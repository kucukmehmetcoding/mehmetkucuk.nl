const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    include: { translations: true }
  });

  const translations = [
    {
      slug: "yapay-zeka-gelecegi",
      en: {
        title: "Artificial Intelligence Shaping the Future",
        seoTitle: "AI: Technology of the Future",
        summary: "A detailed analysis of recent AI developments and their impact on the technology world.",
        metaDescription: "Learn about AI's latest breakthroughs, applications, and economic impacts by 2030.",
        body: "<h2>What is Artificial Intelligence?</h2><p>Artificial Intelligence (AI) is a field of technology that enables computers to exhibit human-like intelligence. Recent breakthroughs have made AI an integral part of our daily lives.</p><h2>Current Applications</h2><p>Today, AI is extensively used in healthcare, finance, and education sectors. Diagnosis, financial analysis, and personalized learning systems are powered by AI.</p><h2>Future Vision</h2><p>By 2030, AI is expected to increase economic efficiency and create millions of new job opportunities.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "Kunstmatige Intelligentie Vormt de Toekomst",
        seoTitle: "AI: Technologie van de Toekomst",
        summary: "Een gedetailleerde analyse van recente AI-ontwikkelingen en hun impact op de technologische wereld.",
        metaDescription: "Ontdek AI's nieuwste doorbraken, toepassingen en economische gevolgen tot 2030.",
        body: "<h2>Wat is Kunstmatige Intelligentie?</h2><p>Kunstmatige Intelligentie (AI) is een technologieveld dat computers in staat stelt mensachtige intelligentie te vertonen. Recente doorbraken hebben AI onderdeel van ons dagelijks leven gemaakt.</p><h2>Huidige toepassingen</h2><p>Vandaag worden AI veel toegepast in gezondheids-, finantie- en onderwijssectoren. Diagnoses, financiële analyses en persoonlijke leersystemen worden door AI aangestuurd.</p><h2>Toekomstvisie</h2><p>Naar verwachting zal AI tegen 2030 de economische efficiëntie verhogen en miljoenen nieuwe banen creëren.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "bulut-teknolojisi-donemus",
      en: {
        title: "A Turning Point in Cloud Technology",
        seoTitle: "Cloud Computing: Modern Business Infrastructure",
        summary: "A comprehensive study on modern enterprises' dependence on cloud infrastructure and its future.",
        metaDescription: "Learn about cloud technology's hybrid architecture, security, and industry trends.",
        body: "<h2>What is Cloud Computing?</h2><p>Cloud computing refers to the provision of computing resources over the internet. This model provides organizations with flexibility and cost savings.</p><h2>Industry Trends</h2><p>Hybrid cloud architecture and multi-cloud strategies are becoming increasingly common. Companies now work with multiple cloud providers.</p><h2>Security Issues</h2><p>Data privacy and cybersecurity remain the primary concerns in cloud migration.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "Een Keerpunt in Cloud-Technologie",
        seoTitle: "Cloud Computing: Moderne Bedrijfsinfrastructuur",
        summary: "Een uitgebreide studie over de afhankelijkheid van moderne ondernemingen van cloud-infrastructuur.",
        metaDescription: "Informatie over cloud-technologie's hybride architectuur, veiligheid en trends.",
        body: "<h2>Wat is Cloud Computing?</h2><p>Cloud computing verwijst naar de verstrekking van computerbronnen via internet. Dit model biedt organisaties flexibiliteit en kostenbesparing.</p><h2>Industriële trends</h2><p>Hybride cloud-architectuur en multi-cloud-strategieën worden steeds gebruikelijker. Bedrijven werken nu met meerdere cloud-providers.</p><h2>Beveiligingskwesties</h2><p>Gegevensprivacy en cybersecurity blijven de voornaamste zorgen bij cloud-migratie.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "blockchain-ve-kriptografi",
      en: {
        title: "The Revolutionary Nature of Blockchain Technology",
        seoTitle: "Blockchain: The Future of Distributed Systems",
        summary: "Research on blockchain applications beyond finance and its potential.",
        metaDescription: "Explore blockchain technology's applications in supply chain, identity, and voting systems.",
        body: "<h2>Blockchain Fundamentals</h2><p>Blockchain is a decentralized and transparent ledger system. Every transaction is cryptographically secure.</p><h2>Practical Applications</h2><p>Supply chain tracking, digital identity, and voting systems are some of blockchain's new use cases.</p><h2>Challenges</h2><p>Scalability, energy consumption, and regulations are the main obstacles to blockchain adoption.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "Het Revolutionaire Karakter van Blockchain-Technologie",
        seoTitle: "Blockchain: De Toekomst van Gedistribueerde Systemen",
        summary: "Onderzoek naar blockchain-toepassingen buiten financiën en het potentieel ervan.",
        metaDescription: "Verken blockchain-technologie's toepassingen in toeleveringsketen, identiteit en stemsystemen.",
        body: "<h2>Blockchain Fundamentals</h2><p>Blockchain is een gedecentraliseerd en transparant boekhoudkundig systeem. Elke transactie is cryptografisch veilig.</p><h2>Praktische toepassingen</h2><p>Supply chain tracking, digitale identiteit en stemsystemen zijn enkele nieuwe gebruiksgevallen van blockchain.</p><h2>Uitdagingen</h2><p>Schaalbaarheid, energieverbruik en regelgeving zijn de belangrijkste belemmeringen voor blockchain-adoptie.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "quantum-bilgisayarlar",
      en: {
        title: "Quantum Computers Opening the Era of Hyper-Computation",
        seoTitle: "Quantum Computers: Toward a Computing Revolution",
        summary: "About the revolution quantum computers will create in business and science.",
        metaDescription: "IBM, Google and other companies' quantum research and future applications.",
        body: "<h2>What is Quantum Mechanics?</h2><p>Quantum mechanics is the branch of physics that explains the behavior of atoms and subatomic particles. Quantum computers use these principles in computation.</p><h2>Current Status</h2><p>IBM, Google, and other tech giants are conducting quantum research. However, production-ready systems are still years away.</p><h2>Potential Applications</h2><p>Drug discovery, optimization problems, and cryptanalysis will be important application areas for quantum computers.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "Kwantumcomputers Openen het Tijdperk van Hypercomputing",
        seoTitle: "Kwantumcomputers: Naar een Computingrevolutie",
        summary: "Over de revolutie die kwantumcomputers in bedrijven en wetenschap zullen creëren.",
        metaDescription: "Kwantumonderzoek van IBM, Google en andere bedrijven en toekomstige toepassingen.",
        body: "<h2>Wat is Kwantummechanica?</h2><p>Kwantummechanica is de tak van de natuurkunde die het gedrag van atomen en subatomaire deeltjes verklaart. Kwantumcomputers gebruiken deze principes bij berekeningen.</p><h2>Huidige status</h2><p>IBM, Google en andere technologiegiganten voeren kwantumonderzoek uit. Productie-gereedde systemen zijn echter nog jaren verwijderd.</p><h2>Mogelijke toepassingen</h2><p>Geneesmiddelenontdekking, optimalisatieproblemen en cryptoanalyse zullen belangrijke toepassingsgebieden voor kwantumcomputers zijn.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "web3-ve-metaverse",
      en: {
        title: "Web3 and Metaverse: The Future of the Internet",
        seoTitle: "Web3 and Metaverse: A New Digital Age",
        summary: "Analysis of the new digital ecosystem created by decentralized web and virtual worlds.",
        metaDescription: "Discover Web3's decentralized nature and the future of metaverse's virtual environments.",
        body: "<h2>What is Web3?</h2><p>Web3 is a new version of the internet built on decentralized technologies. Users will have control over their own data and digital assets.</p><h2>Metaverse Concept</h2><p>The metaverse is virtual environments where physical and digital worlds converge. Social interaction, business, and entertainment will take place in these environments.</p><h2>Current Developments</h2><p>Meta, Microsoft, and other companies are investing billions in metaverse infrastructure.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "Web3 en Metaverse: De Toekomst van het Internet",
        seoTitle: "Web3 en Metaverse: Een Nieuw Digitaal Tijdperk",
        summary: "Analyse van het nieuwe digitale ecosysteem gecreëerd door gedecentraliseerd web en virtuele werelden.",
        metaDescription: "Ontdek Web3's gedecentraliseerde aard en de toekomst van metaverse's virtuele omgevingen.",
        body: "<h2>Wat is Web3?</h2><p>Web3 is een nieuwe versie van internet gebouwd op gedecentraliseerde technologieën. Gebruikers hebben controle over hun eigen gegevens en digitale activa.</p><h2>Metaverse-concept</h2><p>De metaverse zijn virtuele omgevingen waar fysieke en digitale werelden samenkomen. Sociale interactie, zaken en entertainment vinden in deze omgevingen plaats.</p><h2>Huidige ontwikkelingen</h2><p>Meta, Microsoft en andere bedrijven investeren miljarden in metaverse-infrastructuur.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "5g-teknolojisinin-etkileri",
      en: {
        title: "Economic Impact of 5G Technology",
        seoTitle: "5G: The Economic Impact of Fast Connectivity",
        summary: "Changes that fifth generation network technology will bring to industry and society.",
        metaDescription: "The revolutionary impact of 5G networks on IoT, smart cities, and autonomous vehicles.",
        body: "<h2>5G Features</h2><p>5G provides fast data transfer, low latency, and connectivity for numerous devices. These features are vital for IoT and autonomous vehicles.</p><h2>Deployment Status</h2><p>As of 2025, 5G networks are beginning to spread globally. Service is also available in major cities in Turkey.</p><h2>Future Expectations</h2><p>Telemedicine, smart cities, and industrial automation will experience a revolution with 5G technology.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "Economische Impact van 5G-Technologie",
        seoTitle: "5G: De Economische Impact van Snelle Verbinding",
        summary: "Veranderingen die technologie van het vijfde generatienetwerk voor industrie en samenleving zal brengen.",
        metaDescription: "De revolutionaire impact van 5G-netwerken op IoT, slimme steden en autonome voertuigen.",
        body: "<h2>5G-functies</h2><p>5G biedt snelle gegevensoverdracht, lage latentie en connectiviteit voor talrijke apparaten. Deze functies zijn essentieel voor IoT en autonome voertuigen.</p><h2>Implementatiestatus</h2><p>Vanaf 2025 beginnen 5G-netwerken wereldwijd uit te breiden. De service is ook beschikbaar in grote steden in Turkije.</p><h2>Toekomstverwachtingen</h2><p>Telemedica, slimme steden en industriële automatisering zullen een revolutie ervaren met 5G-technologie.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "siber-guvenlik-tehditleri",
      en: {
        title: "The Biggest Cybersecurity Threats of 2025",
        seoTitle: "Cybersecurity: The Biggest Threats of 2025",
        summary: "The most serious cyber threats of today and near future and protection methods.",
        metaDescription: "A comprehensive guide on AI-powered attacks, ransomware, and zero-trust architecture.",
        body: "<h2>AI-Powered Attacks</h2><p>Hackers are increasingly using AI for sophisticated attacks. Zero-day exploits and automated penetration attacks are on the rise.</p><h2>Ransomware Trend</h2><p>Ransomware attacks are becoming more targeted and costly. Critical infrastructure sectors are particularly at risk.</p><h2>Defense Strategies</h2><p>Multi-factor authentication, zero-trust architecture, and continuous monitoring have become essential.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "De Grootste Cyberbeveiligingsbedreigingen van 2025",
        seoTitle: "Cyberbeveiliging: De Grootste Bedreigingen van 2025",
        summary: "De meest ernstige cyberbedreigingen van vandaag en nabije toekomst en beschermingsmethoden.",
        metaDescription: "Een uitgebreide gids over AI-aangestuurd aanvallen, ransomware en zero-trust architectuur.",
        body: "<h2>Door AI aangestuurde aanvallen</h2><p>Hackers gebruiken steeds vaker AI voor geavanceerde aanvallen. Zero-day exploits en geautomatiseerde penetratieaanvallen nemen toe.</p><h2>Ransomware-trend</h2><p>Ransomware-aanvallen worden doelgerichtener en duurder. Kritieke infrastructuursectoren lopen bijzonder veel risico.</p><h2>Verdedigingsstrategieën</h2><p>Multi-factor authenticatie, zero-trust architectuur en continue monitoring zijn essentieel geworden.</p>",
        author: "Mehmet Küçük"
      }
    },
    {
      slug: "yazilim-gelistirme-trendleri",
      en: {
        title: "2025 Trends in Software Development",
        seoTitle: "Software Development: The Hottest Trends of 2025",
        summary: "Current analysis of modern software development practices, tools, and methodologies.",
        metaDescription: "Latest trends in low-code, AI-powered development, and DevOps in the software industry.",
        body: "<h2>Low-Code and No-Code Platforms</h2><p>The democratization of software development is accelerating with low-code and no-code tools. Business analysts and domain experts can now write code.</p><h2>AI-Powered Development</h2><p>AI assistants like GitHub Copilot are significantly increasing developer productivity. Code writing speed is doubling.</p><h2>DevOps Maturity</h2><p>Automated testing, continuous deployment, and monitoring have become industry standards.</p>",
        author: "Mehmet Küçük"
      },
      nl: {
        title: "2025 Trends in Softwareontwikkeling",
        seoTitle: "Softwareontwikkeling: De Heetste Trends van 2025",
        summary: "Huidige analyse van moderne softwareontwikkelingspraktijken, hulpmiddelen en methodologieën.",
        metaDescription: "Laatste trends in low-code, AI-gestuurd development en DevOps in de software-industrie.",
        body: "<h2>Low-Code en No-Code Platforms</h2><p>De democratisering van softwareontwikkeling versnelt met low-code en no-code tools. Zakelijke analisten en domain experts kunnen nu code schrijven.</p><h2>Door AI aangestuurde ontwikkeling</h2><p>AI-assistenten zoals GitHub Copilot verhogen de productiviteit van ontwikkelaars aanzienlijk. De schrijfsnelheid van code verdubbelt.</p><h2>DevOps-volwassenheid</h2><p>Geautomatiseerd testen, continue deployment en monitoring zijn industriestandaard geworden.</p>",
        author: "Mehmet Küçük"
      }
    }
  ];

  for (const article of translations) {
    // Add EN translation
    if (article.en) {
      try {
        await prisma.translation.create({
          data: {
            lang: "en",
            ...article.en,
            article: {
              connect: { slug: article.slug }
            }
          }
        });
        console.log(`✓ EN translation added for ${article.slug}`);
      } catch (error) {
        console.log(`✗ EN: ${article.slug} - ${error.message}`);
      }
    }

    // Add NL translation
    if (article.nl) {
      try {
        await prisma.translation.create({
          data: {
            lang: "nl",
            ...article.nl,
            article: {
              connect: { slug: article.slug }
            }
          }
        });
        console.log(`✓ NL translation added for ${article.slug}`);
      } catch (error) {
        console.log(`✗ NL: ${article.slug} - ${error.message}`);
      }
    }
  }

  console.log("\n✅ Translation seeding completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
