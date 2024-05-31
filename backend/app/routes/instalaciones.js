const express = require('express')
const controller = require('../controllers/instalaciones')

const router = express.Router()
const path = 'instalaciones'

// Ruta GET instalaciones
router.get(`/${path}`, controller.getData);

// Ruta POST instalaciones
router.post(`/${path}`, controller.insertData);

// Ruta PUT instalaciones
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE instalaciones
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router;