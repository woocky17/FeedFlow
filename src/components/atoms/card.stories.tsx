import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "dashed", "interactive"] },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add News Source
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          A solid card with rounded corners and slate border.
        </p>
      </>
    ),
  },
};

export const Dashed: Story = {
  args: {
    padding: "lg",
    children: (
      <div className="text-center">
        <p className="text-slate-400">No sources yet</p>
        <p className="mt-1 text-sm text-slate-300">Add your first news source above.</p>
      </div>
    ),
  },
  name: "Dashed (empty state)",
};

export const Interactive: Story = {
  args: {
    padding: "sm",
    variant: "interactive",
    children: (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">El País</p>
          <p className="text-xs text-slate-400">https://feeds.elpais.com/...</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Active</span>
      </div>
    ),
  },
  name: "Interactive (list row)",
};

export const NoPadding: Story = {
  args: {
    padding: "none",
    children: (
      <>
        <div className="aspect-video bg-slate-100" />
        <div className="p-4">
          <h3 className="font-semibold text-slate-900">Article title here</h3>
          <p className="mt-2 text-sm text-slate-400">Useful when the card hosts an image bleed.</p>
        </div>
      </>
    ),
  },
};
