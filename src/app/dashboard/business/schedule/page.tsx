"use client";

import { useMemo, useState } from "react";

export default function BusinessSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Mock: przykładowe zajęcia i wydarzenia
  const eventsByDate = useMemo(
    () => ({
      [new Date().toISOString().slice(0, 10)]: [
        {
          id: "e1",
          time: "17:00",
          title: "CrossFit – grupa zaawansowana",
          coach: "Agnieszka Nowak",
          room: "Sala A",
        },
        {
          id: "e2",
          time: "18:30",
          title: "Joga – relaksacyjna",
          coach: "Piotr Zieliński",
          room: "Sala B",
        },
      ],
      [new Date(Date.now() + 86400000).toISOString().slice(0, 10)]: [
        {
          id: "e3",
          time: "07:30",
          title: "Trening obwodowy",
          coach: "Jan Kowalski",
          room: "Sala C",
        },
      ],
    }),
    []
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Harmonogramy zajęć
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Placeholder kalendarza – wkrótce dodamy pełną funkcjonalność
            </p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Zajęcia {new Date(selectedDate).toLocaleDateString("pl-PL")}
        </h2>
        {Array.isArray((eventsByDate as any)[selectedDate]) ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {(eventsByDate as any)[selectedDate].map((ev: any) => (
              <li
                key={ev.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {ev.time} • {ev.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Trener: {ev.coach} • {ev.room}
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200">
                  Szczegóły
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-700 dark:text-slate-300">
            Brak zaplanowanych zajęć. Dodaj pierwsze wydarzenie.
          </div>
        )}
      </div>
    </div>
  );
}
