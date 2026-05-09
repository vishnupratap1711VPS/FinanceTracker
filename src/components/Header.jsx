import { Home, Coins, TrendingUp, BookOpen, Wallet, Gem } from 'lucide-react';

export default function Header({ page, setPage, theme, setTheme }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'crypto', label: 'Crypto', icon: Coins },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
    { id: 'raremetals', label: 'Rare Metals', icon: Gem },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 border-b bg-white dark:bg-slate-900 dark:border-slate-800 px-5 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-3 rounded-md">
            <Wallet size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold dark:text-white">
              Finance Tracker
            </h1>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                className={
                  page === tab.id
                    ? 'bg-teal-600 text-white px-4 py-2 rounded-md'
                    : 'bg-slate-200 dark:bg-slate-800 dark:text-white px-4 py-2 rounded-md'
                }
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  {tab.label}
                </div>
              </button>
            );
          })}

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-2 rounded-md dark:bg-slate-800 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </header>
  );
}
