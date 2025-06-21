const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const RehearsalAttendance = sequelize.define(
  'RehearsalAttendance',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    rehearsalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Rehearsals',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('attending', 'not_attending', 'maybe', 'no_response'),
      defaultValue: 'no_response',
    },
    responseTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attendanceConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    checkinTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    excuseReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for not attending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'rehearsalId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

module.exports = RehearsalAttendance;