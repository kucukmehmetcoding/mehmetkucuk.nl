import Link from 'next/link';
import type {Translation} from '@prisma/client';
import styles from './ArticleCard.module.css';

export function ArticleCard({
  translation,
  slug
}: {
  translation: Translation;
  slug: string;
}) {
  return (
    <article className={styles.card}>
      <header>
        <p className={styles.eyebrow}>
          {new Date(translation.publishedAt ?? Date.now()).toLocaleDateString()}
        </p>
        <h3 className={styles.title}>
          <Link href={`/${translation.lang}/news/${slug}`}>{translation.title}</Link>
        </h3>
      </header>
      <p className={styles.summary}>{translation.summary}</p>
      <footer>
        <span className={styles.meta}>{translation.author}</span>
      </footer>
    </article>
  );
}
