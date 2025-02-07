const mongoose = require('mongoose');

// Esquema de Resultados
const ResultadosSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true
    },
    jornada: {
      type: Number,
      default: 0,
      required: true
    },
    fecha: {
      type: Date,
      required: true
    },
    hora: {
      type: String,
      required: true
    },
    lugar: {
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
      type: Number,
      required: true
    },
    goles_visitante: {
      type: Number,
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

// Middleware para formatear los datos antes de guardarlos
ResultadosSchema.pre('save', function (next) {
    try {
        this.goles_local = Number(this.goles_local);
        this.goles_visitante = Number(this.goles_visitante);

        if (isNaN(this.goles_local) || isNaN(this.goles_visitante)) {
            throw new Error('Los goles deben ser números válidos.');
        }

        if (this.fecha) {
            const fecha = new Date(this.fecha);
            if (isNaN(fecha.getTime())) {
                throw new Error('La fecha no es válida.');
            }
            this.fecha = fecha.toISOString().split('T')[0];
        }

        if (this.hora) {
            const [hours, minutes] = this.hora.split(':');
            if (!hours || !minutes) {
                throw new Error('La hora debe estar en formato HH:mm.');
            }
            this.hora = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }

        next();
    } catch (error) {
        next(error);
    }
});


const Resultados = mongoose.model('resultados', ResultadosSchema);

module.exports = Resultados;
