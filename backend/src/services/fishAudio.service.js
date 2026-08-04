import config from '../config/env.js';

class FishAudioService {
  constructor() {
    this.apiKey = config.fishAudio.apiKey;
    this.baseUrl = config.fishAudio.baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Fish Audio API error: ${response.status}`);
    }

    return response;
  }

  async textToSpeech(text, voiceId, options = {}) {
    const response = await this.request('/v1/tts', {
      method: 'POST',
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format: options.format || 'mp3',
        latency: options.latency || 'normal',
        ...options
      })
    });

    return response.arrayBuffer();
  }

  async uploadVoiceSample(audioBuffer, metadata = {}) {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), metadata.filename || 'sample.wav');
    
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);

    const response = await this.request('/v1/samples', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    return response.json();
  }

  async cloneVoice(sampleIds, options = {}) {
    const response = await this.request('/v1/models', {
      method: 'POST',
      body: JSON.stringify({
        title: options.title || 'Cloned Voice',
        description: options.description || '',
        sample_ids: sampleIds,
        visibility: 'private',
        ...options
      })
    });

    return response.json();
  }

  async getVoice(voiceId) {
    const response = await this.request(`/v1/models/${voiceId}`, {
      method: 'GET'
    });

    return response.json();
  }

  async deleteVoice(voiceId) {
    await this.request(`/v1/models/${voiceId}`, {
      method: 'DELETE'
    });

    return true;
  }

  async listVoices(page = 1, pageSize = 10) {
    const response = await this.request(`/v1/models?page=${page}&page_size=${pageSize}`, {
      method: 'GET'
    });

    return response.json();
  }
}

export default new FishAudioService();
