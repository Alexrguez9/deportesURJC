const mongoose = require('mongoose');

// Esquema de Reserva
const reservasSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'instalaciones',
    required: true
  },
  initDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
});

// Middleware to calculate the total price before saving the reservation
reservasSchema.pre('save', async function(next) {
  const reservation = this;
  const facility = await mongoose.model('instalaciones').findById(reservation.facilityId);

  if (!facility) {
    throw new Error('Instalación no encontrada');
  }
  const duration = (reservation.endDate - reservation.initDate) / (30 * 60 * 1000); // Duration in half hours
  reservation.totalPrice = duration * facility.priceForHalfHour;
  
  next();
});


const Reservation = mongoose.model('reservas', reservasSchema);
module.exports = Reservation;