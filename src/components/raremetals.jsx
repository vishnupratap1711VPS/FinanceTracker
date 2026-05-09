import { useState } from 'react';

import PortfolioPage from './PortfolioPage';

const rareMetals = [
  { id: 'gold', symbol: 'XAU', name: 'Gold' },
  { id: 'silver', symbol: 'XAG', name: 'Silver' },
  { id: 'platinum', symbol: 'XPT', name: 'Platinum' },
  { id: 'palladium', symbol: 'XPD', name: 'Palladium' },
  { id: 'lithium', symbol: 'Li', name: 'Lithium' },
  { id: 'neodymium', symbol: 'Nd', name: 'Neodymium' },
];

const starterRareMetals = [
  {
    id: 3,
    apiId: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    quantity: 2,
    buyPrice: 2300,
  },
];

const rareMetalPrices = {
  gold: 2365,
  silver: 31,
  platinum: 1030,
  palladium: 970,
  lithium: 14,
  neodymium: 78,
};

const rareMetalTrend = [
  { day: 'Mon', value: 4700 },
  { day: 'Tue', value: 4760 },
  { day: 'Wed', value: 4825 },
  { day: 'Thu', value: 4790 },
  { day: 'Fri', value: 4910 },
];

export default function RareMetalsPage() {
  const [metalItems, setMetalItems] = useState(starterRareMetals);

  function addMetal(item) {
    setMetalItems([...metalItems, item]);
  }

  function deleteMetal(id) {
    const updated = metalItems.filter((item) => item.id !== id);
    setMetalItems(updated);
  }

  return (
    <PortfolioPage
      items={metalItems}
      prices={rareMetalPrices}
      choices={rareMetals}
      title="Rare Metals Portfolio"
      chartData={rareMetalTrend}
      loading={false}
      error=""
      unit="units"
      onAdd={addMetal}
      onDelete={deleteMetal}
    />
  );
}
