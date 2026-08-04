import axios from 'axios';

const baseURL = import.meta.env.PROD
  ? `${window.location.origin}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  // The backend revokes the supplied refresh token, so it must be sent
  logout: () => api.post('/auth/logout', {
    refreshToken: localStorage.getItem('refreshToken')
  }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken })
};

// Users API
export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  bulkCreate: (users) => api.post('/users/bulk', { users }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  reinvite: (id) => api.post(`/users/${id}/reinvite`),
  assignTopics: (id, topicIds) => api.put(`/users/${id}/topics`, { topicIds }),
  getProgress: (id) => api.get(`/users/${id}/progress`)
};

// Company API
export const companyAPI = {
  getCurrent: () => api.get('/companies/current'),
  update: (data) => api.put('/companies/current', data),
  updateBranding: (formData) => api.put('/companies/current/branding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSSO: (data) => api.put('/companies/current/sso', data),
  getStats: (period) => api.get('/companies/current/stats', { params: { period } })
};

// Topics API
export const topicsAPI = {
  list: (params) => api.get('/topics', { params }),
  create: (data) => api.post('/topics', data),
  get: (id) => api.get(`/topics/${id}`),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
  generatePhrases: (id, data) => api.post(`/topics/${id}/generate-phrases`, data),
  createPhrase: (id, data) => api.post(`/topics/${id}/phrases`, data),
  updatePhrase: (id, phraseId, data) => api.put(`/topics/${id}/phrases/${phraseId}`, data),
  deletePhrase: (id, phraseId) => api.delete(`/topics/${id}/phrases/${phraseId}`),
  bulkImportPhrases: (id, phrases) => api.post(`/topics/${id}/phrases/bulk`, { phrases })
};

// Phrases API
export const phrasesAPI = {
  list: (topicId, params) => api.get(`/topics/${topicId}/phrases`, { params }),
  create: (topicId, data) => api.post(`/topics/${topicId}/phrases`, data),
  update: (id, data) => api.put(`/phrases/${id}`, data),
  delete: (id) => api.delete(`/phrases/${id}`),
  getEmergency: () => api.get('/phrases/emergency'),
  generateAudio: (id) => api.post(`/phrases/${id}/generate-audio`),
  pregenerateTopicAudio: (topicId) => api.post(`/phrases/topic/${topicId}/pregenerate-audio`)
};

// Voice API
export const voiceAPI = {
  getProfile: () => api.get('/voice/profile'),
  updateAccent: (accent) => api.put('/voice/profile/accent', { accent }),
  // Voice samples (raw uploads)
  uploadSample: (formData) => api.post('/voice/samples', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  listSamples: () => api.get('/voice/samples'),
  deleteSample: (id) => api.delete(`/voice/samples/${id}`),
  // Voice clones (DeepInfra / Chatterbox Multilingual)
  createClone: (formData) => api.post('/voice/clones', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  listClones: () => api.get('/voice/clones'),
  setDefaultClone: (id) => api.put(`/voice/clones/${id}/default`),
  deleteClone: (id) => api.delete(`/voice/clones/${id}`),
  // Per-employee voice assignment
  assignVoiceToEmployee: (userId, voiceCloneId) =>
    api.put(`/voice/clones/assign/${userId}`, { voiceCloneId })
};

// Content API
export const contentAPI = {
  list: (params) => api.get('/content', { params }),
  upload: (formData) => api.post('/content', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  detectTopics: (formData) => api.post('/content/detect-topics', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  get: (id) => api.get(`/content/${id}`),
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
  getAnalytics: () => api.get('/content/analytics')
};

// Training API
export const trainingAPI = {
  getTopics: () => api.get('/training/topics'),
  getPhrases: (topicId, params) => api.get(`/training/phrases/${topicId}`, { params }),
  startSession: (topicId, mode) => api.post('/training/sessions', { topicId, mode }),
  updateSession: (id, data) => api.put(`/training/sessions/${id}`, data),
  completeSession: (id) => api.post(`/training/sessions/${id}/complete`),
  getProgress: () => api.get('/training/progress'),
  getStats: (period) => api.get('/training/stats', { params: { period } }),
  getAudioMetrics: (period) => api.get('/training/audio-metrics', { params: { period } }),
  getLeaderboard: (period) => api.get('/training/leaderboard', { params: { period } }),
  getDailyGoals: () => api.get('/training/daily-goals'),
  updateDailyGoals: (data) => api.put('/training/daily-goals', data),
  getSavedPhrases: () => api.get('/training/saved-phrases'),
  getSavedPhraseIds: () => api.get('/training/saved-phrase-ids'),
  toggleSavePhrase: (phraseId, topicId) => api.post('/training/saved-phrases/toggle', { phraseId, topicId }),
  // Pronunciation history
  getPronunciationHistory: (params) => api.get('/training/pronunciation-history', { params }),
  // Badges
  getBadges: () => api.get('/training/badges'),
  getEarnedBadges: () => api.get('/training/badges/earned')
};

// Analytics API (Manager)
export const analyticsAPI = {
  getCompanyAnalytics: (period) => api.get('/analytics/company', { params: { period } }),
  getCompanyAudioMetrics: (period) => api.get('/analytics/audio-metrics', { params: { period } }),
  // Backend mounts company stats under /companies/current/stats
  getCompanyStats: (period) => api.get('/companies/current/stats', { params: { period } })
};

// Speech API
export const speechAPI = {
  textToSpeech: (text, voiceId, language = 'ja') => api.post('/speech/tts', { text, voiceId, language }),
  analyze: (expected, actual) => api.post('/speech/analyze', { expected, actual }),
  analyzeMetrics: (formData) => api.post('/speech/metrics', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// AI API
export const aiAPI = {
  extractCompanyInfo: (content, type, url) => api.post('/ai/extract-company-info', { content, type, url }),
  extractFromPDF: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/ai/extract-from-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPronunciationFeedback: (expected, actual, context) => 
    api.post('/ai/pronunciation-feedback', { expected, actual, ...context }),
  // Backend also accepts topicId + conversationStarter to scope the conversation
  conversation: (messages, context = {}) => api.post('/ai/conversation', { messages, ...context }),
  generatePhrases: (topic, difficulty, count) => 
    api.post('/ai/generate-phrases', { topic, difficulty, count })
};

// Culture API
export const cultureAPI = {
  getForTraining: () => api.get('/culture/training'),
  list: () => api.get('/culture'),
  create: (data) => api.post('/culture', data),
  update: (id, data) => api.put(`/culture/${id}`, data),
  delete: (id) => api.delete(`/culture/${id}`)
};

// Learning Paths API
export const learningPathsAPI = {
  getForTraining: () => api.get('/learning-paths/training'),
  list: () => api.get('/learning-paths'),
  create: (data) => api.post('/learning-paths', data),
  update: (id, data) => api.put(`/learning-paths/${id}`, data),
  delete: (id) => api.delete(`/learning-paths/${id}`)
};

// Scenarios API
export const scenariosAPI = {
  getForTraining: () => api.get('/scenarios/training'),
  list: () => api.get('/scenarios'),
  create: (data) => api.post('/scenarios', data),
  update: (id, data) => api.put(`/scenarios/${id}`, data),
  delete: (id) => api.delete(`/scenarios/${id}`)
};

export default api;
