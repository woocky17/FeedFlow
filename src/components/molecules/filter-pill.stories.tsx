import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterPill } from "./filter-pill";

const HeartIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const meta: Meta<typeof FilterPill> = {
  title: "Molecules/FilterPill",
  component: FilterPill,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["amber", "red"] },
  },
};

export default meta;
type Story = StoryObj<typeof FilterPill>;

export const Inactive: Story = {
  args: { children: "All", active: false },
};

export const Active: Story = {
  args: { children: "Technology", active: true },
};

export const FavoritesActive: Story = {
  args: { children: "Favorites", active: true, color: "red", icon: HeartIcon },
};

export const Group: Story = {
  render: () => (
    <div className="flex gap-2">
      <FilterPill active>All</FilterPill>
      <FilterPill color="red" icon={HeartIcon}>Favorites</FilterPill>
      <FilterPill>Technology</FilterPill>
      <FilterPill>Sports</FilterPill>
      <FilterPill>Business</FilterPill>
    </div>
  ),
};
