const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const BandMember = sequelize.define(
  'BandMember',
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
    },
    role: {
      type: DataTypes.ENUM('admin', 'member', 'guest'),
      defaultValue: 'member',
    },
    instrument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
        fields: ['userId', 'bandId'],
      },
    ],
  }
);

module.exports = BandMember;