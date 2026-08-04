import { User, AuditLog } from '../models/index.js';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '../utils/response.js';
import emailService from '../services/email.service.js';
import crypto from 'crypto';

export const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, role, department } = req.query;
    const skip = (page - 1) * limit;

    const query = { companyId: req.companyId };
    
    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { 'profile.firstName': new RegExp(search, 'i') },
        { 'profile.lastName': new RegExp(search, 'i') }
      ];
    }
    if (status === 'expired') {
      // Find invited users whose invite has expired
      query.status = 'invited';
      query.inviteExpiresAt = { $lt: new Date() };
    } else if (status) {
      query.status = status;
    } else {
      // By default, exclude inactive (deleted) users
      query.status = { $ne: 'inactive' };
    }
    if (role) query.role = role;
    if (department) query['profile.department'] = department;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('assignedTopics')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    return paginatedResponse(res, users.map(u => u.toJSON()), page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, role, department, position, assignedTopics } = req.body;

    // Check if email already exists in company (exclude deleted/inactive users)
    const existing = await User.findOne({ 
      companyId: req.companyId, 
      email: email.toLowerCase(),
      status: { $ne: 'inactive' }
    });
    
    if (existing) {
      return errorResponse(res, 'Email already exists in this company', ErrorCodes.CONFLICT, null, 409);
    }

    // Clean up any old inactive users with same email to avoid unique index conflict
    await User.deleteMany({
      companyId: req.companyId,
      email: email.toLowerCase(),
      status: 'inactive'
    });

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    const now = new Date();
    const user = new User({
      companyId: req.companyId,
      email: email.toLowerCase(),
      role: role || 'employee',
      profile: { firstName, lastName, department, position },
      assignedTopics: assignedTopics || [],
      status: 'invited',
      invitedAt: now,
      inviteExpiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000)
    });
    await user.setPassword(tempPassword);
    await user.save();

    // Log action
    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'user.created',
      resource: 'user',
      resourceId: user._id,
      details: { email, role }
    });

    // Send invite email
    const company = req.user.companyId;
    emailService.sendEmployeeInvite(
      email, 
      company.name, 
      tempPassword, 
      req.user.profile?.firstName || 'Admin'
    ).catch(console.error);

    return successResponse(res, user.toJSON(), null, 201);
  } catch (error) {
    next(error);
  }
};

export const bulkCreateUsers = async (req, res, next) => {
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return errorResponse(res, 'Users array is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const results = { created: [], failed: [] };
    const company = req.user.companyId;

    for (const userData of users) {
      try {
        const { email, firstName, lastName, department } = userData;
        
        const existing = await User.findOne({ 
          companyId: req.companyId, 
          email: email.toLowerCase() 
        });
        
        if (existing) {
          results.failed.push({ email, reason: 'Email already exists' });
          continue;
        }

        const tempPassword = crypto.randomBytes(8).toString('hex');
        
        const now = new Date();
        const user = new User({
          companyId: req.companyId,
          email: email.toLowerCase(),
          role: 'employee',
          profile: { firstName, lastName, department },
          status: 'invited',
          invitedAt: now,
          inviteExpiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000)
        });
        await user.setPassword(tempPassword);
        await user.save();

        emailService.sendEmployeeInvite(
          email, 
          company.name, 
          tempPassword
        ).catch(console.error);

        results.created.push({ email, id: user._id });
      } catch (err) {
        results.failed.push({ email: userData.email, reason: err.message });
      }
    }

    return successResponse(res, results, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      companyId: req.companyId 
    }).populate('assignedTopics');

    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    return successResponse(res, user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, department, position, role, status } = req.body;

    const user = await User.findOne({ 
      _id: req.params.id, 
      companyId: req.companyId 
    });

    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
      return errorResponse(res, 'Cannot change your own role', ErrorCodes.FORBIDDEN, null, 403);
    }

    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (department !== undefined) user.profile.department = department;
    if (position !== undefined) user.profile.position = position;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'user.updated',
      resource: 'user',
      resourceId: user._id,
      details: req.body
    });

    return successResponse(res, user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      companyId: req.companyId 
    });

    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return errorResponse(res, 'Cannot delete your own account', ErrorCodes.FORBIDDEN, null, 403);
    }

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'user.deleted',
      resource: 'user',
      resourceId: user._id,
      details: { email: user.email }
    });

    await User.deleteOne({ _id: user._id });

    return successResponse(res, { message: 'User removed' });
  } catch (error) {
    next(error);
  }
};

export const assignTopics = async (req, res, next) => {
  try {
    const { topicIds } = req.body;

    const user = await User.findOne({ 
      _id: req.params.id, 
      companyId: req.companyId 
    });

    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    user.assignedTopics = topicIds || [];
    await user.save();
    await user.populate('assignedTopics');

    return successResponse(res, user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const reinviteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Only allow re-invite for invited/expired users
    if (user.status === 'active') {
      return errorResponse(res, 'User is already active', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    // Block re-invite if current invite is still valid (not expired)
    if (user.status === 'invited' && user.inviteExpiresAt && new Date() < user.inviteExpiresAt) {
      const remainingMs = user.inviteExpiresAt.getTime() - Date.now();
      const remainingHrs = Math.ceil(remainingMs / (60 * 60 * 1000));
      return errorResponse(
        res,
        `Invite is still active. It expires in ${remainingHrs} hour${remainingHrs !== 1 ? 's' : ''}. Please wait before re-inviting.`,
        ErrorCodes.VALIDATION_ERROR,
        null,
        400
      );
    }

    // Generate new temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    await user.setPassword(tempPassword);

    const now = new Date();
    user.status = 'invited';
    user.invitedAt = now;
    user.inviteExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    await user.save();

    // Send re-invite email
    const company = req.user.companyId;
    emailService.sendEmployeeInvite(
      user.email,
      company.name,
      tempPassword,
      req.user.profile?.firstName || 'Admin'
    ).catch(console.error);

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'user.reinvited',
      resource: 'user',
      resourceId: user._id,
      details: { email: user.email }
    });

    return successResponse(res, user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const getUserProgress = async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      companyId: req.companyId 
    });

    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    return successResponse(res, {
      progress: user.progress,
      stars: user.stars,
      badges: user.badges
    });
  } catch (error) {
    next(error);
  }
};
