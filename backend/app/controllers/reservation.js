const Reservation = require('../models/reservation');

// Get all data from Reservas
exports.getData = async (req, res) => {
    const reservations = await Reservation.find();
    res.json(reservations);
}

// Add new reservation
exports.insertData = async (req, res) => {
    try {
        const { userId, facilityId, initDate, endDate, totalPrice, isPaid }  = req.body;

        if (!userId || !facilityId || !initDate || !endDate) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const newReserva = new Reservation({
            userId,
            facilityId,
            initDate,
            endDate,
            totalPrice,
            isPaid
        });

        const savedReservation = await newReserva.save();
        res.status(201).json(savedReservation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos de reserva', message: error.message });
    }
};

// Update a reservation
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedReservation = await Reservation.updateOne({ _id: id }, { $set: body });

        if (updatedReservation.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró la reserva para actualizar' });
        } else {
            res.json({ message: 'Reserva actualizada exitosamente', updatedReservation });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos de la reserva', message: error.message });
    }
}

// Delete a reservation
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReservation = await Reservation.deleteOne({ _id: id });
        
        if (deletedReservation.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró la reserva para eliminar' });
        } else {
            res.json({ message: 'Reserva eliminada exitosamente', deletedReservation });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos de la reserva', message: error.message });
    }
}