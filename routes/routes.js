const { getHistoricalQueries, calculateDistance } = require('../controllers/controllers')
const router = require('express').Router()

router.get('/historical-queries', getHistoricalQueries)

router.post('/calculate-distance', calculateDistance)

module.exports = router