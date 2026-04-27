import type { Language } from "@/domain/shared";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    language: Language;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      language: Language;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    language: Language;
  }
}
