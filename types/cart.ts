export interface CartItem {
  productId: string;
  productName: string;
  category: string;
  price: string;
  priceAmount?: number;    // numeric price in priceCurrency
  priceCurrency?: string;  // e.g. 'INR', 'USD', 'EUR', 'CAD'
  image?: string;
  packaging: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
