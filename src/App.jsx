import { useEffect, useState } from 'react';
import { BookOpen, Coins, Home, PieChart, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const coins = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
];

const stocks = [
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft' },
  { id: 'NVDA', symbol: 'NVDA', name: 'Nvidia' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet' },
  { id: 'AMZN', symbol: 'AMZN', name: 'Amazon' },
  { id: 'META', symbol: 'META', name: 'Meta' },
  { id: 'SPY', symbol: 'SPY', name: 'S&P 500 ETF' },
];

const starterCrypto = [
  { id: 1, apiId: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', quantity: 0.15, buyPrice: 55000 },
  { id: 2, apiId: 'ethereum', name: 'Ethereum', symbol: 'ETH', quantity: 2, buyPrice: 2800 },
];

const starterStocks = [
  { id: 3, apiId: 'AAPL', name: 'Apple', symbol: 'AAPL', quantity: 4, buyPrice: 180 },
  { id: 4, apiId: 'MSFT', name: 'Microsoft', symbol: 'MSFT', quantity: 3, buyPrice: 390 },
];

const sampleStockPrices = {
  AAPL: 195,
  MSFT: 425,
  NVDA: 875,
  TSLA: 180,
  GOOGL: 170,
  AMZN: 185,
  META: 500,
  SPY: 520,
};

const cryptoTrend = [
  { day: 'Mon', value: 12800 },
  { day: 'Tue', value: 13240 },
  { day: 'Wed', value: 12920 },
  { day: 'Thu', value: 13750 },
  { day: 'Fri', value: 14220 },
  { day: 'Sat', value: 13980 },
  { day: 'Sun', value: 14610 },
];

const stockTrend = [
  { day: 'Mon', value: 2180 },
  { day: 'Tue', value: 2240 },
  { day: 'Wed', value: 2310 },
  { day: 'Thu', value: 2285 },
  { day: 'Fri', value: 2360 },
  { day: 'Sat', value: 2340 },
  { day: 'Sun', value: 2415 },
];

const marketTrend = cryptoTrend.map((item, index) => ({
  day: item.day,
  crypto: item.value,
  stocks: stockTrend[index].value,
}));

function money(value) {
  return '$' + Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function Header({ page, setPage, theme, setTheme }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'crypto', label: 'Crypto', icon: Coins },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="accent-tile grid h-12 w-12 place-items-center rounded-md text-white shadow-sm">
            <Wallet size={23} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">FinanceTracker</p>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">Investment Dashboard</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
        <nav className="flex gap-1 rounded-md border border-slate-200 bg-white/70 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                className={
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ' +
                  (page === tab.id ? 'accent-tile text-white shadow-sm' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800')
                }
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </nav>
        <select value={theme} onChange={(event) => setTheme(event.target.value)} className="rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, tone = 'dark', note = 'Live' }) {
  const color = tone === 'good' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800';
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <span className={'rounded-md px-2 py-1 text-xs font-bold ' + color}>{note}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function ChartBox({ title, data, lines }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="accent-text" />
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} width={46} />
            <Tooltip formatter={(value) => money(value)} />
            {lines.map((line) => <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={3} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function AddForm({ title, choices, onAdd, unit }) {
  const [choiceId, setChoiceId] = useState(choices[0].id);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const choice = choices.find((item) => item.id === choiceId);
    onAdd({
      id: Date.now(),
      apiId: choice.id,
      name: choice.name,
      symbol: choice.symbol,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
    });
    setQuantity('');
    setBuyPrice('');
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 dark:bg-slate-800 p-5">
        <p className="text-sm font-semibold text-teal-700">New holding</p>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>

      <div className="grid gap-3 p-5">
        <select value={choiceId} onChange={(event) => setChoiceId(event.target.value)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 outline-none focus:border-teal-600">
          {choices.map((item) => <option key={item.id} value={item.id}>{item.symbol} - {item.name}</option>)}
        </select>
        <input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder={unit} type="number" className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 outline-none focus:border-teal-600" />
        <input value={buyPrice} onChange={(event) => setBuyPrice(event.target.value)} placeholder="Buy price" type="number" className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 outline-none focus:border-teal-600" />
        <button className="primary-btn flex items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold text-white shadow-sm">
          <Plus size={18} /> Add holding
        </button>
      </div>
    </form>
  );
}

function HoldingRow({ item, price, unit, onDelete }) {
  const value = (price || 0) * item.quantity;
  const cost = item.buyPrice * item.quantity;
  const profit = value - cost;
  const isProfit = profit >= 0;

  return (
    <li className="grid gap-3 border-b border-slate-100 px-1 py-4 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 md:grid-cols-[1.35fr_.8fr_.9fr_.9fr_auto] md:items-center">
      <div className="flex items-center gap-3">
        <span className="accent-tile grid h-11 w-11 place-items-center rounded-md text-sm font-bold text-white shadow-sm">{item.symbol.slice(0, 2)}</span>
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{item.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.symbol}</p>
        </div>
      </div>
      <p className="text-slate-700 dark:text-slate-200">{item.quantity} {unit}</p>
      <p className="text-slate-700 dark:text-slate-200">{price ? money(price) : 'loading...'}</p>
      <p className={(isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600') + ' w-fit rounded-md px-2 py-1 text-sm font-bold'}>
        {isProfit ? '+' : ''}{money(profit)}
      </p>
      <button onClick={() => onDelete(item.id)} className="grid h-9 w-9 place-items-center rounded-md border border-red-200 text-red-700 hover:bg-red-50" title="Delete">
        <Trash2 size={16} />
      </button>
    </li>
  );
}

function PortfolioPage(props) {
  const totalValue = props.items.reduce((sum, item) => sum + (props.prices[item.apiId] || 0) * item.quantity, 0);
  const totalCost = props.items.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);
  const profit = totalValue - totalCost;
  const allocation = props.items.map((item) => ({ ...item, value: (props.prices[item.apiId] || 0) * item.quantity }));

  return (
    <main className="mx-auto max-w-6xl px-5 py-6">
      <section className="hero-panel mb-6 overflow-hidden rounded-md text-white shadow-sm">
        <div className="grid gap-6 border-b border-white/10 p-6 md:grid-cols-[1.4fr_.8fr] md:items-end">
          <div>
            <p className="accent-text text-sm font-semibold uppercase tracking-wide">{props.hero}</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight">{money(totalValue)}</h2>
            <p className="mt-3 text-sm text-slate-300">{props.items.length} holdings tracked with public API prices</p>
          </div>
          <div className="rounded-md bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-sm text-slate-300">Net result</p>
            <p className={(profit >= 0 ? 'text-emerald-300' : 'text-red-300') + ' mt-1 text-2xl font-bold'}>{money(profit)}</p>
          </div>
        </div>
        <div className="grid divide-y divide-white/10 text-sm text-slate-300 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <p className="p-4">Beginner React code</p>
          <p className="p-4">State and props</p>
          <p className="p-4">API integration</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label={props.valueLabel} value={money(totalValue)} tone="good" />
        <StatCard label="Total spent" value={money(totalCost)} note="Cost" />
        <StatCard label="Profit or loss" value={money(profit)} note={profit >= 0 ? 'Up' : 'Down'} tone={profit >= 0 ? 'good' : 'dark'} />
      </section>

      {props.loading && <p className="mt-4 rounded-md bg-blue-50 p-3 text-blue-800">Loading prices...</p>}
      {props.error && <p className="mt-4 rounded-md bg-red-50 p-3 text-red-700">{props.error}</p>}

      <div className="mt-6">
        <ChartBox title={props.chartTitle} data={props.trend} lines={[{ key: 'value', name: props.valueLabel, color: '#14b8a6' }]} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <AddForm title={props.formTitle} choices={props.choices} onAdd={props.onAdd} unit={props.unit} />
          <section className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="accent-text" />
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Allocation</h2>
            </div>
            <div className="mt-4 space-y-3">
              {allocation.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex justify-between text-sm"><span>{item.symbol}</span><span>{money(item.value)}</span></div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="accent-bar h-2 rounded-full" style={{ width: `${totalValue ? (item.value / totalValue) * 100 : 0}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">{props.listTitle}</h2>
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{props.items.length} holdings</span>
          </div>
          <div className="hidden grid-cols-[1.35fr_.8fr_.9fr_.9fr_auto] bg-slate-50 dark:bg-slate-800 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 md:grid">
            <span>Asset</span><span>Quantity</span><span>Price</span><span>Return</span><span></span>
          </div>
          <ul className="px-5">
            {props.items.map((item) => <HoldingRow key={item.id} item={item} price={props.prices[item.apiId]} unit={props.unit} onDelete={props.onDelete} />)}
          </ul>
        </section>
      </div>
    </main>
  );
}

function HomePage({ setPage }) {
  const cards = [
    { title: 'Crypto', text: 'Track coins, add holdings, and view live values.', page: 'crypto', icon: Coins },
    { title: 'Stocks', text: 'Watch stock holdings with fallback prices when APIs fail.', page: 'stocks', icon: TrendingUp },
    { title: 'Lessons', text: 'See the React concepts used to build this project.', page: 'lessons', icon: BookOpen },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="hero-panel overflow-hidden rounded-md text-white shadow-sm">
        <div className="grid gap-8 p-7 md:grid-cols-[1.25fr_.75fr] md:items-center">
          <div>
            <p className="accent-text text-sm font-semibold uppercase tracking-wide">Welcome back</p>
            <h2 className="mt-3 max-w-2xl text-5xl font-black tracking-tight">Manage crypto and stocks in one simple React dashboard.</h2>
            <p className="mt-4 max-w-xl text-slate-300">A clean beginner project using JSX, state, events, props, conditional rendering, lists, effects, and API data.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setPage('crypto')} className="primary-btn rounded-md px-5 py-3 font-bold text-white">Open Crypto</button>
              <button onClick={() => setPage('stocks')} className="rounded-md bg-white/10 px-5 py-3 font-bold text-white ring-1 ring-white/15 hover:bg-white/15">Open Stocks</button>
            </div>
          </div>
          <div className="rounded-md bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-sm text-slate-300">Project includes</p>
            <p className="mt-3 text-3xl font-black">3 pages</p>
            <p className="mt-2 text-sm text-slate-300">Home, portfolio tracking, and React lesson notes.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.title} onClick={() => setPage(card.page)} className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="accent-soft grid h-11 w-11 place-items-center rounded-md"><Icon size={21} /></span>
              <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.text}</p>
            </button>
          );
        })}
      </section>

      <div className="mt-6">
        <ChartBox
          title="Market overview"
          data={marketTrend}
          lines={[
            { key: 'crypto', name: 'Crypto', color: '#14b8a6' },
            { key: 'stocks', name: 'Stocks', color: '#3b82f6' },
          ]}
        />
      </div>
    </main>
  );
}

