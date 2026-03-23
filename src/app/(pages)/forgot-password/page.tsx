import { AuthLayout } from "@/components/templates/auth-layout";
import { ForgotPasswordForm } from "@/components/organisms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Reset password" subtitle="We'll help you get back in">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
