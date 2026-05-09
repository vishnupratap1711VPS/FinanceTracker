import { useEffect, useState } from 'react';

import Header from './components/Header';
import HomePage from './components/HomePage';
import PortfolioPage from './components/PortfolioPage';
import LessonsPage from './components/LessonsPage';
import RareMetalsPage from './components/raremetals';

const coins = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
];

const stocks = [
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla' },
  { id: 'NVDA', symbol: 'NVDA', name: 'Nvidia' },
];

const starterCrypto = [
  {
    id: 1,
    apiId: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    quantity: 0.15,
    buyPrice: 55000,
  },
];

const starterStocks = [
  {
    id: 2,
    apiId: 'AAPL',
    name: 'Apple',
    symbol: 'AAPL',
    quantity: 4,
    buyPrice: 180,
  },
];

const sampleStockPrices = {
  AAPL: 195,
  MSFT: 425,
  TSLA: 180,
  NVDA: 875,
};

const cryptoTrend = [
  { day: 'Mon', value: 12000 },
  { day: 'Tue', value: 12800 },
  { day: 'Wed', value: 13200 },
  { day: 'Thu', value: 13600 },
  { day: 'Fri', value: 14000 },
];

const stockTrend = [
  { day: 'Mon', value: 2000 },
  { day: 'Tue', value: 2150 },
  { day: 'Wed', value: 2250 },
  { day: 'Thu', value: 2350 },
  { day: 'Fri', value: 2450 },
];

export default function App() {
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState('light');

  const [cryptoItems, setCryptoItems] = useState(starterCrypto);
  const [stockItems, setStockItems] = useState(starterStocks);

  const [cryptoPrices, setCryptoPrices] = useState({});
  const [stockPrices, setStockPrices] = useState(sampleStockPrices);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getCryptoPrices() {
      setLoading(true);

      try {
        const ids = cryptoItems
          .map((item) => item.apiId)
          .join(',');

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );

        const data = await response.json();

        let prices = {};

        cryptoItems.forEach((item) => {
          prices[item.apiId] = data[item.apiId]?.usd || 0;
        });

        setCryptoPrices(prices);
      } catch {
        setError('Could not load crypto prices');
      }

      setLoading(false);
    }

    getCryptoPrices();
  }, [cryptoItems]);

  useEffect(() => {
    async function getStockPrices() {
      let prices = {};

      try {
        for (let item of stockItems) {
          const response = await fetch(
            `https://stooq.com/q/l/?s=${item.apiId.toLowerCase()}.us&f=sd2t2ohlcvn&h&e=csv`
          );

          const text = await response.text();

          const rows = text.trim().split('\n');

          const price = Number(rows[1]?.split(',')[6]);

          prices[item.apiId] = price || sampleStockPrices[item.apiId];
        }

        setStockPrices(prices);
      } catch {
        setStockPrices(sampleStockPrices);
      }
    }

    getStockPrices();
  }, [stockItems]);

  function addCrypto(item) {
    setCryptoItems([...cryptoItems, item]);
  }

  function deleteCrypto(id) {
    const updated = cryptoItems.filter((item) => item.id !== id);
    setCryptoItems(updated);
  }

  function addStock(item) {
    setStockItems([...stockItems, item]);
  }

  function deleteStock(id) {
    const updated = stockItems.filter((item) => item.id !== id);
    setStockItems(updated);
  }

  return (
    <div className={(theme === 'dark' ? 'dark ' : '') + 'app-bg min-h-screen'}>
      <Header
        page={page}
        setPage={setPage}
        theme={theme}
        setTheme={setTheme}
      />

      {page === 'home' && <HomePage setPage={setPage} />}

      {page === 'crypto' && (
        <PortfolioPage
          items={cryptoItems}
          prices={cryptoPrices}
          choices={coins}
          title="Crypto Portfolio"
          chartData={cryptoTrend}
          loading={loading}
          error={error}
          unit="coins"
          onAdd={addCrypto}
          onDelete={deleteCrypto}
        />
      )}

      {page === 'stocks' && (
        <PortfolioPage
          items={stockItems}
          prices={stockPrices}
          choices={stocks}
          title="Stock Portfolio"
          chartData={stockTrend}
          loading={loading}
          error={error}
          unit="shares"
          onAdd={addStock}
          onDelete={deleteStock}
        />
      )}

      {page === 'raremetals' && <RareMetalsPage />}

      {page === 'lessons' && <LessonsPage />}
    </div>
  );
}
