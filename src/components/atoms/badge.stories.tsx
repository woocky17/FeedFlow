import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "info", "neutral", "positive", "negative", "amber"],
    },
    size: { control: "select", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Default", variant: "default" },
};

export const Positive: Story = {
  args: { children: "Positive", variant: "positive" },
};

export const Negative: Story = {
  args: { children: "Negative", variant: "negative" },
};

export const Neutral: Story = {
  args: { children: "Neutral", variant: "neutral" },
};

export const Amber: Story = {
  args: { children: "3 sources", variant: "amber" },
};

export const Small: Story = {
  args: { children: "12", size: "sm", variant: "error" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">default</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="error">error</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="neutral">neutral</Badge>
      <Badge variant="positive">positive</Badge>
      <Badge variant="negative">negative</Badge>
      <Badge variant="amber">amber</Badge>
    </div>
  ),
};
