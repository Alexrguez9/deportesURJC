const mongoose = require('mongoose');

// Esquema de Reserva
const reservasSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  instalacionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'instalaciones',
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  precioTotal: {
    type: Number,
    required: true
  }
});

// Middleware para calcular el precio total antes de guardar
reservasSchema.pre('save', async function(next) {
  const reserva = this;
  const instalacion = await mongoose.model('instalaciones').findById(reserva.instalacionId);

  if (!instalacion) {
    throw new Error('Instalación no encontrada');
  }
  
  const duracion = (reserva.fecha_fin - reserva.fecha_inicio) / (30 * 60 * 1000); // Duración en medias horas
  reserva.precioTotal = duracion * instalacion.precioPorMediaHora;
  
  next();
});
*/

const Reservas = mongoose.model('reservas', reservasSchema);
module.exports = Reservas;