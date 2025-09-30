import { Request, Response } from 'express';
import getFetchOptions from '../utils/constants';

const MARKET_MAP: Record<string, string> = {
	Türkiye: 'turkey',
	USA: 'america',
	Germany: 'germany',
	Japan: 'japan',
	'Hong Kong': 'hongkong',
	UK: 'uk',
	India: 'india',
};

const PREFIX_MARKET_MAP: Record<string, string> = {
	NASDAQ: 'america',
	NYSE: 'america',
	BIST: 'turkey',
	NSE: 'india',
	JPX: 'japan',
	LSE: 'uk',
	HKG: 'hongkong',
	XETRA: 'germany',
};

// GET -> /markets -> Gets all the exchange market countries
export const getMarkets = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!MARKET_MAP || Object.keys(MARKET_MAP).length === 0) {
			return res.status(404).json({ success: false, error: 'No market data found.' });
		}
		res.status(200).json({ success: true, data: MARKET_MAP });
	} catch {
		res.status(500).json({ success: false, error: 'Internal server error.' });
	}
};

// Helper function to determine marketCountry based on stockName
const determineMarketCountry = (stockName: string, queryMarketCountry?: string): string => {
	let marketCountry = queryMarketCountry || 'turkey';

	if (stockName.includes(':')) {
		const prefix = stockName.split(':')[0].toUpperCase();
		if (PREFIX_MARKET_MAP[prefix]) {
			marketCountry = PREFIX_MARKET_MAP[prefix];
		} else {
			const countryFromPrefix = Object.entries(MARKET_MAP).find(([key, val]) =>
			  val.toLowerCase().includes(prefix.toLowerCase())
			);
			if (countryFromPrefix) {
				marketCountry = countryFromPrefix[1];
			}
		}
	}

	return marketCountry;
};

// GET -> / -> Gets all the stocks -> ?range & marketCountry {turkey,america,japan,germany,hongkong,uk}
export const getStocks = async (req: Request, res: Response): Promise<void> => {
	try {
		const range = Number(req.query.range) || 50;
		const stockName = typeof req.query.stockName === 'string' ? req.query.stockName : '';
		const marketCountryQuery =
		  typeof req.query.marketCountry === 'string' ? req.query.marketCountry : undefined;

		const marketCountry = determineMarketCountry(stockName, marketCountryQuery);

		if (!marketCountry || range <= 0) {
			return res.status(400).json({
				success: false,
				error: 'Invalid query parameters. Please provide a valid "marketCountry" and positive "range".',
			});
		}

		const response = await fetch(
		  `https://scanner.tradingview.com/${marketCountry}/scan?label-product=screener-stock`,
		  getFetchOptions(
			`{"columns":["name","description","close","change","sector"],"ignore_unknown_fields":false,"options":{"lang":"tr"},"range":[0,${range}],"sort":{"sortBy":"market_cap_basic","sortOrder":"desc"},"symbols":{},"markets":["${marketCountry}"],"filter2":{"operator":"and","operands":[{"operation":{"operator":"or","operands":[{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["common"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["preferred"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"dr"}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"fund"}},{"expression":{"left":"typespecs","operation":"has_none_of","right":["etf"]}}]}}]}}]}}`
		  )
		);

		if (!response.ok) {
			return res.status(response.status).json({ success: false, error: 'Failed to fetch stock data from the external API.' });
		}

		const data = await response.json();

		if (!data?.data || !Array.isArray(data.data)) {
			return res.status(500).json({ success: false, error: 'Unexpected data format received from external API.' });
		}
		console.log(data.data)
		const items = data.data.map((item: any) => ({
			name: item.d[0],
			symbolCode: item.s,
			description: item.d[1],
			close: item.d[2],
			change: item.d[3],
			sector: item.d[4],
			currency: item.d[11],
		}));

		res.status(200).json({ success: true, data: { totalCount: data.totalCount, items } });
	} catch {
		res.status(500).json({ success: false, error: 'Internal server error.' });
	}
};

