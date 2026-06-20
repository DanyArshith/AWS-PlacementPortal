const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', phase: 3, mode: 'mock-backend' });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
