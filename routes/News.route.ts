import express from 'express';
import { getNew } from '../controllers/News.controller';

const router = express.Router();

router.get('/', getNew);

module.exports = router;
