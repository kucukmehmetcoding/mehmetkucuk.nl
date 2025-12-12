const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const articles = [
    {
      slug: "yapay-zeka-gelecegi",
      imageUrl: "https://images.unsplash.com/photo-1677442d019cecf8181d2ed0a7265fcc2bd4a5a0?w=800",
      category: "Technology",
      tags: ["AI", "Future", "Innovation"],
      published: true,
      publishedAt: new Date("2025-12-10"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "Yapay Zeka Geleceğin Şekillendirmesi",
            seoTitle: "Yapay Zeka: Geleceğin Teknolojisi",
            summary: "Yapay zekanın son gelişmeler ve teknoloji dünyasında yaratacağı etki hakkında detaylı analiz.",
            metaDescription: "AI'nin son gelişmeleri, uygulamaları ve 2030 yılına kadar ekonomiye yaratacağı etkileri öğrenin.",
            body: "<h2>Yapay Zeka Nedir?</h2><p>Yapay zeka (AI), bilgisayarların insan benzeri zekâ sergilemesini sağlayan teknoloji dalıdır. Son yıllarda meydana gelen atılımlar, AI'ni günlük hayatımızın ayrılmaz bir parçası haline getirmiştir.</p><h2>Mevcut Uygulamalar</h2><p>Günümüzde AI, sağlık, finans ve eğitim sektörlerinde geniş ölçüde kullanılmaktadır. Tanı koyma, finansal analizler ve kişiselleştirilmiş öğrenme sistemleri AI tarafından güçlendirilmektedir.</p><h2>Gelecek Vizyonu</h2><p>2030 yılına kadar AI'nin ekonomik etkinliğini artacağı ve milyonlarca yeni iş alanı yaratacağı öngörülüyor.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "bulut-teknolojisi-donemus",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      category: "Technology",
      tags: ["Cloud", "Infrastructure"],
      published: true,
      publishedAt: new Date("2025-12-09"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "Bulut Teknolojisinde Dönüş Noktası",
            seoTitle: "Bulut Bilişim: Modern İşletmelerin Altyapısı",
            summary: "Modern işletmelerin bulut altyapısına olan bağımlılığı ve geleceği hakkında kapsamlı araştırma.",
            metaDescription: "Bulut teknolojisinin hibrit mimarisi, güvenlik ve endüstri trendleri hakkında detaylı bilgi.",
            body: "<h2>Bulut Bilişim Nedir?</h2><p>Bulut bilişim, internet üzerinden bilgi işlem kaynaklarının sağlanmasını ifade eder. Bu model, kuruluşlara esneklik ve maliyet tasarrufu sağlar.</p><h2>Endüstri Trendleri</h2><p>Hibrit bulut mimarisi ve multi-cloud stratejileri giderek yaygınlaşmaktadır. Şirketler artık birden fazla bulut sağlayıcısı ile çalışıyor.</p><h2>Güvenlik Konuları</h2><p>Veri gizliliği ve siber güvenlik, bulut geçişinin en önemli endişeleri olmaya devam etmektedir.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "blockchain-ve-kriptografi",
      imageUrl: "https://images.unsplash.com/photo-1639762681033-6461bc4adfee?w=800",
      category: "Technology",
      tags: ["Blockchain", "Crypto"],
      published: true,
      publishedAt: new Date("2025-12-08"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "Blockchain Teknolojisinin Devrim Niteliği",
            seoTitle: "Blockchain: Dağıtık Sistemlerin Geleceği",
            summary: "Blockchain'in finans dışı alanlardaki uygulamaları ve potansiyeli üzerine araştırma.",
            metaDescription: "Blockchain teknolojisinin tedarik zinciri, kimlik ve oy verme gibi uygulamalarını keşfedin.",
            body: "<h2>Blockchain Temelleri</h2><p>Blockchain, merkezi olmayan ve şeffaf bir defter sistemidir. Her işlem kriptografik olarak güvenlidir.</p><h2>Pratik Uygulamalar</h2><p>Tedarik zinciri takibi, dijital kimlik ve oy verme sistemleri blockchain teknolojisinin bazı yeni kullanım alanlarıdır.</p><h2>Zorluklar</h2><p>Ölçeklenebilirlik, enerji tüketimi ve düzenlemeler blockchain'in yaygın kabulü önündeki başlıca engeller.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "quantum-bilgisayarlar",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f5ae4e8a90f?w=800",
      category: "Technology",
      tags: ["Quantum", "Computing"],
      published: true,
      publishedAt: new Date("2025-12-07"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "Kuantum Bilgisayarlar Hiper Hesaplama Çağını Açıyor",
            seoTitle: "Kuantum Bilgisayarlar: Hesaplama Devrimine Doğru",
            summary: "Kuantum bilgisayarları, iş dünyasında ve bilim alanında yaratacağı devrim hakkında.",
            metaDescription: "IBM, Google ve diğer şirketlerin kuantum araştırmaları ve gelecekteki uygulamalar.",
            body: "<h2>Kuantum Mekaniği Nedir?</h2><p>Kuantum mekaniği, atom ve subatomik partiküllerin davranışını açıklayan fizik dalıdır. Kuantum bilgisayarlar bu ilkeleri hesaplamada kullanır.</p><h2>Günümüz Durumu</h2><p>IBM, Google ve diğer teknoloji devleri kuantum araştırmaları yapmaktadırlar. Ancak kullanıma hazır sistemler hala bazı yıl uzakta.</p><h2>Potansiyel Uygulamalar</h2><p>İlaç keşfi, optimizasyon sorunları ve kripto analizi kuantum bilgisayarlarının önemli uygulama alanları olacak.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "web3-ve-metaverse",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
      category: "Technology",
      tags: ["Web3", "Metaverse"],
      published: true,
      publishedAt: new Date("2025-12-06"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "Web3 ve Metaverse: İnternetin Geleceği",
            seoTitle: "Web3 ve Metaverse: Yeni Dijital Çağ",
            summary: "Merkezi olmayan web ve sanal dünyaların birlikte yaratacağı yeni dijital ekosistemin analizi.",
            metaDescription: "Web3'ün merkezi olmayan yapısı ve metaverse'ün sanal ortamlarının geleceğini keşfedin.",
            body: "<h2>Web3 Nedir?</h2><p>Web3, merkezi olmayan teknolojiler üzerine inşa edilen yeni internet versiyonudur. Kullanıcılar kendi verilerine ve dijital varlıklarına kontrol sahibi olacak.</p><h2>Metaverse Kavramı</h2><p>Metaverse, fiziksel ve dijital dünyaların birleştiği sanal ortamlardır. Sosyal etkileşim, iş ve eğlence bu ortamlarda gerçekleşecektir.</p><h2>Mevcut Gelişmeler</h2><p>Meta, Microsoft ve diğer şirketler metaverse altyapısına milyarlarca dolar yatırım yapmaktadırlar.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "5g-teknolojisinin-etkileri",
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      category: "Technology",
      tags: ["5G", "Networks"],
      published: true,
      publishedAt: new Date("2025-12-05"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "5G Teknolojisinin Ekonomik Etkileri",
            seoTitle: "5G: Hızlı Bağlantının Ekonomik Etkisi",
            summary: "Beşinci nesil ağ teknolojisinin endüstri ve topluma yaratacağı değişimler.",
            metaDescription: "5G ağlarının IoT, akıllı şehirler ve otonom araçlara yaratacağı devrimci etkiler.",
            body: "<h2>5G Özellikleri</h2><p>5G, hızlı veri aktarımı, düşük gecikme ve çok sayıda cihazın bağlanabilmesini sağlar. Bu özellikler IoT ve otonom araçlar için hayati.</p><h2>Kurulum Durumu</h2><p>2025 yılı itibariyle, 5G ağları dünya genelinde yaygınlaşmaya başlamıştır. Türkiye'de de büyük şehirlerde hizmet verilmektedir.</p><h2>Gelecek Beklentileri</h2><p>Tele-sağlık, akıllı şehirler ve endüstriyel otomasyon 5G teknolojisiyle devrim yaşayacak.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "siber-guvenlik-tehditleri",
      imageUrl: "https://images.unsplash.com/photo-1518611505868-d2b4fd36b785?w=800",
      category: "Technology",
      tags: ["Security", "Cybersecurity"],
      published: true,
      publishedAt: new Date("2025-12-04"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "2025'in En Büyük Siber Güvenlik Tehditleri",
            seoTitle: "Siber Güvenlik: 2025'in En Büyük Tehditleri",
            summary: "Günümüzün ve yakın geleceğin en ciddi siber tehditleri ve koruma yöntemleri.",
            metaDescription: "AI destekli saldırılar, ransomware ve zero-trust mimarisi hakkında kapsamlı rehber.",
            body: "<h2>Yapay Zeka Destekli Saldırılar</h2><p>Hackerler giderek daha sofistike saldırılar için AI kullanmaktadırlar. Zero-day exploitler ve otomatik penetrasyon saldırıları artmaktadır.</p><h2>Ransomware Trendi</h2><p>Ransomware saldırıları daha hedefli ve pahalı hale gelmektedir. Kritik altyapı sektörleri özellikle risk altındadır.</p><h2>Savunma Stratejileri</h2><p>Çok faktörlü kimlik doğrulama, zero-trust mimarisi ve sürekli izleme artık zorunlu hale gelmiştir.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    },
    {
      slug: "yazilim-gelistirme-trendleri",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      category: "Technology",
      tags: ["Software", "Development"],
      published: true,
      publishedAt: new Date("2025-12-03"),
      translations: {
        create: [
          {
            lang: "tr",
            title: "Yazılım Geliştirmede 2025 Trendleri",
            seoTitle: "Yazılım Geliştirme: 2025'in En Sıcak Trendleri",
            summary: "Modern yazılım geliştirme pratikleri, araçları ve metodolojileri hakkında güncel analiz.",
            metaDescription: "Low-code, AI destekli geliştirme ve DevOps'un yazılım sektöründeki son trendleri.",
            body: "<h2>Low-Code ve No-Code Platformları</h2><p>Yazılım geliştirme sürecinin demokratikleşmesi low-code ve no-code araçlarla hızlanmaktadır. İş analisti ve domain uzmanları artık kod yazabilmektedir.</p><h2>AI Destekli Geliştirme</h2><p>GitHub Copilot gibi AI asistanları, geliştiricilerin verimliğini önemli ölçüde artırmaktadır. Kod yazma hızı iki katına çıkmaktadır.</p><h2>DevOps Olgunlaşması</h2><p>Otomatik testing, continuous deployment ve monitoring artık endüstri standardı hale gelmiştir.</p>",
            author: "Mehmet Küçük"
          }
        ]
      }
    }
  ];

  for (const article of articles) {
    try {
      await prisma.article.create({
        data: article
      });
      console.log(`✓ Created: ${article.slug}`);
    } catch (error) {
      console.log(`✗ Error creating ${article.slug}:`, error.message);
    }
  }
  
  console.log("\n✅ Demo articles seeding completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
