import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EntityRow } from "./entity-row";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { ToggleSwitch } from "@/components/atoms/toggle-switch";

const meta: Meta<typeof EntityRow> = {
  title: "Molecules/EntityRow",
  component: EntityRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EntityRow>;

export const WithBadgeAndActions: Story = {
  render: () => (
    <EntityRow>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Technology</span>
        <Badge variant="amber" size="sm">custom</Badge>
      </div>
      <div className="flex items-center gap-2">
        <IconButton icon={<Icon name="edit" />} label="Edit" />
        <IconButton icon={<Icon name="trash" />} tone="red" label="Delete" />
      </div>
    </EntityRow>
  ),
};

export const WithToggleAndDelete: Story = {
  render: () => (
    <EntityRow>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
          World News API
          <Badge variant="neutral" size="sm" className="uppercase tracking-wider">
            WorldNews
          </Badge>
        </p>
        <p className="truncate text-xs text-slate-400">https://api.worldnewsapi.com</p>
      </div>
      <div className="ml-4 flex items-center gap-3">
        <ToggleSwitch checked label="Toggle" onChange={() => {}} />
        <IconButton icon={<Icon name="trash" />} tone="red" label="Delete" />
      </div>
    </EntityRow>
  ),
};

export const Stack: Story = {
  render: () => (
    <div className="space-y-2">
      <EntityRow>
        <span className="text-sm font-medium text-slate-700">Default category</span>
        <Badge variant="neutral" size="sm">default</Badge>
      </EntityRow>
      <EntityRow>
        <span className="text-sm font-medium text-slate-700">My category</span>
        <Badge variant="amber" size="sm">custom</Badge>
      </EntityRow>
    </div>
  ),
};
