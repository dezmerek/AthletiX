import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect } from "vitest";
import ThemeToggle from "@/theme/ThemeToggle";

const setThemeMock = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: setThemeMock }),
}));

describe("ThemeToggle", () => {
  test("renders button with aria-label and toggles theme on click", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: /toggle theme/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });
});
