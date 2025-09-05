"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const plan = searchParams.get("plan");
    const canceled = searchParams.get("canceled");

    if (success === "true" && plan) {
      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>Dziękujemy! Subskrypcja planu ${plan} została pomyślnie aktywowana.</span>
      `;
      document.body.appendChild(notification);

      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.toString());
    } else if (canceled === "true") {
      // Show cancel notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>Płatność została anulowana. Możesz spróbować ponownie w dowolnym momencie.</span>
      `;
      document.body.appendChild(notification);

      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return <>{children}</>;
}
