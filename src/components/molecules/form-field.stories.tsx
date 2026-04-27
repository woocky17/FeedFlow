import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormField } from "./form-field";

const meta: Meta<typeof FormField> = {
  title: "Molecules/FormField",
  component: FormField,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
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
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: { label: "Source name", placeholder: "El País" },
};

export const WithValue: Story = {
  args: {
    label: "Base URL",
    type: "url",
    defaultValue: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
  },
};

export const WithError: Story = {
  args: {
    label: "Base URL",
    type: "url",
    defaultValue: "not-a-url",
    error: "Must be a valid URL",
  },
};

export const Disabled: Story = {
  args: {
    label: "API Key",
    defaultValue: "wn_secret_xxx",
    disabled: true,
  },
};

export const Form: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FormField label="Source name" placeholder="El País" />
      <FormField
        label="Base URL"
        type="url"
        placeholder="https://example.com/feed.xml"
      />
      <FormField
        label="API Key"
        placeholder="Required for WorldNewsAPI"
        error="API Key is required"
      />
    </div>
  ),
};
