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
    res.status(400).json({ success: false, error: err });
  }
};

// GET -> /:baseCurrency -> Gets only related to the base currency
export const getSpecific = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allCurrencies = await getAllCurrenciesHelper();

    if (allCurrencies !== -1) {
      const filteredCurrencies = allCurrencies.filter((item: Currency) => {
        return (
          // USDTRY KISMINDAKİ TRY'Yİ BAZ ALIYOR EĞER BÜTÜN TRY PARİTELERİNİ ÇEKMEK İSTİYORSAN
          // SLİCE'Yİ KALDIR
          item.name.slice(3).toLowerCase() ===
          req.params.baseCurrency.toLowerCase()
        );
      });

      res.status(200).json({ success: true, data: filteredCurrencies });
    } else {
      res
        .status(400)
        .json({ success: false, error: 'Error fetching currencies' });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
};

// GET -> /events/:parites -> Gets all the related events from a parite
export const getPariteEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
        req.params.parites.slice(0, 3) + ',' + req.params.parites.slice(3)
      }`,
      getFetchOptions()
    );

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj.result });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
};

// GET -> /performance/:parites -> Gets all the related performance metrics from a parite
export const getParitePerformances = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
      `https://scanner.tradingview.com/symbol?symbol=FX:${req.params.parites}&fields=change,Perf.5D,Perf.W,Perf.1M,Perf.6M,Perf.YTD,Perf.Y,Perf.5Y,Perf.All&no_404=true&label-product=symbols-performance`,
      options
    );

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
};

// GET -> /news/:parites/:lang -> Gets all the news from related parite
export const getPariteNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lang = req.params.lang;

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
      `https://news-mediator.tradingview.com/public/view/v1/symbol?filter=lang:${lang}&filter=symbol:FX:${req.params.parites}&client=landing&streaming=true`,
      options
    );

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj.items });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
};

// GET -> /news/read/:storyPath/:lang -> Gets all the information from given news
export const getReadNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storyPath = req.params.storyPath;
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
      `https://news-headlines.tradingview.com/v3/story?id=tag:${storyPath}&lang=${req.params.lang}`,
      options
    );

    const obj = await response.json();

    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
};
