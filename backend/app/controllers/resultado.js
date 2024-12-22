//controller-Resultado.js
const model = require('../models/Resultados');

// obtener data de Resultados
exports.getData = async (req, res) => {
    const resultadoData = await model.find();
    res.json(resultadoData);
}

// insertar data en Resultados
exports.insertData = async (req, res) => {
    try {
        const newResultado = new model(req.body);
        const savedResultado = await newResultado.save();
        res.status(201).json(savedResultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos', message: error.message });
    }
};

// editar un Resultado
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedResultado = await model.updateOne({ _id: id }, { $set: body });

        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (updatedResultado.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        } else {
            res.json({ message: 'Usuario actualizado exitosamente', updatedResultado });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
}

// eliminar un Resultado
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResultado = await model.deleteOne({ _id: id });
        
        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (deletedResultado.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para eliminar' });
        } else {
            res.json({ message: 'Usuario eliminado exitosamente', deletedResultado });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos', message: error.message });
    }
}