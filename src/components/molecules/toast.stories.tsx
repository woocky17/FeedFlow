import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast } from "./toast";
import { ToastProvider, useToast } from "./toast-provider";
import { Button } from "@/components/atoms";

const meta: Meta<typeof Toast> = {
  title: "Molecules/Toast",
  component: Toast,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: { type: "success", children: "Following \"Ukraine war\"" },
};

export const Error: Story = {
  args: { type: "error", children: "Failed to fetch articles" },
};

export const Info: Story = {
  args: { type: "info", children: "3 new articles synced" },
};

function ProviderDemo() {
  const toast = useToast();
  return (
    <div className="flex gap-2">
      <Button variant="primary-gradient" onClick={() => toast.success("Saved!")}>Fire success</Button>
      <Button variant="danger" onClick={() => toast.error("Failed!")}>Fire error</Button>
      <Button variant="secondary" onClick={() => toast.info("Heads up")}>Fire info</Button>
    </div>
  );
}

export const WithProvider: StoryObj = {
  render: () => (
    <ToastProvider>
      <ProviderDemo />
    </ToastProvider>
  ),
};
