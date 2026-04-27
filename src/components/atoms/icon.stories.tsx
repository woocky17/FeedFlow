import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, IconName } from "./icon";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: ["edit", "trash", "heart", "book", "x", "plus", "check", "compare", "external"] satisfies IconName[],
    },
    size: { control: { type: "number", min: 12, max: 48, step: 2 } },
    filled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: { name: "edit", size: 16 },
};

export const Filled: Story = {
  args: { name: "heart", filled: true, className: "text-red-500" },
};

export const Large: Story = {
  args: { name: "trash", size: 32 },
};

export const Colored: Story = {
  args: { name: "book", filled: true, className: "text-amber-500" },
};

const ALL: IconName[] = ["edit", "trash", "heart", "book", "x", "plus", "check", "compare", "external"];

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 p-2 text-slate-700">
      {ALL.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} size={24} />
          <span className="text-xs text-slate-400">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-slate-700">
      <Icon name="edit" size={12} />
      <Icon name="edit" size={16} />
      <Icon name="edit" size={20} />
      <Icon name="edit" size={24} />
      <Icon name="edit" size={32} />
    </div>
  ),
};
