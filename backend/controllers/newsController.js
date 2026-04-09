// In-memory cache to stay within GNews free tier (100 req/day)
let newsCache = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const FALLBACK_NEWS = [
  {
    title: "Urban Safety: How Communities Are Using Technology to Prevent Crime",
    description: "Cities across India are adopting community-driven safety platforms to report incidents in real-time, creating safer neighborhoods through collective vigilance.",
    image: null,
    url: "#",
    source: "SafetyMap Insights",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Police Launch New Initiative for Nighttime Street Safety",
    description: "Law enforcement agencies introduce enhanced patrolling and community alert systems in poorly-lit urban areas to reduce nighttime incidents.",
    image: null,
    url: "#",
    source: "SafetyMap Insights",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Women's Safety Apps See Record Downloads Across Metro Cities",
    description: "Safety-focused mobile applications are seeing unprecedented adoption rates as awareness around personal security tools continues to grow.",
    image: null,
    url: "#",
    source: "SafetyMap Insights",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Road Accident Hotspots Identified Through Crowdsourced Data",
    description: "Community reporting platforms are helping traffic authorities identify and address dangerous intersections and road segments more effectively.",
    image: null,
    url: "#",
    source: "SafetyMap Insights",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Cyber Crime Reports Surge: Essential Tips to Stay Protected Online",
    description: "Experts urge citizens to stay vigilant against phishing, UPI fraud, and identity theft as digital crimes continue to rise nationwide.",
    image: null,
    url: "#",
    source: "SafetyMap Insights",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// @desc    Get safety-related news (proxied from GNews API)
// @route   GET /api/news
export const getNews = async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (newsCache.data && (now - newsCache.timestamp) < CACHE_DURATION) {
      return res.json(newsCache.data);
    }

    const apiKey = process.env.GNEWS_API_KEY;

    // Fallback to mock data if no API key configured
    if (!apiKey) {
      return res.json(FALLBACK_NEWS);
    }

    const response = await fetch(
      `https://gnews.io/api/v4/search?q=crime+OR+safety+OR+accident+OR+theft&country=in&lang=en&max=10&apikey=${apiKey}`
    );

    if (!response.ok) {
      console.error('GNews API error:', response.status);
      return res.json(newsCache.data || FALLBACK_NEWS);
    }

    const data = await response.json();

    const articles = (data.articles || []).map(article => ({
      title: article.title,
      description: article.description,
      image: article.image,
      url: article.url,
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt
    }));

    // Cache the result
    newsCache = { data: articles, timestamp: now };

    res.json(articles);
  } catch (error) {
    console.error('News fetch error:', error.message);
    res.json(newsCache.data || FALLBACK_NEWS);
  }
};
