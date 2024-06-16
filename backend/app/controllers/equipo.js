//controller-equipo.js
const model = require('../models/Equipo');

// obtener data de users
exports.getData = async (req, res) => {
    const userData = await model.find();
    res.json(userData);
}

// insertar data en users
exports.insertData = async (req, res) => {
    try {
        const newTeam = new model(req.body);
        const savedTeam = await newTeam.save();
        res.status(201).json(savedTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos de equipo', message: error.message });
    }
};


// editar un equipo
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updateTeam = await model.updateOne({ _id: id }, { $set: body });

        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (updateTeam.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró el equipo para actualizar' });
        } else {
            res.json({ message: 'Equipo actualizado exitosamente', updateTeam });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
}

// eliminar un equipo
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeam = await model.deleteOne({ _id: id });
        
        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (deletedTeam.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró el equipo para eliminar' });
        } else {
            res.json({ message: 'Equipo eliminado exitosamente', deletedTeam });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos', message: error.message });
    }
}