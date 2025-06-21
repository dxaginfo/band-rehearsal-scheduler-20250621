const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const Rehearsal = sequelize.define(
  'Rehearsal',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locationDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurringPattern: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object defining the recurring pattern',
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
      defaultValue: 'scheduled',
    },
    isCancelled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON array of attachment URLs/metadata',
    },
    // bandId is defined as a foreign key through association
    // createdBy is defined as a foreign key through association
  },
  {
    timestamps: true,
    indexes: [
      {
        name: 'rehearsal_band_id',
        fields: ['bandId'],
      },
      {
        name: 'rehearsal_time_range',
        fields: ['startTime', 'endTime'],
      },
    ],
  }
);

// Rehearsal relationships will be defined in models/index.js

module.exports = Rehearsal;