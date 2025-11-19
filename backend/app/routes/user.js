const express = require('express')
const controller = require('../controllers/user')

const router = express.Router()
const path = 'users'

router.get(`/${path}`, controller.getData);

// Login cookie
router.get(`/${path}/session`, controller.getSessionUser);

router.get(`/${path}/:id`, controller.getOne);

router.post(`/${path}/register`, controller.register);

router.post(`/${path}/login`, controller.login);

router.post(`/${path}/logout`, controller.logout);

router.put(`/${path}/:id`, controller.updateOne);

router.put(`/${path}/:id/profile`, controller.updatePasswordAndName);

router.delete(`/${path}/:id`, controller.deleteOne);

// Checks admin user email from .env
router.post(`/${path}/check-admin`, controller.checkIfAdmin);

module.exports = router;