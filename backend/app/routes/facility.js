const express = require('express')
const controller = require('../controllers/facility')

const router = express.Router()
const path = 'facilities'

// Ruta GET facilities
router.get(`/${path}`, controller.getData);

// Ruta POST facilities
router.post(`/${path}`, controller.insertData);

// Ruta PUT facilities
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE facilities
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router;