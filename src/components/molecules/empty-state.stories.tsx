import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/atoms";

const meta: Meta<typeof EmptyState> = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Basic: Story = {
  args: {
    title: "No articles yet",
    description: "Sync some sources to see articles here.",
  },
};

export const WithIcon: Story = {
  args: {
    title: "No stories followed yet",
    description: "Head to the Feed and tap the book icon on any article.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: "No sources configured",
    description: "Add a news source to start syncing articles.",
    action: <Button variant="primary-gradient">Add source</Button>,
  },
};
