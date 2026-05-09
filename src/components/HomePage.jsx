import { Coins, Gem, LineChart, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';

import ChartBox from './ChartBox';

const marketData = [
  { day: 'Mon', value: 10000 },
  { day: 'Tue', value: 12000 },
  { day: 'Wed', value: 13000 },
  { day: 'Thu', value: 14000 },
  { day: 'Fri', value: 15000 },
];

const portfolioTypes = [
  {
    id: 'crypto',
    title: 'Crypto',
    detail: 'Track Bitcoin, Ethereum, Solana, and other digital assets.',
    value: '$14,000',
    change: '+12.4%',
    icon: Coins,
  },
  {
    id: 'stocks',
    title: 'Stocks',
    detail: 'Follow shares from Apple, Microsoft, Tesla, Nvidia, and more.',
    value: '$2,450',
    change: '+7.1%',
    icon: TrendingUp,
  },
  {
    id: 'raremetals',
    title: 'Rare Metals',
    detail: 'Manage gold, silver, platinum, palladium, lithium, and minerals.',
    value: '$4,910',
    change: '+4.5%',
    icon: Gem,
  },
];

const highlights = [
  'Add holdings with quantity and buy price',
  'Compare current value against total cost',
  'Review profit and loss for every asset class',
  'Switch between light and dark views anytime',
];

export default function HomePage({ setPage }) {
  return (
    <main className="max-w-6xl mx-auto px-5 py-8">
      <section className="hero-panel text-white p-8 rounded-md">
        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-8 items-center">
          <div>
            <p className="text-sm font-semibold text-teal-200">
              Personal Investment Dashboard
            </p>

            <h2 className="text-4xl sm:text-5xl font-bold mt-3">
              Manage crypto, stocks, and rare metals in one place
            </h2>

            <p className="mt-4 text-slate-300 max-w-2xl">
              Finance Tracker helps you record what you bought, compare it with
              current sample market values, and understand where your portfolio
              is gaining or losing value.
            </p>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                onClick={() => setPage('crypto')}
                className="bg-teal-600 px-5 py-3 rounded-md"
              >
                Open Crypto
              </button>

              <button
                onClick={() => setPage('stocks')}
                className="bg-white text-black px-5 py-3 rounded-md"
              >
                Open Stocks
              </button>

              <button
                onClick={() => setPage('raremetals')}
                className="bg-white text-black px-5 py-3 rounded-md"
              >
                Open Rare Metals
              </button>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-md p-5">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500 p-3 rounded-md">
                <Wallet size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-300">Combined watch value</p>
                <h3 className="text-3xl font-bold">$21,360</h3>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-black/20 p-4 rounded-md">
                <p className="text-sm text-slate-300">Markets</p>
                <p className="text-2xl font-bold">3</p>
              </div>

              <div className="bg-black/20 p-4 rounded-md">
                <p className="text-sm text-slate-300">Assets</p>
                <p className="text-2xl font-bold">14+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mt-6">
        {portfolioTypes.map((type) => {
          const Icon = type.icon;

          return (
            <button
              key={type.id}
              onClick={() => setPage(type.id)}
              className="text-left bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-md p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200 p-3 rounded-md">
                  <Icon size={22} />
                </div>

                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {type.change}
                </span>
              </div>

              <h3 className="text-xl font-bold mt-4 dark:text-white">
                {type.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {type.detail}
              </p>

              <p className="text-2xl font-bold mt-4 dark:text-white">
                {type.value}
              </p>
            </button>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6">
        <ChartBox title="Market Overview" data={marketData} />

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-md p-5">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200 p-3 rounded-md">
              <ShieldCheck size={22} />
            </div>

            <h3 className="text-2xl font-bold dark:text-white">
              What you can track
            </h3>
          </div>

          <div className="grid gap-3 mt-5">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex gap-3 bg-slate-100 dark:bg-slate-950 p-3 rounded-md text-slate-700 dark:text-slate-200"
              >
                <LineChart size={18} className="text-teal-600 shrink-0 mt-1" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
