export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "Smartphones" | "Accessories" | "Audio" | "Smart Watches" | "Home Appliances";
  price?: string; // Stored as a formatted string e.g. "₹79,900" or "₹1,499"
  image: string;
  description: string;
  featured?: boolean;
  isAccessoryPageOnly?: boolean; // Dedicated accessory flag
  specifications: string[];
}

export const INITIAL_PRODUCTS: Product[] = [
  // Smartphones
  {
    id: "phone-iphone15pm",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Smartphones",
    price: "₹1,48,900",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop",
    description: "Forged in titanium, featuring the groundbreaking A17 Pro chip and a customisable Action button.",
    featured: true,
    specifications: ["Titanium Design", "A17 Pro Chip", "48MP Main Camera", "Super Retina XDR Display"],
  },
  {
    id: "phone-s24u",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    price: "₹1,29,999",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra, you can unleash whole new levels of creativity.",
    featured: true,
    specifications: ["Galaxy AI Built-in", "200MP Quad Telephoto", "Snapdragon 8 Gen 3", "Built-in S Pen"],
  },
  {
    id: "phone-nothing2",
    name: "Nothing Phone (2)",
    brand: "Nothing",
    category: "Smartphones",
    price: "₹42,999",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
    description: "A new way to interact. The Glyph Interface helps you focus on what matters most. Design that goes beneath the surface.",
    featured: false,
    specifications: ["Glyph Interface 2.0", "Nothing OS 2.0", "50 MP Dual Rear Camera", "Snapdragon 8+ Gen 1"],
  },
  
  // Audio
  {
    id: "audio-sonyxm5",
    name: "WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: "Audio",
    price: "₹29,990",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    description: "Redefining distraction-free listening with industry-leading noise cancellation and magnificent audio clarity.",
    featured: true,
    specifications: ["Industry Leading ANC", "30-Hour Battery Life", "Speak-to-Chat Technology", "Hi-Res Audio Wireless"],
  },
  {
    id: "audio-boseqc",
    name: "QuietComfort Ultra Earbuds",
    brand: "Bose",
    category: "Audio",
    price: "₹25,900",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
    description: "Breakthrough spatialised audio for more immersive listening, custom-tuned to the shape of your ears.",
    featured: true,
    specifications: ["CustomTune Sound Calibration", "Immersive Audio Mode", "World-class ANC", "Touch Control Gestures"],
  },
  
  // Smart Watches
  {
    id: "watch-apple9",
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "Smart Watches",
    price: "₹41,900",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=600&auto=format&fit=crop",
    description: "Smarter. Brighter. Mightier. A magical new way to use your watch without touching the screen.",
    featured: true,
    specifications: ["S9 SiP Processor", "Double Tap Gesture", "On-Device Siri", "Advanced Health Sensors"],
  },
  {
    id: "watch-galaxy6",
    name: "Galaxy Watch 6 Classic",
    brand: "Samsung",
    category: "Smart Watches",
    price: "₹36,999",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop",
    description: "Bring back the iconic rotating bezel. Track your sleep, monitor your heart rate, and elevate your everyday style.",
    featured: false,
    specifications: ["Rotating Bezel", "Body Composition Analysis", "Personalised Heart Rate Zone", "Exquisite Steel Case"],
  },

  // Home Appliances
  {
    id: "app-dysonv15",
    name: "V15 Detect Absolute Vacuum",
    brand: "Dyson",
    category: "Home Appliances",
    price: "₹65,900",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=600&auto=format&fit=crop",
    description: "The most powerful, intelligent cordless vacuum. Reveals microscopic dust with laser illumination.",
    featured: true,
    specifications: ["Laser Dust Detection", "Piezo Sensor Tech", "230 AW Suction Power", "Up to 60 Mins Run Time"],
  },
  {
    id: "app-philipsfryer",
    name: "Airfryer XXL Connected",
    brand: "Philips",
    category: "Home Appliances",
    price: "₹18,999",
    image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=600&auto=format&fit=crop",
    description: "Crispy taste with up to 90% less fat. Connected for smart cooking recommendations and easy meal prepping.",
    featured: false,
    specifications: ["Rapid Air Technology", "XXL Family Size", "NutriU App Integration", "Keep Warm Function"],
  },

  // Accessories (Dedicated accessory list)
  {
    id: "acc-magsafecase",
    name: "iPhone FineWoven Case with MagSafe",
    brand: "Apple",
    category: "Accessories",
    price: "₹5,900",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop",
    description: "Made from durable microtwill, the material has a soft, suede-like feel while protecting your iPhone.",
    featured: true,
    isAccessoryPageOnly: true,
    specifications: ["MagSafe Compatible", "Eco-friendly Fabric", "Scratch-resistant Coating"],
  },
  {
    id: "acc-ankercharger",
    name: "Anker Prime 67W Wall Charger",
    brand: "Anker",
    category: "Accessories",
    price: "₹3,999",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&auto=format&fit=crop",
    description: "Ultra-compact 3-port wall charger powered by GaN technology, capable of charging laptops and phones simultaneously.",
    featured: true,
    isAccessoryPageOnly: true,
    specifications: ["67W Power Delivery", "GaNPrime Tech", "ActiveShield 2.0 Safety"],
  },
  {
    id: "acc-spigenultra",
    name: "Spigen Ultra Hybrid Case",
    brand: "Spigen",
    category: "Accessories",
    price: "₹1,499",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop",
    description: "Crystal clear transparency highlights your phone's original design, with mil-grade drop protection.",
    featured: false,
    isAccessoryPageOnly: true,
    specifications: ["Air Cushion Technology", "Hybrid Structure", "Long-lasting Clarity"],
  },
  {
    id: "acc-belkincable",
    name: "Belkin BoostCharge USB-C Cable",
    brand: "Belkin",
    category: "Accessories",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop",
    description: "Engineered with a double-braided nylon exterior, giving you up to 30x more durability than ordinary cables.",
    featured: false,
    isAccessoryPageOnly: true,
    specifications: ["Braided Nylon Exterior", "USB-C to USB-C", "Supports up to 60W Power"],
  }
];

export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") {
    return INITIAL_PRODUCTS;
  }
  const stored = localStorage.getItem("maa_radio_products");
  if (!stored) {
    localStorage.setItem("maa_radio_products", JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("maa_radio_products", JSON.stringify(products));
  }
}
