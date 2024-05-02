const mongoose = require('mongoose');

// Creamos Schema de moongose
const ResultadosSchema = new mongoose.Schema(
  { 
    sport: {
        type: String,
        required: true
    },
    fecha: {
        type: String,
        required: true
    },
    equipo_local_id: {
        type: String,
        required: true
    },
    equipo_visitante_id: {
        type: String,
        required: true
    },
    equipo_local: {
        type: String,
        required: true
    },
    equipo_visitante: {
        type: String,
        required: true
    },
    goles_local: {
        type: String,
        required: true
    },
    goles_visitante: {
        type: String,
        required: true
    },
    resultado: {
        type: String,
        required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const Resultados = mongoose.model('Resultados', ResultadosSchema);

module.exports = Resultados;
