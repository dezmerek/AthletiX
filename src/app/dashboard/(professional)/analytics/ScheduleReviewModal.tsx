"use client";

import { ClientProgress } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  clients: ClientProgress[];
}

export default function ScheduleReviewModal({ open, onClose, clients }: Props) {
  if (!open) return null;

  const now = new Date();

  const handleSubmit = async (form: HTMLFormElement) => {
    form.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Zaplanuj Przegląd Postępów
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const selectedClient = String(formData.get("client") || "");
            const reviewDate = String(formData.get("date") || "");
            const reviewTime = String(formData.get("time") || "");
            const reviewNotes = String(formData.get("notes") || "");

            if (!reviewDate) return alert("Proszę wybrać datę przeglądu");
            if (!reviewTime) return alert("Proszę wybrać godzinę przeglądu");

            const selectedDateTime = new Date(`${reviewDate}T${reviewTime}`);
            if (selectedDateTime <= now) {
              return alert("Data i godzina przeglądu muszą być w przyszłości");
            }

            try {
              const calendarEvent = {
                title: `Przegląd postępów${
                  selectedClient ? ` - ${selectedClient}` : ""
                }`,
                type: "appointment" as const,
                date: reviewDate,
                time: reviewTime,
                duration: 60,
                description: `Przegląd postępów klienta${
                  selectedClient ? `: ${selectedClient}` : "ów"
                }\n\nNotatki: ${reviewNotes || "Brak notatek"}`,
                color: "#8B5CF6",
              };

              const response = await fetch("/api/calendar/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(calendarEvent),
              });

              if (!response.ok)
                throw new Error("Błąd podczas dodawania do kalendarza");

              const result = await response.json();
              alert(
                `✅ Przegląd został zaplanowany pomyślnie!\n\n📅 Data: ${new Date(
                  reviewDate
                )
                  .toISOString()
                  .split("T")[0]
                  .split("-")
                  .reverse()
                  .join("/")}\n🕐 Godzina: ${reviewTime}\n👤 Klient: ${
                  selectedClient || "Wszyscy klienci"
                }\n📝 Notatki: ${
                  reviewNotes || "Brak notatek"
                }\n🆔 ID Wydarzenia: ${
                  result.event.id
                }\n📱 Wydarzenie zostało dodane do kalendarza`
              );
              onClose();
            } catch (error) {
              console.error("Błąd podczas planowania przeglądu:", error);
              alert(
                `❌ Błąd podczas planowania przeglądu: ${
                  error instanceof Error ? error.message : "Nieznany błąd"
                }`
              );
            }
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Wybierz klienta (opcjonalnie)
              </label>
              <select
                name="client"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              >
                <option value="">Wszyscy klienci</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data przeglądu
              </label>
              <input
                name="date"
                type="date"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Godzina przeglądu
              </label>
              <input
                name="time"
                type="time"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notatki (opcjonalnie)
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                placeholder="Dodatkowe informacje o przeglądzie..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Zaplanuj
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
