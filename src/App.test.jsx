import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import App from "./App";

const pages = [
  ["/", "Home"],
  ["/team", "Team"],
  ["/calender", "Calender"],
  ["/documents", "Documents"],
  ["/projects", "Projects"],
];

const renderPage = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

describe("sidebar routing", () => {
  test.each(pages)("opens %s with the correct active link", (path, title) => {
    renderPage(path);

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    const activeLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0]).toHaveAttribute("href", path);
    expect(activeLinks[0]).toHaveClass("active");
  });

  test("navigates through animated pages and collapses the expanded sidebar", async () => {
    const user = userEvent.setup();
    renderPage();
    const toggle = screen.getByRole("button", { name: "Click" });
    const menu = screen.getByRole("list");
    const collapsedWidth = getComputedStyle(menu).width;
    let previousTitle = "Home";

    for (const [path, title] of [...pages.slice(1), pages[0]]) {
      await user.click(toggle);
      expect(Number.parseFloat(getComputedStyle(menu).width)).toBeGreaterThan(
        Number.parseFloat(collapsedWidth)
      );

      const link = screen.getByRole("link", { name: new RegExp(`^${title}`) });
      await user.click(link);

      expect(menu).toHaveStyle({ width: collapsedWidth });
      expect(link).toHaveAttribute("href", path);
      expect(link).toHaveAttribute("aria-current", "page");
      expect(link).toHaveClass("active");
      expect(
        await screen.findByRole("heading", { name: title }, { timeout: 3000 })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: previousTitle })
      ).not.toBeInTheDocument();
      previousTitle = title;
    }
  }, 15000);
});
