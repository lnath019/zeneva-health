export type ProductCategory = "First Aid" | "Personal Care" | "Health & Wellness";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  image: string;
  description: string;
}

export const PRODUCTS: Product[] = [
  { id: "band-aid", name: "Band-Aid Strips (Assorted)", category: "First Aid", price: 90, unit: "box of 20", image: "/images/products/band-aid.jpg", description: "Waterproof adhesive bandages for minor cuts and scrapes." },
  { id: "gauze-roll", name: "Sterile Gauze Roll", category: "First Aid", price: 60, unit: "roll", image: "/images/products/gauze-roll.jpg", description: "Soft sterile gauze for wound dressing." },
  { id: "cotton-wool", name: "Cotton Wool Roll", category: "First Aid", price: 45, unit: "100g roll", image: "/images/products/cotton-wool.jpg", description: "Absorbent cotton for cleaning wounds." },
  { id: "elastic-bandage", name: "Elastic Crepe Bandage", category: "First Aid", price: 120, unit: "roll", image: "/images/products/elastic-bandage.jpg", description: "Stretchable bandage for sprains and support wraps." },
  { id: "hand-sanitizer", name: "Hand Sanitizer 100ml", category: "Personal Care", price: 110, unit: "100ml bottle", image: "/images/products/hand-sanitizer.jpg", description: "Alcohol-based sanitizer that kills 99.9% of germs." },
  { id: "antiseptic-wash", name: "Antiseptic Hand Wash", category: "Personal Care", price: 150, unit: "200ml bottle", image: "/images/products/antiseptic-wash.jpg", description: "Gentle antibacterial hand wash for daily use." },
  { id: "chapstick", name: "Moisturizing Lip Balm", category: "Personal Care", price: 80, unit: "stick", image: "/images/products/chapstick.jpg", description: "Soothing lip balm for dry and chapped lips." },
  { id: "sunscreen", name: "Sunscreen SPF 50", category: "Personal Care", price: 550, unit: "50ml tube", image: "/images/products/sunscreen.jpg", description: "Broad-spectrum sun protection for daily wear." },
  { id: "face-mask", name: "Disposable Face Masks", category: "Personal Care", price: 250, unit: "pack of 10", image: "/images/products/face-mask.jpg", description: "3-ply protective masks for everyday use." },
  { id: "body-lotion", name: "Moisturizing Body Lotion", category: "Personal Care", price: 320, unit: "200ml bottle", image: "/images/products/body-lotion.jpg", description: "Daily hydration for dry and sensitive skin." },
  { id: "mosquito-spray", name: "Mosquito Repellent Spray", category: "Health & Wellness", price: 190, unit: "100ml bottle", image: "/images/products/mosquito-spray.jpg", description: "Long-lasting protection against mosquitoes." },
  { id: "mosquito-cream", name: "Mosquito Repellent Cream", category: "Health & Wellness", price: 140, unit: "50g tube", image: "/images/products/mosquito-cream.jpg", description: "Skin-friendly repellent cream for outdoor use." },
  { id: "thermometer", name: "Digital Thermometer", category: "Health & Wellness", price: 350, unit: "1 unit", image: "/images/products/thermometer.jpg", description: "Fast, accurate digital temperature readings." },
  { id: "multivitamin", name: "Multivitamin Tablets", category: "Health & Wellness", price: 480, unit: "bottle of 30", image: "/images/products/multivitamin.jpg", description: "Daily multivitamin for general wellness." },
];

export const CATEGORIES: ProductCategory[] = ["First Aid", "Personal Care", "Health & Wellness"];
