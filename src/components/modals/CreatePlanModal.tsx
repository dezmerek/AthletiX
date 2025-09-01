"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Client {
  _id: string;
  name: string;
  email: string;
  image?: string;
  userProfile?: {
    weight?: number;
    targetWeight?: number;
  };
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
}

interface TrainingDay {
  day: number;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
}

export default function CreatePlanModal({
  isOpen,
  onClose,
  onPlanCreated,
}: CreatePlanModalProps) {
  const t = useTranslations("plans.createPlanModal");
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    description: "",
    type: "both" as "training" | "nutrition" | "both",
    startDate: "",
    endDate: "",
    goals: {
      strength: [""],
      endurance: [""],
      flexibility: [""],
      nutrition: [""],
      trainerTargetWeight: "",
    },
    trainingPlan: {
      duration: 4, // 4 tygodnie domyślnie
      frequency: 3, // 3 treningi na tydzień
      trainingDays: [
        {
          day: 1,
          name: "Trening A",
          exercises: [
            { name: "Przysiady", sets: 3, reps: 10, weight: 0, restTime: 90 },
            {
              name: "Wyciskanie na ławce",
              sets: 3,
              reps: 10,
              weight: 0,
              restTime: 90,
            },
            { name: "Martwy ciąg", sets: 3, reps: 8, weight: 0, restTime: 120 },
          ],
          notes: "",
        },
        {
          day: 2,
          name: "Trening B",
          exercises: [
            { name: "Wiosłowanie", sets: 3, reps: 12, weight: 0, restTime: 90 },
            {
              name: "Przysiady bułgarskie",
              sets: 3,
              reps: 10,
              weight: 0,
              restTime: 90,
            },
            { name: "Pompki", sets: 3, reps: 15, weight: 0, restTime: 60 },
          ],
          notes: "",
        },
        {
          day: 3,
          name: "Trening C",
          exercises: [
            { name: "Przysiady", sets: 3, reps: 8, weight: 0, restTime: 90 },
            {
              name: "Wyciskanie żołnierskie",
              sets: 3,
              reps: 10,
              weight: 0,
              restTime: 90,
            },
            { name: "Podciąganie", sets: 3, reps: 8, weight: 0, restTime: 90 },
          ],
          notes: "",
        },
      ],
    },
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchClients(searchQuery);
      } else {
        setClients([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientId: "",
        name: "",
        description: "",
        type: "both",
        startDate: "",
        endDate: "",
        goals: {
          strength: [""],
          endurance: [""],
          flexibility: [""],
          nutrition: [""],
          trainerTargetWeight: "",
        },
        trainingPlan: {
          duration: 4,
          frequency: 3,
          trainingDays: [
            {
              day: 1,
              name: "Trening A",
              exercises: [
                {
                  name: "Przysiady",
                  sets: 3,
                  reps: 10,
                  weight: 0,
                  restTime: 90,
                },
                {
                  name: "Wyciskanie na ławce",
                  sets: 3,
                  reps: 10,
                  weight: 0,
                  restTime: 90,
                },
                {
                  name: "Martwy ciąg",
                  sets: 3,
                  reps: 8,
                  weight: 0,
                  restTime: 120,
                },
              ],
              notes: "",
            },
            {
              day: 2,
              name: "Trening B",
              exercises: [
                {
                  name: "Wiosłowanie",
                  sets: 3,
                  reps: 12,
                  weight: 0,
                  restTime: 90,
                },
                {
                  name: "Przysiady bułgarskie",
                  sets: 3,
                  reps: 10,
                  weight: 0,
                  restTime: 90,
                },
                { name: "Pompki", sets: 3, reps: 15, weight: 0, restTime: 60 },
              ],
              notes: "",
            },
            {
              day: 3,
              name: "Trening C",
              exercises: [
                {
                  name: "Przysiady",
                  sets: 3,
                  reps: 8,
                  weight: 0,
                  restTime: 90,
                },
                {
                  name: "Wyciskanie żołnierskie",
                  sets: 3,
                  reps: 10,
                  weight: 0,
                  restTime: 90,
                },
                {
                  name: "Podciąganie",
                  sets: 3,
                  reps: 8,
                  weight: 0,
                  restTime: 90,
                },
              ],
              notes: "",
            },
          ],
        },
      });
      setSelectedClient(null);
      setSearchQuery("");
      setClients([]);
      setError("");
    }
  }, [isOpen]);

  const searchClients = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setClients(data.users || []);
      }
    } catch (error) {
      console.error("Error searching clients:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setFormData((prev) => ({ ...prev, clientId: client._id }));
    setSelectedClient(client);
    setSearchQuery(client.name);
    setClients([]);
  };

  // Funkcje do zarządzania ćwiczeniami
  const addExercise = (dayIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      trainingPlan: {
        ...prev.trainingPlan,
        trainingDays: prev.trainingPlan.trainingDays.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                exercises: [
                  ...day.exercises,
                  {
                    name: "",
                    sets: 3,
                    reps: 10,
                    weight: 0,
                    restTime: 60,
                    notes: "",
                  },
                ],
              }
            : day
        ),
      },
    }));
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      trainingPlan: {
        ...prev.trainingPlan,
        trainingDays: prev.trainingPlan.trainingDays.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                exercises: day.exercises.filter(
                  (_, exIndex) => exIndex !== exerciseIndex
                ),
              }
            : day
        ),
      },
    }));
  };

  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    field: keyof Exercise,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      trainingPlan: {
        ...prev.trainingPlan,
        trainingDays: prev.trainingPlan.trainingDays.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((exercise, exIndex) =>
                  exIndex === exerciseIndex
                    ? { ...exercise, [field]: value }
                    : exercise
                ),
              }
            : day
        ),
      },
    }));
  };

  const addTrainingDay = () => {
    const newDayNumber = formData.trainingPlan.trainingDays.length + 1;
    setFormData((prev) => ({
      ...prev,
      trainingPlan: {
        ...prev.trainingPlan,
        trainingDays: [
          ...prev.trainingPlan.trainingDays,
          {
            day: newDayNumber,
            name: `Trening ${String.fromCharCode(64 + newDayNumber)}`, // A, B, C, D...
            exercises: [
              {
                name: "",
                sets: 3,
                reps: 10,
                weight: 0,
                restTime: 60,
                notes: "",
              },
            ],
            notes: "",
          },
        ],
      },
    }));
  };

  const removeTrainingDay = (dayIndex: number) => {
    if (formData.trainingPlan.trainingDays.length > 1) {
      setFormData((prev) => ({
        ...prev,
        trainingPlan: {
          ...prev.trainingPlan,
          trainingDays: prev.trainingPlan.trainingDays.filter(
            (_, index) => index !== dayIndex
          ),
        },
      }));
    }
  };

  // Funkcje do zarządzania celami

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.clientId ||
      !formData.name ||
      !formData.type ||
      !formData.startDate
    ) {
      setError(t("validation.requiredFields"));
      return;
    }

    // Walidacja planu treningowego
    if (
      (formData.type === "training" || formData.type === "both") &&
      formData.trainingPlan
    ) {
      const hasEmptyExercises = formData.trainingPlan.trainingDays.some((day) =>
        day.exercises.some((exercise) => !exercise.name.trim())
      );

      if (hasEmptyExercises) {
        setError("Wszystkie ćwiczenia muszą mieć nazwę");
        return;
      }
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/professional/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          goals: {
            ...formData.goals,
            weight: selectedClient?.userProfile?.weight || undefined,
            targetWeight:
              selectedClient?.userProfile?.targetWeight || undefined,
          },
        }),
      });

      if (response.ok) {
        onPlanCreated();
        onClose();
        // Reset form
        setFormData({
          clientId: "",
          name: "",
          description: "",
          type: "both",
          startDate: "",
          endDate: "",
          goals: {
            strength: [""],
            endurance: [""],
            flexibility: [""],
            nutrition: [""],
            trainerTargetWeight: "",
          },
          trainingPlan: {
            duration: 4,
            frequency: 3,
            trainingDays: [
              {
                day: 1,
                name: "Trening A",
                exercises: [
                  {
                    name: "Przysiady",
                    sets: 3,
                    reps: 10,
                    weight: 0,
                    restTime: 90,
                  },
                  {
                    name: "Wyciskanie na ławce",
                    sets: 3,
                    reps: 10,
                    weight: 0,
                    restTime: 90,
                  },
                  {
                    name: "Martwy ciąg",
                    sets: 3,
                    reps: 8,
                    weight: 0,
                    restTime: 120,
                  },
                ],
                notes: "",
              },
              {
                day: 2,
                name: "Trening B",
                exercises: [
                  {
                    name: "Wiosłowanie",
                    sets: 3,
                    reps: 12,
                    weight: 0,
                    restTime: 90,
                  },
                  {
                    name: "Przysiady bułgarskie",
                    sets: 3,
                    reps: 10,
                    weight: 0,
                    restTime: 90,
                  },
                  {
                    name: "Pompki",
                    sets: 3,
                    reps: 15,
                    weight: 0,
                    restTime: 60,
                  },
                ],
                notes: "",
              },
              {
                day: 3,
                name: "Trening C",
                exercises: [
                  {
                    name: "Przysiady",
                    sets: 3,
                    reps: 8,
                    weight: 0,
                    restTime: 90,
                  },
                  {
                    name: "Wyciskanie żołnierskie",
                    sets: 3,
                    reps: 10,
                    weight: 0,
                    restTime: 90,
                  },
                  {
                    name: "Podciąganie",
                    sets: 3,
                    reps: 8,
                    weight: 0,
                    restTime: 90,
                  },
                ],
                notes: "",
              },
            ],
          },
        });
        setSearchQuery("");
        setClients([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("error.createFailed"));
      }
    } catch (error) {
      setError(t("error.createFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = (type: keyof typeof formData.goals) => {
    if (type === "weight" || type === "targetWeight") return;
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [type]: [...prev.goals[type], ""],
      },
    }));
  };

  const removeGoal = (type: keyof typeof formData.goals, index: number) => {
    if (type === "weight" || type === "targetWeight") return;
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [type]: prev.goals[type].filter((_, i) => i !== index),
      },
    }));
  };

  const updateGoal = (
    type: keyof typeof formData.goals,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [type]: prev.goals[type].map((goal, i) => (i === index ? value : goal)),
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("title")}
            </h2>
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Client Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("client")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchClientPlaceholder")}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white pr-10"
                required
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {clients.length > 0 && (
              <div className="mt-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 max-h-48 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client._id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-600 border-b border-slate-100 dark:border-slate-600 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {client.image ? (
                        <img
                          src={client.image}
                          alt={client.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {client.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Client Info */}
            {formData.clientId && selectedClient && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {selectedClient.image ? (
                    <img
                      src={selectedClient.image}
                      alt={selectedClient.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-emerald-300 dark:bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {selectedClient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-emerald-900 dark:text-emerald-100">
                      {selectedClient.name}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {selectedClient.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Client Weight Info */}
          {selectedClient && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("clientInfo")}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("currentWeight")}:
                  </span>
                  <span className="ml-2 font-medium">
                    {selectedClient.userProfile?.weight
                      ? `${selectedClient.userProfile.weight} kg`
                      : t("notSet")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("targetWeight")}:
                  </span>
                  <span className="ml-2 font-medium">
                    {selectedClient.userProfile?.targetWeight
                      ? `${selectedClient.userProfile.targetWeight} kg`
                      : t("notSet")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("planName")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("planNamePlaceholder")}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          {/* Plan Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("planType")}
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              required
            >
              <option value="training">{t("types.training")}</option>
              <option value="nutrition">{t("types.nutrition")}</option>
              <option value="both">{t("types.both")}</option>
            </select>
          </div>

          {/* Trainer's Target Weight Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("trainerTargetWeight")} ({t("optional")})
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.goals.trainerTargetWeight || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  goals: {
                    ...prev.goals,
                    trainerTargetWeight: e.target.value,
                  },
                }))
              }
              placeholder={t("trainerTargetWeightPlaceholder")}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("trainerTargetWeightDescription")}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("startDate")}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("endDate")}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Training Plan Section */}
          {(formData.type === "training" || formData.type === "both") && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                  🏋️‍♂️ Plan treningowy
                </h4>
                <button
                  type="button"
                  onClick={addTrainingDay}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  + Dodaj dzień treningowy
                </button>
              </div>

              {/* Training Plan Settings */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Czas trwania (tygodnie)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.trainingPlan.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trainingPlan: {
                          ...prev.trainingPlan,
                          duration: parseInt(e.target.value) || 4,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Treningi na tydzień
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.trainingPlan.frequency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trainingPlan: {
                          ...prev.trainingPlan,
                          frequency: parseInt(e.target.value) || 3,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Training Days */}
              <div className="space-y-4">
                {formData.trainingPlan.trainingDays.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={day.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              trainingPlan: {
                                ...prev.trainingPlan,
                                trainingDays:
                                  prev.trainingPlan.trainingDays.map(
                                    (d, index) =>
                                      index === dayIndex
                                        ? { ...d, name: e.target.value }
                                        : d
                                  ),
                              },
                            }))
                          }
                          className="text-lg font-medium text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:outline-none px-2 py-1"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Dzień {day.day}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => addExercise(dayIndex)}
                          className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          + Ćwiczenie
                        </button>
                        {formData.trainingPlan.trainingDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTrainingDay(dayIndex)}
                            className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            Usuń dzień
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Exercises */}
                    <div className="space-y-3">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={exerciseIndex}
                          className="grid grid-cols-6 gap-2 items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) =>
                                updateExercise(
                                  dayIndex,
                                  exerciseIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Nazwa ćwiczenia"
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) =>
                                updateExercise(
                                  dayIndex,
                                  exerciseIndex,
                                  "sets",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              placeholder="Seria"
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) =>
                                updateExercise(
                                  dayIndex,
                                  exerciseIndex,
                                  "reps",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              placeholder="Powtórzenia"
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exercise.weight}
                              onChange={(e) =>
                                updateExercise(
                                  dayIndex,
                                  exerciseIndex,
                                  "weight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="Waga (kg)"
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={exercise.restTime}
                              onChange={(e) =>
                                updateExercise(
                                  dayIndex,
                                  exerciseIndex,
                                  "restTime",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Odpoczynek (s)"
                              className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeExercise(dayIndex, exerciseIndex)
                              }
                              className="px-2 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Day Notes */}
                    <div className="mt-3">
                      <textarea
                        value={day.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            trainingPlan: {
                              ...prev.trainingPlan,
                              trainingDays: prev.trainingPlan.trainingDays.map(
                                (d, index) =>
                                  index === dayIndex
                                    ? { ...d, notes: e.target.value }
                                    : d
                              ),
                            },
                          }))
                        }
                        placeholder="Notatki do tego dnia treningowego..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Goals */}
          {["strength", "endurance", "flexibility", "nutrition"].map(
            (goalType) => (
              <div key={goalType}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(`${goalType}Goals`)}
                  </label>
                  <button
                    type="button"
                    onClick={() => addGoal(goalType as any)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    {t("addGoal")}
                  </button>
                </div>
                {formData.goals[goalType as keyof typeof formData.goals].map(
                  (goal, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) =>
                          updateGoal(goalType as any, index, e.target.value)
                        }
                        placeholder={t(`${goalType}GoalPlaceholder`)}
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeGoal(goalType as any, index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? t("creating") : t("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
