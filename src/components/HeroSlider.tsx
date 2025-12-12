'use client';

import {useState, useEffect, useCallback} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface SliderArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
  author: string;
}

interface HeroSliderProps {
  articles: SliderArticle[];
  lang: string;
  labels: {
    readMore: string;
    by: string;
  };
}

export default function HeroSlider({articles, lang, labels}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || articles.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, articles.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (articles.length === 0) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === 'tr' ? 'tr-TR' : lang === 'nl' ? 'nl-NL' : 'en-US',
      {day: 'numeric', month: 'long', year: 'numeric'}
    );
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Slider */}
      <div className="relative h-[500px] sm:h-[550px] md:h-[600px]">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0 z-10'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full z-0'
                : 'opacity-0 translate-x-full z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-slate-900/80" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 w-full">
                <div className="max-w-3xl">
                  {/* Category Badge */}
                  <Link
                    href={`/${lang}/category/${article.category.toLowerCase()}`}
                    className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 rounded-full mb-4 hover:bg-blue-700 transition-colors"
                  >
                    {article.category}
                  </Link>

                  {/* Title */}
                  <Link href={`/${lang}/post/${article.slug}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight hover:text-blue-400 transition-colors line-clamp-3">
                      {article.title}
                    </h2>
                  </Link>

                  {/* Summary */}
                  <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-6 line-clamp-2 max-w-2xl">
                    {article.summary}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                    <span>{labels.by} {article.author}</span>
                    <span>•</span>
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  </div>

                  {/* Read More Button */}
                  <Link
                    href={`/${lang}/post/${article.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    {labels.readMore}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {articles.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {articles.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip (Desktop) */}
      {articles.length > 1 && (
        <div className="hidden lg:block absolute bottom-0 right-0 z-30 p-6">
          <div className="flex gap-3">
            {articles.slice(0, 5).map((article, index) => (
              <button
                key={article.id}
                onClick={() => goToSlide(index)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {article.imageUrl ? (
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
