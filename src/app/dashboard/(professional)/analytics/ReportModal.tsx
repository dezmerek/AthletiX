"use client";

import { AnalyticsData, ClientProgress, MonthlyStats } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  reportData: {
    period: string;
    metric: string;
    analyticsData: AnalyticsData | null;
    clientProgress: ClientProgress[];
    monthlyStats: MonthlyStats[];
  };
}

export default function ReportModal({ open, onClose, reportData }: Props) {
  if (!open) return null;

  const generatePDF = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Raport Wydajności Klientów - AthletiX</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #10b981;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #10b981;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          .metric-card {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 5px;
          }
          .metric-label {
            color: #666;
            font-size: 14px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .table th,
          .table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          .table th {
            background: #f8fafc;
            font-weight: bold;
            color: #374151;
          }
          .table tr:nth-child(even) {
            background: #f9fafb;
          }
          .progress-bar {
            width: 100px;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: #10b981;
            transition: width 0.3s ease;
          }
          .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .badge-nutrition {
            background: #fef3c7;
            color: #92400e;
          }
          .badge-training {
            background: #dbeafe;
            color: #1e40af;
          }
          .badge-both {
            background: #d1fae5;
            color: #065f46;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AthletiX - Raport Wydajności Klientów</h1>
          <p>Wygenerowano: ${new Date().toLocaleDateString("pl-PL")} | Okres: ${
      reportData.period
    }</p>
        </div>

        ${
          reportData.analyticsData
            ? `
        <div class="section">
          <h2>Kluczowe Metryki</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${
                reportData.analyticsData.totalClients
              }</div>
              <div class="metric-label">Łączna liczba klientów</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${
                reportData.analyticsData.activeClients
              }</div>
              <div class="metric-label">Aktywni klienci</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${
                reportData.analyticsData.avgProgress
              }%</div>
              <div class="metric-label">Średni postęp</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.analyticsData.revenue.toLocaleString(
                "pl-PL"
              )} zł</div>
              <div class="metric-label">Przychody (${
                reportData.analyticsData.monthlyGrowth > 0 ? "+" : ""
              }${reportData.analyticsData.monthlyGrowth}%)</div>
            </div>
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <h2>Przegląd Postępów Klientów</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Klient</th>
                <th>Typ Planu</th>
                <th>Waga</th>
                <th>Postęp</th>
                <th>Aktywność</th>
                <th>Ostatnia Aktywność</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.clientProgress
                .map(
                  (client) => `
                <tr>
                  <td><strong>${client.name}</strong></td>
                  <td>
                    <span class="badge badge-${client.type}">
                      ${
                        client.type === "nutrition"
                          ? "Żywienie"
                          : client.type === "training"
                          ? "Trening"
                          : "Oba"
                      }
                    </span>
                  </td>
                  <td>${client.startWeight}kg → ${
                    client.currentWeight
                  }kg<br><small>Cel: ${client.targetWeight}kg</small></td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${
                        client.progress
                      }%"></div>
                    </div>
                    <small>${client.progress}%</small>
                  </td>
                  <td>${client.workoutsCompleted} treningów<br>${
                    client.nutritionLogged
                  } posiłków</td>
                  <td>${new Date(client.lastActivity).toLocaleDateString(
                    "pl-PL"
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        ${
          reportData.monthlyStats.length > 0
            ? `
        <div class="section">
          <h2>Statystyki Miesięczne</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Miesiąc</th>
                <th>Nowi Klienci</th>
                <th>Ukończone Plany</th>
                <th>Średni Postęp</th>
                <th>Przychody</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.monthlyStats
                .map(
                  (month) => `
                <tr>
                  <td><strong>${month.month}</strong></td>
                  <td>${month.newClients}</td>
                  <td>${month.completedPlans}</td>
                  <td>${month.avgProgress}%</td>
                  <td>${month.revenue.toLocaleString("pl-PL")} zł</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>Raport wygenerowany automatycznie przez system AthletiX</p>
          <p>© ${new Date().getFullYear()} AthletiX - Platforma dla trenerów personalnych</p>
        </div>
      </body>
      </html>
    `;

    // Create a blob with the HTML content
    const blob = new Blob([reportHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `raport-wydajnosci-klientow-${
      new Date().toISOString().split("T")[0]
    }.html`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);

    // Show success message
    alert(
      "Raport został pobrany jako plik HTML. Możesz go otworzyć w przeglądarce i wydrukować jako PDF."
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pobieranie Raportu
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

        <div className="mb-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <h4 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                  Raport gotowy do pobrania
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 mt-1">
                  Raport zostanie pobrany jako plik HTML, który możesz otworzyć
                  w przeglądarce i wydrukować jako PDF.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-3">
            Zawartość raportu:
          </h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-emerald-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Kluczowe metryki wydajności
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-emerald-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Szczegółowy przegląd postępów klientów
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-emerald-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Statystyki miesięczne
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-emerald-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Profesjonalne formatowanie
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={generatePDF}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Pobierz Raport
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
