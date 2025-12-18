import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import AppRouter from "../ui/router/AppRouter";

describe("Uygulama Router", () => {
  test("ana sayfada ana ekran render edilir", () => {
    window.history.pushState({}, "", "/");
    render(<AppRouter />);
    expect(screen.getByText("Kahvaltı")).toBeInTheDocument();
  });

  test("/menu/day rotasında gün menüsü render edilir", () => {
    window.history.pushState({}, "", "/menu/day");
    render(<AppRouter />);
    expect(screen.getByText("Kahvaltı Menüsü")).toBeInTheDocument();
    expect(screen.getByText("Yumurta")).toBeInTheDocument();
  });

  test("/recommend rotasında geçici içerik görünür", () => {
    window.history.pushState({}, "", "/recommend");
    render(<AppRouter />);
    expect(screen.getByText("Öneriler (geçici)")).toBeInTheDocument();
  });

  test("ana ekrandaki kart tıklanınca /menu rotasına gider", async () => {
    window.history.pushState({}, "", "/");
    const kullanici = userEvent.setup();
    render(<AppRouter />);
    await kullanici.click(screen.getByText("Kahvaltı"));
    expect(window.location.pathname).toBe("/menu/day");
    expect(screen.getByText("Kahvaltı Menüsü")).toBeInTheDocument();
  });
});

