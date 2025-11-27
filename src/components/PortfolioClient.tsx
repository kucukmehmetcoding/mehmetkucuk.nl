'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, Github, Calendar, User, Code, Monitor, Bot } from 'lucide-react';
import clsx from 'clsx';

interface Project {
  id: string;
  title: { [key: string]: string };
  description: { [key: string]: string };
  image: string;
  category: 'web' | 'software' | 'ai';
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  completionDate: string;
  client: { [key: string]: string };
}

interface PortfolioClientProps {
  projects: Project[];
  locale: string;
}

export default function PortfolioClient({ projects, locale }: PortfolioClientProps) {
  const t = useTranslations('PortfolioPage');
  const [activeFilter, setActiveFilter] = useState<'all' | 'web' | 'software' | 'ai'>('all');

  const categories = ['all', 'web', 'software', 'ai'] as const;

  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium',
              activeFilter === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            {t(`categories.${category}`)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group">
            {/* Project Image */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400">
                {project.category === 'web' && <Monitor className="w-12 h-12" />}
                {project.category === 'software' && <Code className="w-12 h-12" />}
                {project.category === 'ai' && <Bot className="w-12 h-12" />}
              </div>
            </div>

            {/* Project Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.title[locale] || project.title.en}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {project.category === 'web' && t('filterWeb')}
                  {project.category === 'software' && t('filterSoftware')}
                  {project.category === 'ai' && t('filterAI')}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {project.description[locale] || project.description.en}
              </p>

              {/* Technologies */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('techStack')}:</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Meta */}
              <div className="text-sm text-gray-500 mb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t('completionDate')}: {project.completionDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{t('client')}: {project.client[locale] || project.client.en}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('liveDemo')}
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    {t('sourceCode')}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Projects Message */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Bu kategoride henüz proje bulunmuyor.</p>
        </div>
      )}
    </>
  );
}