import { getTranslations } from "next-intl/server";
import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")}>
      <LoginForm />
    </AuthLayout>
  );
}
