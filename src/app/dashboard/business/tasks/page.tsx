"use client";

import { useMemo, useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: string;
}

export default function BusinessTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Przygotować raport MRR za sierpień",
      description: "Zebrać dane z subskrypcji i transakcji, porównać z lipcem",
      completed: false,
      status: "in_progress",
      priority: "high",
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      assignee: "Jan Kowalski",
    },
    {
      id: "t2",
      title: "Skonfigurować cennik nowej oferty",
      description: "Dodać plan Pro+, ustawić ceny i limity",
      completed: true,
      status: "done",
      priority: "medium",
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignee: "Agnieszka Nowak",
    },
    {
      id: "t3",
      title: "Zadzwonić do dostawcy sprzętu",
      description: "Ustalić termin dostawy bieżni i racków",
      completed: false,
      status: "todo",
      priority: "low",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      assignee: "Piotr Zieliński",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Task["status"]>(
    "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | Task["priority"]
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTasks = useMemo(() => {
    const priorityRank: Record<Task["priority"], number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    const statusRank: Record<Task["status"], number> = {
      in_progress: 0,
      todo: 1,
      done: 2,
    };

    const filtered = tasks.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.assignee || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" ? true : t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return [...filtered].sort((a, b) => {
      // 1) Group by status: in_progress, todo, done
      const sr = statusRank[a.status] - statusRank[b.status];
      if (sr !== 0) return sr;
      // 2) For non-done: nearest due date first (undefined at the end)
      const ad = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
      const bd = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
      if (ad !== bd) return ad - bd;
      // 3) Then by priority: high > medium > low
      const pr = priorityRank[a.priority] - priorityRank[b.priority];
      if (pr !== 0) return pr;
      // 4) Fallback: title
      return a.title.localeCompare(b.title);
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const formatDate = (iso?: string) => {
    if (!iso) return "Brak";
    try {
      return new Date(iso).toLocaleDateString("pl-PL");
    } catch {
      return "Brak";
    }
  };

  const priorityBadge = (p: Task["priority"]) => {
    const map = {
      low: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
      medium:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    } as const;
    const label = { low: "Niska", medium: "Średnia", high: "Wysoka" }[p];
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[p]}`}
      >
        {label}
      </span>
    );
  };

  const statusBadge = (s: Task["status"]) => {
    const map = {
      todo: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    } as const;
    const label = {
      todo: "Do zrobienia",
      in_progress: "W toku",
      done: "Zrobione",
    }[s];
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}
      >
        {label}
      </span>
    );
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: !t.completed ? "done" : "todo",
            }
          : t
      )
    );
  };

  const cycleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const order: Task["status"][] = ["todo", "in_progress", "done"];
        const idx = order.indexOf(t.status);
        const next = order[(idx + 1) % order.length];
        return { ...t, status: next, completed: next === "done" };
      })
    );
  };

  const addTask = (payload: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      id: Math.random().toString(36).slice(2, 9),
      completed: payload.status === "done",
      ...payload,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const [editing, setEditing] = useState<Task | null>(null);
  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Zarządzanie zadaniami
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Zadania zespołu z priorytetami i terminami
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Dodaj zadanie
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po tytule/opisie/osobie…"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="todo">Do zrobienia</option>
            <option value="in_progress">W toku</option>
            <option value="done">Zrobione</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">Wszystkie priorytety</option>
            <option value="high">Wysoki</option>
            <option value="medium">Średni</option>
            <option value="low">Niski</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-400">Brak zadań</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Zadanie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Priorytet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Termin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Osoba
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleComplete(t.id)}
                          className="mt-1"
                        />
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              t.completed
                                ? "line-through text-slate-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {t.title}
                          </div>
                          {t.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {t.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(t.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {priorityBadge(t.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {t.assignee || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => cycleStatus(t.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Zmień status
                        </button>
                        <button
                          onClick={() => setEditing(t)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Edytuj
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => {
            addTask(data);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddTaskModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Omit<Task, "id" | "completed">) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignee, setAssignee] = useState<string>("");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Dodaj zadanie
        </h3>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis (opcjonalnie)"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="todo">Do zrobienia</option>
              <option value="in_progress">W toku</option>
              <option value="done">Zrobione</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="high">Wysoki</option>
              <option value="medium">Średni</option>
              <option value="low">Niski</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Osoba (opcjonalnie)"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          >
            Anuluj
          </button>
          <button
            onClick={() =>
              onSubmit({
                title,
                description,
                status,
                priority,
                dueDate,
                assignee,
              })
            }
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTaskModal({
  task,
  onClose,
  onSubmit,
}: {
  task: Task;
  onClose: () => void;
  onSubmit: (patch: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<Task["status"]>(task.status);
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);
  const [dueDate, setDueDate] = useState<string>(task.dueDate || "");
  const [assignee, setAssignee] = useState<string>(task.assignee || "");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Edytuj zadanie
        </h3>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="todo">Do zrobienia</option>
              <option value="in_progress">W toku</option>
              <option value="done">Zrobione</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="high">Wysoki</option>
              <option value="medium">Średni</option>
              <option value="low">Niski</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          >
            Anuluj
          </button>
          <button
            onClick={() =>
              onSubmit({
                title,
                description,
                status,
                priority,
                dueDate,
                assignee,
              })
            }
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
