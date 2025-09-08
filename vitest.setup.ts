import "@testing-library/jest-dom";

// Silence Next.js server components warnings in tests where irrelevant
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = String(args[0] ?? "");
  if (
    message.includes("Warning: ReactDOM.render is no longer supported") ||
    message.includes("Use createRoot")
  ) {
    return;
  }
  originalError(...(args as unknown as Parameters<typeof originalError>));
};
