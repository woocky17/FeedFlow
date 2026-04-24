import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeader } from "./section-header";

const meta: Meta<typeof SectionHeader> = {
  title: "Molecules/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Today: Story = { args: { children: "Today" } };
export const Yesterday: Story = { args: { children: "Yesterday" } };
export const Date: Story = { args: { children: "Monday 14 April 2026" } };
