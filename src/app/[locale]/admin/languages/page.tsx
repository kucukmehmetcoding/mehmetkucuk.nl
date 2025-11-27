'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface LanguageData {
  HomePage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    helperText: string;
    exampleText: string;
    servicesButton: string;
    aiAssistant: string;
    chatPlaceholder: string;
    aboutLink: string;
    contactLink: string;
    countryName: string;
  };
  Navigation: {
    home: string;
    services: string;
    portfolio: string;
    contact: string;
    about: string;
    languageSelector: string;
  };
  PortfolioPage: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterWeb: string;
    filterSoftware: string;
    filterAI: string;
    viewProject: string;
    liveDemo: string;
    sourceCode: string;
    techStack: string;
    projectType: string;
    completionDate: string;
    client: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
  };
  Services: {
    webDesign: string;
    software: string;
    aiBots: string;
  };
  ServicesPage: {
    title: string;
    subtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    items: {
      webDesign: {
        title: string;
        description: string;
        features: string;
      };
      software: {
        title: string;
        description: string;
        features: string;
      };
      aiBots: {
        title: string;
        description: string;
        features: string;
      };
    };
  };
  Contact: {
    title: string;
    subtitle: string;
    infoTitle: string;
    formName: string;
    formEmail: string;
    formSubject: string;
    formMessage: string;
    formButton: string;
    formSelectSubject: string;
    formSubjectWeb: string;
    formSubjectSoftware: string;
    formSubjectAI: string;
    formSubjectOther: string;
    formMessagePlaceholder: string;
    emailLabel: string;
    emailAvailable: string;
    locationLabel: string;
  };
  SEO: {
    defaultTitle: string;
    defaultDescription: string;
    homeTitle: string;
    homeDescription: string;
    servicesTitle: string;
    servicesDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    contactTitle: string;
    contactDescription: string;
    portfolioTitle: string;
    portfolioDescription: string;
  };
  Auth: {
    loginTitle: string;
    email: string;
    password: string;
    loginButton: string;
    logoutButton: string;
    error: string;
  };
}

