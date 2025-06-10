const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isInternSport: {
        type: Boolean,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    schedule: {
        initialHour: {
            type: Date,
            required: true
        },
        endHour: {
            type: Date,
            required: true
        }
    },
    capacity: {
        type: Number,
        required: true
    },
    priceForHalfHour: {
        type: Number,
        required: true
    }
});

const Facility = mongoose.model('Facility', facilitySchema);

module.exports = Facility;