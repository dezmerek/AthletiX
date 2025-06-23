"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, signIn } from "next-auth/react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(session?.user?.name || "");
  const [isUpdating, startTransition] = useTransition();
  const [updateStatus, setUpdateStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Google account state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoadingGoogleStatus, setIsLoadingGoogleStatus] = useState(true);
  const [googleStatus, setGoogleStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Aktualizuj lokalny state gdy zmieni się sesja
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  // Check if user has a password on component mount
  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const response = await fetch("/api/user/password-status");
        const data = await response.json();

        if (response.ok) {
          setHasPassword(data.hasPassword);
        }
      } catch (error) {
        console.error("Error checking password status:", error);
      }
    };

    const checkGoogleStatus = async () => {
      try {
        console.log("Checking Google status...");
        const response = await fetch("/api/user/google-status");
        const data = await response.json();

        console.log("Google status response:", response.status, data);

        if (response.ok) {
          console.log("Setting Google connected to:", data.isConnected);
          setIsGoogleConnected(data.isConnected);
        } else {
          console.error("Error response from Google status:", data);
        }
      } catch (error) {
        console.error("Error checking Google status:", error);
      } finally {
        setIsLoadingGoogleStatus(false);
      }
    };

    if (session?.user) {
      checkPasswordStatus();
      checkGoogleStatus();
    }
  }, [session?.user]);

  // Check for authentication errors in URL parameters
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "OAuthAccountNotLinked") {
      setGoogleStatus({
        type: "error",
        message: t("connectedAccounts.accountAlreadyConnected"),
      });
      // Clear the error from URL after a short delay to allow the message to be shown
      const timer = setTimeout(() => {
        router.replace("/dashboard/settings", { scroll: false });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router, t]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus({ type: null, message: "" });

    if (!name.trim()) {
      setUpdateStatus({
        type: "error",
        message: t("profile.errors.nameRequired"),
      });
      return;
    }

    if (name.trim() === session?.user?.name) {
      setUpdateStatus({
        type: "error",
        message: t("profile.errors.nameUnchanged"),
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/user/update-name", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update name");
        }

        console.log("Name updated successfully, new name:", data.name);

        // Aktualizacja sesji z nową nazwą - przekazujemy nową nazwę bezpośrednio
        const updateResult = await update({
          user: {
            name: data.name,
          },
        });

        console.log("Session update result:", updateResult);

        // Wymuszenie odświeżenia routera, żeby navbar się zaktualizował
        router.refresh();

        setUpdateStatus({
          type: "success",
          message: t("profile.success.nameUpdated"),
        });
      } catch (error) {
        console.error("Error updating name:", error);
        setUpdateStatus({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : t("profile.errors.updateFailed"),
        });
      }
    });
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus({ type: null, message: "" });

    // Walidacja
    if (!newEmail.trim()) {
      setEmailStatus({
        type: "error",
        message: t("email.errors.emailRequired"),
      });
      return;
    }

    // Walidacja formatu emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailStatus({
        type: "error",
        message: t("email.errors.emailInvalid"),
      });
      return;
    }

    if (newEmail.trim().toLowerCase() === session?.user?.email?.toLowerCase()) {
      setEmailStatus({
        type: "error",
        message: t("email.errors.emailUnchanged"),
      });
      return;
    }

    if (newEmail !== confirmEmail) {
      setEmailStatus({
        type: "error",
        message: t("email.errors.emailsNotMatch"),
      });
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const response = await fetch("/api/user/update-email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        let errorMessage = t("email.errors.updateFailed");

        if (data.code === "PASSWORD_REQUIRED_FOR_GOOGLE_ACCOUNT") {
          errorMessage = t("email.passwordRequiredDescription");
        } else if (data.error?.includes("already used")) {
          errorMessage = t("email.errors.emailTaken");
        } else if (data.error?.includes("same as current")) {
          errorMessage = t("email.errors.emailUnchanged");
        } else if (data.error?.includes("valid email")) {
          errorMessage = t("email.errors.emailInvalid");
        } else if (data.error) {
          errorMessage = data.error;
        }

        throw new Error(errorMessage);
      }

      console.log("Email updated successfully, new email:", data.email);

      // Aktualizacja sesji z nowym emailem
      const updateResult = await update({
        user: {
          email: data.email,
        },
      });

      console.log("Session update result:", updateResult);

      // Wymuszenie odświeżenia routera
      router.refresh();

      // Wyczyść pola formularza
      setNewEmail("");
      setConfirmEmail("");

      setEmailStatus({
        type: "success",
        message: t("email.success.updated"),
      });
    } catch (error) {
      console.error("Error updating email:", error);
      setEmailStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t("email.errors.updateFailed"),
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setUpdateStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Wyloguj użytkownika i przekieruj na stronę główną natychmiast
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error deleting account:", error);
      setUpdateStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : t("deleteAccount.error"),
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    // Validation for setting new password
    if (!hasPassword) {
      if (!newPassword.trim()) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.newPasswordRequired"),
        });
        return;
      }

      if (newPassword.length < 6) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.passwordTooShort"),
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.passwordsNotMatch"),
        });
        return;
      }
    } else {
      // Validation for changing existing password
      if (!currentPassword.trim()) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.currentPasswordRequired"),
        });
        return;
      }

      if (!newPassword.trim()) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.newPasswordRequired"),
        });
        return;
      }

      if (newPassword.length < 6) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.passwordTooShort"),
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordStatus({
          type: "error",
          message: t("password.errors.passwordsNotMatch"),
        });
        return;
      }
    }

    setIsUpdatingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = t("password.errors.updateFailed");

        // Handle specific error codes
        if (data.code === "CURRENT_PASSWORD_REQUIRED") {
          errorMessage = t("password.errors.currentPasswordRequired");
        } else if (data.code === "CURRENT_PASSWORD_INCORRECT") {
          errorMessage = t("password.errors.currentPasswordIncorrect");
        } else if (data.code === "PASSWORD_TOO_SHORT") {
          errorMessage = t("password.errors.passwordTooShort");
        } else if (data.error) {
          errorMessage = data.error;
        }

        throw new Error(errorMessage);
      }

      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasPassword(true); // User now has a password

      setPasswordStatus({
        type: "success",
        message: hasPassword
          ? t("password.success.changed")
          : t("password.success.set"),
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t("password.errors.updateFailed"),
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConnectGoogle = async () => {
    setGoogleStatus({ type: null, message: "" });

    try {
      await signIn("google", {
        callbackUrl: "/dashboard/settings",
        redirect: true,
      });
    } catch (error) {
      console.error("Error connecting Google:", error);
      setGoogleStatus({
        type: "error",
        message: t("connectedAccounts.disconnectError"),
      });
    }
  };

  const handleDisconnectGoogle = async () => {
    setGoogleStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/user/disconnect-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: "google" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "PASSWORD_REQUIRED") {
          setGoogleStatus({
            type: "error",
            message: t("connectedAccounts.passwordRequiredError"),
          });
          return;
        }
        throw new Error(data.error || "Failed to disconnect Google account");
      }

      setIsGoogleConnected(false);
      setGoogleStatus({
        type: "success",
        message: t("connectedAccounts.disconnected"),
      });
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      setGoogleStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t("connectedAccounts.disconnectError"),
      });
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            {t("description")}
          </p>{" "}
        </div>{" "}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 ${
            hasPassword ? "xl:grid-cols-3" : "xl:grid-cols-2"
          } gap-8`}
        >
          {/* Profile settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-emerald-500"
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
              <h2 className="ml-4 text-xl font-semibold text-slate-900 dark:text-white">
                {t("profile.title")}
              </h2>
            </div>

            <form
              onSubmit={handleNameUpdate}
              className="space-y-6 flex-1 flex flex-col"
            >
              {updateStatus.type && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    updateStatus.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {updateStatus.message}
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("profile.displayName")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={session?.user?.name || ""}
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white transition-colors duration-200"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("profile.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                />
              </div>
              <div className="mt-auto">
                <button
                  type="submit"
                  disabled={
                    isUpdating ||
                    !name.trim() ||
                    name.trim() === session?.user?.name
                  }
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isUpdating
                    ? t("profile.updating")
                    : t("profile.updateButton")}
                </button>
              </div>
            </form>
          </div>{" "}
          {/* Email settings */}
          {hasPassword && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.05a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white ml-4">
                    {t("email.title")}
                  </h2>
                  <p className="ml-4 text-sm text-slate-600 dark:text-slate-400">
                    {t("email.description")}
                  </p>
                </div>
              </div>{" "}
              <form
                onSubmit={handleEmailUpdate}
                className="flex-1 flex flex-col"
              >
                {emailStatus.type && (
                  <div
                    className={`mb-4 p-4 rounded-xl text-sm font-medium ${
                      emailStatus.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {emailStatus.message}
                  </div>
                )}
                {!hasPassword ? (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center p-8 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-amber-600 dark:text-amber-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        {t("email.passwordRequiredTitle")}
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 mb-4">
                        {t("email.passwordRequiredDescription")}
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {t("email.passwordRequiredAction")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="currentEmailDisplay"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          {t("email.currentEmail")}
                        </label>
                        <input
                          type="email"
                          id="currentEmailDisplay"
                          value={session?.user?.email || ""}
                          disabled
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="newEmail"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          {t("email.newEmail")}
                        </label>
                        <input
                          type="email"
                          id="newEmail"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="confirmEmail"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          {t("email.confirmEmail")}
                        </label>
                        <input
                          type="email"
                          id="confirmEmail"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                    <div className="mt-auto pt-8">
                      <button
                        type="submit"
                        disabled={
                          isUpdatingEmail ||
                          !newEmail.trim() ||
                          !confirmEmail.trim()
                        }
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isUpdatingEmail
                          ? t("email.updating")
                          : t("email.updateButton")}
                      </button>
                    </div>
                  </>
                )}{" "}
              </form>
            </div>
          )}
          {/* Password */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white ml-4">
                  {hasPassword
                    ? t("password.changeTitle")
                    : t("password.setTitle")}
                </h2>
                <p className="ml-4 text-sm text-slate-600 dark:text-slate-400">
                  {hasPassword
                    ? t("password.changeDescription")
                    : t("password.setDescription")}
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePasswordUpdate}
              className="flex-1 flex flex-col"
            >
              {passwordStatus.type && (
                <div
                  className={`mb-4 p-4 rounded-xl text-sm font-medium ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}
              <div className="space-y-4">
                {hasPassword && (
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t("password.currentPassword")}
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-200"
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    {t("password.newPassword")}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    {t("password.confirmPassword")}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="mt-auto pt-8">
                <button
                  type="submit"
                  disabled={
                    isUpdatingPassword ||
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    (hasPassword && !currentPassword.trim())
                  }
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isUpdatingPassword
                    ? t("password.updating")
                    : hasPassword
                    ? t("password.changeButton")
                    : t("password.setButton")}
                </button>
              </div>
            </form>
          </div>
          {/* Connected accounts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-semibold text-slate-900 dark:text-white">
                {t("connectedAccounts.title")}
              </h2>
            </div>

            <div className="space-y-4">
              {googleStatus.type && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    googleStatus.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {googleStatus.message}
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                <div className="flex items-center space-x-3">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <div>
                    <div className="text-slate-900 dark:text-white font-medium">
                      Google
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {isLoadingGoogleStatus
                        ? "Loading..."
                        : isGoogleConnected
                        ? t("connectedAccounts.connected")
                        : t("connectedAccounts.notConnected")}
                    </div>
                  </div>
                </div>
                {!isLoadingGoogleStatus && (
                  <>
                    {isGoogleConnected ? (
                      <button
                        onClick={handleDisconnectGoogle}
                        className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        {t("connectedAccounts.disconnect")}
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectGoogle}
                        className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {t("connectedAccounts.connect")}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Delete account */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-red-500"
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
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white ml-4">
                  {t("deleteAccount.title")}
                </h2>
                <p className="ml-4 text-sm text-slate-600 dark:text-slate-400">
                  {t("deleteAccount.description")}
                </p>
              </div>
            </div>

            <div className="mt-auto">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 cursor-pointer"
                >
                  {t("deleteAccount.button")}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                      {t("deleteAccount.confirmTitle")}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {t("deleteAccount.confirmMessage")}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting
                        ? t("deleteAccount.deleting")
                        : t("deleteAccount.confirmButton")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="flex-1 flex justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("deleteAccount.cancelButton")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
