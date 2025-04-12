import getFetchOptions from './constants';
import Currency from './constants';

export const getAllCurrenciesHelper = async (): Promise<
  Currency[] | number
> => {
  try {
    const obj: Currency[] = [];

    const response = await fetch(
      'https://scanner.tradingview.com/forex/scan?label-product=markets-screener',
      getFetchOptions(
        '{"columns":["name","description","close","currency","change","change_abs","high","low"],"ignore_unknown_fields":false,"options":{"lang":"en"},"range":[0,2595],"sort":{"sortBy":"name","sortOrder":"asc","nullsFirst":false},"preset":"forex_rates_all"}'
      )
    );

    const data = await response.json();

    data.data.forEach((item: any) => {
      obj.push({
        name: item.d[0],
        symbolCode: item.s,
        description: item.d[1],
        close: item.d[2],
        currency: item.d[3],
        change: item.d[4],
        change_abs: item.d[5],
        high: item.d[6],
        low: item.d[7],
      });
    });

    return obj;
  } catch (error) {
    return -1;
  }
};
