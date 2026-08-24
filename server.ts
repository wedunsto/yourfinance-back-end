import "dotenv/config";
const express = require('express');
const healthRoutes = require('./src/routes/health.routes');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(express.json());

app.use('/api/health', healthRoutes);

app.listen(PORT, () => {
  console.log(`yourfinance-backend listening on port ${PORT}`);
});

module.exports = app;
