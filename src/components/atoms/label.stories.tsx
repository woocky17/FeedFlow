import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: "Source name" },
};

export const ForInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1 w-80">
      <Label htmlFor="source-name">Source name</Label>
      <input
        id="source-name"
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        placeholder="El País"
      />
    </div>
  ),
};
