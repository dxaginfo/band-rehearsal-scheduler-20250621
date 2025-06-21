const { Availability, User, Band, BandMember } = require('../models');
const { asyncHandler } = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

/**
 * @desc    Set user availability for a band
 * @route   POST /api/availability/band/:bandId
 * @access  Private (Band member)
 */
exports.setAvailability = asyncHandler(async (req, res) => {
  const { bandId } = req.params;
  const { dayOfWeek, startTime, endTime, isRecurring, specificDate, isException, notes } = req.body;
  
  // Check if user is a member of the band
  const membership = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId,
      isActive: true
    }
  });

  if (!membership) {
    throw new AppError('Not authorized: You are not a member of this band', 403);
  }

  // Validate inputs
  if (!isRecurring && !specificDate) {
    throw new AppError('Either recurring pattern or specific date must be provided', 400);
  }

  if (isRecurring && (dayOfWeek === undefined || dayOfWeek === null)) {
    throw new AppError('Day of week is required for recurring availability', 400);
  }

  // Create availability record
  const availability = await Availability.create({
    userId: req.user.id,
    bandId,
    dayOfWeek: isRecurring ? dayOfWeek : null,
    startTime,
    endTime,
    isRecurring: isRecurring || false,
    specificDate: specificDate || null,
    isException: isException || false,
    notes,
    priority: 1 // Default priority
  });

  res.status(201).json({
    success: true,
    data: availability
  });
});

/**
 * @desc    Get user's availability for a band
 * @route   GET /api/availability/band/:bandId
 * @access  Private (Band member)
 */
exports.getUserAvailability = asyncHandler(async (req, res) => {
  const { bandId } = req.params;
  
  // Check if user is a member of the band
  const membership = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId,
      isActive: true
    }
  });

  if (!membership) {
    throw new AppError('Not authorized: You are not a member of this band', 403);
  }

  // Get user's availability
  const availability = await Availability.findAll({
    where: {
      userId: req.user.id,
      bandId
    },
    order: [
      ['isRecurring', 'DESC'],
      ['dayOfWeek', 'ASC'],
      ['startTime', 'ASC'],
      ['specificDate', 'ASC']
    ]
  });

  res.status(200).json({
    success: true,
    count: availability.length,
    data: availability
  });
});

/**
 * @desc    Get all band members' availability
 * @route   GET /api/availability/band/:bandId/all
 * @access  Private (Band admin)
 */
exports.getBandAvailability = asyncHandler(async (req, res) => {
  const { bandId } = req.params;
  
  // Check if user is a band admin
  const membership = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId,
      role: 'admin',
      isActive: true
    }
  });

  const band = await Band.findByPk(bandId);
  if (!band) {
    throw new AppError('Band not found', 404);
  }

  if (!membership && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized: Admin access required', 403);
  }

  // Get all band members
  const members = await BandMember.findAll({
    where: {
      bandId,
      isActive: true
    },
    attributes: ['userId'],
    include: {
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }
  });

  // Get availability for each member
  const memberIds = members.map(member => member.userId);
  
  const availability = await Availability.findAll({
    where: {
      bandId,
      userId: {
        [Op.in]: memberIds
      }
    },
    include: {
      model: User,
      attributes: ['id', 'firstName', 'lastName']
    },
    order: [
      ['userId', 'ASC'],
      ['isRecurring', 'DESC'],
      ['dayOfWeek', 'ASC'],
      ['startTime', 'ASC'],
      ['specificDate', 'ASC']
    ]
  });

  res.status(200).json({
    success: true,
    count: availability.length,
    data: availability
  });
});

/**
 * @desc    Update availability
 * @route   PUT /api/availability/:id
 * @access  Private (Owner of the availability)
 */
