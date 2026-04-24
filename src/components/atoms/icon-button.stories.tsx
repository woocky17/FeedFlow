import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconButton } from "./icon-button";

const HeartIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BookIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: "Atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "active-amber", "active-red"] },
    size: { control: "select", options: ["sm", "md"] },
  },
  parameters: { backgrounds: { default: "slate" } },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { icon: HeartIcon, label: "Favorite" },
};

export const ActiveAmber: Story = {
  args: { icon: BookIcon, variant: "active-amber", label: "Following" },
};

export const ActiveRed: Story = {
  args: { icon: HeartIcon, variant: "active-red", label: "Favorited" },
};

export const Loading: Story = {
  args: { icon: BookIcon, isLoading: true, label: "Following..." },
};

export const Disabled: Story = {
  args: { icon: HeartIcon, disabled: true, label: "Disabled" },
};

export const Small: Story = {
  args: { icon: HeartIcon, size: "sm", label: "Favorite" },
};
