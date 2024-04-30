//controller-user.js
const model = require('../models/user');

// obtener data de users
exports.getData = async (req, res) => {
    const userData = await model.find();
    res.json(userData);
}

// insertar data en users
exports.insertData = async (req, res) => {
    try {
        const newUser = new model(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos', message: error.message });
    }
};

// editar un user
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedUser = await model.updateOne({ _id: id }, { $set: body });

        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (updatedUser.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        } else {
            res.json({ message: 'Usuario actualizado exitosamente', updatedUser });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
}

// eliminar un user
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await model.deleteOne({ _id: id });
        
        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (deletedUser.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para eliminar' });
        } else {
            res.json({ message: 'Usuario eliminado exitosamente', deletedUser });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos', message: error.message });
    }
}