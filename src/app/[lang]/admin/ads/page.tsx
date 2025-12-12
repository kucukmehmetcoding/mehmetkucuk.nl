'use client';

import { useState, useEffect } from 'react';
import { getAdSlots, createAdSlot, updateAdSlot, deleteAdSlot, getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from '../actions';

type AdPlacement = 'header' | 'sidebar_top' | 'sidebar_bottom' | 'footer' | 'in_article' | 'between_posts' | 'popup' | 'sticky_bottom';
type AdProvider = 'custom' | 'google_adsense' | 'google_admanager';

interface AdSlot {
  id: string;
  name: string;
  placement: AdPlacement;
  description?: string | null;
  width: number | null;
  height: number | null;
  isActive: boolean;
  priority: number;
  advertisements: Advertisement[];
  createdAt: Date;
}

interface Advertisement {
  id: string;
  name: string;
  slotId: string;
  provider: AdProvider;
  imageUrl: string | null;
  linkUrl: string | null;
  altText: string | null;
  adCode: string | null;
  adUnitId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  targetLangs: string[];
  impressions: number;
  clicks: number;
  isActive: boolean;
}

const placementLabels: Record<AdPlacement, string> = {
  header: '🔝 Header (Üst)',
  sidebar_top: '📐 Sidebar Üst',
  sidebar_bottom: '📐 Sidebar Alt',
  footer: '⬇️ Footer (Alt)',
  in_article: '📰 Makale İçi',
  between_posts: '📋 Yazılar Arası',
  popup: '🪟 Popup',
  sticky_bottom: '📌 Sabit Alt',
};

const providerLabels: Record<AdProvider, string> = {
  custom: '🖼️ Özel Banner',
  google_adsense: '📊 Google AdSense',
  google_admanager: '📈 Google Ad Manager',
};

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<'slots' | 'ads'>('slots');
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Slot form state
  const [slotForm, setSlotForm] = useState({
    name: '',
    placement: 'header' as AdPlacement,
    width: '',
    height: '',
    isActive: true,
    priority: 0,
  });

  // Ad form state
  const [adForm, setAdForm] = useState({
    slotId: '',
    provider: 'custom' as AdProvider,
    imageUrl: '',
    linkUrl: '',
    altText: '',
    adCode: '',
    adUnitId: '',
    startDate: '',
    endDate: '',
    targetLangs: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [slotsResult, adsResult] = await Promise.all([getAdSlots(), getAdvertisements()]);
      setSlots((slotsResult.slots || []) as AdSlot[]);
      setAds((adsResult.ads || []) as Advertisement[]);
    } catch (error) {
      console.error('Error loading ads data:', error);
    }
    setIsLoading(false);
  };

  const handleSlotSubmit = async () => {
    try {
      const data = {
        name: slotForm.name,
        placement: slotForm.placement,
        width: slotForm.width ? parseInt(slotForm.width) : undefined,
        height: slotForm.height ? parseInt(slotForm.height) : undefined,
        isActive: slotForm.isActive,
        priority: slotForm.priority,
      };

      if (editingSlot) {
        await updateAdSlot(editingSlot.id, data);
      } else {
        await createAdSlot(data);
      }

      setShowSlotModal(false);
      setEditingSlot(null);
      resetSlotForm();
      await loadData();
    } catch (error) {
      console.error('Error saving slot:', error);
    }
  };

  const handleAdSubmit = async () => {
    try {
      const data = {
        name: adForm.altText || 'Untitled Ad',
        slotId: adForm.slotId,
        provider: adForm.provider,
        imageUrl: adForm.imageUrl || undefined,
        linkUrl: adForm.linkUrl || undefined,
        altText: adForm.altText || undefined,
        adCode: adForm.adCode || undefined,
        adUnitId: adForm.adUnitId || undefined,
        startDate: adForm.startDate ? new Date(adForm.startDate) : undefined,
        endDate: adForm.endDate ? new Date(adForm.endDate) : undefined,
        targetLangs: adForm.targetLangs,
        isActive: adForm.isActive,
      };

      if (editingAd) {
        await updateAdvertisement(editingAd.id, data);
      } else {
        await createAdvertisement(data);
      }

      setShowAdModal(false);
      setEditingAd(null);
      resetAdForm();
      await loadData();
    } catch (error) {
      console.error('Error saving ad:', error);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (confirm('Bu reklam alanını silmek istediğinize emin misiniz? İçindeki tüm reklamlar da silinecektir.')) {
      await deleteAdSlot(id);
      await loadData();
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm('Bu reklamı silmek istediğinize emin misiniz?')) {
      await deleteAdvertisement(id);
      await loadData();
    }
  };

  const resetSlotForm = () => {
    setSlotForm({
      name: '',
      placement: 'header',
      width: '',
      height: '',
      isActive: true,
      priority: 0,
    });
  };

  const resetAdForm = () => {
    setAdForm({
      slotId: slots[0]?.id || '',
      provider: 'custom',
      imageUrl: '',
      linkUrl: '',
      altText: '',
      adCode: '',
      adUnitId: '',
      startDate: '',
      endDate: '',
      targetLangs: [],
      isActive: true,
    });
  };

  const openSlotEdit = (slot: AdSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      name: slot.name,
      placement: slot.placement,
      width: slot.width?.toString() || '',
      height: slot.height?.toString() || '',
      isActive: slot.isActive,
      priority: slot.priority,
    });
    setShowSlotModal(true);
  };

  const openAdEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setAdForm({
      slotId: ad.slotId,
      provider: ad.provider,
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      altText: ad.altText || '',
      adCode: ad.adCode || '',
      adUnitId: ad.adUnitId || '',
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      targetLangs: ad.targetLangs,
      isActive: ad.isActive,
    });
    setShowAdModal(true);
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
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
        <h1 className="text-2xl font-bold text-white">📢 Reklam Yönetimi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetSlotForm();
              setEditingSlot(null);
              setShowSlotModal(true);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            + Yeni Alan
          </button>
          <button
            onClick={() => {
              resetAdForm();
              setEditingAd(null);
              setShowAdModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + Yeni Reklam
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
            activeTab === 'slots'
              ? 'bg-slate-700 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          📐 Reklam Alanları ({slots.length})
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
            activeTab === 'ads'
              ? 'bg-slate-700 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          🖼️ Reklamlar ({ads.length})
        </button>
      </div>

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              Henüz reklam alanı oluşturulmamış. &quot;Yeni Alan&quot; butonuna tıklayarak başlayın.
            </div>
          ) : (
            slots.map((slot) => (
              <div
                key={slot.id}
                className={`bg-slate-800 rounded-xl p-4 border ${
                  slot.isActive ? 'border-green-500/30' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{slot.name}</h3>
                    <p className="text-sm text-slate-400">{placementLabels[slot.placement]}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      slot.isActive
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {slot.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-3 space-y-1">
                  {slot.width && slot.height && (
                    <p>Boyut: {slot.width}x{slot.height}px</p>
                  )}
                  <p>Öncelik: {slot.priority}</p>
                  <p>Reklam Sayısı: {slot.advertisements?.length || 0}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openSlotEdit(slot)}
                    className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="px-3 py-1.5 bg-red-600/50 hover:bg-red-600 text-white rounded text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Reklam</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Alan</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Sağlayıcı</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">İstatistikler</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">Durum</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Henüz reklam oluşturulmamış. &quot;Yeni Reklam&quot; butonuna tıklayarak başlayın.
                  </td>
                </tr>
              ) : (
                ads.map((ad) => {
                  const slot = slots.find(s => s.id === ad.slotId);
                  return (
                    <tr key={ad.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {ad.imageUrl && (
                            <img
                              src={ad.imageUrl}
                              alt={ad.altText || 'Ad'}
                              className="w-12 h-8 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="text-sm text-white">{ad.altText || 'İsimsiz Reklam'}</p>
                            {ad.linkUrl && (
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {ad.linkUrl}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {slot?.name || 'Bilinmiyor'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {providerLabels[ad.provider]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-1">
                          <p className="text-slate-400">
                            👁️ {ad.impressions.toLocaleString()} görüntüleme
                          </p>
                          <p className="text-slate-400">
                            🖱️ {ad.clicks.toLocaleString()} tıklama
                          </p>
                          <p className="text-blue-400">
                            📊 CTR: {calculateCTR(ad.impressions, ad.clicks)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ad.isActive
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {ad.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openAdEdit(ad)}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="px-2 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded text-sm transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingSlot ? 'Reklam Alanını Düzenle' : 'Yeni Reklam Alanı'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Alan Adı
                </label>
                <input
                  type="text"
                  value={slotForm.name}
                  onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Header Banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Yerleşim
                </label>
                <select
                  value={slotForm.placement}
                  onChange={(e) => setSlotForm({ ...slotForm, placement: e.target.value as AdPlacement })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(placementLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Genişlik (px)
                  </label>
                  <input
                    type="number"
                    value={slotForm.width}
                    onChange={(e) => setSlotForm({ ...slotForm, width: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="728"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Yükseklik (px)
                  </label>
                  <input
                    type="number"
                    value={slotForm.height}
                    onChange={(e) => setSlotForm({ ...slotForm, height: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="90"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Öncelik
                </label>
                <input
                  type="number"
                  value={slotForm.priority}
                  onChange={(e) => setSlotForm({ ...slotForm, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slotForm.isActive}
                  onChange={(e) => setSlotForm({ ...slotForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                />
                <span className="text-sm text-slate-300">Aktif</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSlotModal(false);
                  setEditingSlot(null);
                  resetSlotForm();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSlotSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingSlot ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700 mx-4">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingAd ? 'Reklamı Düzenle' : 'Yeni Reklam'}
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reklam Alanı
                </label>
                <select
                  value={adForm.slotId}
                  onChange={(e) => setAdForm({ ...adForm, slotId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz...</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.name} ({placementLabels[slot.placement]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sağlayıcı
                </label>
                <select
                  value={adForm.provider}
                  onChange={(e) => setAdForm({ ...adForm, provider: e.target.value as AdProvider })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(providerLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {adForm.provider === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Görsel URL
                    </label>
                    <input
                      type="url"
                      value={adForm.imageUrl}
                      onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Link URL
                    </label>
                    <input
                      type="url"
                      value={adForm.linkUrl}
                      onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={adForm.altText}
                      onChange={(e) => setAdForm({ ...adForm, altText: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Reklam açıklaması"
                    />
                  </div>
                </>
              )}

              {(adForm.provider === 'google_adsense' || adForm.provider === 'google_admanager') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ad Unit ID
                    </label>
                    <input
                      type="text"
                      value={adForm.adUnitId}
                      onChange={(e) => setAdForm({ ...adForm, adUnitId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="ca-pub-XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Reklam Kodu (HTML)
                    </label>
                    <textarea
                      value={adForm.adCode}
                      onChange={(e) => setAdForm({ ...adForm, adCode: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="<ins class='adsbygoogle'..."
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={adForm.startDate}
                    onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={adForm.endDate}
                    onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hedef Diller
                </label>
                <div className="flex gap-3">
                  {['tr', 'en', 'nl'].map((lang) => (
                    <label key={lang} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adForm.targetLangs.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdForm({ ...adForm, targetLangs: [...adForm.targetLangs, lang] });
                          } else {
                            setAdForm({
                              ...adForm,
                              targetLangs: adForm.targetLangs.filter((l) => l !== lang),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                      />
                      <span className="text-sm text-slate-300">{lang.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Boş bırakılırsa tüm dillerde gösterilir
                </p>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={adForm.isActive}
                  onChange={(e) => setAdForm({ ...adForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                />
                <span className="text-sm text-slate-300">Aktif</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAdModal(false);
                  setEditingAd(null);
                  resetAdForm();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAdSubmit}
                disabled={!adForm.slotId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {editingAd ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
