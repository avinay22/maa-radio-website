// ─────────────────────────────────────────────────────────────────────────────
// Maa Radio — Site Content Store
// All editable website content lives here. The Admin Panel reads and writes
// this store. Every public page reads from it so edits are immediately live.
// ─────────────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  image: string;
  sortOrder: number;
}

export type OfferType =
  | "Festival Offers"
  | "Wedding Package Discounts"
  | "Combo Offers"
  | "Free Gifts"
  | "Cashback Offers"
  | "EMI Available"
  | "Limited Time Deals";

export interface DynamicOffer {
  id: string;
  title: string;
  description: string;
  type: OfferType;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  image?: string;
  terms?: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  category: "Store Interior" | "Store Exterior" | "Product Displays" | "Customer Moments" | "Events";
  sortOrder: number;
}

export interface SiteContent {
  phone: string;
  whatsapp: string;
  hours: string;
  mapsEmbedUrl: string;
  categories: Category[];
  offers: DynamicOffer[];
  gallery: GalleryItem[];
}

export const STATIC_CONTENT = {
  businessName: "Maa Radio",
  ownerName: "Madan Ghosh",
  address: "Maa Radio, Gogamukh, Dhemaji, Assam",
  footerTagline: "Maa Radio is a premier retail destination in the region, trusted for original mobiles, high-fidelity accessories, and verified home appliances. Founded and managed by Tushar Ghosh.",
  
  // Hero Section
  heroBadge: "Trusted Since 1986",
  heroHeading: "Everything you need for",
  heroHeadingAccent: "Your Home",
  heroBody: "Looking for a new phone, gaming laptop, TV, refrigerator, washing machine or accessories? You'll find genuine products, great offers and friendly service—all in one place.",
  heroCTAPrimary: "Explore Products",
  heroCTASecondary: "Why Choose Maa Radio",
  heroFeaturedLabel: "Today's Pick",
  heroEnquireLabel: "Enquire Now",

  // Philosophy
  philosophyLabel: "WHY PEOPLE TRUST MAA RADIO",
  philosophyQuote: "Whether you're buying your first smartphone, a gaming laptop, a refrigerator, or a gift for someone special, we make every purchase memorable. Enjoy genuine products, exciting gifts, exclusive offers, combo savings, easy finance, expert guidance, and after-sales support—all backed by over 40 years of trust and care.",
  philosophyAuthor: "Maa Radio, Est. 2010",

  // Why Choose Us
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

  // Brands
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

  // Reviews
  reviewsLabel: "REAL CUSTOMER EXPERIENCES",
  reviewsHeading: "What Our Customers Say",
  reviews: [
    {
      id: "r1",
      quote: "I bought my iPhone 13 from Maa Radio and the experience was excellent. The staff explained everything clearly, helped me choose the right accessories and even guided me about the warranty. Highly recommended.",
      author: "Arnab Saikia",
      location: "Gogamukh",
    },
    {
      id: "r2",
      quote: "Unlike other stores, Maa Radio doesn't push you to buy expensive stuff. They focus on what you actually need. Their audio collection is amazing.",
      author: "Priyam Bordoloi",
      location: "Dhemaji",
    },
    {
      id: "r3",
      quote: "Got my Dyson vacuum from Maa Radio. Excellent customer service, Tushar personally handled the warranty registration and demo.",
      author: "Riniki Sharma",
      location: "Lakhimpur",
    },
  ],

  // About Page
  aboutTagline: "Our Journey",
  aboutHeading: "The Story Behind",
  aboutHeadingAccent: "Maa Radio",
  aboutIntro: "What began as a dedicated local store has evolved into a premier retail destination for genuine smartphones, premium accessories, and high-fidelity home appliances.",
  aboutQuote: "In a digital world overflowing with cheap clones and impersonal online checkout screens, we stand for human-verified authenticity and direct accountability.",
  aboutParagraph1: "Maa Radio was founded with a singular, clear directive: to bring genuine, certified electronics to our patrons. Over the years, we have seen the market flood with grey-market imports, refurbished duplicates, and cheap knock-offs that compromise device health and user safety.",
  aboutParagraph2: "Recognising this gap, Tushar Ghosh established Maa Radio as a trusted sanctuary where quality is never open to compromise. We maintain direct relationships with brand representatives, ensuring that every piece of inventory — from a simple adapter cable to a flagship titanium smartphone — is 100% brand-original and carries its valid brand warranty.",
  aboutParagraph3: "We purposefully do not include online checkout carts or automated payment gateways. We believe in the human side of retail. We welcome our patrons to connect directly with us, consult on their technological needs, examine products in our physical store, and receive personalized support and care.",
  aboutOwnerTitle: "Founder & Active Owner",
  aboutOwnerQuote: '"We don\'t just sell electronics. We build lifelong relationships. Every product I procure is verified as if I were using it in my own home."',
  
  // Gallery Section
  galleryLabel: "INSIDE MAA RADIO",
  galleryHeading: "Take a Look Inside Our Store",
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  phone: "+91 70027 33658",
  whatsapp: "917002733658",
  hours: "Mon - Sat: 10:00 AM – 8:30 PM",
  mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57186.20572797769!2d94.61869894464858!3d27.382025091722055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37424ea642058b73%3A0x671b56360341738c!2sGogamukh%2C%20Assam!5e0!3m2!1sen!2sin!4v1721200000000!5m2!1sen!2sin",
  categories: [
    {
      id: "cat-smartphones",
      name: "Smartphones",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop",
      sortOrder: 1,
    },
    {
      id: "cat-laptops",
      name: "Gaming Laptops & Laptops",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop",
      sortOrder: 2,
    },
    {
      id: "cat-accessories",
      name: "Accessories",
      image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=500&auto=format&fit=crop",
      sortOrder: 3,
    },
    {
      id: "cat-headphones",
      name: "Headphones & Earbuds",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop",
      sortOrder: 4,
    },
    {
      id: "cat-watches",
      name: "Smart Watches & Watches",
      image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=500&auto=format&fit=crop",
      sortOrder: 5,
    },
    {
      id: "cat-appliances",
      name: "Home Appliances",
      image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=500&auto=format&fit=crop",
      sortOrder: 6,
    },
  ],
  offers: [],
  gallery: [],
};
const STORAGE_KEY = "maa_radio_site_content";

export function getSiteContent(): SiteContent {
  if (typeof window === "undefined") return DEFAULT_SITE_CONTENT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SITE_CONTENT;
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

