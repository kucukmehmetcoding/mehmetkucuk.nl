'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getRssFeeds,
  createRssFeed,
  updateRssFeed,
  deleteRssFeed,
  toggleRssFeedStatus,
  getBotSettings,
  updateBotSettings,
  getBotRunLogs,
  getBotStats,
  initializeDefaultRssFeeds,
  getCategories,
} from '../actions';

type FeedPriority = 'high' | 'medium' | 'low';
type FeedStatus = 'active' | 'paused' | 'error';

interface CategoryTranslation {
  lang: string;
  name: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface RssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  priority: FeedPriority;
  status: FeedStatus;
  lastFetchedAt: Date | null;
  totalFetched: number;
  totalPublished: number;
  errorCount: number;
  lastError: string | null;
  language: string;
  maxItemsPerFetch: number;
  _count?: { fetchedItems: number };
}

interface BotSettings {
  id: string;
  isEnabled: boolean;
  highPriorityInterval: number;
  mediumPriorityInterval: number;
  lowPriorityInterval: number;
  dailyArticleTarget: number;
  maxArticlesPerHour: number;
  minQaScore: number;
  autoPublish: boolean;
  simHashThreshold: number;
  crossSourceDedup: boolean;
  enablePaywallFilter: boolean;
}

interface BotRunLog {
  id: string;
  priority: FeedPriority;
  startedAt: Date;
  completedAt: Date | null;
  feedsChecked: number;
  itemsFetched: number;
  itemsProcessed: number;
  itemsPublished: number;
  itemsSkipped: number;
  errors: string[];
}

const priorityLabels: Record<FeedPriority, { label: string; color: string }> = {
  high: { label: '🔴 Yüksek', color: 'bg-red-500/20 text-red-300' },
  medium: { label: '🟡 Orta', color: 'bg-yellow-500/20 text-yellow-300' },
  low: { label: '🟢 Düşük', color: 'bg-green-500/20 text-green-300' },
};

const statusLabels: Record<FeedStatus, { label: string; color: string }> = {
  active: { label: '✅ Aktif', color: 'bg-green-500/20 text-green-300' },
  paused: { label: '⏸️ Duraklatılmış', color: 'bg-yellow-500/20 text-yellow-300' },
  error: { label: '❌ Hata', color: 'bg-red-500/20 text-red-300' },
};

// Category icons mapping
const categoryIcons: Record<string, string> = {
  technology: '💻',
  ai: '🤖',
  crypto: '₿',
  programming: '👨‍💻',
  security: '🔒',
  science: '🔬',
  gaming: '🎮',
  gadgets: '📱',
  business: '💼',
  space: '🚀',
  mobile: '📱',
  software: '💾',
};

