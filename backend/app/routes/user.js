const express = require('express')
const controller = require('../controllers/user')

const router = express.Router()
const path = 'users'

// Ruta GET users
router.get(`/${path}`, controller.getData);

// Ruta POST user
router.post(`/${path}`, controller.insertData);

// Ruta PUT user
router.put(`/${path}/:id`, controller.updateOne);

// Ruta DELETE user
router.delete(`/${path}/:id`, controller.deleteOne);

module.exports = router;