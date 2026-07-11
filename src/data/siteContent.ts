// ─────────────────────────────────────────────────────────────────────────────
// Maa Radio — Site Content Store
// All editable website content lives here. The Admin Panel reads and writes
// this store. Every public page reads from it so edits are immediately live.
// ─────────────────────────────────────────────────────────────────────────────

export interface WhyCard {
  icon: string;
  title: string;
  description: string;
}

export interface Review {
  id: string;
  quote: string;
  author: string;
  location: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  terms: string;
}

export interface ComboDeal {
  id: string;
  title: string;
  description: string;
  items: string;
  price: string;
}

export interface Gift {
  id: string;
  title: string;
  description: string;
  conditions: string;
}

export interface EMIOffer {
  id: string;
  provider: string;
  plan: string;
  description: string;
}

export interface SiteContent {
  // ── Business Identity ──────────────────────────────────────────────────────
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  mapsEmbedUrl: string;
  footerTagline: string;

  // ── Hero Section ───────────────────────────────────────────────────────────
  heroBadge: string;
  heroHeading: string;
  heroHeadingAccent: string;
  heroBody: string;
  heroCTAPrimary: string;
  heroCTASecondary: string;
  heroFeaturedLabel: string;
  heroProductName: string;
  heroProductPrice: string;
  heroProductVariant: string;
  heroProductImage: string;
  heroEnquireLabel: string;

  // ── Philosophy Section ─────────────────────────────────────────────────────
  philosophyLabel: string;
  philosophyQuote: string;
  philosophyAuthor: string;

  // ── Why Choose Us ──────────────────────────────────────────────────────────
  whyLabel: string;
  whyHeading: string;
  whyDescription?: string;
  whyCards: WhyCard[];

  // ── Brands Marquee ─────────────────────────────────────────────────────────
  brandsLabel: string;
  brands: string[];

  // ── Reviews ────────────────────────────────────────────────────────────────
  reviewsLabel: string;
  reviewsHeading: string;
  reviews: Review[];

  // ── Gallery ────────────────────────────────────────────────────────────────
  galleryLabel: string;
  galleryHeading: string;
  gallery: string[];

  // ── Contact CTA ────────────────────────────────────────────────────────────
  contactCtaLabel: string;
  contactCtaHeading: string;
  contactCtaBody: string;

  // ── About Page ─────────────────────────────────────────────────────────────
  aboutTagline: string;
  aboutHeading: string;
  aboutHeadingAccent: string;
  aboutIntro: string;
  aboutQuote: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutParagraph3: string;
  aboutOwnerTitle: string;
  aboutOwnerQuote: string;

  // ── Deals & Offers ─────────────────────────────────────────────────────────
  offersLabel: string;
  offersHeading: string;
  offers: Offer[];
  comboDealsLabel: string;
  comboDealsHeading: string;
  comboDeals: ComboDeal[];
  giftsLabel: string;
  giftsHeading: string;
  gifts: Gift[];
  emiLabel: string;
  emiHeading: string;
  emiOffers: EMIOffer[];
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  // ── Business Identity ──────────────────────────────────────────────────────
  businessName: "Maa Radio",
  ownerName: "Madan Ghosh",
  phone: "+91 70027 33658",
  whatsapp: "917002733658",
  address: "Maa Radio, Gogamukh, Dhemaji, Assam",
  hours: "Mon - Sat: 10:00 AM – 8:30 PM",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114631.79237976935!2d91.64415843468535!3d26.123616694692764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5f2ec3d6b05f%3A0x6b44a2dc98305c48!2sGuwahati%2C%20Assam!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  footerTagline:
    "Maa Radio is a premier retail destination in the region, trusted for original mobiles, high-fidelity accessories, and verified home appliances. Founded and managed by Tushar Ghosh.",

  // ── Hero Section ───────────────────────────────────────────────────────────
  heroBadge: "Trusted Since 1986",
  heroHeading: "Everything you need for",
  heroHeadingAccent: "Your Home",
  heroBody:
    "Looking for a new phone, gaming laptop, TV, refrigerator, washing machine or accessories? You'll find genuine products, great offers and friendly service—all in one place.",
  heroCTAPrimary: "Explore Products",
  heroCTASecondary: "Why Choose Maa Radio",
  heroFeaturedLabel: "Today's Pick",
  heroProductName: "iPhone 15 Pro",
  heroProductPrice: "₹1,24,900",
  heroProductVariant: "Available in Store",
  heroProductImage:
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=420&auto=format&fit=crop",
  heroEnquireLabel: "Enquire",

  // ── Philosophy Section ─────────────────────────────────────────────────────
  philosophyLabel: "WHY PEOPLE TRUST MAA RADIO",
  philosophyQuote:
    "Whether you're buying your first smartphone, a gaming laptop, a refrigerator, or a gift for someone special, we make every purchase memorable. Enjoy genuine products, exciting gifts, exclusive offers, combo savings, easy finance, expert guidance, and after-sales support—all backed by over 40 years of trust and care.",
  philosophyAuthor: "Maa Radio, Est. 2010",