// GET -> /:marketCountry/:stockName -> Gets the given stock
export const stockSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		let { marketCountry, stockName } = req.params;

		if (!stockName) {
			return res.status(400).json({ success: false, error: 'Missing required parameter: "stockName".' });
		}

		marketCountry = determineMarketCountry(stockName, marketCountry);
		stockName = stockName.slice(stockName.lastIndexOf(':') + 1);

		const response = await fetch(
		  `https://scanner.tradingview.com/${marketCountry}/scan?label-product=screener-stock`,
		  getFetchOptions(
			`{"columns":["name","description","close","change","sector"],"filter":[{"left":"name,description","operation":"match","right":"${stockName}"}],"ignore_unknown_fields":false,"options":{"lang":"tr"},"range":[0,100],"sort":{"sortBy":"market_cap_basic","sortOrder":"desc"},"symbols":{},"markets":["${marketCountry}"],"filter2":{"operator":"and","operands":[{"operation":{"operator":"or","operands":[{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["common"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["preferred"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"dr"}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"fund"}},{"expression":{"left":"typespecs","operation":"has_none_of","right":["etf"]}}]}}]}}]}}`
		  )
		);

		if (!response.ok) {
			return res.status(response.status).json({ success: false, error: 'Failed to fetch stock data from the external API.' });
		}

		const data = await response.json();

		if (!Array.isArray(data.data)) {
			return res.status(500).json({ success: false, error: 'Unexpected response format from external API.' });
		}

		const items = data.data.map((item: any) => ({
			name: item.d[0],
			symbolCode: item.s,
			description: item.d[1],
			close: item.d[2],
			change: item.d[3],
			sector: item.d[4],
			currency: item.d[11],
		}));

		res.status(200).json({ success: true, data: { totalCount: data.totalCount, items } });
	} catch {
		res.status(500).json({ success: false, error: 'Internal server error.' });
	}
};

// GET -> /news/?stockName=BIST:EREGL&lang=tr -> Gets all the news related to given stock name
export const getStockNews = async (req: Request, res: Response): Promise<void> => {
	try {
		const stockName = req.query.stockName;
		const lang = typeof req.query.lang === 'string' ? req.query.lang : 'en';

		if (!stockName || typeof stockName !== 'string') {
			return res.status(400).json({ success: false, error: 'Missing or invalid "stockName" query parameter.' });
		}

		const options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Accept-Encoding': 'gzip, deflate, br, zstd',
				'Accept-Language': 'en-US,en;q=0.5',
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
				Host: 'scanner.tradingview.com',
				Origin: 'https://tr.tradingview.com',
				Referer: 'https://tr.tradingview.com/',
				'User-Agent':
				  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0',
			},
		};

		const response = await fetch(
		  `https://news-mediator.tradingview.com/public/view/v1/symbol?filter=lang:${lang}&filter=symbol:${stockName}&client=overview`,
		  options
		);

		if (!response.ok) {
			return res.status(response.status).json({ success: false, error: 'Failed to fetch news data from the external API.' });
		}

		const data = await response.json();

		if (!Array.isArray(data.items)) {
			return res.status(500).json({ success: false, error: 'Unexpected response format from external API.' });
		}

		res.status(200).json({ success: true, data: data.items });
	} catch {
		res.status(500).json({ success: false, error: 'Internal server error.' });
	}
};

// GET -> /performance/?stockName=BIST:EREGL -> Gets performance data for the given stock
export const getStockPerformance = async (req: Request, res: Response): Promise<void> => {
	try {
		const stockName = req.query.stockName;
		if (!stockName || typeof stockName !== 'string') {
			return res.status(400).json({ success: false, error: 'Missing or invalid "stockName" query parameter.' });
		}

		const options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Accept-Encoding': 'gzip, deflate, br, zstd',
				'Accept-Language': 'en-US,en;q=0.5',
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
				Host: 'scanner.tradingview.com',
				Origin: 'https://tr.tradingview.com',
				Referer: 'https://tr.tradingview.com/',
				'User-Agent':
				  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0',
			},
		};

		const response = await fetch(
		  `https://scanner.tradingview.com/symbol?symbol=${stockName}&fields=change,Perf.5D,Perf.W,Perf.1M,Perf.6M,Perf.YTD,Perf.Y,Perf.5Y,Perf.All&no_404=true&label-product=symbols-performance`,
		  options
		);

		if (!response.ok) {
			return res.status(response.status).json({ success: false, error: 'Failed to fetch performance data from the external API.' });
		}

		const data = await response.json();

		if (!data || typeof data !== 'object') {
			return res.status(500).json({ success: false, error: 'Unexpected response format from external API.' });
		}

		res.status(200).json({ success: true, data });
	} catch {
		res.status(500).json({ success: false, error: 'Internal server error.' });
	}
};
