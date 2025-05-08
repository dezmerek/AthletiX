"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="relative min-h-screen py-20 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300">{t("description")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 group-focus-within:text-emerald-500 transition-colors"
              >
                {t("form.name")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 group-focus-within:text-emerald-500 transition-colors"
              >
                {t("form.email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 group-focus-within:text-emerald-500 transition-colors"
            >
              {t("form.subject")}
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">{t("form.selectSubject")}</option>
              <option value="general">{t("form.subjects.general")}</option>
              <option value="support">{t("form.subjects.support")}</option>
              <option value="business">{t("form.subjects.business")}</option>
              <option value="other">{t("form.subjects.other")}</option>
            </select>
          </div>

          <div className="group">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 group-focus-within:text-emerald-500 transition-colors"
            >
              {t("form.message")}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-none"
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-500 dark:hover:to-teal-500 transition-all duration-300 font-medium"
            >
              {t("form.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 