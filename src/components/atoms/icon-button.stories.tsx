import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconButton } from "./icon-button";
import { Icon } from "./icon";

const meta: Meta<typeof IconButton> = {
  title: "Atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    appearance: { control: "select", options: ["overlay", "subtle"] },
    tone: { control: "select", options: ["neutral", "amber", "red"] },
    size: { control: "select", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const SubtleEdit: Story = {
  args: {
    icon: <Icon name="edit" />,
    appearance: "subtle",
    tone: "neutral",
    label: "Edit",
  },
};

export const SubtleDelete: Story = {
  args: {
    icon: <Icon name="trash" />,
    appearance: "subtle",
    tone: "red",
    label: "Delete",
  },
};

export const OverlayHeart: Story = {
  args: {
    icon: <Icon name="heart" filled />,
    appearance: "overlay",
    tone: "red",
    label: "Favorite",
  },
};

export const OverlayBook: Story = {
  args: {
    icon: <Icon name="book" />,
    appearance: "overlay",
    tone: "amber",
    label: "Follow story",
  },
};

export const Loading: Story = {
  args: {
    icon: <Icon name="book" />,
    isLoading: true,
    appearance: "overlay",
    label: "Following...",
  },
};

export const RowActions: Story = {
  render: () => (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
      <span className="flex-1 text-sm text-slate-700">Technology</span>
      <IconButton icon={<Icon name="edit" />} appearance="subtle" tone="neutral" label="Edit" />
      <IconButton icon={<Icon name="trash" />} appearance="subtle" tone="red" label="Delete" />
    </div>
  ),
};
