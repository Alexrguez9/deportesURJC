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
      partidos_ganados: {
        type: Number,
        default: 0
      },
      partidos_empatados: {
        type: Number,
        default: 0
      },
      partidos_perdidos: {
        type: Number,
        default: 0
      }
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const Equipo = mongoose.model('equipos', EquipoSchema);

module.exports = Equipo;
