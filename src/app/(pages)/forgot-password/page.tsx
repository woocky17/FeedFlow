import { getTranslations } from "next-intl/server";
import { AuthLayout } from "@/components/templates/auth-layout";
import { ForgotPasswordForm } from "@/components/organisms/forgot-password-form";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
