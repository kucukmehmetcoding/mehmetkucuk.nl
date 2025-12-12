import {Language, Prisma} from '@prisma/client';
import {prisma} from './prisma';

export type ArticleWithTranslation = Prisma.ArticleGetPayload<{
  include: {translations: true; source: true};
}>;

export async function getPublishedArticles(lang: Language, limit = 20) {
  return prisma.article.findMany({
    where: {published: true},
    orderBy: {publishedAt: 'desc'},
    take: limit,
    include: {
      translations: {
        where: {lang},
        take: 1
      }
    }
  });
}

export async function getArticleBySlug(slug: string, lang: Language) {
  return prisma.article.findUnique({
    where: {slug},
    include: {
      translations: {
        where: {lang},
        take: 1
      },
      source: true
    }
  });
}

export async function searchArticles(query: string, lang: Language, take = 20, skip = 0) {
  return prisma.translation.findMany({
    where: {
      lang,
      OR: [
        {title: {contains: query, mode: 'insensitive'}},
        {summary: {contains: query, mode: 'insensitive'}},
        {body: {contains: query, mode: 'insensitive'}}
      ],
      article: {published: true}
    },
    orderBy: {publishedAt: 'desc'},
    take,
    skip,
    include: {article: true}
  });
}

export async function enqueueApproval(translationId: string) {
  return prisma.approvalQueue.upsert({
    where: {translationId},
    update: {},
    create: {translationId}
  });
}
