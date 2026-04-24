import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "ghost", "primary-gradient"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Save changes", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Cancel", variant: "secondary" },
};

export const Danger: Story = {
  args: { children: "Delete", variant: "danger" },
};

export const Ghost: Story = {
  args: { children: "Dismiss", variant: "ghost" },
};

export const PrimaryGradient: Story = {
  args: { children: "Create category", variant: "primary-gradient" },
};

export const Loading: Story = {
  args: { children: "Save", variant: "primary-gradient", isLoading: true },
};

export const Disabled: Story = {
  args: { children: "Save", variant: "primary-gradient", disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">primary</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="danger">danger</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="primary-gradient">primary-gradient</Button>
    </div>
  ),
};
