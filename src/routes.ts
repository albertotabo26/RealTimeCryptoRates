import express from 'express';
import { fetchExchangeRate, fetchCurrencies } from './api';

const router = express.Router();

router.get('/exchange-rate', async (req, res) => {
  const { crypto, currency } = req.query;
  try {
    if (typeof crypto !== 'string' || typeof currency !== 'string') {
        return res.status(400).json({ error: 'Crypto and currency parameters must be strings' });
    }
    const rate = await fetchExchangeRate(crypto, currency);
    res.json(rate);
  } catch (error) {
    res.status(500).send('Error fetching exchange rate');
  }
});

router.get('/currencies', async (req, res) => {
    try {
        const currencies = await fetchCurrencies();
        res.json(currencies);
    } catch (error) {
        res.status(500).send('Error fetching currency list');
    }
});

export default router;
