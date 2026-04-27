"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isLanguage } from "@/domain/shared";
import { UpdateUserLanguage } from "@/application/user";
import { PrismaUserRepository } from "@/infrastructure/db/prisma/user-repository-impl";
import { LOCALE_COOKIE } from "@/i18n/routing";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const userRepository = new PrismaUserRepository();
const updateUserLanguage = new UpdateUserLanguage(userRepository);

export async function setLocaleCookie(locale: string): Promise<void> {
  if (!isLanguage(locale)) return;

  const session = await auth();
  if (session?.user?.id) {
    await updateUserLanguage.execute({ userId: session.user.id, language: locale });
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
