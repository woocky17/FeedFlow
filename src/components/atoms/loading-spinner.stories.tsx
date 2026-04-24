import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingSpinner } from "./loading-spinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Atoms/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["amber", "slate", "white"] },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: { size: "md", color: "amber" },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const Slate: Story = {
  args: { color: "slate" },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <LoadingSpinner size="sm" />
      <LoadingSpinner size="md" />
      <LoadingSpinner size="lg" />
    </div>
  ),
};
