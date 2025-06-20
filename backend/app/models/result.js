const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  round: { type: Number, default: 0, required: true },
  date: { type: Date, required: true },
  hour: { type: String, required: true },
  place: { type: String, required: true },
  localTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true },
  visitorTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'teams', required: true },
  localTeam: { type: String, required: true },
  visitorTeam: { type: String, required: true },
  localGoals: { type: Number, required: true },
  visitorGoals: { type: Number, required: true },
  result: { type: String, required: true }
}, {
  versionKey: false,
  timestamps: true
});

// Middleware for validating and formatting data before saving
resultSchema.pre('save', function (next) {
    try {
        this.localGoals = Number(this.localGoals);
        this.visitorGoals = Number(this.visitorGoals);

        if (isNaN(this.localGoals) || isNaN(this.visitorGoals)) {
            throw new Error('Los goles deben ser números válidos.');
        }

        if (this.date) {
            const date = new Date(this.date);
            if (isNaN(date.getTime())) {
                throw new Error('La fecha no es válida.');
            }
        }

        if (this.hour) {
            const [hours, minutes] = this.hour.split(':');
            if (!hours || !minutes) {
                throw new Error('La hora debe estar en formato HH:mm.');
            }
            this.hour = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }

        next();
    } catch (error) {
        next(error);
    }
});


const Result = mongoose.model('results', resultSchema);

module.exports = Result;
