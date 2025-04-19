import { Request, Response } from 'express';
import getFetchOptions from '../utils/constants';

// GET -> /markets -> Gets all the exchange market countries
export const getMarkets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const markets = {
      Türkiye: 'turkey',
      USA: 'america',
      Germany: 'germany',
      Japan: 'japan',
      'Hong Kong': 'hongkong',
      UK: 'uk',
    };

    if (!markets || Object.keys(markets).length === 0) {
      res.status(404).json({
        success: false,
        error: 'No market data found.',
      });
    }

    res.status(200).json({
      success: true,
      data: markets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
};

// GET -> / -> Gets all the stocks -> ?range & marketCountry {turkey,america,japan,germany,hongkong,uk}
export const getStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = Number(req.query.range) || 50;
    const marketCountry =
      typeof req.query.marketCountry === 'string'
        ? req.query.marketCountry
        : 'turkey';

    if (!marketCountry || typeof range !== 'number' || range <= 0) {
      res.status(400).json({
        success: false,
        error:
          'Invalid query parameters. Please provide a valid "marketCountry" and positive "range".',
      });
    }

    const response = await fetch(
      `https://scanner.tradingview.com/${marketCountry}/scan?label-product=screener-stock`,
      getFetchOptions(
        `{"columns":["name","description","close","change","sector"],"ignore_unknown_fields":false,"options":{"lang":"tr"},"range":[0,${range}],"sort":{"sortBy":"market_cap_basic","sortOrder":"desc"},"symbols":{},"markets":["${marketCountry}"],"filter2":{"operator":"and","operands":[{"operation":{"operator":"or","operands":[{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["common"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["preferred"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"dr"}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"fund"}},{"expression":{"left":"typespecs","operation":"has_none_of","right":["etf"]}}]}}]}}]}}`
      )
    );

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: 'Failed to fetch stock data from the external API.',
      });
    }

    const data = await response.json();

    if (!data || !data.data || !Array.isArray(data.data)) {
      res.status(500).json({
        success: false,
        error: 'Unexpected data format received from external API.',
      });
    }

    const items = data.data.map((item) => ({
      name: item.d[0],
      symbolCode: item.s,
      description: item.d[1],
      close: item.d[2],
      change: item.d[3],
      sector: item.d[4],
      currency: item.d[11],
    }));

    res.status(200).json({
      success: true,
      data: { totalCount: data.totalCount, items },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
};

// GET -> /:marketCountry/:stockName -> Gets the given stock
export const stockSearch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const marketCountry = req.params.marketCountry;
    const stockName = req.params.stockName;

    if (!marketCountry || !stockName) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: "marketCountry" and "stockName".',
      });
    }

    const response = await fetch(
      `https://scanner.tradingview.com/${marketCountry}/scan?label-product=screener-stock`,
      getFetchOptions(
        `{"columns":["name","description","close","change","sector"],"filter":[{"left":"name,description","operation":"match","right":"${stockName}"}],"ignore_unknown_fields":false,"options":{"lang":"tr"},"range":[0,100],"sort":{"sortBy":"market_cap_basic","sortOrder":"desc"},"symbols":{},"markets":["${marketCountry}"],"filter2":{"operator":"and","operands":[{"operation":{"operator":"or","operands":[{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["common"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"stock"}},{"expression":{"left":"typespecs","operation":"has","right":["preferred"]}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"dr"}}]}},{"operation":{"operator":"and","operands":[{"expression":{"left":"type","operation":"equal","right":"fund"}},{"expression":{"left":"typespecs","operation":"has_none_of","right":["etf"]}}]}}]}}]}}`
      )
    );

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: 'Failed to fetch stock data from the external API.',
      });
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      res.status(500).json({
        success: false,
        error: 'Unexpected response format from external API.',
      });
    }

    const items = data.data.map((item) => ({
      name: item.d[0],
      symbolCode: item.s,
      description: item.d[1],
      close: item.d[2],
      change: item.d[3],
      sector: item.d[4],
      currency: item.d[11],
    }));

    res.status(200).json({
      success: true,
      data: { totalCount: data.totalCount, items },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
};

// GET -> /news/?stockName=BIST:EREGL&lang=tr -> Gets all the news related to given stock name
export const getStockNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stockName = req.query.stockName;
    const lang = req.query.lang || 'en';

    if (!stockName || typeof stockName !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid "stockName" query parameter.',
      });
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
      res.status(response.status).json({
        success: false,
        error: 'Failed to fetch news data from the external API.',
      });
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.items)) {
      res.status(500).json({
        success: false,
        error: 'Unexpected response format from external API.',
      });
    }

    res.status(200).json({ success: true, data: data.items });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
};

// GET -> /performance/?stockName=BIST:EREGL -> Gets all the news related to given stock name
export const getStockPerformance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stockName = req.query.stockName;

    if (!stockName || typeof stockName !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid "stockName" query parameter.',
      });
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
      res.status(response.status).json({
        success: false,
        error: 'Failed to fetch performance data from the external API.',
      });
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      res.status(500).json({
        success: false,
        error: 'Unexpected response format from external API.',
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
};
