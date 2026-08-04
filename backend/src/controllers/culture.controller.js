import { CultureContent, AuditLog } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';

// Admin: List all culture content for company
export const listCultureContent = async (req, res, next) => {
  try {
    const content = await CultureContent.find({
      companyId: req.companyId,
      isActive: true
    }).sort({ sortOrder: 1, createdAt: -1 });

    return successResponse(res, content);
  } catch (error) {
    next(error);
  }
};

// Admin: Create culture content
export const createCultureContent = async (req, res, next) => {
  try {
    const { title, titleJapanese, subtitle, icon, contentType, rules, tips, types, videoUrl, sortOrder } = req.body;

    const content = new CultureContent({
      companyId: req.companyId,
      title,
      titleJapanese,
      subtitle,
      icon,
      contentType,
      rules,
      tips,
      types,
      videoUrl,
      sortOrder,
      createdBy: req.user._id
    });
    await content.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'culture.created',
      resource: 'settings',
      resourceId: content._id,
      details: { title }
    });

    return successResponse(res, content, null, 201);
  } catch (error) {
    next(error);
  }
};

// Admin: Update culture content
export const updateCultureContent = async (req, res, next) => {
  try {
    const { title, titleJapanese, subtitle, icon, contentType, rules, tips, types, videoUrl, sortOrder, isActive } = req.body;

    const content = await CultureContent.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!content) {
      return errorResponse(res, 'Culture content not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (title !== undefined) content.title = title;
    if (titleJapanese !== undefined) content.titleJapanese = titleJapanese;
    if (subtitle !== undefined) content.subtitle = subtitle;
    if (icon !== undefined) content.icon = icon;
    if (contentType !== undefined) content.contentType = contentType;
    if (rules !== undefined) content.rules = rules;
    if (tips !== undefined) content.tips = tips;
    if (types !== undefined) content.types = types;
    if (videoUrl !== undefined) content.videoUrl = videoUrl;
    if (sortOrder !== undefined) content.sortOrder = sortOrder;
    if (isActive !== undefined) content.isActive = isActive;

    await content.save();

    return successResponse(res, content);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete culture content
export const deleteCultureContent = async (req, res, next) => {
  try {
    const content = await CultureContent.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!content) {
      return errorResponse(res, 'Culture content not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    content.isActive = false;
    await content.save();

    return successResponse(res, { message: 'Culture content deleted' });
  } catch (error) {
    next(error);
  }
};

// Employee: Get culture content for training
export const getCultureForTraining = async (req, res, next) => {
  try {
    const content = await CultureContent.find({
      companyId: req.companyId,
      isActive: true
    }).sort({ sortOrder: 1 });

    return successResponse(res, content);
  } catch (error) {
    next(error);
  }
};
