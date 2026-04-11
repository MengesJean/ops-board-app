import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectMilestonesSection } from "@/components/projects/milestones/project-milestones-section";
import { mockMilestones } from "@/test/mocks/fixtures/milestones";

describe("ProjectMilestonesSection", () => {
  it("renders the roadmap header with the milestone count", () => {
    render(
      <ProjectMilestonesSection
        projectId={101}
        milestones={mockMilestones}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /roadmap/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 milestones on the roadmap/i)).toBeInTheDocument();
  });

  it("renders milestones in position order", () => {
    render(
      <ProjectMilestonesSection
        projectId={101}
        milestones={mockMilestones}
      />,
    );
    const titles = screen
      .getAllByRole("heading", { level: 4 })
      .map((el) => el.textContent);
    expect(titles).toEqual(["Discovery", "Design ready", "Client UAT"]);
  });

  it("shows the empty state when no milestones exist", () => {
    render(<ProjectMilestonesSection projectId={999} milestones={[]} />);
    expect(screen.getByText(/no milestones yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add the first milestone/i }),
    ).toBeInTheDocument();
  });

  it("opens the create sheet when the Add button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ProjectMilestonesSection
        projectId={101}
        milestones={mockMilestones}
      />,
    );
    await user.click(screen.getByRole("button", { name: /add milestone/i }));
    expect(
      await screen.findByRole("form", { name: /create milestone/i }),
    ).toBeInTheDocument();
  });

  it("creates a milestone and adds it to the list", async () => {
    const user = userEvent.setup();
    render(
      <ProjectMilestonesSection
        projectId={101}
        milestones={mockMilestones}
      />,
    );
    await user.click(screen.getByRole("button", { name: /add milestone/i }));
    await user.type(
      await screen.findByLabelText(/^title\s*\*?$/i),
      "Beta launch",
    );
    await user.click(
      screen.getByRole("button", { name: /create milestone/i }),
    );
    await waitFor(() => {
      expect(screen.getByText("Beta launch")).toBeInTheDocument();
    });
    expect(screen.getByText(/4 milestones on the roadmap/i)).toBeInTheDocument();
  });
});
