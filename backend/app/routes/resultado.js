const express = require('express')
const controller = require('../controllers/resultado')

const router = express.Router()
const path = 'resultados'

// Ruta GET resultados
router.get(`/${path}`, controller.getData);

// Ruta GET result by id
router.get(`/${path}/:id`, controller.getOne);

// Ruta POST resultado
router.post(`/${path}`, controller.insertData);

// Ruta PUT resultado
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE resultado
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router;