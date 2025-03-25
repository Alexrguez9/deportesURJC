const mongoose = require('mongoose');

// Creamos Schema de moongose
const EquipoSchema = new mongoose.Schema(
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

const Team = mongoose.model('equipos', EquipoSchema);

module.exports = Team;
