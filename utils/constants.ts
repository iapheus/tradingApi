export default function getFetchOptions(body?: string): {
  method: string;
  headers: { [key: string]: string };
  body?: string;
} {
  const options = {
    method: 'POST',
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
    body,
  };

  return options;
}

export default interface Currency {
  name: string;
  symbolCode: string;
  description: string;
  close: number;
  currency: string;
  change: number;
  change_abs: number;
  high: number;
  low: number;
}
