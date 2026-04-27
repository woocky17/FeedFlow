import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isLanguage } from "@/domain/shared";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "./routing";

export default getRequestConfig(async () => {
  const session = await auth().catch(() => null);
  const sessionLocale = session?.user?.language;

  let locale = DEFAULT_LOCALE;
  if (isLanguage(sessionLocale)) {
    locale = sessionLocale;
  } else {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;
    if (isLanguage(cookieValue)) locale = cookieValue;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
