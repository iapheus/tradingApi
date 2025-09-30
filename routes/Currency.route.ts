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

// GET -> / -> Gets all the currencies
router.get('/', getAllCurrencies);

// GET -> /:baseCurrency -> Gets only related to the base currency
router.get('/:baseCurrency', getSpecific);

// GET -> /events/:parites -> Gets all the related events from a parite
router.get('/events/:parites', getPariteEvents);

// GET -> /performance/:parites -> Gets all the related performance metrics from a parite
router.get('/performance/:parites', getParitePerformances);

// GET -> /news/:parites/:lang -> Gets all the news from related parite
router.get('/news/:parites/:lang', getPariteNews);

// GET -> /news/read/:storyPath/:lang -> Gets all the information from given news
router.get('/news/read/:storyPath/:lang', getReadNews);

export default router;
