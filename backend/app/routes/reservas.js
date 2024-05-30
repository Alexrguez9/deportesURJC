const express = require('express')
const controller = require('../controllers/reservas')

const router = express.Router()
const path = 'reservas'

// Ruta GET reservas
router.get(`/${path}`, controller.getData);

// Ruta POST reservas
router.post(`/${path}`, controller.insertData);

// Ruta PUT reservas
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE reservas
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router;