import { Request, Response } from 'express';
import Parser from 'rss-parser';

let parser = new Parser();

const shuffle = (array: any[]): any[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// GET -> / -> Gets all the currencies
export const getRssFeed = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rssLinks = req.body.links;
  let feed: string[] = [];
  try {
    const feedPromises = rssLinks.map(async (item) => {
      const rssFeed = await parser.parseURL(item);
      return rssFeed;
    });

    feed = await Promise.all(feedPromises);

    feed = shuffle(feed);

    res.status(200).json({ success: true, data: feed });
  } catch (err) {
    res.status(400).json({ success: false, error: err });
  }
};