type Languages = Record<'tr' | 'en' | 'nl', LanguageData>;

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Languages | null>(null);
  const [activeTab, setActiveTab] = useState<'tr' | 'en' | 'nl'>('tr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/languages');
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      showToast('Failed to load languages', 'error');
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const saveLanguage = async () => {
    if (!languages) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/languages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: activeTab,
          data: languages[activeTab],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save language');
      }

      showToast(`${activeTab.toUpperCase()} content saved successfully`, 'success');
    } catch (error) {
      showToast('Failed to save language content', 'error');
      console.error('Error saving language:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: keyof LanguageData, field: string, value: string, subsection?: string) => {
    if (!languages) return;

    setLanguages(prev => {
      if (!prev) return prev;
      
      const newLanguages = { ...prev };
      const currentLang = { ...newLanguages[activeTab] };
      
      if (subsection) {
        // Handle nested objects like ServicesPage.items.webDesign.title
        const sectionData = currentLang[section] as Record<string, unknown>;
        if (sectionData[subsection] && typeof sectionData[subsection] === 'object') {
          sectionData[subsection] = {
            ...(sectionData[subsection] as Record<string, unknown>),
            [field]: value
          };
        }
      } else if (typeof currentLang[section] === 'object' && currentLang[section] !== null) {
        // Handle direct object properties like HomePage.title
        (currentLang[section] as Record<string, unknown>)[field] = value;
      }
      
      newLanguages[activeTab] = currentLang;
      return newLanguages;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!languages) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load language data</p>
        <button 
          onClick={fetchLanguages}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentLanguage = languages[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Languages Management</h1>
        <button
          onClick={saveLanguage}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>

      {/* Language Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['tr', 'en', 'nl'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === lang
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {lang.toUpperCase()} - {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Nederlands'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HomePage Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Home Page</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={currentLanguage.HomePage.title}
                onChange={(e) => updateField('HomePage', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <input
                type="text"
                value={currentLanguage.HomePage.subtitle}
                onChange={(e) => updateField('HomePage', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Placeholder</label>
              <input
                type="text"
                value={currentLanguage.HomePage.searchPlaceholder}
                onChange={(e) => updateField('HomePage', 'searchPlaceholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Button</label>
              <input
                type="text"
                value={currentLanguage.HomePage.searchButton}
                onChange={(e) => updateField('HomePage', 'searchButton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Helper Text</label>
              <textarea
                value={currentLanguage.HomePage.helperText}
                onChange={(e) => updateField('HomePage', 'helperText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Example Text</label>
              <input
                type="text"
                value={currentLanguage.HomePage.exampleText}
                onChange={(e) => updateField('HomePage', 'exampleText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services Button</label>
              <input
                type="text"
                value={currentLanguage.HomePage.servicesButton}
                onChange={(e) => updateField('HomePage', 'servicesButton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Assistant</label>
              <input
                type="text"
                value={currentLanguage.HomePage.aiAssistant}
                onChange={(e) => updateField('HomePage', 'aiAssistant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chat Placeholder</label>
              <input
                type="text"
                value={currentLanguage.HomePage.chatPlaceholder}
                onChange={(e) => updateField('HomePage', 'chatPlaceholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Link</label>
              <input
                type="text"
                value={currentLanguage.HomePage.aboutLink}
                onChange={(e) => updateField('HomePage', 'aboutLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Link</label>
              <input
                type="text"
                value={currentLanguage.HomePage.contactLink}
                onChange={(e) => updateField('HomePage', 'contactLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country Name</label>
              <input
                type="text"
                value={currentLanguage.HomePage.countryName}
                onChange={(e) => updateField('HomePage', 'countryName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Navigation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home</label>
              <input
                type="text"
                value={currentLanguage.Navigation.home}
                onChange={(e) => updateField('Navigation', 'home', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services</label>
              <input
                type="text"
                value={currentLanguage.Navigation.services}
                onChange={(e) => updateField('Navigation', 'services', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio</label>
              <input
                type="text"
                value={currentLanguage.Navigation.portfolio}
                onChange={(e) => updateField('Navigation', 'portfolio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
              <input
                type="text"
                value={currentLanguage.Navigation.contact}
                onChange={(e) => updateField('Navigation', 'contact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About</label>
              <input
                type="text"
                value={currentLanguage.Navigation.about}
                onChange={(e) => updateField('Navigation', 'about', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language Selector</label>
              <input
                type="text"
                value={currentLanguage.Navigation.languageSelector}
                onChange={(e) => updateField('Navigation', 'languageSelector', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Services</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Web Design</label>
              <input
                type="text"
                value={currentLanguage.Services.webDesign}
                onChange={(e) => updateField('Services', 'webDesign', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Software</label>
              <input
                type="text"
                value={currentLanguage.Services.software}
                onChange={(e) => updateField('Services', 'software', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Bots</label>
              <input
                type="text"
                value={currentLanguage.Services.aiBots}
                onChange={(e) => updateField('Services', 'aiBots', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Services Page Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Services Page</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title</label>
                <input
                  type="text"
                  value={currentLanguage.ServicesPage.title}
                  onChange={(e) => updateField('ServicesPage', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Subtitle</label>
                <input
                  type="text"
                  value={currentLanguage.ServicesPage.subtitle}
                  onChange={(e) => updateField('ServicesPage', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Title</label>
                <input
                  type="text"
                  value={currentLanguage.ServicesPage.ctaTitle}
                  onChange={(e) => updateField('ServicesPage', 'ctaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Subtitle</label>
                <input
                  type="text"
                  value={currentLanguage.ServicesPage.ctaSubtitle}
                  onChange={(e) => updateField('ServicesPage', 'ctaSubtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Button</label>
                <input
                  type="text"
                  value={currentLanguage.ServicesPage.ctaButton}
                  onChange={(e) => updateField('ServicesPage', 'ctaButton', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Service Items */}
            {Object.entries(currentLanguage.ServicesPage.items).map(([key, service]) => (
              <div key={key} className="border-t pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">{key}</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => updateField('ServicesPage', 'title', e.target.value, key)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateField('ServicesPage', 'description', e.target.value, key)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Features</label>
                    <input
                      type="text"
                      value={service.features}
                      onChange={(e) => updateField('ServicesPage', 'features', e.target.value, key)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Page Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Page</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title</label>
              <input
                type="text"
                value={currentLanguage.PortfolioPage.title}
                onChange={(e) => updateField('PortfolioPage', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Subtitle</label>
              <input
                type="text"
                value={currentLanguage.PortfolioPage.subtitle}
                onChange={(e) => updateField('PortfolioPage', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter All</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.filterAll}
                  onChange={(e) => updateField('PortfolioPage', 'filterAll', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Web</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.filterWeb}
                  onChange={(e) => updateField('PortfolioPage', 'filterWeb', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Software</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.filterSoftware}
                  onChange={(e) => updateField('PortfolioPage', 'filterSoftware', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter AI</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.filterAI}
                  onChange={(e) => updateField('PortfolioPage', 'filterAI', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">View Project</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.viewProject}
                  onChange={(e) => updateField('PortfolioPage', 'viewProject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live Demo</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.liveDemo}
                  onChange={(e) => updateField('PortfolioPage', 'liveDemo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Code</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.sourceCode}
                  onChange={(e) => updateField('PortfolioPage', 'sourceCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.techStack}
                  onChange={(e) => updateField('PortfolioPage', 'techStack', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.projectType}
                  onChange={(e) => updateField('PortfolioPage', 'projectType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Completion Date</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.completionDate}
                  onChange={(e) => updateField('PortfolioPage', 'completionDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
                <input
                  type="text"
                  value={currentLanguage.PortfolioPage.client}
                  onChange={(e) => updateField('PortfolioPage', 'client', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Title</label>
              <input
                type="text"
                value={currentLanguage.PortfolioPage.ctaTitle}
                onChange={(e) => updateField('PortfolioPage', 'ctaTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Subtitle</label>
              <textarea
                value={currentLanguage.PortfolioPage.ctaSubtitle}
                onChange={(e) => updateField('PortfolioPage', 'ctaSubtitle', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Button</label>
              <input
                type="text"
                value={currentLanguage.PortfolioPage.ctaButton}
                onChange={(e) => updateField('PortfolioPage', 'ctaButton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={currentLanguage.Contact.title}
                onChange={(e) => updateField('Contact', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <input
                type="text"
                value={currentLanguage.Contact.subtitle}
                onChange={(e) => updateField('Contact', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Info Title</label>
              <input
                type="text"
                value={currentLanguage.Contact.infoTitle}
                onChange={(e) => updateField('Contact', 'infoTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Name</label>
              <input
                type="text"
                value={currentLanguage.Contact.formName}
                onChange={(e) => updateField('Contact', 'formName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Email</label>
              <input
                type="text"
                value={currentLanguage.Contact.formEmail}
                onChange={(e) => updateField('Contact', 'formEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Subject</label>
              <input
                type="text"
                value={currentLanguage.Contact.formSubject}
                onChange={(e) => updateField('Contact', 'formSubject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Message</label>
              <input
                type="text"
                value={currentLanguage.Contact.formMessage}
                onChange={(e) => updateField('Contact', 'formMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Button</label>
              <input
                type="text"
                value={currentLanguage.Contact.formButton}
                onChange={(e) => updateField('Contact', 'formButton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Select Subject</label>
              <input
                type="text"
                value={currentLanguage.Contact.formSelectSubject}
                onChange={(e) => updateField('Contact', 'formSelectSubject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Subject Web</label>
              <input
                type="text"
                value={currentLanguage.Contact.formSubjectWeb}
                onChange={(e) => updateField('Contact', 'formSubjectWeb', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Subject Software</label>
              <input
                type="text"
                value={currentLanguage.Contact.formSubjectSoftware}
                onChange={(e) => updateField('Contact', 'formSubjectSoftware', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Subject AI</label>
              <input
                type="text"
                value={currentLanguage.Contact.formSubjectAI}
                onChange={(e) => updateField('Contact', 'formSubjectAI', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Subject Other</label>
              <input
                type="text"
                value={currentLanguage.Contact.formSubjectOther}
                onChange={(e) => updateField('Contact', 'formSubjectOther', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Message Placeholder</label>
              <input
                type="text"
                value={currentLanguage.Contact.formMessagePlaceholder}
                onChange={(e) => updateField('Contact', 'formMessagePlaceholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Label</label>
              <input
                type="text"
                value={currentLanguage.Contact.emailLabel}
                onChange={(e) => updateField('Contact', 'emailLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Available</label>
              <input
                type="text"
                value={currentLanguage.Contact.emailAvailable}
                onChange={(e) => updateField('Contact', 'emailAvailable', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Label</label>
              <input
                type="text"
                value={currentLanguage.Contact.locationLabel}
                onChange={(e) => updateField('Contact', 'locationLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Title</label>
              <input
                type="text"
                value={currentLanguage.SEO.homeTitle}
                onChange={(e) => updateField('SEO', 'homeTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Description</label>
              <textarea
                value={currentLanguage.SEO.contactDescription}
                onChange={(e) => updateField('SEO', 'contactDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio Title</label>
              <input
                type="text"
                value={currentLanguage.SEO.portfolioTitle}
                onChange={(e) => updateField('SEO', 'portfolioTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio Description</label>
              <textarea
                value={currentLanguage.SEO.portfolioDescription}
                onChange={(e) => updateField('SEO', 'portfolioDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services Title</label>
              <input
                type="text"
                value={currentLanguage.SEO.servicesTitle}
                onChange={(e) => updateField('SEO', 'servicesTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services Description</label>
              <textarea
                value={currentLanguage.SEO.servicesDescription}
                onChange={(e) => updateField('SEO', 'servicesDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Authentication</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="text"
                value={currentLanguage.Auth.email}
                onChange={(e) => updateField('Auth', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="text"
                value={currentLanguage.Auth.password}
                onChange={(e) => updateField('Auth', 'password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Login Button</label>
              <input
                type="text"
                value={currentLanguage.Auth.loginButton}
                onChange={(e) => updateField('Auth', 'loginButton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logout Button</label>
              <input
                type="text"
                value={currentLanguage.Auth.logoutButton}
                onChange={(e) => updateField('Auth', 'logoutButton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}