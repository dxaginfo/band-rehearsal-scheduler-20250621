const { Band, User, BandMember } = require('../models');
const { asyncHandler } = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a new band
 * @route   POST /api/bands
 * @access  Private
 */
exports.createBand = asyncHandler(async (req, res) => {
  const { name, description, genre, location } = req.body;

  // Create the band with current user as owner
  const band = await Band.create({
    name,
    description,
    genre,
    location,
    ownerId: req.user.id,
  });

  // Add creator as a band member with admin role
  await BandMember.create({
    userId: req.user.id,
    bandId: band.id,
    role: 'admin',
    joinDate: new Date(),
  });

  res.status(201).json({
    success: true,
    data: band,
  });
});

/**
 * @desc    Get all bands for the current user
 * @route   GET /api/bands
 * @access  Private
 */
exports.getBands = asyncHandler(async (req, res) => {
  const bands = await Band.findAll({
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'members',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: {
          attributes: ['role', 'instrument', 'joinDate'],
        },
      },
    ],
    where: {
      '$members.id$': req.user.id,
    },
  });

  res.status(200).json({
    success: true,
    count: bands.length,
    data: bands,
  });
});

/**
 * @desc    Get a single band by ID
 * @route   GET /api/bands/:id
 * @access  Private (Band members only)
 */
exports.getBand = asyncHandler(async (req, res) => {
  const band = await Band.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'members',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: {
          attributes: ['role', 'instrument', 'joinDate'],
        },
      },
    ],
  });

  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if current user is a member of the band
  const isMember = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: band.id,
    },
  });

  if (!isMember) {
    throw new AppError('Not authorized to access this band', 403);
  }

  res.status(200).json({
    success: true,
    data: band,
  });
});

/**
 * @desc    Update a band
 * @route   PUT /api/bands/:id
 * @access  Private (Band admins only)
 */
exports.updateBand = asyncHandler(async (req, res) => {
  const { name, description, genre, location, isActive } = req.body;

  let band = await Band.findByPk(req.params.id);

  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if current user is a band admin
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: band.id,
    },
  });

  if (!memberRecord || (memberRecord.role !== 'admin' && band.ownerId !== req.user.id)) {
    throw new AppError('Not authorized to update this band', 403);
  }

  // Update band
  band.name = name || band.name;
  band.description = description || band.description;
  band.genre = genre || band.genre;
  band.location = location || band.location;
  
  if (typeof isActive === 'boolean') {
    band.isActive = isActive;
  }

  await band.save();

  res.status(200).json({
    success: true,
    data: band,
  });
});

/**
 * @desc    Delete a band
 * @route   DELETE /api/bands/:id
 * @access  Private (Band owner only)
 */
exports.deleteBand = asyncHandler(async (req, res) => {
  const band = await Band.findByPk(req.params.id);

  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Only the band owner can delete a band
  if (band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to delete this band', 403);
  }

  await band.destroy();

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Add a member to a band
 * @route   POST /api/bands/:id/members
 * @access  Private (Band admins only)
 */
exports.addBandMember = asyncHandler(async (req, res) => {
  const { email, role, instrument } = req.body;

  const band = await Band.findByPk(req.params.id);

  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if current user is a band admin
  const adminRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: band.id,
      role: 'admin',
    },
  });

  if (!adminRecord && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to add members to this band', 403);
  }

  // Find user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('User not found with that email', 404);
  }

  // Check if user is already a member
  const existingMember = await BandMember.findOne({
    where: {
      userId: user.id,
      bandId: band.id,
    },
  });

  if (existingMember) {
    throw new AppError('User is already a member of this band', 400);
  }

  // Add user as band member
  const bandMember = await BandMember.create({
    userId: user.id,
    bandId: band.id,
    role: role || 'member',
    instrument,
    joinDate: new Date(),
  });

  res.status(201).json({
    success: true,
    data: bandMember,
  });
});

/**
 * @desc    Remove a member from a band
 * @route   DELETE /api/bands/:id/members/:userId
 * @access  Private (Band admins only)
 */
exports.removeBandMember = asyncHandler(async (req, res) => {
  const band = await Band.findByPk(req.params.id);

  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if current user is a band admin
  const adminRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: band.id,
      role: 'admin',
    },
  });

  if (!adminRecord && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to remove members from this band', 403);
  }

  // Cannot remove the band owner
  if (band.ownerId === req.params.userId) {
    throw new AppError('Cannot remove the band owner', 400);
  }

  // Find and remove the member
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.params.userId,
      bandId: band.id,
    },
  });

  if (!memberRecord) {
    throw new AppError('User is not a member of this band', 404);
  }

  await memberRecord.destroy();

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Update a band member's role
 * @route   PUT /api/bands/:id/members/:userId
 * @access  Private (Band admins only)
 */
exports.updateBandMember = asyncHandler(async (req, res) => {
  const { role, instrument } = req.body;

  const band = await Band.findByPk(req.params.id);

  if (!band) {
    throw new AppError('Band not found', 404);
  }

  // Check if current user is a band admin
  const adminRecord = await BandMember.findOne({
    where: {
      userId: req.user.id,
      bandId: band.id,
      role: 'admin',
    },
  });

  if (!adminRecord && band.ownerId !== req.user.id) {
    throw new AppError('Not authorized to update members in this band', 403);
  }

  // Find the member to update
  const memberRecord = await BandMember.findOne({
    where: {
      userId: req.params.userId,
      bandId: band.id,
    },
  });

  if (!memberRecord) {
    throw new AppError('User is not a member of this band', 404);
  }

  // Cannot change the role of the band owner
  if (band.ownerId === req.params.userId && role && role !== 'admin') {
    throw new AppError('Cannot change the role of the band owner', 400);
  }

  // Update member
  if (role) memberRecord.role = role;
  if (instrument) memberRecord.instrument = instrument;

  await memberRecord.save();

  res.status(200).json({
    success: true,
    data: memberRecord,
  });
});