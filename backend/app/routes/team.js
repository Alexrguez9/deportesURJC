const express = require('express')
const controller = require('../controllers/team')

const router = express.Router()
const path = 'equipos'

// Ruta GET equipos
router.get(`/${path}`, controller.getData);

// Ruta POST equipo
router.post(`/${path}`, controller.insertData);

// Ruta PUT equipo
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE equipo
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router