import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NotificationItem } from "./notification-item";

const meta: Meta<typeof NotificationItem> = {
  title: "Molecules/NotificationItem",
  component: NotificationItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NotificationItem>;

const NOW = new Date().toISOString();

export const Unread: Story = {
  args: {
    message: "Your weekly digest is ready",
    createdAt: NOW,
    read: false,
    onMarkRead: () => {},
  },
};

export const Read: Story = {
  args: {
    message: "Your weekly digest is ready",
    createdAt: NOW,
    read: true,
  },
};

export const Stack: Story = {
  render: () => (
    <div className="space-y-2">
      <NotificationItem message="New article in Technology" createdAt={NOW} read={false} onMarkRead={() => {}} />
      <NotificationItem message="Sync completed: 24 new articles" createdAt={NOW} read={false} onMarkRead={() => {}} />
      <NotificationItem message="Welcome to FeedFlow" createdAt={NOW} read />
    </div>
  ),
};
