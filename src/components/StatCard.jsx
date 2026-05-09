export default function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-md p-5 border border-transparent dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-400">{label}</p>

      <h2 className="text-2xl font-bold dark:text-white mt-2">
        {value}
      </h2>
    </div>
  );
}
