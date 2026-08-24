const healthService = require('../services/health.service');

function getHealth(req, res) {
  const status = healthService.getStatus();
  res.status(200).json(status);
}

module.exports = { getHealth };
