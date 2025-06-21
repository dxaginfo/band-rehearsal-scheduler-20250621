const { Rehearsal, User, Band, BandMember, RehearsalAttendance } = require('../models');
const { asyncHandler } = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

/**
 * @desc    Create a new rehearsal
 * @route   POST /api/bands/:bandId/rehearsals
 * @access  Private (Band members with admin role)
 */
exports.createRehearsal = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    location,
    locationDetails,
    isRecurring,
    recurringPattern,
    notes,
    attachments,
  } = req.body;

  const bandId = req.params.bandId;

  // Check if band exists
  const band = await Band.findByPk(bandId);
  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if user is a band member with admin role
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId,
      role: 'admin',
    },
  });

  if (!memberRecord && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to create rehearsals for this band', 403);
  }

  // Validate time range
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    throw new AppError('End time must be after start time', 400);
  }

  // Create rehearsal
  const rehearsal = await Rehearsal.create({
    title,
    description,
    startTime: start,
    endTime: end,
    location,
    locationDetails,
    isRecurring: isRecurring || false,
    recurringPattern: recurringPattern || null,
    notes,
    attachments,
    bandId,
    createdBy: req.user.id,
  });

  // If recurring, create additional instances based on pattern
  if (isRecurring && recurringPattern) {
    // Logic for creating recurring rehearsals would go here
    // This would depend on how we define recurring patterns
  }

  res.status(201).json({
    success: true,
    data: rehearsal,
  });
});

/**
 * @desc    Get all rehearsals for a band
 * @route   GET /api/bands/:bandId/rehearsals
 * @access  Private (Band members)
 */
exports.getBandRehearsals = asyncHandler(async (req, res) => {
  const bandId = req.params.bandId;

  // Check if band exists
  const band = await Band.findByPk(bandId);
  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if user is a band member
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId,
    },
  });

  if (!memberRecord && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to view rehearsals for this band', 403);
  }

  // Query params for filtering
  const { from, to, status } = req.query;
  
  // Build query conditions
  const whereConditions = { bandId };
  
  // Date range filter
  if (from || to) {
    whereConditions.startTime = {};
    if (from) whereConditions.startTime[Op.gte] = new Date(from);
    if (to) whereConditions.startTime[Op.lte] = new Date(to);
  }
  
  // Status filter
  if (status) {
    whereConditions.status = status;
  }

  // Get rehearsals
  const rehearsals = await Rehearsal.findAll({
    where: whereConditions,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'attendees',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: {
          attributes: ['status', 'responseTime', 'notes'],
        },
      },
    ],
    order: [['startTime', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count: rehearsals.length,
    data: rehearsals,
  });
});

/**
 * @desc    Get a single rehearsal by ID
 * @route   GET /api/rehearsals/:id
 * @access  Private (Band members)
 */
exports.getRehearsal = asyncHandler(async (req, res) => {
  const rehearsal = await Rehearsal.findByPk(req.params.id, {
    include: [
      {
        model: Band,
        attributes: ['id', 'name', 'description'],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'attendees',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: {
          attributes: ['status', 'responseTime', 'notes'],
        },
      },
    ],
  });

  if (!rehearsal) {
    throw new AppError('Rehearsal not found', 404);
  }

  // Check if user is a band member
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: rehearsal.bandId,
    },
  });

  const band = await Band.findByPk(rehearsal.bandId);

  if (!memberRecord && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to view this rehearsal', 403);
  }

  res.status(200).json({
    success: true,
    data: rehearsal,
  });
});

/**
 * @desc    Update a rehearsal
 * @route   PUT /api/rehearsals/:id
 * @access  Private (Band admins or creator)
 */
