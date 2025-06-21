const User = require('./User');
const Band = require('./Band');
const Rehearsal = require('./Rehearsal');
const BandMember = require('./BandMember');
const Attendance = require('./Attendance');
const Availability = require('./Availability');

// Band to User (owner) relationship
Band.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});
User.hasMany(Band, {
  foreignKey: 'ownerId',
  as: 'ownedBands',
});

// Band members (many-to-many relationship)
Band.belongsToMany(User, {
  through: BandMember,
  as: 'members',
  foreignKey: 'bandId',
});
User.belongsToMany(Band, {
  through: BandMember,
  as: 'bands',
  foreignKey: 'userId',
});

// Rehearsal relationships
Rehearsal.belongsTo(Band, {
  foreignKey: 'bandId',
});
Band.hasMany(Rehearsal, {
  foreignKey: 'bandId',
});

Rehearsal.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'createdBy',
});
User.hasMany(Rehearsal, {
  foreignKey: 'createdById',
  as: 'createdRehearsals',
});

// Attendance tracking (many-to-many)
Rehearsal.belongsToMany(User, {
  through: Attendance,
  as: 'attendees',
  foreignKey: 'rehearsalId',
});
User.belongsToMany(Rehearsal, {
  through: Attendance,
  as: 'rehearsals',
  foreignKey: 'userId',
});

// User availability
Availability.belongsTo(User, {
  foreignKey: 'userId',
});
User.hasMany(Availability, {
  foreignKey: 'userId',
});

Availability.belongsTo(Band, {
  foreignKey: 'bandId',
});
Band.hasMany(Availability, {
  foreignKey: 'bandId',
});

module.exports = {
  User,
  Band,
  Rehearsal,
  BandMember,
  Attendance,
  Availability,
};