import { Trash2 } from 'lucide-react';

function money(value) {
  return '$' + Number(value || 0).toLocaleString();
}

export default function HoldingRow({
  item,
  price,
  unit,
  onDelete,
}) {
  const total = (price || 0) * item.quantity;
  const cost = item.buyPrice * item.quantity;
  const profit = total - cost;

  return (
    <div className="border-b py-4 dark:border-slate-700">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-bold dark:text-white">
            {item.name}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {item.quantity} {unit}
          </p>
        </div>

        <div>
          <p className="dark:text-white">
            Price: {money(price)}
          </p>

          <p className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
            {money(profit)}
          </p>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="bg-red-100 text-red-600 p-2 rounded-md"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
