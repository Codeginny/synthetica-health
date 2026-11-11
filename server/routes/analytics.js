const { Router } = require('express');
const { filtersSchema, assistantQuerySchema } = require('../validators/schemas');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const analytics = require('../services/analyticsService');
const assistant = require('../services/assistantService');

const router = Router();
router.use(authenticate);

router.get('/analytics/dashboard', asyncHandler(async (req, res) => res.json(await analytics.getDashboard(filtersSchema.parse(req.query)))));
router.get('/analytics/doctors', asyncHandler(async (_req, res) => res.json(await analytics.getDoctors())));
router.post('/assistant/query', asyncHandler(async (req, res) => res.json(await assistant.ask(assistantQuerySchema.parse(req.body)))));

module.exports = router;
