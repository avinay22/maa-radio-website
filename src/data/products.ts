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

