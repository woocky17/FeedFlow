import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ToggleSwitch } from "./toggle-switch";

const meta: Meta<typeof ToggleSwitch> = {
  title: "Atoms/ToggleSwitch",
  component: ToggleSwitch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ToggleSwitch>;

export const On: Story = {
  args: { checked: true, onChange: () => {}, label: "Active" },
};

export const Off: Story = {
  args: { checked: false, onChange: () => {}, label: "Inactive" },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, onChange: () => {}, label: "Disabled" },
};

export const Interactive: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div className="flex items-center gap-3">
        <ToggleSwitch checked={on} onChange={setOn} label="Notifications" />
        <span className="text-sm text-slate-600">{on ? "On" : "Off"}</span>
      </div>
    );
  },
};
