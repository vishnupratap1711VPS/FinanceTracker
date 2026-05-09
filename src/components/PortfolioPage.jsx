import AddForm from './AddForm';
import HoldingRow from './HoldingRow';
import StatCard from './StatCard';
import ChartBox from './ChartBox';

function money(value) {
  return '$' + Number(value || 0).toLocaleString();
}

export default function PortfolioPage({
  items,
  prices,
  choices,
  title,
  chartData,
  loading,
  error,
  unit,
  onAdd,
  onDelete,
}) {
  let totalValue = 0;
  let totalCost = 0;

  items.forEach((item) => {
    totalValue += (prices[item.apiId] || 0) * item.quantity;
    totalCost += item.buyPrice * item.quantity;
  });

  const profit = totalValue - totalCost;

  return (
    <main className="max-w-6xl mx-auto px-5 py-6">
      <div className="bg-slate-900 text-white p-6 rounded-md">
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="mt-3 text-2xl">{money(totalValue)}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <StatCard label="Portfolio Value" value={money(totalValue)} />
        <StatCard label="Total Cost" value={money(totalCost)} />
        <StatCard label="Profit / Loss" value={money(profit)} />
      </div>

      {loading && (
        <p className="mt-4 bg-blue-100 p-3 rounded-md">
          Loading prices...
        </p>
      )}

      {error && (
        <p className="mt-4 bg-red-100 p-3 rounded-md">
          {error}
        </p>
      )}

      <div className="mt-6">
        <ChartBox title={title + ' Trend'} data={chartData} />
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 mt-6">
        <AddForm
          choices={choices}
          unit={unit}
          onAdd={onAdd}
        />

        <div className="bg-white dark:bg-slate-900 rounded-md p-5">
          <h2 className="text-2xl font-bold dark:text-white mb-4">
            Holdings
          </h2>

          {items.map((item) => (
            <HoldingRow
              key={item.id}
              item={item}
              price={prices[item.apiId]}
              unit={unit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </main>
  );
}