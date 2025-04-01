const express = require('express')
const controller = require('../controllers/user')

const router = express.Router()
const path = 'users'

// Ruta GET users
router.get(`/${path}`, controller.getData);

// Ruta GET user by id
router.get(`/${path}/:id`, controller.getOne);

// Ruta POST register
router.post(`/${path}/register`, controller.register);

// Ruta POST login
router.post(`/${path}/login`, controller.login);

// Ruta POST logout
router.post(`/${path}/logout`, controller.logout);

// Ruta PUT user
router.put(`/${path}/:id`, controller.updateOne);

// Ruta PUT user edit password and profile
router.put(`/${path}/:id/profile`, controller.updatePasswordAndName);

// Ruta DELETE user
router.delete(`/${path}/:id`, controller.deleteOne);

// Nueva ruta para obtener el email del admin desde .env
router.post(`/${path}/check-admin`, controller.checkIfAdmin );

module.exports = router;