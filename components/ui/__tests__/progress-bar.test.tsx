import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "@/components/ui/progress-bar";

describe("ProgressBar", () => {
  it("renders with role progressbar and current value", () => {
    render(<ProgressBar value={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps a value above max", () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("clamps a negative value", () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("uses a custom label when provided", () => {
    render(<ProgressBar value={50} label="Half done" />);
    expect(screen.getByLabelText("Half done")).toBeInTheDocument();
  });
});
