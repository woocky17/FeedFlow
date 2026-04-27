import { getTranslations } from "next-intl/server";
import { AuthLayout } from "@/components/templates/auth-layout";
import { RegisterForm } from "@/components/organisms/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")}>
      <RegisterForm />
    </AuthLayout>
  );
}
