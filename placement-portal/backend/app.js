const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(morgan((tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: Number(tokens['response-time'](req, res)),
      contentLength: tokens.res(req, res, 'content-length'),
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
  }, {
    stream: {
      write: (message) => {
        try {
          const logData = JSON.parse(message);
          logger.info(`HTTP ${logData.method} ${logData.url} - ${logData.status}`, logData);
        } catch (err) {
          logger.info(message.trim());
        }
      }
    }
  }));
} else {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', phase: 3, mode: 'mock-backend' });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
