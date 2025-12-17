import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import AppRouter from "../ui/router/AppRouter";

describe("Uygulama Router", () => {
  test("ana sayfada ana ekran render edilir", () => {
    window.history.pushState({}, "", "/");
    render(<AppRouter />);
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
  });

  test("/menu/day rotasında gün menüsü render edilir", () => {
    window.history.pushState({}, "", "/menu/day");
    render(<AppRouter />);
    expect(screen.getByText("Breakfast Menu")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  test("/recommend rotasında geçici içerik görünür", () => {
    window.history.pushState({}, "", "/recommend");
    render(<AppRouter />);
    expect(screen.getByText("Recommend (mock)")).toBeInTheDocument();
  });
});

