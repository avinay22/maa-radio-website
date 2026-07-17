export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  specifications: string[];
  originalPrice: string;
  discountPrice?: string;
  discountPercentage?: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  stockStatus: string;
  warranty?: string;
  emiAvailable: boolean;
  freeGift?: string;
  comboOffer?: string;
  cashbackOffer?: string;
  offersAndPromotions?: string;
  isAccessoryPageOnly?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [];

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

