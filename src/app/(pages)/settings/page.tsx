import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { AppLayout } from "@/components/templates/app-layout";
import { LanguageSwitcher } from "@/components/atoms/language-switcher";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const t = await getTranslations("settings");

  return (
    <AppLayout title={t("title")}>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("language.title")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("language.description")}</p>
        <div className="mt-4">
          <LanguageSwitcher />
        </div>
      </section>
    </AppLayout>
  );
}
