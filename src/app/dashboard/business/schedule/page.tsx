"use client";

import { useEffect, useMemo, useState } from "react";

interface EventItem {
  id: string;
  title: string;
  coach?: string;
  room?: string;
  start: string; // ISO
  end: string; // ISO
  capacity?: number;
}

export default function BusinessSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const from = new Date(selectedDate);
      const to = new Date(selectedDate);
      to.setDate(to.getDate() + 1);
      const res = await fetch(
        `/api/business/schedule?from=${from.toISOString()}&to=${to.toISOString()}`
      );
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Harmonogramy zajęć
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Zajęcia i wydarzenia w wybranym dniu
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Dodaj wydarzenie
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Zajęcia {new Date(selectedDate).toLocaleDateString("pl-PL")}
        </h2>
        {loading ? (
          <div className="text-slate-600 dark:text-slate-400">Ładowanie…</div>
        ) : events.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(ev.start).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" • "}
                    {ev.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {ev.coach ? `Trener: ${ev.coach}` : ""}
                    {ev.coach && ev.room ? " • " : ""}
                    {ev.room ? ev.room : ""}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditing(ev)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Usunąć to wydarzenie?")) return;
                      try {
                        await fetch(`/api/business/schedule/${ev.id}`, {
                          method: "DELETE",
                        });
                        await fetchEvents();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 dark:border-red-700 text-sm"
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-700 dark:text-slate-300">
            Brak zaplanowanych zajęć. Dodaj pierwsze wydarzenie.
          </div>
        )}
      </div>

      {showAddModal && (
        <AddEventModal
          date={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false);
            await fetchEvents();
          }}
        />
      )}

      {editing && (
        <EditEventModal
          event={editing}
          onClose={() => setEditing(null)}
          onSuccess={async () => {
            setEditing(null);
            await fetchEvents();
          }}
        />
      )}
    </div>
  );
}

function AddEventModal({
  date,
  onClose,
  onSuccess,
}: {
  date: string;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [coach, setCoach] = useState("");
  const [room, setRoom] = useState("");
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("18:00");
  const [capacity, setCapacity] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      const startIso = new Date(`${date}T${start}:00`).toISOString();
      const endIso = new Date(`${date}T${end}:00`).toISOString();
      const res = await fetch("/api/business/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          coach,
          room,
          start: startIso,
          end: endIso,
          capacity,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      await onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Dodaj wydarzenie
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
              placeholder="Trener (opcjonalnie)"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Sala (opcjonalnie)"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value || "0", 10))}
            placeholder="Pojemność"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          >
            Anuluj
          </button>
          <button
            disabled={saving || !title}
            onClick={submit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
          >
            {saving ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditEventModal({
  event,
  onClose,
  onSuccess,
}: {
  event: EventItem;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}) {
  const [title, setTitle] = useState(event.title);
  const [coach, setCoach] = useState(event.coach || "");
  const [room, setRoom] = useState(event.room || "");
  const [start, setStart] = useState(
    new Date(event.start).toISOString().slice(11, 16)
  );
  const [end, setEnd] = useState(
    new Date(event.end).toISOString().slice(11, 16)
  );
  const [capacity, setCapacity] = useState<number>(event.capacity || 0);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      const date = new Date(event.start).toISOString().slice(0, 10);
      const startIso = new Date(`${date}T${start}:00`).toISOString();
      const endIso = new Date(`${date}T${end}:00`).toISOString();
      const res = await fetch(`/api/business/schedule/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          coach,
          room,
          start: startIso,
          end: endIso,
          capacity,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      await onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Edytuj wydarzenie
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
              placeholder="Trener (opcjonalnie)"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Sala (opcjonalnie)"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value || "0", 10))}
            placeholder="Pojemność"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          >
            Anuluj
          </button>
          <button
            disabled={saving || !title}
            onClick={submit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
          >
            {saving ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </div>
    </div>
  );
}
