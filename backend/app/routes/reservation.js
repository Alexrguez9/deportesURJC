const express = require('express')
const controller = require('../controllers/reservation')

const router = express.Router()
const path = 'reservations'

// Ruta GET reservations
router.get(`/${path}`, controller.getData);

// Ruta POST reservation
router.post(`/${path}`, controller.insertData);

// Ruta PUT reservation
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE reservation
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router;