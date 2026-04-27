import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isLanguage, type Language } from "@/domain/shared";
import { GetArticleWithTranslation } from "@/application/article-translation";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaArticleTranslationRepository } from "@/infrastructure/db/prisma/article-translation-repository-impl";
import { GroqTranslationService } from "@/infrastructure/ai/groq-translator";

const articleRepository = new PrismaArticleRepository();
const translationRepository = new PrismaArticleTranslationRepository();
const translator = process.env.GROQ_API_KEY
  ? new GroqTranslationService(process.env.GROQ_API_KEY)
  : null;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("targetLang");
    const sessionLang = session?.user?.language;
    const targetLang: Language = isLanguage(requested)
      ? requested
      : isLanguage(sessionLang)
        ? sessionLang
        : "es";

    if (!translator) {
      return NextResponse.json(
        { error: "Translation service is not configured" },
        { status: 503 },
      );
    }

    const useCase = new GetArticleWithTranslation(
      articleRepository,
      translationRepository,
      translator,
    );

    const result = await useCase.execute({ articleId: id, targetLang });

    return NextResponse.json({
      id: result.article.id,
      original: result.original,
      displayed: result.displayed,
      displayedLanguage: result.displayedLanguage,
      sourceLanguage: result.article.language,
      isTranslated: result.displayedLanguage !== result.article.language,
      translationFailed: result.translationFailed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to translate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
