import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    hasError: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Source name" },
};

export const Filled: Story = {
  args: { defaultValue: "El País", placeholder: "Source name" },
};

export const WithError: Story = {
  args: {
    defaultValue: "not-a-url",
    hasError: true,
    placeholder: "Base URL",
  },
};

export const Disabled: Story = {
  args: { defaultValue: "Disabled value", disabled: true },
};

export const TypeUrl: Story = {
  args: {
    type: "url",
    placeholder: "https://example.com/feed.xml",
  },
};

export const TypePassword: Story = {
  args: { type: "password", defaultValue: "secret-token" },
};

export const Stack: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Input placeholder="Source name" />
      <Input type="url" placeholder="https://example.com" />
      <Input placeholder="API Key" />
    </div>
  ),
};
