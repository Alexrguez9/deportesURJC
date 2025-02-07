const mongoose = require('mongoose');

// Esquema de Intalación
const instalacionSchema = new mongoose.Schema({
    nombre: {
      type: String,
      required: true
    },
    isInternSport: {
      type: String,
      required: true
    },
    descripcion: {
      type: String,
      required: true
    },
    horario: {
      horarioInicio: {
        type: Date,
        required: true
      },
      horarioFin: {
      type: Date,
      required: true
      }
    },
    capacidad: {
      type: Number,
      required: true
    },
    precioPorMediaHora: {
      type: Number,
      required: true
    }
  });

// Definir el modelo de Instalación
const Instalacion = mongoose.model('instalaciones', instalacionSchema);

module.exports = Instalacion;