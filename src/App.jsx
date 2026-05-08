import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Coins,
  Edit3,
  Home,
  LineChart,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sun,
  TrendingUp,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STORAGE_KEY = 'finance-tracker-assets-v1';
const THEME_KEY = 'finance-tracker-theme-v1';
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
const COLORS = ['#14b8a6', '#f97316', '#3b82f6', '#e11d48', '#8b5cf6', '#84cc16', '#f59e0b'];

const starterAssets = [
  {
    id: crypto.randomUUID(),
    type: 'crypto',
    name: 'Bitcoin',
    symbol: 'btc',
    apiId: 'bitcoin',
    quantity: 0.25,
    buyPrice: 56000,
    price: 0,
    change24h: 0,
    updatedAt: null,
  },
  {
    id: crypto.randomUUID(),
    type: 'stock',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    apiId: 'aapl.us',
    quantity: 8,
    buyPrice: 185,
    price: 0,
    change24h: 0,
    updatedAt: null,
  },
];

const popularStocks = [
  ['AAPL', 'Apple Inc.'],
  ['MSFT', 'Microsoft Corp.'],
  ['NVDA', 'NVIDIA Corp.'],
  ['GOOGL', 'Alphabet Inc.'],
  ['AMZN', 'Amazon.com Inc.'],
  ['META', 'Meta Platforms Inc.'],
  ['TSLA', 'Tesla Inc.'],
  ['AMD', 'Advanced Micro Devices'],
  ['NFLX', 'Netflix Inc.'],
  ['JPM', 'JPMorgan Chase'],
  ['V', 'Visa Inc.'],
  ['SPY', 'SPDR S&P 500 ETF'],
  ['QQQ', 'Invesco QQQ ETF'],
].map(([symbol, name]) => ({ type: 'stock', symbol, name, apiId: `${symbol.toLowerCase()}.us` }));

const demoHistory = [
  { date: 'Mon', value: 22800 },
  { date: 'Tue', value: 24150 },
  { date: 'Wed', value: 23620 },
  { date: 'Thu', value: 25280 },
  { date: 'Fri', value: 26040 },
  { date: 'Sat', value: 25780 },
  { date: 'Sun', value: 26920 },
];

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function loadAssets() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : starterAssets;
  } catch {
    return starterAssets;
  }
}

async function searchCrypto(query) {
  if (!query.trim()) return [];
  const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Crypto search failed');
  const data = await response.json();
  return (data.coins || []).slice(0, 8).map((coin) => ({
    type: 'crypto',
    name: coin.name,
    symbol: coin.symbol,
    apiId: coin.id,
    thumb: coin.thumb,
  }));
}

function searchStocks(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return popularStocks
    .filter((asset) => asset.symbol.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q))
    .slice(0, 8);
}

async function fetchCryptoPrices(assets) {
  const ids = [...new Set(assets.filter((asset) => asset.type === 'crypto').map((asset) => asset.apiId))];
  if (!ids.length) return {};

  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');

  const response = await fetch(url);
  if (!response.ok) throw new Error('CoinGecko price request failed');
  const data = await response.json();

  return Object.fromEntries(
    Object.entries(data).map(([id, value]) => [
      id,
      {
        price: safeNumber(value.usd),
        change24h: safeNumber(value.usd_24h_change),
      },
    ]),
  );
}

async function fetchStockQuote(asset) {
  const response = await fetch(`https://stooq.com/q/l/?s=${asset.apiId}&f=sd2t2ohlcvn&h&e=csv`);
  if (!response.ok) throw new Error(`Stock quote failed for ${asset.symbol}`);
  const text = await response.text();
  const [, row] = text.trim().split('\n');
  if (!row) return null;
  const columns = row.split(',');
  const close = safeNumber(columns[6]);
  const open = safeNumber(columns[3]);
  return {
    price: close,
    change24h: open ? ((close - open) / open) * 100 : 0,
  };
}

async function refreshMarketData(assets) {
  const cryptoPrices = await fetchCryptoPrices(assets);
  const stockResults = await Promise.allSettled(
    assets.filter((asset) => asset.type === 'stock').map(async (asset) => [asset.apiId, await fetchStockQuote(asset)]),
  );
  const stockPrices = Object.fromEntries(
    stockResults
      .filter((result) => result.status === 'fulfilled' && result.value[1]?.price)
      .map((result) => result.value),
  );
  const now = new Date().toISOString();

  return assets.map((asset) => {
    const market = asset.type === 'crypto' ? cryptoPrices[asset.apiId] : stockPrices[asset.apiId];
    return market?.price ? { ...asset, ...market, updatedAt: now } : asset;
  });
}

