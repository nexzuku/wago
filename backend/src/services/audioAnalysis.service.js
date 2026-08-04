import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import config from '../config/env.js';

const execFileAsync = promisify(execFile);

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const parseWav = (buffer) => {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const riff = view.getUint32(0, false);
  if (riff !== 0x52494646) {
    throw new Error('Invalid WAV: Missing RIFF header');
  }

  let offset = 12;
  let fmtChunk = null;
  let dataOffset = null;
  let dataSize = null;

  while (offset + 8 <= view.byteLength) {
    const chunkId = view.getUint32(offset, false);
    const chunkSize = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;

    if (chunkId === 0x666d7420) {
      fmtChunk = {
        audioFormat: view.getUint16(chunkStart, true),
        numChannels: view.getUint16(chunkStart + 2, true),
        sampleRate: view.getUint32(chunkStart + 4, true),
        bitsPerSample: view.getUint16(chunkStart + 14, true)
      };
    }

    if (chunkId === 0x64617461) {
      dataOffset = chunkStart;
      dataSize = chunkSize;
      break;
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!fmtChunk || dataOffset === null) {
    throw new Error('Invalid WAV: Missing fmt or data chunk');
  }

  if (fmtChunk.audioFormat !== 1) {
    throw new Error('Unsupported WAV format (only PCM supported)');
  }

  if (fmtChunk.bitsPerSample !== 16) {
    throw new Error('Unsupported WAV bit depth (only 16-bit PCM supported)');
  }

  const samples = new Float32Array(dataSize / 2);
  let sampleIndex = 0;
  for (let i = dataOffset; i < dataOffset + dataSize; i += 2) {
    const int16 = view.getInt16(i, true);
    samples[sampleIndex++] = int16 / 32768;
  }

  return {
    samples,
    sampleRate: fmtChunk.sampleRate,
    numChannels: fmtChunk.numChannels
  };
};

const computeRms = (frame) => {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / frame.length);
};

const computeZeroCrossingRate = (frame) => {
  let crossings = 0;
  for (let i = 1; i < frame.length; i++) {
    if ((frame[i - 1] >= 0 && frame[i] < 0) || (frame[i - 1] < 0 && frame[i] >= 0)) {
      crossings++;
    }
  }
  return crossings / frame.length;
};

// minHeight filters out noise micro-peaks so only real articulatory events are counted
const estimatePeaks = (values, minHeight = 0) => {
  let peaks = 0;
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] > minHeight && values[i] > values[i - 1] && values[i] > values[i + 1]) peaks++;
  }
  return peaks;
};

const levenshtein = (a = '', b = '') => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const normalizeText = (text) => text.trim().toLowerCase();

const runOpenSmile = async ({ buffer }) => {
  if (!config.openSmile?.enabled || !config.openSmile?.binaryPath || !config.openSmile?.configPath) {
    return null;
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'opensmile-'));
  const wavPath = path.join(tmpDir, 'input.wav');
  const csvPath = path.join(tmpDir, 'output.csv');

  await fs.writeFile(wavPath, buffer);

  try {
    await execFileAsync(config.openSmile.binaryPath, [
      '-C',
      config.openSmile.configPath,
      '-I',
      wavPath,
      '-O',
      csvPath
    ]);

    const csv = await fs.readFile(csvPath, 'utf8');
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const headers = lines[0].split(',').map(h => h.trim());
    const values = lines[1].split(',').map(v => Number(v.trim()));
    const features = {};
    headers.forEach((key, idx) => {
      if (!Number.isNaN(values[idx])) features[key] = values[idx];
    });
    return features;
  } catch (error) {
    console.error('OpenSMILE failed:', error.message);
    return null;
  } finally {
    await Promise.allSettled([
      fs.unlink(wavPath).catch(() => null),
      fs.unlink(csvPath).catch(() => null)
    ]);
  }
};

