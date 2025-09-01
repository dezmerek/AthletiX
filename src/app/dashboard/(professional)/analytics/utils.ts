export const getProgressColor = (progress: number) => {
  if (progress >= 80) return "text-green-600 dark:text-green-400";
  if (progress >= 60) return "text-blue-600 dark:text-blue-400";
  if (progress >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case "nutrition":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "training":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "both":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
};
