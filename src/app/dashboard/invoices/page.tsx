"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import CreateInvoiceModal from "@/components/dashboard/professional/CreateInvoiceModal";
import EditInvoiceModal from "@/components/dashboard/professional/EditInvoiceModal";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  issueDate: string;
  description: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProfessionalInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/professional/invoices");
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", text: "Szkic" },
      sent: { color: "bg-blue-100 text-blue-800", text: "Wysłana" },
      paid: { color: "bg-green-100 text-green-800", text: "Opłacona" },
      overdue: { color: "bg-red-100 text-red-800", text: "Przeterminowana" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę fakturę?")) return;

    try {
      const response = await fetch(`/api/professional/invoices/${invoiceId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }
      await fetchInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(
        `/api/professional/invoices/${invoiceId}/pdf`
      );
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktura-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleLoadDemo = async () => {
    try {
      setLoadingDemo(true);
      const response = await fetch("/api/professional/invoices/seed", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to load demo data");
      }
      await fetchInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 mb-4">Błąd: {error}</div>
            <button
              onClick={fetchInvoices}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Faktury
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Zarządzaj fakturami dla swoich klientów
            </p>
          </div>
          <div className="flex space-x-3">
            {invoices.length === 0 && (
              <button
                onClick={handleLoadDemo}
                disabled={loadingDemo}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span>
                  {loadingDemo ? "Ładowanie..." : "Załaduj dane demo"}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nowa faktura</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {invoices.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Wszystkie faktury
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter((inv) => inv.status === "paid").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Opłacone
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-blue-600">
              {invoices.filter((inv) => inv.status === "sent").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Wysłane
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(
                invoices
                  .filter((inv) => inv.status === "paid")
                  .reduce((sum, inv) => sum + inv.amount, 0)
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Przychód
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista faktur
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Numer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Klient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kwota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Termin płatności
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      Brak faktur. Kliknij "Nowa faktura" aby utworzyć pierwszą
                      fakturę.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {invoice.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {invoice.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Podgląd"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                            title="Edytuj"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Pobierz PDF"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Usuń"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchInvoices}
      />

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingInvoice(null);
        }}
        onSuccess={fetchInvoices}
        invoice={editingInvoice}
      />

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Faktura {selectedInvoice.invoiceNumber}
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Klient
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedInvoice.customerName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedInvoice.customerEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Kwota
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(
                        selectedInvoice.amount,
                        selectedInvoice.currency
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedInvoice.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Termin płatności
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                </div>

                {selectedInvoice.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Opis
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedInvoice.description}
                    </p>
                  </div>
                )}

                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Pozycje faktury
                    </label>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Opis</th>
                            <th className="px-3 py-2 text-left">Ilość</th>
                            <th className="px-3 py-2 text-left">
                              Cena jednostkowa
                            </th>
                            <th className="px-3 py-2 text-left">Razem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {selectedInvoice.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2">{item.quantity}</td>
                              <td className="px-3 py-2">
                                {formatCurrency(
                                  item.unitPrice,
                                  selectedInvoice.currency
                                )}
                              </td>
                              <td className="px-3 py-2 font-medium">
                                {formatCurrency(
                                  item.total,
                                  selectedInvoice.currency
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Zamknij
                </button>
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice._id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Pobierz PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