export const analyzeAudioBuffer = async ({ buffer, expectedText, actualText, responseLatencyMs }) => {
  const wav = parseWav(buffer);
  const { samples, sampleRate } = wav;
  const durationSec = samples.length / sampleRate;

  const frameSize = Math.max(1, Math.floor(sampleRate * 0.02));
  const frames = Math.floor(samples.length / frameSize);

  const rmsValues = [];
  const zcrValues = [];

  for (let i = 0; i < frames; i++) {
    const start = i * frameSize;
    const frame = samples.subarray(start, start + frameSize);
    rmsValues.push(computeRms(frame));
    zcrValues.push(computeZeroCrossingRate(frame));
  }

  const maxRms = Math.max(...rmsValues, 0.0001);
  const energyThreshold = maxRms * 0.2;
  const speechFrames = rmsValues.filter((rms) => rms >= energyThreshold).length;
  const silenceFrames = frames - speechFrames;
  const speechRatio = speechFrames / Math.max(frames, 1);
  const silenceRatio = silenceFrames / Math.max(frames, 1);

  let pauseMsTotal = 0;
  let pauseCount = 0;
  let currentPause = 0;
  for (const rms of rmsValues) {
    if (rms < energyThreshold) {
      currentPause += 20;
    } else if (currentPause > 0) {
      pauseMsTotal += currentPause;
      pauseCount++;
      currentPause = 0;
    }
  }
  if (currentPause > 0) {
    pauseMsTotal += currentPause;
    pauseCount++;
  }
  const averagePauseMs = pauseCount ? pauseMsTotal / pauseCount : 0;

  const rmsMean = rmsValues.reduce((a, b) => a + b, 0) / Math.max(rmsValues.length, 1);
  const rmsVar = rmsValues.reduce((a, b) => a + Math.pow(b - rmsMean, 2), 0) / Math.max(rmsValues.length, 1);
  const zcrMean = zcrValues.reduce((a, b) => a + b, 0) / Math.max(zcrValues.length, 1);
  const zcrVar = zcrValues.reduce((a, b) => a + Math.pow(b - zcrMean, 2), 0) / Math.max(zcrValues.length, 1);

  // Only count peaks that exceed 30% of the max frame energy — filters noise micro-peaks
  const peakCount = estimatePeaks(rmsValues, maxRms * 0.3);
  const speechRate = durationSec > 0 ? peakCount / durationSec : 0;

  // energyScore: compare mean RMS against a target comfortable speaking level (-26 dB FS ≈ 0.05).
  // Using rmsMean/maxRms was biased: a single loud spike inflated maxRms and lowered the score.
  const TARGET_RMS = 0.05;
  const energyScore = clamp(rmsMean / TARGET_RMS, 0, 1) * 100;

  const timingScore = clamp(1 - silenceRatio, 0, 1) * 100;

  // stabilityScore: zcrVar for speech sits in ~[0.001, 0.05]. Multiplier 5 was too low —
  // almost all recordings scored 90+. Multiplier 20 gives meaningful discrimination.
  const stabilityScore = clamp(1 - zcrVar * 20, 0, 1) * 100;
  const articulationScore = clamp(speechRate / 6, 0, 1) * 100;

  let accuracyScore = null;
  if (expectedText && actualText) {
    const normalizedExpected = normalizeText(expectedText);
    const normalizedActual = normalizeText(actualText);
    const distance = levenshtein(normalizedExpected, normalizedActual);
    const maxLen = Math.max(normalizedExpected.length, 1);
    accuracyScore = clamp(1 - distance / maxLen, 0, 1) * 100;
  }

  const arousal = clamp((energyScore / 100 + (1 - silenceRatio)) / 2, 0, 1);
  let emotion = arousal > 0.7 ? 'energetic' : arousal < 0.35 ? 'calm' : 'neutral';

  const openSmileFeatures = await runOpenSmile({ buffer });
  if (openSmileFeatures) {
    const loudness = openSmileFeatures.loudness_sma3_mean || openSmileFeatures.loudness_sma_mean;
    const f0 = openSmileFeatures['F0semitoneFrom27.5Hz_sma3nz_mean'] || openSmileFeatures['F0semitoneFrom27.5Hz_sma_mean'];
    if (Number.isFinite(loudness) && Number.isFinite(f0)) {
      if (loudness > 1.2 && f0 > 25) emotion = 'excited';
      else if (loudness < 0.4 && f0 < 12) emotion = 'calm';
      else emotion = 'focused';
    }
  }

  const latencyPenalty = responseLatencyMs ? clamp(1 - responseLatencyMs / 8000, 0, 1) : 0.8;
  const disengagementScore = clamp((silenceRatio + (1 - latencyPenalty)) / 2, 0, 1) * 100;

  return {
    id: crypto.randomUUID(),
    durationSec,
    energy: {
      score: Math.round(energyScore),
      rmsMean,
      rmsVar
    },
    timing: {
      speechRatio: Number(speechRatio.toFixed(3)),
      silenceRatio: Number(silenceRatio.toFixed(3)),
      averagePauseMs: Math.round(averagePauseMs),
      score: Math.round(timingScore)
    },
    stability: {
      zcrMean: Number(zcrMean.toFixed(4)),
      zcrVar: Number(zcrVar.toFixed(6)),
      score: Math.round(stabilityScore)
    },
    articulation: {
      speechRate: Number(speechRate.toFixed(2)),
      score: Math.round(articulationScore)
    },
    accuracy: accuracyScore === null ? null : Math.round(accuracyScore),
    emotion: {
      label: emotion,
      arousal: Number(arousal.toFixed(2)),
      openSmile: openSmileFeatures || null
    },
    sensoryDisengagement: {
      score: Math.round(disengagementScore),
      latencyMs: responseLatencyMs || null
    }
  };
};
