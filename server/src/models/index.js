const User = require('./User');
const Band = require('./Band');
const Rehearsal = require('./Rehearsal');
const BandMember = require('./BandMember');
const Attendance = require('./Attendance');
const Availability = require('./Availability');
const RehearsalAttendance = require('./RehearsalAttendance');

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
  foreignKey: 'createdBy',
  as: 'creator',
});
User.hasMany(Rehearsal, {
  foreignKey: 'createdBy',
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

// Rehearsal attendance (for newer implementation)
Rehearsal.belongsToMany(User, {
  through: RehearsalAttendance,
  as: 'attendeesDetailed',
  foreignKey: 'rehearsalId',
});
User.belongsToMany(Rehearsal, {
  through: RehearsalAttendance,
  as: 'rehearsalsDetailed',
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
  RehearsalAttendance,
};