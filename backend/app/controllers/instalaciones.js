const Instalacion = require('../models/Instalaciones');

// obtener data de Instalaciones
exports.getData = async (req, res) => {
    try {
        const instalacionData = await Instalacion.find();
        res.json(instalacionData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos de los instalaciones', message: error.message });
    }
};

// insertar data en Instalaciones
exports.insertData = async (req, res) => {
    try {
        const newInstalacion = new Instalacion(req.body);
        const savedInstalacion = await newInstalacion.save();
        res.status(201).json(savedInstalacion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos', message: error.message });
    }
};

// editar una Instalación
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedInstalacion = await Instalacion.updateOne({ _id: id }, { $set: body });

        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (updatedInstalacion.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        } else {
            res.json({ message: 'Usuario actualizado exitosamente', updatedInstalacion });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
}

// eliminar una Instalación
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInstalacion = await Instalacion.deleteOne({ _id: id });
        
        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (deletedInstalacion.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para eliminar' });
        } else {
            res.json({ message: 'Usuario eliminado exitosamente', deletedInstalacion });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos', message: error.message });
    }
}