  // ── Why Choose Us ──────────────────────────────────────────────────────────
  whyLabel: "Why Choose Us",
  whyHeading: "Why Families Choose Maa Radio",
  whyDescription: "For over 40 years, we've built our reputation by putting customers first. Here's what makes shopping with us different.",
  whyCards: [
    {
      icon: "shield",
      title: "🛡️ Genuine Products",
      description: "Every product we sell is 100% original and comes from trusted brands. You get proper warranty, genuine accessories and complete peace of mind.",
    },
    {
      icon: "gift",
      title: "🎁 Great Offers & Exciting Gifts",
      description: "Enjoy festival offers, combo discounts, wedding deals and exciting gifts on selected purchases. We always try to give you more value for your money.",
    },
    {
      icon: "credit-card",
      title: "💳 Easy EMI & Finance",
      description: "Buying your favourite product is simple with our easy EMI and finance options. Take it home today and pay comfortably.",
    },
    {
      icon: "wrench",
      title: "🛠️ Setup & After-Sales Support",
      description: "Need help after your purchase? From laptop software installation to product setup and guidance, we're always here to support you.",
    },
    {
      icon: "handshake",
      title: "🤝 Friendly Service",
      description: "Our team takes time to understand your needs and helps you choose the right product without pressure or confusion.",
    },
    {
      icon: "star",
      title: "⭐ 40+ Years of Trust",
      description: "Families have trusted Maa Radio for over four decades because we believe in honest advice, fair prices and long-term relationships.",
    },
  ],

  // ── Brands Marquee ─────────────────────────────────────────────────────────
  brandsLabel: "Authorized Brands",
  brands: [
    "Apple",
    "Samsung",
    "Nothing",
    "Sony",
    "Bose",
    "Dyson",
    "OnePlus",
    "Anker",
    "Marshall",
  ],

  // ── Reviews ────────────────────────────────────────────────────────────────
  reviewsLabel: "REAL CUSTOMER EXPERIENCES",
  reviewsHeading: "What Our Customers Say",
  reviews: [
    {
      id: "r1",
      quote:
        "I bought my iPhone 13 from Maa Radio and the experience was excellent. The staff explained everything clearly, helped me choose the right accessories and even guided me about the warranty. Highly recommended.",
      author: "Arnab Saikia",
      location: "Gogamukh",
    },
    {
      id: "r2",
      quote:
        "Unlike other stores, Maa Radio doesn't push you to buy expensive stuff. They focus on what you actually need. Their audio collection is amazing.",
      author: "Priyam Bordoloi",
      location: "Dhemaji",
    },
    {
      id: "r3",
      quote:
        "Got my Dyson vacuum from Maa Radio. Excellent customer service, Tushar personally handled the warranty registration and demo.",
      author: "Riniki Sharma",
      location: "Lakhimpur",
    },
  ],

  // ── Gallery ────────────────────────────────────────────────────────────────
  galleryLabel: "INSIDE MAA RADIO",
  galleryHeading: "Take a Look Inside Our Store",
  gallery: [
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=400&auto=format&fit=crop",
  ],

  // ── Contact CTA ────────────────────────────────────────────────────────────
  contactCtaLabel: "VISIT MAA RADIO TODAY",
  contactCtaHeading: "Visit Our Store.",
  contactCtaBody:
    "Visit Maa Radio to explore the latest smartphones, gaming laptops, home appliances and accessories. Our team will help you compare products, explain features, guide you on EMI options and help you choose the right product for your budget.",

  // ── About Page ─────────────────────────────────────────────────────────────
  aboutTagline: "Our Journey",
  aboutHeading: "The Story Behind",
  aboutHeadingAccent: "Maa Radio",
  aboutIntro:
    "What began as a dedicated local store has evolved into a premier retail destination for genuine smartphones, premium accessories, and high-fidelity home appliances.",
  aboutQuote:
    "In a digital world overflowing with cheap clones and impersonal online checkout screens, we stand for human-verified authenticity and direct accountability.",
  aboutParagraph1:
    "Maa Radio was founded with a singular, clear directive: to bring genuine, certified electronics to our patrons. Over the years, we have seen the market flood with grey-market imports, refurbished duplicates, and cheap knock-offs that compromise device health and user safety.",
  aboutParagraph2:
    "Recognising this gap, Tushar Ghosh established Maa Radio as a trusted sanctuary where quality is never open to compromise. We maintain direct relationships with brand representatives, ensuring that every piece of inventory — from a simple adapter cable to a flagship titanium smartphone — is 100% brand-original and carries its valid brand warranty.",
  aboutParagraph3:
    "We purposefully do not include online checkout carts or automated payment gateways. We believe in the human side of retail. We welcome our patrons to connect directly with us, consult on their technological needs, examine products in our physical store, and receive personalized support and care.",
  aboutOwnerTitle: "Founder & Active Owner",
  aboutOwnerQuote:
    '"We don\'t just sell electronics. We build lifelong relationships. Every product I procure is verified as if I were using it in my own home."',

  // ── Deals & Offers ─────────────────────────────────────────────────────────
  offersLabel: "SPECIAL OFFERS",
  offersHeading: "Exclusive Store Deals",
  offers: [],
  comboDealsLabel: "COMBO DEALS",
  comboDealsHeading: "Save More With Combos",
  comboDeals: [],
  giftsLabel: "FREE GIFTS",
  giftsHeading: "Complimentary With Purchase",
  gifts: [],
  emiLabel: "EASY FINANCE",
  emiHeading: "Flexible EMI Options",
  emiOffers: [],
};

const STORAGE_KEY = "maa_radio_site_content";

export function getSiteContent(): SiteContent {
  if (typeof window === "undefined") return DEFAULT_SITE_CONTENT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SITE_CONTENT;
    // Merge with defaults so new fields always exist even if localStorage is stale
    return { ...DEFAULT_SITE_CONTENT, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function saveSiteContent(content: SiteContent): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }
}
