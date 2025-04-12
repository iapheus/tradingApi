import { Request, Response } from 'express';
import getFetchOptions from '../utils/constants';

// GET -> / -> Gets all the currencies
export const getNew = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, data: 'Heyy, it works!' });
};