function LessonsPage() {
  const topics = ['React and JSX', 'Variables in JSX', 'Components and props', 'Dynamic list rendering', 'Conditional rendering', 'useState hook', 'Events and updates', 'Lifting state up', 'useEffect and APIs', 'Import and export'];
  return (
    <main className="mx-auto max-w-4xl px-5 py-6">
      <section className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Concepts used in this app</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {topics.map((topic, index) => <li key={topic} className="rounded-md bg-slate-50 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200">Lesson {index + 1}: {topic}</li>)}
        </ul>
      </section>
    </main>
  );
}

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
      setError('');
      try {
        const ids = cryptoItems.map((item) => item.apiId).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await response.json();
        const nextPrices = {};
        cryptoItems.forEach((item) => (nextPrices[item.apiId] = data[item.apiId]?.usd || 0));
        setCryptoPrices(nextPrices);
      } catch {
        setError('Could not load crypto prices.');
      }
      setLoading(false);
    }
    getCryptoPrices();
  }, [cryptoItems]);

  useEffect(() => {
    async function getStockPrices() {
      const nextPrices = {};
      try {
        for (const item of stockItems) {
          const response = await fetch(`https://stooq.com/q/l/?s=${item.apiId.toLowerCase()}.us&f=sd2t2ohlcvn&h&e=csv`);
          const rows = (await response.text()).trim().split('\n');
          const livePrice = Number(rows[1]?.split(',')[6]);
          nextPrices[item.apiId] = livePrice || sampleStockPrices[item.apiId] || 0;
        }
        setStockPrices(nextPrices);
      } catch {
        setStockPrices(sampleStockPrices);
      }
    }
    getStockPrices();
  }, [stockItems]);

  return (
    <div className={(theme === 'dark' ? 'dark ' : '') + 'app-bg min-h-screen text-slate-800 dark:text-slate-100'}>
      <Header page={page} setPage={setPage} theme={theme} setTheme={setTheme} />
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'crypto' && <PortfolioPage items={cryptoItems} prices={cryptoPrices} choices={coins} unit="coins" hero="Live crypto portfolio value" valueLabel="Crypto value" formTitle="Add coin" listTitle="Crypto holdings" chartTitle="Crypto market trend" trend={cryptoTrend} loading={loading} error={error} onAdd={(item) => setCryptoItems([...cryptoItems, item])} onDelete={(id) => setCryptoItems(cryptoItems.filter((item) => item.id !== id))} />}
      {page === 'stocks' && <PortfolioPage items={stockItems} prices={stockPrices} choices={stocks} unit="shares" hero="Live stock portfolio value" valueLabel="Stock value" formTitle="Add stock" listTitle="Stock holdings" chartTitle="Stock market trend" trend={stockTrend} loading={loading} error={error} onAdd={(item) => setStockItems([...stockItems, item])} onDelete={(id) => setStockItems(stockItems.filter((item) => item.id !== id))} />}
      {page === 'lessons' && <LessonsPage />}
    </div>
  );
}
