const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    sport: {
      type: String,
      required: true
    },
    results: {
      wins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      losses: { type: Number, default: 0 }
    },
    points: { 
      type: Number,
      default: 0 
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const Team = mongoose.model('teams', teamSchema);

module.exports = Team;
