import { useState, useEffect, useCallback } from "react";

interface Client {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  type: "nutrition" | "training" | "both";
  lastActivity?: string;
  progress?: {
    weight?: number;
    targetWeight?: number;
    workoutsCompleted: number;
    nutritionLogged: number;
  };
  nextSession?: string;
  addedAt: string;
  notes?: string;
}

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  addClient: (clientData: {
    clientId: string;
    type: string;
    notes?: string;
  }) => Promise<boolean>;
  removeClient: (clientId: string) => Promise<boolean>;
  updateClient: (
    clientId: string,
    updates: Partial<Client>
  ) => Promise<boolean>;
  refreshClients: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/professional/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch clients");
      }
    } catch (error) {
      setError("Error fetching clients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addClient = useCallback(
    async (clientData: {
      clientId: string;
      type: string;
      notes?: string;
    }): Promise<boolean> => {
      try {
        const response = await fetch("/api/professional/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientData),
        });

        if (response.ok) {
          const data = await response.json();
          setClients((prev) => [data.client, ...prev]);
          return true;
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to add client");
          return false;
        }
      } catch (error) {
        setError("Error adding client");
        return false;
      }
    },
    []
  );

  const removeClient = useCallback(
    async (clientId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/professional/clients/${clientId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setClients((prev) =>
            prev.filter((client) => client._id !== clientId)
          );
          return true;
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to remove client");
          return false;
        }
      } catch (error) {
        setError("Error removing client");
        return false;
      }
    },
    []
  );

  const updateClient = useCallback(
    async (clientId: string, updates: Partial<Client>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/professional/clients/${clientId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const data = await response.json();
          setClients((prev) =>
            prev.map((client) =>
              client._id === clientId ? { ...client, ...data.client } : client
            )
          );
          return true;
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to update client");
          return false;
        }
      } catch (error) {
        setError("Error updating client");
        return false;
      }
    },
    []
  );

  const refreshClients = useCallback(async () => {
    await fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    isLoading,
    error,
    addClient,
    removeClient,
    updateClient,
    refreshClients,
  };
}
