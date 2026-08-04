import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  score: { type: Number, min: 0, max: 100 },
  rmsMean: Number,
  rmsVar: Number,
  speechRatio: Number,
  silenceRatio: Number,
  averagePauseMs: Number,
  zcrMean: Number,
  zcrVar: Number,
  speechRate: Number,
  label: String,
  arousal: Number,
  latencyMs: Number
}, { _id: false });

const audioMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingSession' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  phraseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Phrase' },
  mode: { type: String, enum: ['listen_repeat', 'test', 'free_talk'] },
  durationSec: Number,
  energy: scoreSchema,
  timing: scoreSchema,
  stability: scoreSchema,
  articulation: scoreSchema,
  accuracy: { type: Number, min: 0, max: 100 },
  emotion: { label: String, arousal: Number },
  sensoryDisengagement: { score: Number, latencyMs: Number }
}, { timestamps: true });

audioMetricSchema.index({ userId: 1, createdAt: -1 });
audioMetricSchema.index({ companyId: 1, createdAt: -1 });

const AudioMetric = mongoose.model('AudioMetric', audioMetricSchema);

export default AudioMetric;
