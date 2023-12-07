import axios from 'axios';
import { wss } from './server';
const API_KEY = process.env.API_KEY;

export const fetchExchangeRate = async (crypto: string, currency: string) => {
  try {
    const url = `https://rest.coinapi.io/v1/exchangerate/${crypto}/${currency}`;
    const response = await axios.get(url, {
      headers: { 'X-CoinAPI-Key': API_KEY },
    });

    wss.clients.forEach((client: any) => {
      client.send(JSON.stringify(response.data));
    });

  } catch (error) {
    console.error('Error fetching exchange rate:', error);
  }
};

export const fetchCurrencies = async () => {
  try {
      const response = await axios.get('https://rest.coinapi.io/v1/assets', {
          headers: { 'X-CoinAPI-Key': API_KEY },
      });

      const cryptocurrencies = response.data.filter((asset: { type_is_crypto: number; }) => asset.type_is_crypto === 1);
      const traditionalCurrencies = response.data.filter((asset: { type_is_crypto: number; }) => asset.type_is_crypto === 0);

      return {
          cryptocurrencies,
          traditionalCurrencies,
      };
  } catch (error) {
      console.error('Error fetching currency list:', error);
      throw error;
  }
};