exports.updateRehearsal = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    location,
    locationDetails,
    status,
    notes,
    attachments,
  } = req.body;

  let rehearsal = await Rehearsal.findByPk(req.params.id);

  if (!rehearsal) {
    throw new AppError('Rehearsal not found', 404);
  }

  // Check if user is a band admin or the creator
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: rehearsal.bandId,
      role: 'admin',
    },
  });

  const band = await Band.findByPk(rehearsal.bandId);

  if (!memberRecord && rehearsal.createdBy !== req.user.id && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to update this rehearsal', 403);
  }

  // Validate time range if both are provided
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new AppError('End time must be after start time', 400);
    }
  }

  // Update rehearsal
  if (title) rehearsal.title = title;
  if (description) rehearsal.description = description;
  if (startTime) rehearsal.startTime = new Date(startTime);
  if (endTime) rehearsal.endTime = new Date(endTime);
  if (location) rehearsal.location = location;
  if (locationDetails) rehearsal.locationDetails = locationDetails;
  if (status) rehearsal.status = status;
  if (notes) rehearsal.notes = notes;
  if (attachments) rehearsal.attachments = attachments;

  await rehearsal.save();

  res.status(200).json({
    success: true,
    data: rehearsal,
  });
});

/**
 * @desc    Delete a rehearsal
 * @route   DELETE /api/rehearsals/:id
 * @access  Private (Band admins or creator)
 */
exports.deleteRehearsal = asyncHandler(async (req, res) => {
  const rehearsal = await Rehearsal.findByPk(req.params.id);

  if (!rehearsal) {
    throw new AppError('Rehearsal not found', 404);
  }

  // Check if user is a band admin or the creator
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: rehearsal.bandId,
      role: 'admin',
    },
  });

  const band = await Band.findByPk(rehearsal.bandId);

  if (!memberRecord && rehearsal.createdBy !== req.user.id && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to delete this rehearsal', 403);
  }

  await rehearsal.destroy();

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Update attendance status for a rehearsal
 * @route   POST /api/rehearsals/:id/attendance
 * @access  Private (Band members)
 */
exports.updateAttendance = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const rehearsal = await Rehearsal.findByPk(req.params.id);

  if (!rehearsal) {
    throw new AppError('Rehearsal not found', 404);
  }

  // Check if user is a band member
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: rehearsal.bandId,
    },
  });

  if (!memberRecord) {
    throw new AppError('Not authorized to update attendance for this rehearsal', 403);
  }

  // Check if valid status
  if (!['attending', 'not_attending', 'maybe'].includes(status)) {
    throw new AppError('Invalid attendance status', 400);
  }

  // Update or create attendance record
  let attendance = await RehearsalAttendance.findOne({
    where: {
      rehearsalId: rehearsal.id,
      userId: req.user.id,
    },
  });

  if (attendance) {
    // Update existing record
    attendance.status = status;
    attendance.responseTime = new Date();
    if (notes) attendance.notes = notes;
    await attendance.save();
  } else {
    // Create new record
    attendance = await RehearsalAttendance.create({
      rehearsalId: rehearsal.id,
      userId: req.user.id,
      status,
      notes: notes || null,
      responseTime: new Date(),
    });
  }

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

/**
 * @desc    Get all rehearsals for current user (across all bands)
 * @route   GET /api/rehearsals/me
 * @access  Private
 */
exports.getUserRehearsals = asyncHandler(async (req, res) => {
  // Get all bands the user is a member of
  const bandMembers = await BandMember.findAll({
    where: {
      userId: req.user.id,
    },
    attributes: ['bandId'],
  });

  const bandIds = bandMembers.map(member => member.bandId);

  // Query params for filtering
  const { from, to, status } = req.query;
  
  // Build query conditions
  const whereConditions = {
    bandId: {
      [Op.in]: bandIds,
    },
  };
  
  // Date range filter
  if (from || to) {
    whereConditions.startTime = {};
    if (from) whereConditions.startTime[Op.gte] = new Date(from);
    if (to) whereConditions.startTime[Op.lte] = new Date(to);
  }
  
  // Status filter
  if (status) {
    whereConditions.status = status;
  }

  // Get rehearsals
  const rehearsals = await Rehearsal.findAll({
    where: whereConditions,
    include: [
      {
        model: Band,
        attributes: ['id', 'name'],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: User,
        as: 'attendees',
        attributes: ['id', 'firstName', 'lastName'],
        through: {
          attributes: ['status'],
          where: {
            userId: req.user.id,
          },
          required: false,
        },
      },
    ],
    order: [['startTime', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count: rehearsals.length,
    data: rehearsals,
  });
});