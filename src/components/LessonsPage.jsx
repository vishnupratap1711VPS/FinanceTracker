export default function LessonsPage() {
  const lessons = [
    'React Components',
    'JSX',
    'Props',
    'useState',
    'useEffect',
    'API Fetching',
    'Conditional Rendering',
    'List Rendering',
  ];

  return (
    <main className="max-w-4xl mx-auto px-5 py-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-md">
        <h2 className="text-3xl font-bold dark:text-white">
          React Concepts Used
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {lessons.map((lesson, index) => (
            <div
              key={index}
              className="bg-slate-100 dark:bg-slate-800 dark:text-white p-4 rounded-md"
            >
              {lesson}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}