import express from 'express';
import { getRssFeed } from '../controllers/News.controller';

const router = express.Router();

router.post('/', getRssFeed);

module.exports = router;
