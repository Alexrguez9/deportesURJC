const Result = require('../models/result');
const Team = require('../models/team');
const mongoose = require('mongoose');

// Function to calculate points based on the result of the match
const calculatePoints = (local_goals, visitor_goals) => {
    if (local_goals > visitor_goals) return [3, 0]; // Local win
    if (local_goals < visitor_goals) return [0, 3]; // Visitor win
    return [1, 1]; // Draw
};

const calculateWinDrawLoss = (local_goals, visitor_goals) => {
    if (local_goals > visitor_goals) return [1, 0, 0]; // Local win
    if (local_goals < visitor_goals) return [0, 0, 1]; // Visitor win
    return [0, 1, 0]; // Draw
}

const updatePoints = async (newResult, prevResult) => {

    // When deleting a result
    if (!newResult && prevResult) {
        const { localTeamId, visitorTeamId, localGoals, visitorGoals } = prevResult;
        try {
            // Obtain previous points
            const [prevLocalPoints, prevVisitorPoints] = calculatePoints(prevResult.localGoals, prevResult.visitorGoals);

            // Calculate diference in win, draw and loss for local
            const localResults = calculateWinDrawLoss(localGoals, visitorGoals);
            // Calculate diference in win, draw and loss for visitante
            const visitorResults = calculateWinDrawLoss(prevResult.visitorGoals, prevResult.localGoals);

            await Team.findByIdAndUpdate(localTeamId, {
                $inc: {
                    points: -prevLocalPoints,
                    "results.wins": -localResults[0],
                    "results.draws": -localResults[1],
                    "results.losses": -localResults[2],
                }
            });
            await Team.findByIdAndUpdate(visitorTeamId, {
                $inc: {
                    points: -prevVisitorPoints,
                    "results.wins": -visitorResults[0],
                    "results.draws": -visitorResults[1],
                    "results.losses": -visitorResults[2],
                }
            });
            return;
        }
        catch (error) {
            console.error("Error al actualizar puntos:", error);
        }
    }

    const { localTeamId, visitorTeamId, localGoals, visitorGoals } = newResult;
    try {
        const [localPoints, visitorPoints] = calculatePoints(localGoals, visitorGoals);
        // Update result
        if (prevResult) {
            if (prevResult?.result !== newResult?.result) {
                // Obtain previous points
                const [prevLocalPoints, prevVisitorPoints] = calculatePoints(prevResult.localGoals, prevResult.visitorGoals);

                // Calculate diference in win, draw and loss for local
                const localResults = calculateWinDrawLoss(prevResult.localGoals, prevResult.visitorGoals).map((x, i) => -x + calculateWinDrawLoss(localGoals, visitorGoals)[i]);
                // Calculate diference in win, draw and loss for visitante
                const visitorResults = calculateWinDrawLoss(prevResult.visitorGoals, prevResult.localGoals).map((x, i) => -x + calculateWinDrawLoss(visitorGoals, localGoals)[i]);
        
                await Team.findByIdAndUpdate(localTeamId, {
                    $inc: {
                        points: -prevLocalPoints + localPoints,
                        "results.wins": localResults[0],
                        "results.draws": localResults[1],
                        "results.losses": localResults[2],
                    }
                });

                await Team.findByIdAndUpdate(visitorTeamId, {
                    $inc: {
                        points: -prevVisitorPoints + visitorPoints,
                        "results.wins": visitorResults[0],
                        "results.draws": visitorResults[1],
                        "results.losses": visitorResults[2],
                    }
                });
            }
        // Create new result
        } else {
            const oldTeam = await Team.findById(new mongoose.Types.ObjectId(localTeamId));
            // New result, add points
            await Team.findByIdAndUpdate(localTeamId, {
                $inc: {
                    points: localPoints,
                    "results.wins": localGoals > visitorGoals ? 1 : 0,
                    "results.draws": localGoals === visitorGoals ? 1 : 0,
                    "results.losses": localGoals < visitorGoals ? 1 : 0
                }
            });
            const newTeam = await Team.findById(localTeamId);

            await Team.findByIdAndUpdate(new mongoose.Types.ObjectId(visitorTeamId), {
                $inc: {
                    points: visitorPoints,
                    "results.wins": visitorGoals > localGoals ? 1 : 0,
                    "results.draws": localGoals === visitorGoals ? 1 : 0,
                    "results.losses": visitorGoals < localGoals ? 1 : 0
                }
            });
        }

    } catch (error) {
        console.error("Error al actualizar puntos:", error);
    }
};


// Get all results
exports.getData = async (req, res) => {
    const results = await Result.find();
    res.json(results);
}

// Get a result by id
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Result.findById(id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: 'Resultado no encontrado' });
    }
};

// Add a new result
exports.insertData = async (req, res) => {
    try {
        const { localTeamId, visitorTeamId } = req.body;

        // Verify that both teams exist
        const localTeam = await Team.findById(localTeamId);
        const visitorTeam = await Team.findById(visitorTeamId);
        if (!localTeam || !visitorTeam) {
            return res.status(400).json({ error: 'Uno o ambos equipos no existen' });
        }
        // Create and save the new result
        const newResult = new Result(req.body);
        await newResult.save();

        // Add points to the teams
        await updatePoints(req.body, null);

        res.status(201).json(newResult);
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar resultado', message: error.message });
    }
};

// Update a result
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;

        // Get the previous result
        const prevResult = await Result.findById(id);
        if (!prevResult) {
            return res.status(404).json({ message: 'Resultado no encontrado' });
        }
        // Update the result
        const updatedResult = await Result.findByIdAndUpdate(id, req.body, { new: true });

        // Revert the points and statistics of the previous result
        await updatePoints(req.body, prevResult);

        res.json({ message: 'Resultado actualizado exitosamente', updatedResult });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar resultado', message: error.message });
    }
};

// Delete a result
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        // Get the previous result
        const prevResult = await Result.findById(id);
        if (!prevResult) {
            return res.status(404).json({ message: 'Resultado no encontrado' });
        }
        // Revert the points and statistics of the previous result
        await updatePoints(null, prevResult);

        // Delete the result
        await Result.findByIdAndDelete(id);

        res.json({ message: 'Resultado eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar resultado', message: error.message });
    }
};

// Obtains all results by team id
exports.getByTeamId = async (req, res) => {
    try {
        const { teamId } = req.params;
        const results = await Result.find({
            $or: [
                { localTeamId: teamId },
                { visitorTeamId: teamId }
            ]
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener resultados por equipo', message: error.message });
    }
};