export default function AutomationPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'tr';
  
  const [activeTab, setActiveTab] = useState<'feeds' | 'settings' | 'logs'>('feeds');
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [logs, setLogs] = useState<BotRunLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Dynamic categories from database
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  // Feed form state
  const [feedForm, setFeedForm] = useState({
    name: '',
    url: '',
    category: 'technology',
    priority: 'medium' as FeedPriority,
    language: 'en',
    maxItemsPerFetch: 10,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [feedsResult, settingsResult, logsResult, statsResult, categoriesResult] = await Promise.all([
        getRssFeeds(),
        getBotSettings(),
        getBotRunLogs(),
        getBotStats(),
        getCategories(),
      ]);
      
      setFeeds((feedsResult.feeds || []) as RssFeed[]);
      setSettings(settingsResult.settings as BotSettings | null);
      setLogs((logsResult.logs || []) as BotRunLog[]);
      setStats(statsResult.stats);
      
      // Convert categories to options with current language
      if (categoriesResult.success && categoriesResult.categories) {
        const options = categoriesResult.categories.map((cat: { slug: string; translations: CategoryTranslation[] }) => {
          const translation = cat.translations.find((t: CategoryTranslation) => t.lang === lang);
          const name = translation?.name || cat.slug;
          const icon = categoryIcons[cat.slug] || '📁';
          return {
            value: cat.slug,
            label: `${icon} ${name}`,
          };
        });
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleInitializeFeeds = async () => {
    if (!confirm('Varsayılan RSS kaynaklarını eklemek istediğinize emin misiniz?')) return;
    
    const result = await initializeDefaultRssFeeds();
    if (result.success) {
      alert(`✅ ${result.created} kaynak eklendi, ${result.skipped} kaynak zaten mevcut.`);
      await loadData();
    } else {
      alert('❌ Hata: ' + result.error);
    }
  };

  const handleFeedSubmit = async () => {
    setIsSaving(true);
    try {
      if (editingFeed) {
        await updateRssFeed(editingFeed.id, feedForm);
      } else {
        await createRssFeed(feedForm);
      }
      setShowFeedModal(false);
      setEditingFeed(null);
      resetFeedForm();
      await loadData();
    } catch (error) {
      console.error('Error saving feed:', error);
    }
    setIsSaving(false);
  };

  const handleDeleteFeed = async (id: string) => {
    if (!confirm('Bu RSS kaynağını silmek istediğinize emin misiniz?')) return;
    await deleteRssFeed(id);
    await loadData();
  };

  const handleToggleFeed = async (id: string) => {
    await toggleRssFeedStatus(id);
    await loadData();
  };

  const handleSettingsSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateBotSettings(settings);
      alert('✅ Ayarlar kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setIsSaving(false);
  };

  const resetFeedForm = () => {
    setFeedForm({
      name: '',
      url: '',
      category: 'technology',
      priority: 'medium',
      language: 'en',
      maxItemsPerFetch: 10,
    });
  };

  const openFeedEdit = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFeedForm({
      name: feed.name,
      url: feed.url,
      category: feed.category,
      priority: feed.priority,
      language: feed.language,
      maxItemsPerFetch: feed.maxItemsPerFetch,
    });
    setShowFeedModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🤖 Otomasyon Yönetimi</h1>
        <div className="flex gap-2">
          <button
            onClick={handleInitializeFeeds}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            🚀 Varsayılan Kaynakları Ekle
          </button>
          <button
            onClick={() => {
              resetFeedForm();
              setEditingFeed(null);
              setShowFeedModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + Yeni RSS Kaynağı
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-3xl font-bold text-white">{stats.today.published}</div>
            <div className="text-sm text-slate-400">Bugün Yayınlanan</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-3xl font-bold text-white">{stats.total.activeFeeds}/{stats.total.feeds}</div>
            <div className="text-sm text-slate-400">Aktif Kaynak</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-3xl font-bold text-white">{stats.total.published}</div>
            <div className="text-sm text-slate-400">Toplam Yayın</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-3xl font-bold text-white">{stats.today.runs}</div>
            <div className="text-sm text-slate-400">Bugünkü Çalışma</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'feeds', label: '📡 RSS Kaynakları', count: feeds.length },
          { id: 'settings', label: '⚙️ Bot Ayarları' },
          { id: 'logs', label: '📋 Çalışma Günlüğü', count: logs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* RSS Feeds Tab */}
      {activeTab === 'feeds' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Kaynak</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Kategori</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Öncelik</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Durum</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">İstatistik</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {feeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Henüz RSS kaynağı eklenmemiş. &quot;Varsayılan Kaynakları Ekle&quot; veya &quot;Yeni RSS Kaynağı&quot; butonlarını kullanın.
                  </td>
                </tr>
              ) : (
                feeds.map((feed) => (
                  <tr key={feed.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{feed.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[250px]">{feed.url}</p>
                        <p className="text-xs text-slate-600">Dil: {feed.language.toUpperCase()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">
                        {categoryOptions.find(c => c.value === feed.category)?.label || feed.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityLabels[feed.priority].color}`}>
                        {priorityLabels[feed.priority].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[feed.status].color}`}>
                        {statusLabels[feed.status].label}
                      </span>
                      {feed.errorCount > 0 && (
                        <p className="text-xs text-red-400 mt-1">⚠️ {feed.errorCount} hata</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs space-y-1">
                        <p className="text-slate-400">📥 {feed.totalFetched} çekildi</p>
                        <p className="text-slate-400">📤 {feed.totalPublished} yayınlandı</p>
                        {feed.lastFetchedAt && (
                          <p className="text-slate-500">
                            Son: {new Date(feed.lastFetchedAt).toLocaleString('tr-TR')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleFeed(feed.id)}
                          className={`px-2 py-1 rounded text-sm transition-colors ${
                            feed.status === 'active'
                              ? 'bg-yellow-600/50 hover:bg-yellow-600 text-white'
                              : 'bg-green-600/50 hover:bg-green-600 text-white'
                          }`}
                        >
                          {feed.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => openFeedEdit(feed)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteFeed(feed.id)}
                          className="px-2 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded text-sm transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bot Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Bot Ayarları</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
              />
              <span className="text-sm text-slate-300">Bot Aktif</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔴 Yüksek Öncelik Aralığı (dk)
              </label>
              <input
                type="number"
                value={settings.highPriorityInterval}
                onChange={(e) => setSettings({ ...settings, highPriorityInterval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🟡 Orta Öncelik Aralığı (dk)
              </label>
              <input
                type="number"
                value={settings.mediumPriorityInterval}
                onChange={(e) => setSettings({ ...settings, mediumPriorityInterval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🟢 Düşük Öncelik Aralığı (dk)
              </label>
              <input
                type="number"
                value={settings.lowPriorityInterval}
                onChange={(e) => setSettings({ ...settings, lowPriorityInterval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                min="1"
              />
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-md font-semibold text-white mb-4">Günlük Limitler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🎯 Günlük Haber Hedefi
                </label>
                <input
                  type="number"
                  value={settings.dailyArticleTarget}
                  onChange={(e) => setSettings({ ...settings, dailyArticleTarget: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ⏱️ Saatlik Maksimum Haber
                </label>
                <input
                  type="number"
                  value={settings.maxArticlesPerHour}
                  onChange={(e) => setSettings({ ...settings, maxArticlesPerHour: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-md font-semibold text-white mb-4">Kalite Ayarları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📊 Minimum QA Skoru (0-1)
                </label>
                <input
                  type="number"
                  value={settings.minQaScore}
                  onChange={(e) => setSettings({ ...settings, minQaScore: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                  max="1"
                  step="0.05"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Bu skorun altındaki haberler onay kuyruğuna gider
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🔢 SimHash Eşiği (Hamming)
                </label>
                <input
                  type="number"
                  value={settings.simHashThreshold}
                  onChange={(e) => setSettings({ ...settings, simHashThreshold: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Düşük = daha hassas duplikasyon tespiti
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoPublish}
                  onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                />
                <span className="text-sm text-slate-300">Otomatik Yayınla</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.crossSourceDedup}
                  onChange={(e) => setSettings({ ...settings, crossSourceDedup: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                />
                <span className="text-sm text-slate-300">Kaynaklar Arası Duplikasyon Kontrolü</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enablePaywallFilter ?? true}
                  onChange={(e) => setSettings({ ...settings, enablePaywallFilter: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                />
                <span className="text-sm text-slate-300">Paywall/Clickbait Filtreleme</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSettingsSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Tarih</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Öncelik</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Çekilen</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">İşlenen</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Yayınlanan</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Atlanan</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Durum</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Henüz çalışma günlüğü yok. Bot çalıştığında burada görünecek.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <>
                    <tr 
                      key={log.id} 
                      className={`border-t border-slate-700 hover:bg-slate-700/30 ${log.errors.length > 0 ? 'cursor-pointer' : ''}`}
                      onClick={() => log.errors.length > 0 && setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(log.startedAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityLabels[log.priority].color}`}>
                          {priorityLabels[log.priority].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{log.itemsFetched}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{log.itemsProcessed}</td>
                      <td className="px-4 py-3 text-sm text-green-400">{log.itemsPublished}</td>
                      <td className="px-4 py-3 text-sm text-yellow-400">{log.itemsSkipped}</td>
                      <td className="px-4 py-3">
                        {log.completedAt ? (
                          <span className="text-green-400 text-sm">✅ Tamamlandı</span>
                        ) : (
                          <span className="text-yellow-400 text-sm">⏳ Devam ediyor</span>
                        )}
                        {log.errors.length > 0 && (
                          <p className="text-xs text-red-400 mt-1">
                            🔻 {log.errors.length} hata (tıkla)
                          </p>
                        )}
                      </td>
                    </tr>
                    {expandedLogId === log.id && log.errors.length > 0 && (
                      <tr key={`${log.id}-errors`}>
                        <td colSpan={7} className="px-4 py-4 bg-red-900/20 border-t border-red-800/30">
                          <div className="text-sm">
                            <p className="font-medium text-red-300 mb-2">⚠️ Hatalar:</p>
                            <ul className="list-disc pl-5 space-y-1 text-red-200/80">
                              {log.errors.map((err, i) => (
                                <li key={i} className="text-xs">{err}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Feed Modal */}
      {showFeedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingFeed ? 'RSS Kaynağını Düzenle' : 'Yeni RSS Kaynağı'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kaynak Adı
                </label>
                <input
                  type="text"
                  value={feedForm.name}
                  onChange={(e) => setFeedForm({ ...feedForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="The Verge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  RSS URL
                </label>
                <input
                  type="url"
                  value={feedForm.url}
                  onChange={(e) => setFeedForm({ ...feedForm, url: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="https://www.theverge.com/rss/index.xml"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={feedForm.category}
                    onChange={(e) => setFeedForm({ ...feedForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={feedForm.priority}
                    onChange={(e) => setFeedForm({ ...feedForm, priority: e.target.value as FeedPriority })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="high">🔴 Yüksek (5dk)</option>
                    <option value="medium">🟡 Orta (15dk)</option>
                    <option value="low">🟢 Düşük (30dk)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kaynak Dili
                  </label>
                  <select
                    value={feedForm.language}
                    onChange={(e) => setFeedForm({ ...feedForm, language: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="en">🇬🇧 İngilizce</option>
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="nl">🇳🇱 Hollandaca</option>
                    <option value="de">🇩🇪 Almanca</option>
                    <option value="fr">🇫🇷 Fransızca</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Çekim Başına Max
                  </label>
                  <input
                    type="number"
                    value={feedForm.maxItemsPerFetch}
                    onChange={(e) => setFeedForm({ ...feedForm, maxItemsPerFetch: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFeedModal(false);
                  setEditingFeed(null);
                  resetFeedForm();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleFeedSubmit}
                disabled={isSaving || !feedForm.name || !feedForm.url}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Kaydediliyor...' : editingFeed ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
