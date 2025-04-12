import express from 'express';
import {
  getAllCurrencies,
  getSpecific,
  getPariteEvents,
  getParitePerformances,
  getPariteNews,
  getReadNews,
} from '../controllers/Currency.controller';

const router = express.Router();

router.get('/', getAllCurrencies);

router.get('/:baseCurrency', getSpecific);

router.get('/events/:parites', getPariteEvents);

router.get('/performance/:parites', getParitePerformances);

router.get('/news/:parites/:lang', getPariteNews);

router.get('/news/read/:storyPath/:lang', getReadNews);

module.exports = router;