function App() {
  const [assets, setAssets] = useState(loadAssets);
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const [activePage, setActivePage] = useState('home');
  const [query, setQuery] = useState('');
  const [assetType, setAssetType] = useState('crypto');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ quantity: '', buyPrice: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const assetsRef = useRef(assets);

  useEffect(() => {
    assetsRef.current = assets;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(Boolean(query.trim()));
      try {
        const found = assetType === 'crypto' ? await searchCrypto(query) : searchStocks(query);
        setResults(found);
      } catch {
        setError('Search is temporarily unavailable. Try a popular symbol or refresh in a minute.');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [assetType, query]);

  useEffect(() => {
    handleRefresh();
    const interval = setInterval(handleRefresh, 120000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analytics = useMemo(() => {
    const rows = assets.map((asset) => {
      const value = safeNumber(asset.quantity) * safeNumber(asset.price);
      const cost = safeNumber(asset.quantity) * safeNumber(asset.buyPrice);
      const profit = value - cost;
      const profitPercent = cost ? (profit / cost) * 100 : 0;
      return { ...asset, value, cost, profit, profitPercent };
    });
    const summarize = (items) => {
      const totalValue = items.reduce((sum, asset) => sum + asset.value, 0);
      const totalCost = items.reduce((sum, asset) => sum + asset.cost, 0);
      const totalProfit = totalValue - totalCost;
      const best = [...items].sort((a, b) => b.profitPercent - a.profitPercent)[0];
      const allocation = items.filter((asset) => asset.value > 0).map((asset) => ({
        name: asset.symbol.toUpperCase(),
        value: Number(asset.value.toFixed(2)),
      }));
      return { rows: items, totalValue, totalCost, totalProfit, best, allocation };
    };
    const stockRows = rows.filter((asset) => asset.type === 'stock');
    const cryptoRows = rows.filter((asset) => asset.type === 'crypto');
    const all = summarize(rows);
    return {
      ...all,
      stocks: summarize(stockRows),
      crypto: summarize(cryptoRows),
      typeMix: [
        { name: 'Crypto', value: cryptoRows.reduce((sum, asset) => sum + asset.value, 0) },
        { name: 'Stocks', value: stockRows.reduce((sum, asset) => sum + asset.value, 0) },
      ],
    };
  }, [assets]);

  const chartHistory = useMemo(() => {
    if (!analytics.totalValue) return demoHistory;
    return demoHistory.map((point, index) => ({
      ...point,
      value: Math.round(analytics.totalValue * (0.92 + index * 0.012 + Math.sin(index) * 0.018)),
    }));
  }, [analytics.totalValue]);

  async function handleRefresh() {
    setLoading(true);
    setError('');
    try {
      const fresh = await refreshMarketData(assetsRef.current);
      setAssets(fresh);
    } catch {
      setError('Live prices could not be refreshed. Saved portfolio data is still available.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSelected(null);
    setForm({ quantity: '', buyPrice: '' });
    setEditingId(null);
    setQuery('');
    setResults([]);
  }

  function submitAsset(event) {
    event.preventDefault();
    const quantity = safeNumber(form.quantity);
    const buyPrice = safeNumber(form.buyPrice);
    if ((!selected && !editingId) || quantity <= 0 || buyPrice < 0) {
      setError('Choose an asset and enter a valid quantity.');
      return;
    }

    if (editingId) {
      setAssets((current) =>
        current.map((asset) => (asset.id === editingId ? { ...asset, quantity, buyPrice } : asset)),
      );
      resetForm();
      return;
    }

    const duplicate = assets.find((asset) => asset.type === selected.type && asset.apiId === selected.apiId);
    if (duplicate) {
      setAssets((current) =>
        current.map((asset) =>
          asset.id === duplicate.id
            ? {
                ...asset,
                quantity: safeNumber(asset.quantity) + quantity,
                buyPrice,
              }
            : asset,
        ),
      );
    } else {
      setAssets((current) => [
        {
          id: crypto.randomUUID(),
          ...selected,
          quantity,
          buyPrice,
          price: 0,
          change24h: 0,
          updatedAt: null,
        },
        ...current,
      ]);
    }
    resetForm();
  }

  function startEdit(asset) {
    setActivePage(asset.type === 'stock' ? 'stocks' : 'crypto');
    setAssetType(asset.type);
    setEditingId(asset.id);
    setSelected(asset);
    setForm({ quantity: asset.quantity, buyPrice: asset.buyPrice });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeAsset(id) {
    setAssets((current) => current.filter((asset) => asset.id !== id));
  }

  const lastUpdated = assets
    .map((asset) => asset.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  const pageDetails = {
    home: {
      title: 'Home',
      subtitle: 'Track live crypto and stock holdings from one browser-only dashboard.',
    },
    summary: {
      title: 'Summary',
      subtitle: 'A focused view of portfolio value, allocation, return, and market mix.',
    },
    stocks: {
      title: 'Stocks',
      subtitle: 'Manage US stock and ETF positions using no-key public quote data.',
    },
    crypto: {
      title: 'Crypto',
      subtitle: 'Search coins, add holdings, and refresh crypto prices from CoinGecko.',
    },
  };

  const addForm = (
    <AssetForm
      assetType={assetType}
      editingId={editingId}
      form={form}
      query={query}
      results={results}
      searching={searching}
      selected={selected}
      setAssetType={(type) => {
        setAssetType(type);
        setSelected(null);
        setResults([]);
      }}
      setForm={setForm}
      setQuery={setQuery}
      setSelected={setSelected}
      onCancel={resetForm}
      onSubmit={submitAsset}
    />
  );

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
    { id: 'crypto', label: 'Crypto', icon: Coins },
  ];

  return (
    <main className="min-h-screen bg-[#eef3f8] text-slate-950 transition-colors dark:bg-[#07111f] dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-white/80 bg-white/80 p-4 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-500 text-white">
                <Wallet size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">FinanceTracker</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{pageDetails[activePage].subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                title="Refresh prices"
                onClick={handleRefresh}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                title="Toggle dark mode"
                onClick={() => setIsDark((value) => !value)}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={classNames(
                  'flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition',
                  activePage === id
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-white text-slate-600 hover:text-slate-950 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white',
                )}
                onClick={() => {
                  setActivePage(id);
                  if (id === 'stocks' || id === 'crypto') {
                    setAssetType(id === 'stocks' ? 'stock' : 'crypto');
                    setSelected(null);
                    setResults([]);
                    setQuery('');
                  }
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{pageDetails[activePage].title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lastUpdated ? `Prices refreshed ${new Date(lastUpdated).toLocaleTimeString()}` : 'Refresh for live data'}
            </p>
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <span>{error}</span>
            <button title="Dismiss" onClick={() => setError('')}>
              <X size={16} />
            </button>
          </div>
        ) : null}

        {activePage === 'home' ? (
          <HomePage
            addForm={addForm}
            analytics={analytics}
            chartHistory={chartHistory}
            onNavigate={setActivePage}
            onEdit={startEdit}
            onRemove={removeAsset}
          />
        ) : null}

        {activePage === 'summary' ? (
          <SummaryPage analytics={analytics} chartHistory={chartHistory} />
        ) : null}

        {activePage === 'stocks' ? (
          <AssetPage
            addForm={addForm}
            analytics={analytics.stocks}
            title="Stock holdings"
            note="Stock quotes use Stooq no-key CSV data for common US symbols and ETFs."
            onEdit={startEdit}
            onRemove={removeAsset}
          />
        ) : null}

        {activePage === 'crypto' ? (
          <AssetPage
            addForm={addForm}
            analytics={analytics.crypto}
            title="Crypto holdings"
            note="Crypto search and prices use CoinGecko public endpoints."
            onEdit={startEdit}
            onRemove={removeAsset}
          />
        ) : null}
      </div>
    </main>
  );
}

function HomePage({ addForm, analytics, chartHistory, onNavigate, onEdit, onRemove }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Wallet} label="Portfolio value" value={USD.format(analytics.totalValue)} accent="teal" />
        <MetricCard icon={Activity} label="Invested capital" value={USD.format(analytics.totalCost)} accent="blue" />
        <MetricCard
          icon={LineChart}
          label="Total return"
          value={USD.format(analytics.totalProfit)}
          detail={`${analytics.totalCost ? ((analytics.totalProfit / analytics.totalCost) * 100).toFixed(2) : '0.00'}%`}
          positive={analytics.totalProfit >= 0}
          accent="orange"
        />
        <MetricCard
          icon={Coins}
          label="Tracked assets"
          value={analytics.rows.length}
          detail={`${analytics.stocks.rows.length} stocks / ${analytics.crypto.rows.length} crypto`}
          accent="rose"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[390px_1fr]">
        {addForm}
        <div className="grid gap-5">
          <ChartPanel title="Portfolio trend" icon={BarChart3}>
            <PortfolioTrend data={chartHistory} />
          </ChartPanel>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              className="rounded-lg border border-white/80 bg-white p-4 text-left shadow-soft transition hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900"
              onClick={() => onNavigate('stocks')}
            >
              <TrendingUp className="mb-4 text-orange-500" size={24} />
              <div className="text-lg font-semibold">Stocks</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {USD.format(analytics.stocks.totalValue)} across {analytics.stocks.rows.length} positions.
              </div>
            </button>
            <button
              className="rounded-lg border border-white/80 bg-white p-4 text-left shadow-soft transition hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900"
              onClick={() => onNavigate('crypto')}
            >
              <Coins className="mb-4 text-teal-500" size={24} />
              <div className="text-lg font-semibold">Crypto</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {USD.format(analytics.crypto.totalValue)} across {analytics.crypto.rows.length} positions.
              </div>
            </button>
          </div>
        </div>
      </section>

      <HoldingsTable rows={analytics.rows.slice(0, 6)} title="Recent holdings" onEdit={onEdit} onRemove={onRemove} />
    </>
  );
}

function SummaryPage({ analytics, chartHistory }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Wallet} label="Portfolio value" value={USD.format(analytics.totalValue)} accent="teal" />
        <MetricCard icon={Activity} label="Invested capital" value={USD.format(analytics.totalCost)} accent="blue" />
        <MetricCard
          icon={LineChart}
          label="Total return"
          value={USD.format(analytics.totalProfit)}
          detail={`${analytics.totalCost ? ((analytics.totalProfit / analytics.totalCost) * 100).toFixed(2) : '0.00'}%`}
          positive={analytics.totalProfit >= 0}
          accent="orange"
        />
        <MetricCard
          icon={Coins}
          label="Best performer"
          value={analytics.best?.symbol?.toUpperCase() || 'N/A'}
          detail={analytics.best ? `${analytics.best.profitPercent.toFixed(2)}%` : 'Add assets'}
          positive={(analytics.best?.profitPercent || 0) >= 0}
          accent="rose"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        <ChartPanel title="Portfolio trend" icon={BarChart3} className="lg:col-span-3">
          <PortfolioTrend data={chartHistory} />
        </ChartPanel>
        <ChartPanel title="Allocation" icon={Activity} className="lg:col-span-2">
          <AllocationChart data={analytics.allocation} />
        </ChartPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <HoldingsTable rows={analytics.rows} title="All holdings" readOnly />
        <ChartPanel title="Market mix" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.typeMix}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => USD.format(value)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>
    </>
  );
}

function AssetPage({ addForm, analytics, title, note, onEdit, onRemove }) {
  const history = analytics.totalValue
    ? demoHistory.map((point, index) => ({
        ...point,
        value: Math.round(analytics.totalValue * (0.9 + index * 0.015 + Math.cos(index) * 0.016)),
      }))
    : demoHistory;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Wallet} label="Current value" value={USD.format(analytics.totalValue)} accent="teal" />
        <MetricCard
          icon={LineChart}
          label="Return"
          value={USD.format(analytics.totalProfit)}
          detail={`${analytics.totalCost ? ((analytics.totalProfit / analytics.totalCost) * 100).toFixed(2) : '0.00'}%`}
          positive={analytics.totalProfit >= 0}
          accent="orange"
        />
        <MetricCard icon={Activity} label="Positions" value={analytics.rows.length} accent="blue" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[390px_1fr]">
        {addForm}
        <ChartPanel title={`${title} trend`} icon={BarChart3}>
          <PortfolioTrend data={history} />
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{note}</p>
        </ChartPanel>
      </section>

      <HoldingsTable rows={analytics.rows} title={title} onEdit={onEdit} onRemove={onRemove} emptyText="No holdings on this page yet." />
    </>
  );
}

function AssetForm({
  assetType,
  editingId,
  form,
  query,
  results,
  searching,
  selected,
  setAssetType,
  setForm,
  setQuery,
  setSelected,
  onCancel,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-white/80 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{editingId ? 'Edit holding' : 'Add holding'}</h2>
        {editingId ? (
          <button type="button" className="text-sm text-slate-500 hover:text-teal-600" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-950">
        {['crypto', 'stock'].map((type) => (
          <button
            key={type}
            type="button"
            className={classNames(
              'rounded-md px-3 py-2 text-sm font-medium capitalize transition',
              assetType === type
                ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100',
            )}
            onClick={() => setAssetType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Asset search</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950"
          placeholder={assetType === 'crypto' ? 'Search bitcoin, ethereum...' : 'Search AAPL, MSFT, QQQ...'}
          value={query}
          disabled={Boolean(editingId)}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="mt-3 max-h-48 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
        {selected ? (
          <AssetResult asset={selected} selected onSelect={() => setSelected(null)} />
        ) : searching ? (
          <div className="px-3 py-5 text-center text-sm text-slate-500">Searching...</div>
        ) : results.length ? (
          results.map((asset) => (
            <AssetResult key={`${asset.type}-${asset.apiId}`} asset={asset} onSelect={() => setSelected(asset)} />
          ))
        ) : (
          <div className="px-3 py-5 text-center text-sm text-slate-500">
            {query ? 'No matches found.' : 'Search and choose an asset.'}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Quantity" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} />
        <Field label="Buy price" value={form.buyPrice} onChange={(buyPrice) => setForm({ ...form, buyPrice })} />
      </div>

      <button
        type="submit"
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-500 font-semibold text-white transition hover:bg-teal-600"
      >
        <Plus size={18} />
        {editingId ? 'Save holding' : 'Add to portfolio'}
      </button>
    </form>
  );
}

function PortfolioTrend({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="portfolioValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => USD.format(value)} />
        <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} fill="url(#portfolioValue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function AllocationChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => USD.format(value)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function HoldingsTable({ rows, title, onEdit, onRemove, readOnly = false, emptyText = 'No holdings yet.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/80 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Return</th>
              <th className="px-4 py-3">24h</th>
              {!readOnly ? <th className="px-4 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length ? (
              rows.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{asset.name}</div>
                    <div className="text-xs uppercase text-slate-500">{asset.symbol}</div>
                  </td>
                  <td className="px-4 py-3">{NUMBER.format(asset.quantity)}</td>
                  <td className="px-4 py-3">{asset.price ? USD.format(asset.price) : 'Pending'}</td>
                  <td className="px-4 py-3 font-semibold">{USD.format(asset.value)}</td>
                  <td className={classNames('px-4 py-3 font-medium', asset.profit >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                    {USD.format(asset.profit)} ({asset.profitPercent.toFixed(2)}%)
                  </td>
                  <td className={classNames('px-4 py-3 font-medium', asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                    {asset.change24h.toFixed(2)}%
                  </td>
                  {!readOnly ? (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300"
                          title="Edit holding"
                          onClick={() => onEdit(asset)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300"
                          title="Delete holding"
                          onClick={() => onRemove(asset.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={readOnly ? 6 : 7}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, positive = true, accent }) {
  const accents = {
    teal: 'bg-teal-500/12 text-teal-600 dark:text-teal-300',
    blue: 'bg-blue-500/12 text-blue-600 dark:text-blue-300',
    orange: 'bg-orange-500/12 text-orange-600 dark:text-orange-300',
    rose: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
  };

  return (
    <div className="rounded-lg border border-white/80 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className={classNames('grid h-9 w-9 place-items-center rounded-lg', accents[accent])}>
          <Icon size={18} />
        </span>
      </div>
      <div className="min-w-0 text-2xl font-semibold">{value}</div>
      {detail ? <div className={classNames('mt-1 text-sm', positive ? 'text-emerald-500' : 'text-rose-500')}>{detail}</div> : null}
    </div>
  );
}

function ChartPanel({ title, icon: Icon, className, children }) {
  return (
    <div className={classNames('rounded-lg border border-white/80 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-teal-500" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AssetResult({ asset, onSelect, selected }) {
  return (
    <button
      type="button"
      className={classNames(
        'flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-b-0 dark:border-slate-800',
        selected ? 'bg-teal-50 dark:bg-teal-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800',
      )}
      onClick={onSelect}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-200">
        {asset.thumb ? <img src={asset.thumb} alt="" className="h-6 w-6 rounded-full" /> : asset.symbol.slice(0, 2)}
      </div>
      <div className="min-w-0">
        <div className="truncate font-semibold">{asset.name}</div>
        <div className="text-xs uppercase text-slate-500">{asset.symbol}</div>
      </div>
    </button>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type="number"
        min="0"
        step="any"
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default App;
