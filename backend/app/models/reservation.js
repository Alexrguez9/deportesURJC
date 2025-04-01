const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: './facility',
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

const Facility = require('./facility'); 

// Middleware to calculate the total price before saving the reservation
reservationSchema.pre('save', async function(next) {
  const reservation = this;
  const facility = await Facility.findById(reservation.facilityId);

  if (!facility) {
    throw new Error('Instalación no encontrada');
  }
  const duration = (reservation.endDate - reservation.initDate) / (30 * 60 * 1000); // Duration in half hours
  reservation.totalPrice = parseFloat((duration * facility.priceForHalfHour).toFixed(2));
  
  next();
});


const Reservation = mongoose.model('reservations', reservationSchema);
module.exports = Reservation;