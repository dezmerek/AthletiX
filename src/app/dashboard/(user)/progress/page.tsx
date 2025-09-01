"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

interface Measurement {
  id: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

interface Goal {
  id: string;
  type: "weight" | "calorie" | "workout";
  title: string;
  target: number;
  current: number;
  unit: string;
  status: "achieved" | "inProgress" | "notStarted";
}

export default function ProgressPage() {
  const t = useTranslations("Progress");

  // Stan dla danych postępów
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [goals] = useState<Goal[]>([
    {
      id: "1",
      type: "weight",
      title: "Docelowa waga",
      target: 70,
      current: 72.5,
      unit: "kg",
      status: "inProgress",
    },
    {
      id: "2",
      type: "calorie",
      title: "Dzienne kalorie",
      target: 2000,
      current: 1800,
      unit: "kcal",
      status: "inProgress",
    },
    {
      id: "3",
      type: "workout",
      title: "Treningi w tygodniu",
      target: 4,
      current: 3,
      unit: "treningi",
      status: "inProgress",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pobierz dane postępów z API
  useEffect(() => {
    fetchProgressData();
  }, []);

  // Automatycznie zapisz dane gdy stan się zmieni
  useEffect(() => {
    if (!loading) {
      // Zapisz tylko jeśli nie jest to pierwsze ładowanie
      const timer = setTimeout(() => {
        if (weightEntries.length > 0 || measurements.length > 0) {
          console.log("🔄 Auto-saving due to state change...");
          saveProgressData();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [weightEntries, measurements, loading]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching progress data...");
      const response = await fetch("/api/user/progress");
      if (response.ok) {
        const data = await response.json();
        console.log("📥 Received data:", data);

        // Sprawdź czy dane mają id
        if (data.weightEntries) {
          console.log(
            "🔍 Weight entries IDs:",
            data.weightEntries.map((entry: any) => entry.id)
          );
        }
        if (data.measurements) {
          console.log(
            "🔍 Measurements IDs:",
            data.measurements.map((measurement: any) => measurement.id)
          );
        }

        // Upewnij się, że dane są tablicami i mają id
        const validWeightEntries = Array.isArray(data.weightEntries)
          ? data.weightEntries.filter((entry) => entry && entry.id)
          : [];
        const validMeasurements = Array.isArray(data.measurements)
          ? data.measurements.filter(
              (measurement) => measurement && measurement.id
            )
          : [];

        setWeightEntries(validWeightEntries);
        setMeasurements(validMeasurements);
        console.log("✅ Set weightEntries:", validWeightEntries.length);
        console.log("✅ Set measurements:", validMeasurements.length);
      } else {
        console.error("❌ Response not ok:", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Zapisz dane postępów do bazy
  const saveProgressData = async () => {
    try {
      setSaving(true);

      // Upewnij się, że wszystkie dane mają id
      const cleanWeightEntries = weightEntries.filter(
        (entry) => entry && entry.id
      );
      const cleanMeasurements = measurements.filter(
        (measurement) => measurement && measurement.id
      );
      const cleanGoals = goals.filter((goal) => goal && goal.id);

      const dataToSend = {
        weightEntries: cleanWeightEntries,
        measurements: cleanMeasurements,
        goals: cleanGoals,
      };

      console.log("🚀 Sending data to API:", {
        originalWeightEntriesCount: weightEntries.length,
        originalMeasurementsCount: measurements.length,
        originalGoalsCount: goals.length,
        cleanWeightEntriesCount: cleanWeightEntries.length,
        cleanMeasurementsCount: cleanMeasurements.length,
        cleanGoalsCount: cleanGoals.length,
        weightEntries: cleanWeightEntries,
        measurements: cleanMeasurements,
      });

      const response = await fetch("/api/user/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Progress data saved successfully");
      } else {
        console.error("Error saving progress data");
      }
    } catch (error) {
      console.error("Error saving progress data:", error);
    } finally {
      setSaving(false);
    }
  };

  // Dodaj nowy wpis wagi
  const addWeightEntry = (entry: WeightEntry) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    const newWeightEntries = [newEntry, ...weightEntries];
    setWeightEntries(newWeightEntries);

    // Aktualizuj profil z nową wagą
    updateProfileWeight(entry.weight);

    // Stan zostanie automatycznie zapisany przez useEffect
  };

  // Aktualizuj wagę w profilu
  const updateProfileWeight = async (newWeight: number) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: newWeight,
        }),
      });

      if (response.ok) {
        // Aktualizuj lokalny stan profilu
        setProfileData((prev) => ({
          ...prev,
          currentWeight: newWeight,
        }));
        console.log("✅ Profile weight updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile weight:", error);
    }
  };

  // Aktualizuj docelową wagę w profilu
  const updateTargetWeight = async (newTargetWeight: number) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetWeight: newTargetWeight,
        }),
      });

      if (response.ok) {
        // Aktualizuj lokalny stan profilu
        setProfileData((prev) => ({
          ...prev,
          targetWeight: newTargetWeight,
        }));
        console.log("✅ Target weight updated successfully");
        setShowTargetWeightModal(false);
      }
    } catch (error) {
      console.error("Error updating target weight:", error);
    }
  };

  // Usuń wpis wagi
  const removeWeightEntry = (id: string) => {
    const newWeightEntries = weightEntries.filter((entry) => entry.id !== id);
    setWeightEntries(newWeightEntries);
    // Stan zostanie automatycznie zapisany przez useEffect
  };

  // Dodaj nowy pomiar
  const addMeasurement = (measurement: Measurement) => {
    const newMeasurement = {
      ...measurement,
      id: Date.now().toString(),
    };
    console.log("➕ Adding new measurement:", newMeasurement);

    const newMeasurements = [newMeasurement, ...measurements];
    console.log("📏 New measurements array:", newMeasurements);

    setMeasurements(newMeasurements);
    // Stan zostanie automatycznie zapisany przez useEffect
  };

  // Usuń pomiar
  const removeMeasurement = (id: string) => {
    const newMeasurements = measurements.filter(
      (measurement) => measurement.id !== id
    );
    setMeasurements(newMeasurements);
    // Stan zostanie automatycznie zapisany przez useEffect
  };

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);
  const [newTargetWeight, setNewTargetWeight] = useState("");
  const [newWeightEntry, setNewWeightEntry] = useState({
    date: "",
    weight: "",
  });
  const [newMeasurement, setNewMeasurement] = useState({
    date: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
  });

  // Stan dla danych profilu
  const [profileData, setProfileData] = useState({
    currentWeight: 0,
    targetWeight: 0,
  });

  // Pobierz dane profilu
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfileData({
              currentWeight: data.profile.weight || 0,
              targetWeight: data.profile.targetWeight || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  // Obliczenia statystyk
  const currentWeight =
    weightEntries[0]?.weight || profileData.currentWeight || 0;
  const previousWeight = weightEntries[1]?.weight || currentWeight;
  const weightChange = currentWeight - previousWeight;
  const targetWeight =
    profileData.targetWeight ||
    goals.find((g) => g.type === "weight")?.target ||
    70;
  const totalProgress =
    profileData.targetWeight && profileData.currentWeight
      ? (Math.abs(profileData.currentWeight - currentWeight) /
          Math.abs(profileData.currentWeight - targetWeight)) *
        100
      : 0;

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split("T")[0];
    setNewWeightEntry((prev) => ({ ...prev, date: today }));
    setNewMeasurement((prev) => ({ ...prev, date: today }));
  }, []);
  const handleAddWeightEntry = () => {
    if (newWeightEntry.date && newWeightEntry.weight) {
      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        date: newWeightEntry.date,
        weight: parseFloat(newWeightEntry.weight),
      };
      addWeightEntry(newEntry);
      setNewWeightEntry({ date: "", weight: "" });
      setShowWeightModal(false);
    }
  };

  const handleAddMeasurement = () => {
    if (newMeasurement.date) {
      const newMeas: Measurement = {
        id: Date.now().toString(),
        date: newMeasurement.date,
        chest: newMeasurement.chest
          ? parseFloat(newMeasurement.chest)
          : undefined,
        waist: newMeasurement.waist
          ? parseFloat(newMeasurement.waist)
          : undefined,
        hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : undefined,
        arms: newMeasurement.arms ? parseFloat(newMeasurement.arms) : undefined,
        thighs: newMeasurement.thighs
          ? parseFloat(newMeasurement.thighs)
          : undefined,
      };
      addMeasurement(newMeas);
      setNewMeasurement({
        date: "",
        chest: "",
        waist: "",
        hips: "",
        arms: "",
        thighs: "",
      });
      setShowMeasurementModal(false);
    }
  };

  const handleUpdateTargetWeight = () => {
    if (newTargetWeight) {
      updateTargetWeight(parseFloat(newTargetWeight));
      setNewTargetWeight("");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("subtitle")}
          </p>
          {saving && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              💾 Zapisywanie danych...
            </div>
          )}
        </div>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("overview.currentWeight")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentWeight} kg
            </div>
            <div
              className={`text-sm mt-1 ${
                weightChange >= 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {weightChange >= 0 ? "+" : ""}
              {weightChange.toFixed(1)} kg {t("overview.lastWeek")}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("overview.targetWeight")}
              </h3>
              <button
                onClick={() => setShowTargetWeightModal(true)}
                className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                title="Edytuj docelową wagę"
              >
                <svg
                  className="w-4 h-4 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {targetWeight} kg
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {(currentWeight - targetWeight).toFixed(1)} kg pozostało
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("overview.totalProgress")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalProgress.toFixed(0)}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(totalProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("stats.daysActive")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              127
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              dni z rzędu
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weight Tracking */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                {t("weightTracking.title")}
              </h2>
              <button
                onClick={() => setShowWeightModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
              >
                {t("weightTracking.addEntry")}
              </button>
            </div>

            <div className="space-y-3">
              {weightEntries.length > 0 ? (
                weightEntries
                  .filter((entry) => entry && entry.id) // Filtruj tylko elementy z id
                  .slice(0, 5)
                  .map((entry, index) => (
                    <div
                      key={entry.id || `weight-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {entry.weight} kg
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(entry.date).toLocaleDateString("pl-PL")}
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 italic">
                          {entry.notes}
                        </div>
                      )}
                      <button
                        onClick={() => removeWeightEntry(entry.id)}
                        className="text-red-500 hover:text-red-600 text-sm p-1"
                        title="Usuń wpis"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 dark:text-slate-500 mb-2">
                    {t("weightTracking.noEntries")}
                  </div>
                  <button
                    onClick={() => setShowWeightModal(true)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    {t("weightTracking.addFirstEntry")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body Measurements */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                {t("measurements.title")}
              </h2>
              <button
                onClick={() => setShowMeasurementModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
              >
                {t("measurements.addMeasurement")}
              </button>
            </div>

            <div className="space-y-4">
              {measurements.length > 0 ? (
                measurements
                  .filter((measurement) => measurement && measurement.id) // Filtruj tylko elementy z id
                  .slice(0, 3)
                  .map((measurement, index) => (
                    <div
                      key={measurement.id || `measurement-${index}`}
                      className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        {new Date(measurement.date).toLocaleDateString("pl-PL")}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {measurement.chest && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              {t("measurements.chest")}:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white ml-2">
                              {measurement.chest} cm
                            </span>
                          </div>
                        )}
                        {measurement.waist && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              {t("measurements.waist")}:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white ml-2">
                              {measurement.waist} cm
                            </span>
                          </div>
                        )}
                        {measurement.hips && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              {t("measurements.hips")}:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white ml-2">
                              {measurement.hips} cm
                            </span>
                          </div>
                        )}{" "}
                        {measurement.arms && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              {t("measurements.arms")}:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white ml-2">
                              {measurement.arms} cm
                            </span>
                          </div>
                        )}
                        {measurement.thighs && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              {t("measurements.thighs")}:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white ml-2">
                              {measurement.thighs} cm
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => removeMeasurement(measurement.id)}
                          className="text-red-500 hover:text-red-600 text-sm p-1"
                          title="Usuń pomiar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 dark:text-slate-500 mb-2">
                    {t("measurements.noMeasurements")}
                  </div>
                  <button
                    onClick={() => setShowMeasurementModal(true)}
                    className="text-green-500 hover:text-green-600 text-sm"
                  >
                    {t("measurements.addFirstMeasurement")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>{" "}
        {/* Goals */}
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {t("goals.title")}
            </h2>
            <div className="space-y-4">
              {goals
                .filter((goal) => goal && goal.id) // Filtruj tylko elementy z id
                .map((goal, index) => (
                  <div
                    key={goal.id || `goal-${index}`}
                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === "achieved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : goal.status === "inProgress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}
                      >
                        {t(`goals.${goal.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {Math.round((goal.current / goal.target) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.status === "achieved"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (goal.current / goal.target) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>{" "}
          </div>
        </div>
      </div>{" "}
      {/* Weight Entry Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("weightTracking.addEntry")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("weightTracking.date")}
                </label>
                <input
                  type="date"
                  value={newWeightEntry.date}
                  onChange={(e) =>
                    setNewWeightEntry((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("weightTracking.weight")} (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightEntry.weight}
                  onChange={(e) =>
                    setNewWeightEntry((prev) => ({
                      ...prev,
                      weight: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t("weightTracking.cancel")}
              </button>
              <button
                onClick={handleAddWeightEntry}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t("weightTracking.save")}
              </button>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("measurements.addMeasurement")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("weightTracking.date")}
                </label>
                <input
                  type="date"
                  value={newMeasurement.date}
                  onChange={(e) =>
                    setNewMeasurement((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("measurements.chest")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.chest}
                    onChange={(e) =>
                      setNewMeasurement((prev) => ({
                        ...prev,
                        chest: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("measurements.waist")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.waist}
                    onChange={(e) =>
                      setNewMeasurement((prev) => ({
                        ...prev,
                        waist: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("measurements.hips")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.hips}
                    onChange={(e) =>
                      setNewMeasurement((prev) => ({
                        ...prev,
                        hips: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("measurements.arms")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.arms}
                    onChange={(e) =>
                      setNewMeasurement((prev) => ({
                        ...prev,
                        arms: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("measurements.thighs")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.thighs}
                    onChange={(e) =>
                      setNewMeasurement((prev) => ({
                        ...prev,
                        thighs: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t("weightTracking.cancel")}
              </button>
              <button
                onClick={handleAddMeasurement}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {t("weightTracking.save")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Target Weight Modal */}
      {showTargetWeightModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Edytuj docelową wagę
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Docelowa waga (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newTargetWeight}
                  onChange={(e) => setNewTargetWeight(e.target.value)}
                  placeholder={targetWeight.toString()}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTargetWeightModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleUpdateTargetWeight}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
