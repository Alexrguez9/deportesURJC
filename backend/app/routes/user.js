const express = require('express')
const controller = require('../controllers/user')

const router = express.Router()
const path = 'users'

// Ruta GET users
router.get('/users', controller.getData);

// Ruta POST register
router.post('/users/register', controller.register);

// Ruta POST login
router.post('/users/login', controller.login);

// Ruta POST logout
router.post('/users/logout', controller.logout);

// Ruta PUT user
router.put('/users/:id', controller.updateOne);

// Ruta DELETE user
router.delete('/users/:id', controller.deleteOne);

module.exports = router;