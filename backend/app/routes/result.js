const express = require('express')
const controller = require('../controllers/result')

const router = express.Router()
const path = 'results'

router.get(`/${path}`, controller.getData);

// Get one result by id
router.get(`/${path}/:id`, controller.getOne);

// Add new result
router.post(`/${path}`, controller.insertData);

// Update result by id
router.put(`/${path}/:id`, controller.updateOne);

// Delete result by id
router.delete(`/${path}/:id`, controller.deleteOne);

// Get results by team id
router.get(`/${path}/byTeam/:teamId`, controller.getByTeamId);

module.exports = router;