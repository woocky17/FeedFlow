import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LanguageSwitcher } from "./language-switcher";

const meta = {
  title: "Atoms/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
