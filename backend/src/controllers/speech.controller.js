import { Company, AudioMetric } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';
import deepinfraService from '../services/deepinfra.service.js';
import storageService from '../services/storage.service.js';
import { analyzeAudioBuffer } from '../services/audioAnalysis.service.js';

export const textToSpeech = async (req, res, next) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return errorResponse(res, 'Text is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const { language = 'ja' } = req.body;
    const company = await Company.findById(req.companyId);
    // Japanese uses company/user voice clone; English uses default voice
    const resolvedVoiceId = voiceId || deepinfraService.resolveVoiceId(req.user, company);
    const useVoiceId = language === 'ja' ? resolvedVoiceId : null;

    const { buffer: audioBuffer, mimeType } = await deepinfraService.textToSpeech(text, language, useVoiceId);
    const ext = mimeType === 'audio/mpeg' ? 'mp3' : 'wav';
    const fileInfo = await storageService.saveAudio(audioBuffer, `tts-${Date.now()}.${ext}`, req.companyId.toString());

    return successResponse(res, { audioUrl: fileInfo.url, text, language });
  } catch (error) {
    next(error);
  }
};

export const analyzeAudioMetrics = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Audio file (WAV) is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const { expectedText, actualText, responseLatencyMs, sessionId, topicId, phraseId, mode } = req.body;
    const latencyMs = responseLatencyMs ? Number(responseLatencyMs) : null;

    const analysis = await analyzeAudioBuffer({
      buffer: req.file.buffer,
      expectedText,
      actualText,
      responseLatencyMs: Number.isFinite(latencyMs) ? latencyMs : null
    });

    await AudioMetric.create({
      userId: req.user._id,
      companyId: req.companyId,
      sessionId: sessionId || undefined,
      topicId: topicId || undefined,
      phraseId: phraseId || undefined,
      mode: mode || undefined,
      durationSec: analysis.durationSec,
      energy: analysis.energy,
      timing: analysis.timing,
      stability: analysis.stability,
      articulation: analysis.articulation,
      accuracy: analysis.accuracy,
      emotion: analysis.emotion,
      sensoryDisengagement: analysis.sensoryDisengagement
    });

    return successResponse(res, analysis);
  } catch (error) {
    next(error);
  }
};

export const analyzePronunciation = async (req, res, next) => {
  try {
    const { expected, actual } = req.body;

    if (!expected || !actual) {
      return errorResponse(res, 'Expected and actual text are required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    // Simple comparison logic
    // In production, you'd use a more sophisticated comparison or external API
    const expectedChars = expected.split('');
    const actualChars = actual.split('');
    
    let matches = 0;
    expectedChars.forEach((char, i) => {
      if (actualChars[i] === char) matches++;
    });

    const accuracy = Math.round((matches / expectedChars.length) * 100);
    
    // Generate score based on accuracy
    let score = accuracy;
    let feedback = '';
    
    if (accuracy >= 90) {
      feedback = 'Excellent pronunciation! Almost perfect!';
    } else if (accuracy >= 70) {
      feedback = 'Good job! A few minor improvements needed.';
    } else if (accuracy >= 50) {
      feedback = 'Keep practicing! Focus on the difficult sounds.';
    } else {
      feedback = 'Try again slowly. Listen carefully to the example.';
    }

    return successResponse(res, {
      score,
      accuracy,
      feedback,
      expected,
      actual
    });
  } catch (error) {
    next(error);
  }
};
