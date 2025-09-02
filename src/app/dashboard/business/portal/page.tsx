"use client";

import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  body?: string;
  date?: string;
  author?: string;
}

export default function EmployeePortalPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [req, setReq] = useState<{
    type: "leave" | "shift_swap" | "general";
  } | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"from" | "to" | "status">("from");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/business/portal/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/business/portal/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  const formatRequestType = (
    type: "leave" | "shift_swap" | "general" | string
  ) => {
    switch (type) {
      case "leave":
        return "Urlop";
      case "shift_swap":
        return "Zamiana zmiany";
      case "general":
        return "Wniosek ogólny";
      default:
        return String(type);
    }
  };

  const formatStatus = (
    status: "pending" | "approved" | "rejected" | string
  ) => {
    switch (status) {
      case "pending":
        return "Oczekuje";
      case "approved":
        return "Zaakceptowany";
      case "rejected":
        return "Odrzucony";
      default:
        return String(status);
    }
  };

  const normalized = (value?: string) => (value || "").toLowerCase();
  const getDateValue = (value?: string) => {
    const time = value ? Date.parse(value) : NaN;
    return isNaN(time) ? 0 : time;
  };

  const displayedRequests = requests
    .filter((r) => (filterType === "all" ? true : r.type === filterType))
    .filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))
    .filter((r) => {
      if (!query) return true;
      const q = normalized(query);
      return (
        normalized(r.payload?.reason).includes(q) ||
        normalized(r.payload?.from).includes(q) ||
        normalized(r.payload?.to).includes(q) ||
        normalized(r.payload?.swapWith).includes(q) ||
        normalized(r.type).includes(q) ||
        normalized(r.status).includes(q)
      );
    })
    .sort((a, b) => {
      let av = 0;
      let bv = 0;
      if (sortKey === "from") {
        av = getDateValue(a.payload?.from);
        bv = getDateValue(b.payload?.from);
      } else if (sortKey === "to") {
        av = getDateValue(a.payload?.to);
        bv = getDateValue(b.payload?.to);
      } else {
        av = normalized(a.status) < normalized(b.status) ? -1 : 1;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });

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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Komunikaty
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Dodaj
          </button>
        </div>
        {loading ? (
          <div className="text-slate-600 dark:text-slate-400">Ładowanie…</div>
        ) : announcements.length ? (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {a.title}
                    </div>
                    {a.body && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {a.body}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {a.date ? new Date(a.date).toLocaleString("pl-PL") : ""}{" "}
                      {a.author ? `• ${a.author}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditing(a)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Usunąć komunikat?")) return;
                        await fetch(
                          `/api/business/portal/announcements/${a.id}`,
                          { method: "DELETE" }
                        );
                        await fetchAnnouncements();
                      }}
                      className="px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-700 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-600 dark:text-slate-400">
            Brak komunikatów
          </div>
        )}
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
          <ToolButton
            label="Zgłoś urlop"
            onClick={() => setReq({ type: "leave" })}
          />
          <ToolButton
            label="Wymień zmianę"
            onClick={() => setReq({ type: "shift_swap" })}
          />
          <ToolButton
            label="Złóż wniosek"
            onClick={() => setReq({ type: "general" })}
          />
        </div>
      </div>
      {showAdd && (
        <AddAnnouncementModal
          onClose={() => setShowAdd(false)}
          onSubmit={async (payload) => {
            await fetch("/api/business/portal/announcements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            setShowAdd(false);
            await fetchAnnouncements();
          }}
        />
      )}
      {editing && (
        <EditAnnouncementModal
          announcement={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            await fetch(`/api/business/portal/announcements/${editing.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            setEditing(null);
            await fetchAnnouncements();
          }}
        />
      )}
      {req && (
        <RequestModal
          req={req}
          onClose={() => setReq(null)}
          onSubmit={async (payload) => {
            await fetch("/api/business/portal/requests", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            setReq(null);
            await fetchRequests();
          }}
        />
      )}

      {/* Wnioski pracownicze */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Wnioski
          </h2>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj (powód, daty, typ, status)"
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">Wszystkie typy</option>
            <option value="leave">Urlop</option>
            <option value="shift_swap">Zamiana zmiany</option>
            <option value="general">Wniosek ogólny</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="pending">Oczekuje</option>
            <option value="approved">Zaakceptowany</option>
            <option value="rejected">Odrzucony</option>
          </select>
          <div className="flex items-center space-x-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="from">Sortuj: Od</option>
              <option value="to">Sortuj: Do</option>
              <option value="status">Sortuj: Status</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
              title="Zmień kierunek sortowania"
            >
              {sortDir === "asc" ? "Rosnąco" : "Malejąco"}
            </button>
          </div>
        </div>
        {loadingRequests ? (
          <div className="text-slate-600 dark:text-slate-400">Ładowanie…</div>
        ) : requests.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-400">
            Brak wniosków
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Od
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Powód
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {displayedRequests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {formatRequestType(r.type)}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {r.payload?.from || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {r.payload?.to || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {r.payload?.reason || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : r.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {formatStatus(r.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-right">
                      {r.status === "pending" ? (
                        <div className="space-x-2">
                          <button
                            disabled={actionLoadingId === r.id}
                            onClick={async () => {
                              if (!confirm("Zaakceptować wniosek?")) return;
                              setActionLoadingId(r.id);
                              await fetch(
                                `/api/business/portal/requests/${r.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ status: "approved" }),
                                }
                              );
                              await fetchRequests();
                              setActionLoadingId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-green-300 text-green-700 dark:border-green-800 dark:text-green-400"
                          >
                            {actionLoadingId === r.id ? "…" : "Akceptuj"}
                          </button>
                          <button
                            disabled={actionLoadingId === r.id}
                            onClick={async () => {
                              if (!confirm("Odrzucić wniosek?")) return;
                              setActionLoadingId(r.id);
                              await fetch(
                                `/api/business/portal/requests/${r.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ status: "rejected" }),
                                }
                              );
                              await fetchRequests();
                              setActionLoadingId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
                          >
                            {actionLoadingId === r.id ? "…" : "Odrzuć"}
                          </button>
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
                          >
                            Szczegóły
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <span className="text-slate-400">—</span>
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
                          >
                            Szczegóły
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

function AddAnnouncementModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (p: { title: string; body?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Dodaj komunikat
        </h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Treść (opcjonalnie)"
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
            onClick={async () => {
              setSaving(true);
              await onSubmit({ title, body });
              setSaving(false);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
          >
            {saving ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 w-full"
    >
      {label}
    </button>
  );
}

function RequestModal({
  req,
  onClose,
  onSubmit,
}: {
  req: { type: "leave" | "shift_swap" | "general" };
  onClose: () => void;
  onSubmit: (p: any) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [swapWith, setSwapWith] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await onSubmit({ type: req.type, payload: { from, to, reason, swapWith } });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {req.type === "leave"
            ? "Wniosek urlopowy"
            : req.type === "shift_swap"
            ? "Wymiana zmiany"
            : "Wniosek"}
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          {req.type === "shift_swap" && (
            <input
              value={swapWith}
              onChange={(e) => setSwapWith(e.target.value)}
              placeholder="Z kim wymieniasz?"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          )}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Uzasadnienie (opcjonalnie)"
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
            disabled={saving}
            onClick={submit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Wyślij
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAnnouncementModal({
  announcement,
  onClose,
  onSubmit,
}: {
  announcement: Announcement;
  onClose: () => void;
  onSubmit: (p: { title: string; body?: string }) => void;
}) {
  const [title, setTitle] = useState(announcement.title);
  const [body, setBody] = useState(announcement.body || "");
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Edytuj komunikat
        </h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
            onClick={async () => {
              setSaving(true);
              await onSubmit({ title, body });
              setSaving(false);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestDetailsModal({
  request,
  onClose,
}: {
  request: any;
  onClose: () => void;
}) {
  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleString("pl-PL") : "—";
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Szczegóły wniosku
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Typ</span>
            <span className="text-slate-900 dark:text-slate-200">
              {request?.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="text-slate-900 dark:text-slate-200">
              {request?.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Od</span>
              <span className="text-slate-900 dark:text-slate-200">
                {formatDate(request?.payload?.from)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Do</span>
              <span className="text-slate-900 dark:text-slate-200">
                {formatDate(request?.payload?.to)}
              </span>
            </div>
          </div>
          {request?.payload?.swapWith && (
            <div className="flex justify-between">
              <span className="text-slate-500">Zamiana z</span>
              <span className="text-slate-900 dark:text-slate-200">
                {request.payload.swapWith}
              </span>
            </div>
          )}
          {request?.payload?.reason && (
            <div>
              <div className="text-slate-500 mb-1">Uzasadnienie</div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 whitespace-pre-wrap">
                {request.payload.reason}
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
