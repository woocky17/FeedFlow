import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your FeedFlow account">
      <LoginForm />
    </AuthLayout>
  );
}
