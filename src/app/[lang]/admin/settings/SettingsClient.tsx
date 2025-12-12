'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { updateSettings, updateSmtpSettings, testSmtpConnection } from '../actions';

type TabType = 'general' | 'seo' | 'smtp' | 'appearance' | 'advanced';
type UploadType = 'logo' | 'favicon' | 'ogImage';

interface SmtpSettings {
  id?: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
}

interface SettingsClientProps {
  initialSettings: Record<string, string>;
  initialSmtpSettings: SmtpSettings;
}

export default function SettingsClient({ initialSettings, initialSmtpSettings }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(initialSmtpSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [uploadingType, setUploadingType] = useState<UploadType | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: UploadType) => {
    setUploadingType(type);
    setUploadError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (type === 'logo' && result.url) {
          handleSettingChange('siteLogo', result.url);
        } else if (type === 'favicon' && result.urls) {
          // Save all favicon URLs as JSON
          handleSettingChange('siteFavicon', JSON.stringify(result.urls));
          handleSettingChange('siteFaviconMain', result.urls['favicon'] || result.urls['icon-32']);
        } else if (type === 'ogImage' && result.url) {
          handleSettingChange('ogImage', result.url);
        }
      } else {
        setUploadError(result.error || 'Yükleme başarısız');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Yükleme sırasında bir hata oluştu');
    } finally {
      setUploadingType(null);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSmtpChange = (key: keyof SmtpSettings, value: string | number | boolean) => {
    setSmtpSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettings('general', settings);

      if (activeTab === 'smtp') {
        await updateSmtpSettings(smtpSettings);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setIsSaving(false);
  };

  const handleSmtpTest = async () => {
    setSmtpTestResult(null);
    const result = await testSmtpConnection();
    setSmtpTestResult({
      success: result.success,
      message: result.message || result.error || 'Bilinmeyen hata',
    });
    setTimeout(() => setSmtpTestResult(null), 5000);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'general', label: 'Genel', icon: '⚙️' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'smtp', label: 'E-posta (SMTP)', icon: '📧' },
    { id: 'appearance', label: 'Görünüm', icon: '🎨' },
    { id: 'advanced', label: 'Gelişmiş', icon: '🔧' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">⚙️ Site Ayarları</h1>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            saveSuccess
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50`}
        >
          {isSaving ? 'Kaydediliyor...' : saveSuccess ? '✓ Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Genel Ayarlar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mehmet Küçük"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.siteUrl || ''}
                  onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://mehmetkucuk.nl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Açıklaması
              </label>
              <textarea
                value={settings.siteDescription || ''}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Freelance yazılım ve web tasarım hizmetleri"
              />
            </div>

            {/* Logo & Favicon Upload Section */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">🖼️ Logo & Favicon</h3>
              
              {uploadError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                  {uploadError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Site Logosu
                  </label>
                  <div className="space-y-3">
                    {settings.siteLogo && (
                      <div className="relative w-full h-16 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={settings.siteLogo}
                          alt="Site Logo"
                          width={160}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingType === 'logo'}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 border-dashed rounded-lg text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50"
                    >
                      {uploadingType === 'logo' ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Yükleniyor...
                        </span>
                      ) : (
                        <>📤 Logo Yükle</>
                      )}
                    </button>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP veya SVG. Max 2MB. Önerilen: 200x60px</p>
                    {settings.siteLogo && (
                      <input
                        type="text"
                        value={settings.siteLogo}
                        readOnly
                        className="w-full px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400"
                      />
                    )}
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Favicon
                  </label>
                  <div className="space-y-3">
                    {settings.siteFaviconMain && (
                      <div className="relative w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={settings.siteFaviconMain}
                          alt="Favicon"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={faviconInputRef}
                      accept="image/png,image/svg+xml,image/x-icon"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingType === 'favicon'}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 border-dashed rounded-lg text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50"
                    >
                      {uploadingType === 'favicon' ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Yükleniyor...
                        </span>
                      ) : (
                        <>📤 Favicon Yükle</>
                      )}
                    </button>
                    <p className="text-xs text-slate-500">PNG veya SVG. Max 500KB. Kare görsel önerilir (512x512px)</p>
                    {settings.siteFaviconMain && (
                      <input
                        type="text"
                        value={settings.siteFaviconMain}
                        readOnly
                        className="w-full px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">Sosyal Medya Linkleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🐦 Twitter/X
                  </label>
                  <input
                    type="url"
                    value={settings.socialTwitter || ''}
                    onChange={(e) => handleSettingChange('socialTwitter', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    💼 LinkedIn
                  </label>
                  <input
                    type="url"
                    value={settings.socialLinkedin || ''}
                    onChange={(e) => handleSettingChange('socialLinkedin', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🐙 GitHub
                  </label>
                  <input
                    type="url"
                    value={settings.socialGithub || ''}
                    onChange={(e) => handleSettingChange('socialGithub', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📸 Instagram
                  </label>
                  <input
                    type="url"
                    value={settings.socialInstagram || ''}
                    onChange={(e) => handleSettingChange('socialInstagram', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📧 E-posta
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@mehmetkucuk.nl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📞 Telefon
                  </label>
                  <input
                    type="tel"
                    value={settings.contactPhone || ''}
                    onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+31 6 12345678"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Settings Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">SEO Ayarları</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meta Açıklama (Description)
              </label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => handleSettingChange('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Site meta açıklaması (160 karakter önerilir)"
              />
              <p className="text-xs text-slate-500 mt-1">
                {(settings.metaDescription || '').length}/160 karakter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meta Anahtar Kelimeler
              </label>
              <input
                type="text"
                value={settings.metaKeywords || ''}
                onChange={(e) => handleSettingChange('metaKeywords', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="yazılım, web tasarım, freelance, react, next.js"
              />
              <p className="text-xs text-slate-500 mt-1">Virgülle ayırarak yazın</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OG Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  OG Image (Sosyal Medya Görseli)
                </label>
                <div className="space-y-3">
                  {settings.ogImage && (
                    <div className="relative w-full h-32 bg-slate-700 rounded-lg overflow-hidden">
                      <Image
                        src={settings.ogImage}
                        alt="OG Image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={ogImageInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ogImage')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => ogImageInputRef.current?.click()}
                    disabled={uploadingType === 'ogImage'}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 border-dashed rounded-lg text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50"
                  >
                    {uploadingType === 'ogImage' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Yükleniyor...
                      </span>
                    ) : (
                      <>📤 OG Image Yükle</>
                    )}
                  </button>
                  <p className="text-xs text-slate-500">PNG, JPG veya WebP. Max 5MB. Önerilen: 1200x630px</p>
                  {settings.ogImage && (
                    <input
                      type="text"
                      value={settings.ogImage}
                      readOnly
                      className="w-full px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => handleSettingChange('googleAnalyticsId', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Google Search Console
                </label>
                <input
                  type="text"
                  value={settings.googleSearchConsole || ''}
                  onChange={(e) => handleSettingChange('googleSearchConsole', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doğrulama meta etiketi içeriği"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Google Tag Manager ID
                </label>
                <input
                  type="text"
                  value={settings.googleTagManager || ''}
                  onChange={(e) => handleSettingChange('googleTagManager', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={settings.googleAdsenseId || ''}
                  onChange={(e) => handleSettingChange('googleAdsenseId', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ca-pub-XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={settings.facebookPixel || ''}
                  onChange={(e) => handleSettingChange('facebookPixel', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXXXXXXXXX"
                />
              </div>
            </div>
          </div>
        )}

        {/* SMTP Settings Tab */}
        {activeTab === 'smtp' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">E-posta (SMTP) Ayarları</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={smtpSettings.isActive}
                  onChange={(e) => handleSmtpChange('isActive', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">SMTP Aktif</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpSettings.host}
                  onChange={(e) => handleSmtpChange('host', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={smtpSettings.port}
                  onChange={(e) => handleSmtpChange('port', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="587"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={smtpSettings.secure}
                  onChange={(e) => handleSmtpChange('secure', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">SSL/TLS Kullan (Port 465 için)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={smtpSettings.username}
                  onChange={(e) => handleSmtpChange('username', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Şifre / App Password
                </label>
                <input
                  type="password"
                  value={smtpSettings.password}
                  onChange={(e) => handleSmtpChange('password', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gönderen E-posta
                </label>
                <input
                  type="email"
                  value={smtpSettings.fromEmail}
                  onChange={(e) => handleSmtpChange('fromEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="noreply@mehmetkucuk.nl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gönderen Adı
                </label>
                <input
                  type="text"
                  value={smtpSettings.fromName}
                  onChange={(e) => handleSmtpChange('fromName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mehmet Küçük"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <button
                onClick={handleSmtpTest}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                🧪 Bağlantıyı Test Et
              </button>
              {smtpTestResult && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    smtpTestResult.success
                      ? 'bg-green-900/50 border border-green-700 text-green-300'
                      : 'bg-red-900/50 border border-red-700 text-red-300'
                  }`}
                >
                  {smtpTestResult.message}
                </div>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-2">💡 Gmail için İpuçları</h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Host: smtp.gmail.com, Port: 587 (TLS) veya 465 (SSL)</li>
                <li>• 2FA aktifse &quot;App Password&quot; oluşturun</li>
                <li>• &quot;Less secure apps&quot; ayarını açmanız gerekebilir</li>
              </ul>
            </div>
          </div>
        )}

        {/* Appearance Settings Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Görünüm Ayarları</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ana Renk
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor || '#3b82f6'}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor || '#3b82f6'}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  İkincil Renk
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor || '#1e40af'}
                    onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor || '#1e40af'}
                    onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font Ailesi
              </label>
              <select
                value={settings.fontFamily || 'Inter'}
                onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
                <option value="Nunito">Nunito</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.darkModeEnabled === 'true'}
                  onChange={(e) => handleSettingChange('darkModeEnabled', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Karanlık Mod Varsayılan</span>
              </label>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">Header & Footer</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Footer Metni
                </label>
                <textarea
                  value={settings.footerText || ''}
                  onChange={(e) => handleSettingChange('footerText', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="© 2024 Mehmet Küçük. Tüm hakları saklıdır."
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">Özel CSS</h3>
              <textarea
                value={settings.customCss || ''}
                onChange={(e) => handleSettingChange('customCss', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/* Özel CSS kurallarınız */"
              />
            </div>
          </div>
        )}

        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Gelişmiş Ayarlar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sayfa Başına Makale
                </label>
                <input
                  type="number"
                  value={settings.articlesPerPage || '10'}
                  onChange={(e) => handleSettingChange('articlesPerPage', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ISR Yenileme Süresi (saniye)
                </label>
                <input
                  type="number"
                  value={settings.isrRevalidate || '3600'}
                  onChange={(e) => handleSettingChange('isrRevalidate', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="60"
                />
                <p className="text-xs text-slate-500 mt-1">Statik sayfaların yenilenme süresi</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">Bakım Modu</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode === 'true'}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-300">Bakım Modu Aktif</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bakım Mesajı
                </label>
                <textarea
                  value={settings.maintenanceMessage || ''}
                  onChange={(e) => handleSettingChange('maintenanceMessage', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sitemiz şu anda bakım modundadır. Lütfen daha sonra tekrar deneyiniz."
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">API Ayarları</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Rate Limit (istek/dakika)
                </label>
                <input
                  type="number"
                  value={settings.apiRateLimit || '60'}
                  onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="10"
                  max="1000"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-semibold text-white mb-4">Özel Head Kodu</h3>
              <textarea
                value={settings.customHeadCode || ''}
                onChange={(e) => handleSettingChange('customHeadCode', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="<!-- Google Tag Manager, vs. -->"
              />
            </div>

            <div>
              <h3 className="text-md font-semibold text-white mb-4">Özel Body Kodu (Footer öncesi)</h3>
              <textarea
                value={settings.customBodyCode || ''}
                onChange={(e) => handleSettingChange('customBodyCode', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="<!-- Analytics scriptleri, vs. -->"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
