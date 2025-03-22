const model = require('../models/Resultados');
const Equipo = require('../models/Equipo');
const mongoose = require('mongoose');

// Función para calcular puntos según goles
const calculatePoints = (goles_local, goles_visitante) => {
    if (goles_local > goles_visitante) return [3, 0]; // Victoria local
    if (goles_local < goles_visitante) return [0, 3]; // Victoria visitante
    return [1, 1]; // Empate
};

const calculateWinDrawLoss = (goles_local, goles_visitante) => {
    if (goles_local > goles_visitante) return [1, 0, 0]; // Victoria local
    if (goles_local < goles_visitante) return [0, 0, 1]; // Victoria visitante
    return [0, 1, 0]; // Empate
}

const updatePoints = async (newResult, prevResult) => {

    // When deleting a result
    if (!newResult && prevResult) {
        const { equipo_local_id, equipo_visitante_id, goles_local, goles_visitante } = prevResult;
        try {
            // Obtain previous points
            const [puntosPrevLocal, puntosPrevVisitante] = calculatePoints(prevResult.goles_local, prevResult.goles_visitante);

            // Calculate diference in win, draw and loss for local
            const restultsLocal = calculateWinDrawLoss(goles_local, goles_visitante);
            // Calculate diference in win, draw and loss for visitante
            const resultsVisitante = calculateWinDrawLoss(prevResult.goles_visitante, prevResult.goles_local);

            await Equipo.findByIdAndUpdate(equipo_local_id, {
                $inc: {
                    points: -puntosPrevLocal,
                    "results.partidos_ganados": -restultsLocal[0],
                    "results.partidos_empatados": -restultsLocal[1],
                    "results.partidos_perdidos": -restultsLocal[2],
                }
            });
            await Equipo.findByIdAndUpdate(equipo_visitante_id, {
                $inc: {
                    points: -puntosPrevVisitante,
                    "results.partidos_ganados": -resultsVisitante[0],
                    "results.partidos_empatados": -resultsVisitante[1],
                    "results.partidos_perdidos": -resultsVisitante[2],
                }
            });
            return;
        }
        catch (error) {
            console.error("Error al actualizar puntos:", error);
        }
    }

    const { equipo_local_id, equipo_visitante_id, goles_local, goles_visitante } = newResult;
    try {
        const [puntosLocal, puntosVisitante] = calculatePoints(goles_local, goles_visitante);
        // Update result
        if (prevResult) {
            if (prevResult?.resultado !== newResult?.resultado) {
                // Obtain previous points
                const [puntosPrevLocal, puntosPrevVisitante] = calculatePoints(prevResult.goles_local, prevResult.goles_visitante);

                // Calculate diference in win, draw and loss for local
                const restultsLocal = calculateWinDrawLoss(prevResult.goles_local, prevResult.goles_visitante).map((x, i) => -x + calculateWinDrawLoss(goles_local, goles_visitante)[i]);
                // Calculate diference in win, draw and loss for visitante
                const resultsVisitante = calculateWinDrawLoss(prevResult.goles_visitante, prevResult.goles_local).map((x, i) => -x + calculateWinDrawLoss(goles_visitante, goles_local)[i]);
        
                await Equipo.findByIdAndUpdate(equipo_local_id, {
                    $inc: {
                        points: -puntosPrevLocal + puntosLocal,
                        "results.partidos_ganados": restultsLocal[0],
                        "results.partidos_empatados": restultsLocal[1],
                        "results.partidos_perdidos": restultsLocal[2],
                    }
                });

                await Equipo.findByIdAndUpdate(equipo_visitante_id, {
                    $inc: {
                        points: -puntosPrevVisitante + puntosVisitante,
                        "results.partidos_ganados": resultsVisitante[0],
                        "results.partidos_empatados": resultsVisitante[1],
                        "results.partidos_perdidos": resultsVisitante[2],
                    }
                });
            }
        // Create new result
        } else {
            const equipoAntes = await Equipo.findById(new mongoose.Types.ObjectId(equipo_local_id));
            // New result, add points
            await Equipo.findByIdAndUpdate(equipo_local_id, {
                $inc: {
                    points: puntosLocal,
                    "results.partidos_ganados": goles_local > goles_visitante ? 1 : 0,
                    "results.partidos_empatados": goles_local === goles_visitante ? 1 : 0,
                    "results.partidos_perdidos": goles_local < goles_visitante ? 1 : 0
                }
            });
            const equipoDespues = await Equipo.findById(equipo_local_id);

            await Equipo.findByIdAndUpdate(new mongoose.Types.ObjectId(equipo_visitante_id), {
                $inc: {
                    points: puntosVisitante,
                    "results.partidos_ganados": goles_visitante > goles_local ? 1 : 0,
                    "results.partidos_empatados": goles_local === goles_visitante ? 1 : 0,
                    "results.partidos_perdidos": goles_visitante < goles_local ? 1 : 0
                }
            });
        }

    } catch (error) {
        console.error("Error al actualizar puntos:", error);
    }
};


// Get all results
exports.getData = async (req, res) => {
    const resultadoData = await model.find();
    res.json(resultadoData);
}

// Get a result by id
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await model.findById(id);
        res.json(resultado);
    } catch (error) {
        res.status(404).json({ error: 'Resultado no encontrado' });
    }
};

// Add a new result
exports.insertData = async (req, res) => {
    try {
        const { equipo_local_id, equipo_visitante_id, goles_local, goles_visitante } = req.body;

        // Verify that both teams exist
        const equipoLocal = await Equipo.findById(equipo_local_id);
        const equipoVisitante = await Equipo.findById(equipo_visitante_id);
        if (!equipoLocal || !equipoVisitante) {
            return res.status(400).json({ error: 'Uno o ambos equipos no existen' });
        }
        // Create and save the new result
        const newResultado = new model(req.body);
        await newResultado.save();

        // Add points to the teams
        await updatePoints(req.body, null);

        res.status(201).json(newResultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar resultado', message: error.message });
    }
};

// Update a result
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const { equipo_local_id, equipo_visitante_id, goles_local, goles_visitante } = req.body;

        // Get the previous result
        const resultadoPrevio = await model.findById(id);
        if (!resultadoPrevio) {
            return res.status(404).json({ message: 'Resultado no encontrado' });
        }
        // Update the result
        const updatedResultado = await model.findByIdAndUpdate(id, req.body, { new: true });

        // Revert the points and statistics of the previous result
        await updatePoints(req.body, resultadoPrevio);

        res.json({ message: 'Resultado actualizado exitosamente', updatedResultado });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar resultado', message: error.message });
    }
};

// Eliminar un resultado
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        // Get the previous result
        const resultadoPrevio = await model.findById(id);
        if (!resultadoPrevio) {
            return res.status(404).json({ message: 'Resultado no encontrado' });
        }
        // Revert the points and statistics of the previous result
        await updatePoints(null, resultadoPrevio);

        // Delete the result
        await model.findByIdAndDelete(id);

        res.json({ message: 'Resultado eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar resultado', message: error.message });
    }
};

// Obtains all results by team id
exports.getByTeamId = async (req, res) => {
    try {
        const { teamId } = req.params;
        const resultados = await model.find({
            $or: [
                { equipo_local_id: teamId },
                { equipo_visitante_id: teamId }
            ]
        });
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener resultados por equipo', message: error.message });
    }
};