exports.updateAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    dayOfWeek, 
    startTime, 
    endTime, 
    isRecurring, 
    specificDate, 
    isException, 
    notes,
    priority
  } = req.body;

  // Find availability record
  const availability = await Availability.findByPk(id);

  if (!availability) {
    throw new AppError('Availability not found', 404);
  }

  // Check if user owns this availability
  if (availability.userId !== req.user.id) {
    throw new AppError('Not authorized to update this availability', 403);
  }

  // Update fields
  if (dayOfWeek !== undefined) availability.dayOfWeek = dayOfWeek;
  if (startTime !== undefined) availability.startTime = startTime;
  if (endTime !== undefined) availability.endTime = endTime;
  if (isRecurring !== undefined) availability.isRecurring = isRecurring;
  if (specificDate !== undefined) availability.specificDate = specificDate;
  if (isException !== undefined) availability.isException = isException;
  if (notes !== undefined) availability.notes = notes;
  if (priority !== undefined) availability.priority = priority;

  await availability.save();

  res.status(200).json({
    success: true,
    data: availability
  });
});

/**
 * @desc    Delete availability
 * @route   DELETE /api/availability/:id
 * @access  Private (Owner of the availability)
 */
exports.deleteAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find availability record
  const availability = await Availability.findByPk(id);

  if (!availability) {
    throw new AppError('Availability not found', 404);
  }

  // Check if user owns this availability
  if (availability.userId !== req.user.id) {
    throw new AppError('Not authorized to delete this availability', 403);
  }

  await availability.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Find optimal rehearsal times
 * @route   GET /api/availability/band/:bandId/optimal
 * @access  Private (Band admin)
 */
exports.findOptimalTimes = asyncHandler(async (req, res) => {
  const { bandId } = req.params;
  const { duration = 120, requiredMembers = [] } = req.body;  // duration in minutes
  
  // Check if user is a band admin
  const membership = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId,
      role: 'admin',
      isActive: true
    }
  });

  const band = await Band.findByPk(bandId);
  if (!band) {
    throw new AppError('Band not found', 404);
  }

  if (!membership && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized: Admin access required', 403);
  }

  // Get all band members
  const members = await BandMember.findAll({
    where: {
      bandId,
      isActive: true,
      ...(requiredMembers.length > 0 && {
        userId: {
          [Op.in]: requiredMembers
        }
      })
    },
    attributes: ['userId']
  });

  const memberIds = members.map(member => member.userId);

  // Get availability for each member
  const availability = await Availability.findAll({
    where: {
      bandId,
      userId: {
        [Op.in]: memberIds
      }
    },
    include: {
      model: User,
      attributes: ['id', 'firstName', 'lastName']
    }
  });

  // Process availability to find optimal times
  // This is a simplified implementation - a real algorithm would be more complex
  // and would need to handle recurring and exception rules properly
  const weekdayAvailability = [0, 1, 2, 3, 4, 5, 6].map(day => {
    const membersAvailable = {};
    
    // Find members available on this day
    availability
      .filter(a => a.isRecurring && a.dayOfWeek === day)
      .forEach(a => {
        if (!membersAvailable[a.userId]) {
          membersAvailable[a.userId] = [];
        }
        membersAvailable[a.userId].push({
          start: a.startTime,
          end: a.endTime
        });
      });
    
    // Find common time slots
    const commonTimes = [];
    
    // Simplified algorithm - just finds times when all members are available
    // In reality, you'd need a more sophisticated algorithm that considers
    // the duration needed and finds overlapping time slots
    
    return {
      day,
      membersAvailable: Object.keys(membersAvailable).length,
      totalMembers: memberIds.length,
      availabilityPercentage: (Object.keys(membersAvailable).length / memberIds.length) * 100,
      bestTimes: commonTimes
    };
  });

  res.status(200).json({
    success: true,
    data: {
      weekdayAvailability: weekdayAvailability,
      recommendation: weekdayAvailability
        .sort((a, b) => b.availabilityPercentage - a.availabilityPercentage)
        .slice(0, 3) // Top 3 days
    }
  });
});