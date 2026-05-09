import { useState } from 'react';

export default function AddForm({ choices, unit, onAdd }) {
  const [choiceId, setChoiceId] = useState(choices[0].id);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const selected = choices.find((item) => item.id === choiceId);

    const newItem = {
      id: Date.now(),
      apiId: selected.id,
      name: selected.name,
      symbol: selected.symbol,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
    };

    onAdd(newItem);

    setQuantity('');
    setBuyPrice('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 p-5 rounded-md border border-transparent dark:border-slate-800"
    >
      <h2 className="text-2xl font-bold dark:text-white mb-4">
        Add Holding
      </h2>

      <div className="grid gap-3">
        <select
          value={choiceId}
          onChange={(e) => setChoiceId(e.target.value)}
          className="p-2 rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          {choices.map((item) => (
            <option key={item.id} value={item.id}>
              {item.symbol} - {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder={unit}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="p-2 rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <input
          type="number"
          placeholder="Buy Price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          className="p-2 rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <button className="bg-teal-600 text-white py-2 rounded-md">
          Add
        </button>
      </div>
    </form>
  );
}
