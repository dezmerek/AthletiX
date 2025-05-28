"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const error = searchParams.get("error");
  const t = useTranslations("auth.error");

  // Jeśli użytkownik jest zalogowany i wystąpił błąd OAuthAccountNotLinked,
  // przekieruj go do ustawień z odpowiednim komunikatem
  useEffect(() => {
    if (session?.user && error === "OAuthAccountNotLinked") {
      router.replace("/dashboard/settings?error=OAuthAccountNotLinked");
    }
  }, [session, error, router]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return t("accountAlreadyConnected");
      case "Signin":
        return t("signinError");
      case "OAuthCallback":
        return t("callbackError");
      case "OAuthCreateAccount":
        return t("createAccountError");
      case "EmailCreateAccount":
        return t("emailCreateAccountError");
      case "Callback":
        return t("callbackError");
      case "OAuthSignin":
        return t("oauthSigninError");
      case "EmailSignin":
        return t("emailSigninError");
      case "CredentialsSignin":
        return t("credentialsSigninError");
      case "SessionRequired":
        return t("sessionRequiredError");
      default:
        return t("unknownError");
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-white dark:bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="space-y-4">
          {error === "OAuthAccountNotLinked" && session?.user && (
            <Link
              href="/dashboard/settings"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              {t("goToSettings")}
            </Link>
          )}
          
          <Link
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            {t("backToLogin")}
          </Link>

          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
