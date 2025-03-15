const express = require('express')
const controller = require('../controllers/user')

const router = express.Router()
const path = 'users'

// Ruta GET users
router.get('/users', controller.getData);

// Ruta GET user by id
router.get('/users/:id', controller.getOne);

// Ruta POST register
router.post('/users/register', controller.register);

// Ruta POST login
router.post('/users/login', controller.login);

// Ruta POST logout
router.post('/users/logout', controller.logout);

// Ruta PUT user
router.put('/users/:id', controller.updateOne);

// Ruta PUT user edit password and profile
router.put("/users/:id/profile", controller.updatePasswordAndName);

// Ruta DELETE user
router.delete('/users/:id', controller.deleteOne);

// Nueva ruta para obtener el email del admin desde .env
router.post("/users/check-admin", controller.checkIfAdmin );

module.exports = router;