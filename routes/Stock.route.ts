import express from 'express';
import {
	getMarkets,
	getStocks,
	stockSearch,
	getStockNews,
	getStockPerformance,
} from '../controllers/Stock.controller';

const router = express.Router();

// GET -> /markets -> Gets all the exchange market countries
router.get('/markets', getMarkets);

// GET -> / -> Gets all the stocks -> ?range & marketCountry {turkey,america,japan,germany,hongkong,uk}
router.get('/', getStocks);

// GET -> /:marketCountry/:stockName -> Search the given parameter in stocks
router.get('/:marketCountry/:stockName', stockSearch);

// GET -> /news -> Gets all the news -> ?stockName
router.get('/news/', getStockNews);

// GET -> /performance -> Gets all the performance -> ?stockName
router.get('/performance/', getStockPerformance);

export default router;
