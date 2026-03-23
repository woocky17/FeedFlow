import { AuthLayout } from "@/components/templates/auth-layout";
import { RegisterForm } from "@/components/organisms/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout title="Get started" subtitle="Create your FeedFlow account">
      <RegisterForm />
    </AuthLayout>
  );
}
