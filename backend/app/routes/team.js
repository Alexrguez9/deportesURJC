const express = require('express')
const controller = require('../controllers/team')

const router = express.Router()
const path = 'teams'

// Ruta GET teams
router.get(`/${path}`, controller.getData);

// Ruta POST team
router.post(`/${path}`, controller.insertData);

// Ruta PUT team
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE team
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router