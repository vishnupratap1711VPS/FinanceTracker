import ChartBox from './ChartBox';

const marketData = [
  { day: 'Mon', value: 10000 },
  { day: 'Tue', value: 12000 },
  { day: 'Wed', value: 13000 },
  { day: 'Thu', value: 14000 },
  { day: 'Fri', value: 15000 },
];

export default function HomePage({ setPage }) {
  return (
    <main className="max-w-6xl mx-auto px-5 py-8">
      <div className="bg-slate-900 text-white p-8 rounded-md">
        <h2 className="text-5xl font-bold">
          Manage your investments easily
        </h2>

        <p className="mt-4 text-slate-300">
          Track crypto and stocks in one dashboard.
        </p>

        <div className="mt-6 flex gap-4">
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
        </div>
      </div>

      <div className="mt-6">
        <ChartBox title="Market Overview" data={marketData} />
      </div>
    </main>
  );
}