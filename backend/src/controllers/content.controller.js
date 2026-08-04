import { createRequire } from 'module';
import { Content, AuditLog, Topic } from '../models/index.js';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '../utils/response.js';
import storageService from '../services/storage.service.js';
import deepinfraService from '../services/deepinfra.service.js';

const _require = createRequire(import.meta.url);

export const listContent = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, topicId, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { companyId: req.companyId, isActive: true };
    
    if (type) query.type = type;
    if (topicId) query.topicIds = topicId;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Filter by visibility based on user role
    if (req.user.role === 'employee') {
      query.$or = [
        { visibility: 'all' },
        { visibility: 'specific', visibleTo: req.user._id }
      ];
    } else if (req.user.role === 'manager') {
      query.visibility = { $in: ['all', 'managers'] };
    }

    const [content, total] = await Promise.all([
      Content.find(query)
        .populate('topicIds', 'name icon')
        .populate('uploadedBy', 'email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments(query)
    ]);

    return paginatedResponse(res, content, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const uploadContent = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const { title, description, topicIds, visibility, visibleTo } = req.body;

    // Determine content type from mimetype
    let type = 'document';
    if (req.file.mimetype.startsWith('video/')) type = 'video';
    else if (req.file.mimetype.startsWith('audio/')) type = 'audio';
    else if (req.file.mimetype === 'application/pdf') type = 'pdf';
    else if (req.file.mimetype.startsWith('image/')) type = 'image';

    // Save file
    const fileInfo = await storageService.saveContent(
      req.file.buffer,
      req.file.originalname,
      req.companyId.toString()
    );

    const content = new Content({
      companyId: req.companyId,
      title: title || req.file.originalname,
      description,
      type,
      fileUrl: fileInfo.url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      topicIds: topicIds ? JSON.parse(topicIds) : [],
      visibility: visibility || 'all',
      visibleTo: visibleTo ? JSON.parse(visibleTo) : [],
      uploadedBy: req.user._id
    });
    await content.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'content.uploaded',
      resource: 'content',
      resourceId: content._id,
      details: { title: content.title, type }
    });

    return successResponse(res, content, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getContent = async (req, res, next) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      companyId: req.companyId,
      isActive: true
    })
      .populate('topicIds', 'name icon')
      .populate('uploadedBy', 'email profile');

    if (!content) {
      return errorResponse(res, 'Content not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Check visibility
    if (req.user.role === 'employee') {
      if (content.visibility === 'managers') {
        return errorResponse(res, 'Access denied', ErrorCodes.FORBIDDEN, null, 403);
      }
      if (content.visibility === 'specific' && !content.visibleTo.includes(req.user._id)) {
        return errorResponse(res, 'Access denied', ErrorCodes.FORBIDDEN, null, 403);
      }
    }

    // Increment view count
    content.views += 1;
    await content.save();

    return successResponse(res, content);
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { title, description, topicIds, visibility, visibleTo } = req.body;

    const content = await Content.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!content) {
      return errorResponse(res, 'Content not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (title !== undefined) content.title = title;
    if (description !== undefined) content.description = description;
    if (topicIds !== undefined) content.topicIds = topicIds;
    if (visibility !== undefined) content.visibility = visibility;
    if (visibleTo !== undefined) content.visibleTo = visibleTo;

    await content.save();

    return successResponse(res, content);
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!content) {
      return errorResponse(res, 'Content not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    content.isActive = false;
    await content.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'content.deleted',
      resource: 'content',
      resourceId: content._id
    });

    return successResponse(res, { message: 'Content deleted' });
  } catch (error) {
    next(error);
  }
};

export const detectTopics = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfParse = _require('pdf-parse/lib/pdf-parse.js');
        const pdfData = await pdfParse(req.file.buffer);
        text = pdfData.text || '';
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr.message);
        return errorResponse(res, 'Could not extract text from PDF', ErrorCodes.VALIDATION_ERROR, null, 422);
      }
    } else if (req.file.mimetype.startsWith('text/') || req.file.mimetype === 'application/msword') {
      text = req.file.buffer.toString('utf-8');
    } else {
      return errorResponse(res, 'Topic detection only supports PDF and text files', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const limitedText = words.slice(0, 2000).join(' ');

    if (limitedText.trim().length < 20) {
      return errorResponse(res, 'Not enough text content to detect topics', ErrorCodes.VALIDATION_ERROR, null, 422);
    }

    const existingTopics = await Topic.find({ companyId: req.companyId, isActive: true }).select('_id name category');
    const detected = await deepinfraService.detectTopicsFromContent(limitedText, existingTopics);

    return successResponse(res, {
      matchedTopics: detected.matchedTopics || [],
      suggestedTopics: detected.suggestedTopics || [],
      existingTopics: existingTopics.map(t => ({ _id: t._id, name: t.name, category: t.category })),
      wordCount,
      truncated: wordCount > 2000
    });
  } catch (error) {
    next(error);
  }
};

export const getContentAnalytics = async (req, res, next) => {
  try {
    const content = await Content.find({
      companyId: req.companyId,
      isActive: true
    });

    const analytics = {
      totalContent: content.length,
      totalViews: content.reduce((sum, c) => sum + c.views, 0),
      totalCompletions: content.reduce((sum, c) => sum + c.completions, 0),
      byType: {
        document: content.filter(c => c.type === 'document').length,
        video: content.filter(c => c.type === 'video').length,
        audio: content.filter(c => c.type === 'audio').length,
        pdf: content.filter(c => c.type === 'pdf').length,
        image: content.filter(c => c.type === 'image').length
      },
      topContent: content
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(c => ({ id: c._id, title: c.title, views: c.views }))
    };

    return successResponse(res, analytics);
  } catch (error) {
    next(error);
  }
};
