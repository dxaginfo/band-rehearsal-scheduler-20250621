const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const Attendance = sequelize.define(
  'Attendance',
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
      type: DataTypes.ENUM('confirmed', 'declined', 'tentative', 'no_response'),
      defaultValue: 'no_response',
    },
    responseTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attendanceConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the user actually attended (checked in)',
    },
    checkinTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    excuseReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reminderSentAt: {
      type: DataTypes.DATE,
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
    ],
  }
);

module.exports = Attendance;