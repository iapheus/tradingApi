import express from 'express';
import currencyRoute from './routes/Currency.route';
import stockRoute from './routes/Stock.route';
import newsRoute from './routes/News.route';

const app = express();

app.listen(3000, '0.0.0.0', (error) => {
  if (!error) {
    console.log(`It works on http://0.0.0.0:3000`);
  }
});

app.use('/api/v1/currency', currencyRoute);
app.use('/api/v1/stock', stockRoute);
app.use('/api/v1/news', newsRoute);
