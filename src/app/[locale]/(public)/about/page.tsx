import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Code, Palette, Database, Terminal, Cpu, Globe, Zap, Layout } from 'lucide-react';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'SEO'});

  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    alternates: {
      canonical: `/${locale}/about`,
    }
  };
}

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  const skills = [
    { name: 'Next.js', icon: <Globe className="w-6 h-6" /> },
    { name: 'React', icon: <Code className="w-6 h-6" /> },
    { name: 'TypeScript', icon: <Terminal className="w-6 h-6" /> },
    { name: 'Tailwind CSS', icon: <Palette className="w-6 h-6" /> },
    { name: 'Node.js', icon: <Cpu className="w-6 h-6" /> },
    { name: 'Database', icon: <Database className="w-6 h-6" /> },
    { name: 'UI/UX Design', icon: <Layout className="w-6 h-6" /> },
    { name: 'AI Integration', icon: <Zap className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Bio & Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-gray-50 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('bioTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('bioDescription')}
            </p>
          </div>
          <div className="bg-blue-50 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('philosophyTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('philosophyDescription')}
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            {t('skillsTitle')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {skills.map((skill, index) => (
              <div 
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-blue-600 mb-3">
                  {skill.icon}
                </div>
                <span className="font-medium text-gray-700">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
