//controller-Resultado.js
const model = require('../models/Resultados');

// obtener data de Resultados
exports.getData = async (req, res) => {
    const resultadoData = await model.find();
    res.json(resultadoData);
}

// Obtener un resultado por su id
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await model.findById(id);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del usuario', message: error.message });
    }
};

// insertar data en Resultados
exports.insertData = async (req, res) => {
    try {
        const result = req.body;
        const { equipo_local_id, equipo_visitante_id } = result;

        // Verificar si ya existen equipos con los mismos IDs
        const existingEquipoLocal = await model.findOne({ equipo_local_id });
        const existingEquipoVisitante = await model.findOne({ equipo_visitante_id });

        if (!existingEquipoLocal || !existingEquipoVisitante) {
            return res.status(400).json({
                error: 'No existe un equipo con este ID',
                equipo_local_id: existingEquipoLocal ? 'Duplicado' : 'Disponible',
                equipo_visitante_id: existingEquipoVisitante ? 'Duplicado' : 'Disponible'
            });
        }

        const formattedBody = {
            jornada: Number(result.jornada),
            goles_local: Number(result.goles_local),
            goles_visitante: Number(result.goles_visitante),
            fecha: new Date(result.fecha),
            ...result,
        };

        // Si no existen, crear el nuevo resultado
        const newResultado = new model(formattedBody);

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
        const result = req.body;
        const formattedBody = {
            jornada: Number(result.jornada),
            goles_local: Number(result.goles_local),
            goles_visitante: Number(result.goles_visitante),
            fecha: new Date(result.fecha),
            ...result,
        };
        const updatedResultado = await model.updateOne({ _id: id }, { $set: result });
        

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