export default function EmployeePortalPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Portal pracowniczy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Miejsce na komunikaty, dokumenty i narzędzia zespołu
        </p>
      </div>

      {/* Komunikaty */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Komunikaty
        </h2>
        <ul className="space-y-3">
          <li className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Nowy grafik na wrzesień
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Sprawdź dostępność i wymień się zmianami do 28.08
            </div>
          </li>
          <li className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Szkolenie BHP
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Termin: 05.09 godz. 10:00, sala konferencyjna
            </div>
          </li>
        </ul>
      </div>

      {/* Dokumenty */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Dokumenty
        </h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          <li className="py-3 flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Regulamin pracy (PDF)
            </span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm">
              Pobierz
            </button>
          </li>
          <li className="py-3 flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Polityka RODO (PDF)
            </span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm">
              Pobierz
            </button>
          </li>
        </ul>
      </div>

      {/* Narzędzia */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Narzędzia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40">
            Zgłoś urlop
          </button>
          <button className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40">
            Wymień zmianę
          </button>
          <button className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40">
            Złóż wniosek
          </button>
        </div>
      </div>
    </div>
  );
}
