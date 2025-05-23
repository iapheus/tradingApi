import { Request, Response } from 'express';
import { getAllCurrenciesHelper } from '../utils/helperFunctions';
import Currency from '../utils/constants';
import getFetchOptions from '../utils/constants';

// GET -> / -> Gets all the currencies
export const getAllCurrencies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const obj = await getAllCurrenciesHelper();
    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// GET -> /:baseCurrency -> Gets only related to the base currency
export const getSpecific = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const baseCurrency = req.params.baseCurrency;
    if (!baseCurrency || typeof baseCurrency !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid base currency.' });
    }
    const allCurrencies = await getAllCurrenciesHelper();

    if (allCurrencies !== -1) {
      const filteredCurrencies = allCurrencies.filter((item: Currency) => {
        return (
          // USDTRY KISMINDAKİ TRY'Yİ BAZ ALIYOR EĞER BÜTÜN TRY PARİTELERİNİ ÇEKMEK İSTİYORSAN
          // SLİCE'Yİ KALDIR
          // item.name.slice(3).toLowerCase() === baseCurrency.toLowerCase()
          item.name.toLowerCase() === baseCurrency.toLowerCase()
        );
      });

      res.status(200).json({ success: true, data: filteredCurrencies });
    } else {
      res
        .status(400)
        .json({ success: false, error: 'Error fetching currencies' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// GET -> /events/:parites -> Gets all the related events from a parite
export const getPariteEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parites = req.params.parites;
    if (!parites || typeof parites !== 'string' || parites.length < 6) {
      res.status(400).json({ success: false, error: 'Invalid parite format.' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setUTCHours(21, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setUTCHours(21, 0, 0, 0);

    const fromDate = startDate.toISOString();
    const toDate = endDate.toISOString();

    const response = await fetch(
      `https://economic-calendar.tradingview.com/events?from=${fromDate}&to=${toDate}&currencies=${
        parites.slice(0, 3) + ',' + parites.slice(3)
      }`,
      getFetchOptions()
    );

    if (!response.ok) {
      res
        .status(response.status)
        .json({ success: false, error: 'Failed to fetch parite events.' });
    }

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj.result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// GET -> /performance/:parites -> Gets all the related performance metrics from a parite
export const getParitePerformances = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parites = req.params.parites;
    if (!parites || typeof parites !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid parite format.' });
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
      `https://scanner.tradingview.com/symbol?symbol=FX:${parites}&fields=change,Perf.5D,Perf.W,Perf.1M,Perf.6M,Perf.YTD,Perf.Y,Perf.5Y,Perf.All&no_404=true&label-product=symbols-performance`,
      options
    );

    if (!response.ok) {
      res
        .status(response.status)
        .json({ success: false, error: 'Failed to fetch performance data.' });
    }

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// GET -> /news/:parites/:lang -> Gets all the news from related parite
export const getPariteNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lang = req.params.lang;
    const parites = req.params.parites;
    if (
      !lang ||
      typeof lang !== 'string' ||
      !parites ||
      typeof parites !== 'string'
    ) {
      res.status(400).json({ success: false, error: 'Invalid parameters.' });
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
      `https://news-mediator.tradingview.com/public/view/v1/symbol?filter=lang:${lang}&filter=symbol:FX:${parites}&client=landing&streaming=true`,
      options
    );

    if (!response.ok) {
      res
        .status(response.status)
        .json({ success: false, error: 'Failed to fetch parite news.' });
    }

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj.items });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// GET -> /news/read/:storyPath/:lang -> Gets all the information from given news
export const getReadNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storyPath = req.params.storyPath;
    const lang = req.params.lang;

    if (
      !storyPath ||
      typeof storyPath !== 'string' ||
      !lang ||
      typeof lang !== 'string'
    ) {
      res.status(400).json({ success: false, error: 'Invalid parameters.' });
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
      `https://news-headlines.tradingview.com/v3/story?id=tag:${storyPath}&lang=${lang}`,
      options
    );

    if (!response.ok) {
      res
        .status(response.status)
        .json({ success: false, error: 'Failed to fetch news details.' });
    }

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
