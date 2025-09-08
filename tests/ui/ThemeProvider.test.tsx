import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, test, expect } from "vitest";
import ThemeProvider from "@/theme/ThemeProvider";

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: any) => (
    <div data-testid="next-themes">{children}</div>
  ),
}));

describe("ThemeProvider", () => {
  test("renders children", () => {
    render(
      <ThemeProvider attribute="class">
        <div>Child</div>
      </ThemeProvider>
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
    expect(screen.getByTestId("next-themes")).toBeInTheDocument();
  });
});
