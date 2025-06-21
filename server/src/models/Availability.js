const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const Availability = sequelize.define(
  'Availability',
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
    bandId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Bands',
        key: 'id',
      },
      comment: 'Band-specific availability settings',
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0, // Sunday
        max: 6, // Saturday
      },
      comment: '0=Sunday, 1=Monday, 2=Tuesday, etc.',
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Time of day (HH:MM:SS)',
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Time of day (HH:MM:SS)',
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this is a recurring availability slot',
    },
    recurringRule: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Optional iCal-style RRULE string for complex patterns',
    },
    specificDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'For non-recurring or exception dates',
    },
    isException: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is an exception to normal availability',
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Higher priority overrides lower in conflicts',
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
        fields: ['userId'],
      },
      {
        fields: ['bandId'],
      },
      {
        fields: ['dayOfWeek'],
      },
      {
        fields: ['specificDate'],
      },
    ],
  }
);

module.exports = Availability;