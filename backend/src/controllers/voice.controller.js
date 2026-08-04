import { Company, User, VoiceSample, AuditLog } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';
import deepinfraService from '../services/deepinfra.service.js';
import storageService from '../services/storage.service.js';

export const getVoiceProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId);
    return successResponse(res, {
      voiceProfile: company.voiceProfile,
      voiceClones: company.voiceClones || [],
      companyName: company.name
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccent = async (req, res, next) => {
  try {
    const { accent } = req.body;
    
    if (!['tokyo', 'kansai', 'kyushu', 'neutral'].includes(accent)) {
      return errorResponse(res, 'Invalid accent', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const company = await Company.findById(req.companyId);
    company.voiceProfile.accent = accent;
    await company.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'voice.accent_updated',
      resource: 'voice',
      details: { accent }
    });

    return successResponse(res, company.voiceProfile);
  } catch (error) {
    next(error);
  }
};

export const uploadVoiceSample = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Audio file is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    // Save file locally
    const fileInfo = await storageService.saveVoiceSample(
      req.file.buffer,
      req.file.originalname,
      req.companyId.toString()
    );

    // Create voice sample record
    const sample = new VoiceSample({
      companyId: req.companyId,
      filename: fileInfo.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileInfo.url,
      uploadedBy: req.user._id,
      status: 'uploaded'
    });
    await sample.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'voice.sample_uploaded',
      resource: 'voice',
      resourceId: sample._id,
      details: { filename: req.file.originalname }
    });

    return successResponse(res, sample, null, 201);
  } catch (error) {
    next(error);
  }
};

export const listVoiceSamples = async (req, res, next) => {
  try {
    const samples = await VoiceSample.find({ companyId: req.companyId })
      .populate('uploadedBy', 'email profile')
      .sort({ createdAt: -1 });

    return successResponse(res, samples);
  } catch (error) {
    next(error);
  }
};

export const deleteVoiceSample = async (req, res, next) => {
  try {
    const sample = await VoiceSample.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!sample) {
      return errorResponse(res, 'Sample not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Delete file
    const filePath = storageService.getFullPath(sample.url);
    await storageService.deleteFile(filePath);

    await sample.deleteOne();

    return successResponse(res, { message: 'Sample deleted' });
  } catch (error) {
    next(error);
  }
};

// Create a DeepInfra voice clone from an uploaded audio sample
export const createVoiceClone = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Audio file is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }
    const { name, description, isDefault } = req.body;
    if (!name) {
      return errorResponse(res, 'Voice clone name is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const cloneResult = await deepinfraService.createVoiceClone(req.file.buffer, name, description || '', req.file.mimetype, req.file.originalname);
    const deepInfraVoiceId = cloneResult.voice_id;

    const company = await Company.findById(req.companyId);

    // If isDefault, unset existing defaults
    if (isDefault === 'true' || isDefault === true) {
      company.voiceClones.forEach(v => { v.isDefault = false; });
    }

    company.voiceClones.push({
      name,
      description: description || '',
      deepInfraVoiceId,
      isDefault: isDefault === 'true' || isDefault === true,
      status: 'ready'
    });
    await company.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'voice.clone_created',
      resource: 'voice',
      details: { name, deepInfraVoiceId }
    });

    return successResponse(res, { voiceClones: company.voiceClones }, null, 201);
  } catch (error) {
    next(error);
  }
};

// List all voice clones for the company
export const listVoiceClones = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId).select('voiceClones name');
    return successResponse(res, company.voiceClones || []);
  } catch (error) {
    next(error);
  }
};

// Set a voice clone as the company default
export const setDefaultVoiceClone = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId);
    const clone = company.voiceClones.id(req.params.id);
    if (!clone) return errorResponse(res, 'Voice clone not found', ErrorCodes.NOT_FOUND, null, 404);

    company.voiceClones.forEach(v => { v.isDefault = false; });
    clone.isDefault = true;
    await company.save();

    return successResponse(res, company.voiceClones);
  } catch (error) {
    next(error);
  }
};

// Delete a voice clone
export const deleteVoiceClone = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId);
    const clone = company.voiceClones.id(req.params.id);
    if (!clone) return errorResponse(res, 'Voice clone not found', ErrorCodes.NOT_FOUND, null, 404);

    const deepInfraVoiceId = clone.deepInfraVoiceId;
    clone.deleteOne();
    await company.save();

    try { await deepinfraService.deleteVoiceClone(deepInfraVoiceId); } catch { /* ignore remote errors */ }

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'voice.clone_deleted',
      resource: 'voice',
      details: { deepInfraVoiceId }
    });

    return successResponse(res, { message: 'Voice clone deleted' });
  } catch (error) {
    next(error);
  }
};

// Assign a voice clone to an employee
export const assignVoiceToEmployee = async (req, res, next) => {
  try {
    const { voiceCloneId } = req.body; // internal subdoc _id or null to clear
    const user = await User.findOne({ _id: req.params.userId, companyId: req.companyId });
    if (!user) return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);

    if (voiceCloneId) {
      const company = await Company.findById(req.companyId);
      const clone = company.voiceClones.id(voiceCloneId);
      if (!clone) return errorResponse(res, 'Voice clone not found', ErrorCodes.NOT_FOUND, null, 404);
      user.assignedVoiceId = clone.deepInfraVoiceId;
    } else {
      user.assignedVoiceId = null;
    }
    await user.save();

    return successResponse(res, { assignedVoiceId: user.assignedVoiceId });
  } catch (error) {
    next(error);
  }
};
