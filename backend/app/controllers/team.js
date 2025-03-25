const Team = require('../models/team');

// Get all teams
exports.getData = async (req, res) => {
    const users = await Team.find();
    res.json(users);
}

// Add a new team
exports.insertData = async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        const savedTeam = await newTeam.save();
        res.status(201).json(savedTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos de equipo', message: error.message });
    }
};

// Update a team
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updateTeam = await Team.updateOne({ _id: id }, { $set: body });

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

// Delete a team
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeam = await Team.deleteOne({ _id: id });
        
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