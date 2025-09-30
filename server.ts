import express from 'express';
import currencyRoute from './routes/Currency.route';
import stockRoute from './routes/Stock.route';

const app = express();

app.use(express.json());

app.use('/api/v1/currency', currencyRoute);
app.use('/api/v1/stock', stockRoute);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
