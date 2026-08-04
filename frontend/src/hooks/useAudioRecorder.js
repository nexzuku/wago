import { useCallback, useRef, useState } from 'react';

const encodeWav = (audioBuffer) => {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  let offset = 0;
  writeString(offset, 'RIFF');
  offset += 4;
  view.setUint32(offset, 36 + audioBuffer.length * numChannels * 2, true);
  offset += 4;
  writeString(offset, 'WAVE');
  offset += 4;
  writeString(offset, 'fmt ');
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, numChannels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * numChannels * 2, true);
  offset += 4;
  view.setUint16(offset, numChannels * 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString(offset, 'data');
  offset += 4;
  view.setUint32(offset, audioBuffer.length * numChannels * 2, true);
  offset += 4;

  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

const useAudioRecorder = () => {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.start();
    setIsRecording(true);
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current || !isRecording) return null;

    const recorder = recorderRef.current;
    const stopped = new Promise((resolve) => {
      recorder.onstop = () => resolve(true);
    });

    recorder.stop();
    await stopped;
    setIsRecording(false);

    streamRef.current?.getTracks().forEach(track => track.stop());

    const webmBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBlob = encodeWav(audioBuffer);

    await audioContext.close();
    return wavBlob;
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};

export default useAudioRecorder;
