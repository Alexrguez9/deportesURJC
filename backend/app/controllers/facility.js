const Facility = require('../models/facility');

// Get all facilities
exports.getData = async (req, res) => {
    try {
        const facilities = await Facility.find();
        res.json(facilities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos de los instalaciones', message: error.message });
    }
};

// Add a new facility
exports.insertData = async (req, res) => {
    try {
        const newFacility = new Facility(req.body);
        const savedFacility = await newFacility.save();
        res.status(201).json(savedFacility);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos', message: error.message });
    }
};

// Update a facility
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedFacility = await Facility.updateOne({ _id: id }, { $set: body });

        if (updatedFacility.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        } else {
            res.json({ message: 'Usuario actualizado exitosamente', updatedFacility });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
}

// Delete a facility
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFacility = await Facility.deleteOne({ _id: id });
        
        if (deletedFacility.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para eliminar' });
        } else {
            res.json({ message: 'Usuario eliminado exitosamente', deletedFacility });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos', message: error.message });
    }
}