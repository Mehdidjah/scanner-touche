// Sample skincare product database
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  skinConcerns: string[];
  skinType: string[];
  ageGroup: string[];
  gender: string[];
  description: string;
  rating: number;
  reviewsCount: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
    skinConcerns: ["dryness", "redness"],
    skinType: ["dry", "normal"],
    ageGroup: ["teen", "adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Gentle cleanser with hyaluronic acid and ceramides for daily use.",
    rating: 4.7,
    reviewsCount: 12450
  },
  {
    id: "2",
    name: "Salicylic Acid Cleanser",
    brand: "Paula's Choice",
    price: 29.00,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "whiteheads", "oily"],
    skinType: ["oily", "normal"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Effective BHA cleanser that unclogs pores and reduces breakouts.",
    rating: 4.6,
    reviewsCount: 8920
  },
  {
    id: "3",
    name: "Vitamin C Brightening Serum",
    brand: "SkinCeuticals",
    price: 166.00,
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=300&fit=crop",
    skinConcerns: ["pigmentation", "dark_circles", "wrinkles"],
    skinType: ["dry", "normal", "oily"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Premium vitamin C serum with 15% L-ascorbic acid for brighter skin.",
    rating: 4.8,
    reviewsCount: 5670
  },
  {
    id: "4",
    name: "Retinol Anti-Aging Cream",
    brand: "RoC",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=300&h=300&fit=crop",
    skinConcerns: ["wrinkles", "pigmentation"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Clinically proven retinol formula to reduce fine lines and wrinkles.",
    rating: 4.5,
    reviewsCount: 15230
  },
  {
    id: "5",
    name: "Niacinamide Pore Minimizer",
    brand: "The Ordinary",
    price: 6.50,
    imageUrl: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "pigmentation", "oily"],
    skinType: ["oily", "normal"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "10% niacinamide + zinc formula for reducing pore appearance.",
    rating: 4.4,
    reviewsCount: 32100
  },
  {
    id: "6",
    name: "Eye Repair Cream",
    brand: "Kiehl's",
    price: 52.00,
    imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&h=300&fit=crop",
    skinConcerns: ["dark_circles", "eye_bags", "wrinkles"],
    skinType: ["dry", "normal", "oily"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Rich eye cream targeting dark circles, puffiness, and fine lines.",
    rating: 4.3,
    reviewsCount: 7840
  },
  {
    id: "7",
    name: "Oil-Free Moisturizer SPF 30",
    brand: "Neutrogena",
    price: 15.99,
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "oily"],
    skinType: ["oily"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Lightweight, non-comedogenic moisturizer with broad spectrum SPF.",
    rating: 4.2,
    reviewsCount: 18900
  },
  {
    id: "8",
    name: "Intense Hydration Mask",
    brand: "Drunk Elephant",
    price: 38.00,
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop",
    skinConcerns: ["dryness", "redness"],
    skinType: ["dry"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "unisex"],
    description: "Ultra-hydrating overnight mask with marula oil and vitamin F.",
    rating: 4.6,
    reviewsCount: 4320
  },
  {
    id: "9",
    name: "Clarifying Toner",
    brand: "Thayers",
    price: 11.99,
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "redness"],
    skinType: ["oily", "normal"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Alcohol-free witch hazel toner with aloe vera for balanced skin.",
    rating: 4.5,
    reviewsCount: 28600
  },
  {
    id: "10",
    name: "Gentle Exfoliating Scrub",
    brand: "La Roche-Posay",
    price: 16.99,
    imageUrl: "https://images.unsplash.com/photo-1556228841-a3d8ca3bca70?w=300&h=300&fit=crop",
    skinConcerns: ["dryness", "pigmentation"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Micro-exfoliating scrub that gently buffs away dead skin cells.",
    rating: 4.3,
    reviewsCount: 6780
  },
  {
    id: "11",
    name: "Acne Spot Treatment",
    brand: "Mario Badescu",
    price: 17.00,
    imageUrl: "https://images.unsplash.com/photo-1556228994-7d27d77696b9?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "whiteheads"],
    skinType: ["oily", "normal"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Fast-acting drying lotion for overnight pimple treatment.",
    rating: 4.4,
    reviewsCount: 21300
  },
  {
    id: "12",
    name: "Ceramide Rich Cream",
    brand: "Dr. Jart+",
    price: 48.00,
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&h=300&fit=crop",
    skinConcerns: ["dryness", "redness"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Barrier-strengthening cream with 5 essential ceramides.",
    rating: 4.7,
    reviewsCount: 9450
  },
  {
    id: "13",
    name: "Freckle Fading Serum",
    brand: "Murad",
    price: 72.00,
    imageUrl: "https://images.unsplash.com/photo-1620756236308-65c3ef5d25f3?w=300&h=300&fit=crop",
    skinConcerns: ["freckles", "pigmentation"],
    skinType: ["dry", "normal", "oily"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Professional-grade serum that visibly reduces dark spots.",
    rating: 4.2,
    reviewsCount: 3210
  },
  {
    id: "14",
    name: "Mattifying Primer",
    brand: "e.l.f.",
    price: 10.00,
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop",
    skinConcerns: ["oily", "acne"],
    skinType: ["oily"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "unisex"],
    description: "Oil-control primer that keeps skin matte all day long.",
    rating: 4.1,
    reviewsCount: 15600
  },
  {
    id: "15",
    name: "Peptide Eye Gel",
    brand: "Olay",
    price: 28.99,
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop",
    skinConcerns: ["eye_bags", "dark_circles"],
    skinType: ["dry", "normal", "oily"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Cooling gel formula with peptides to de-puff and brighten eyes.",
    rating: 4.3,
    reviewsCount: 11200
  },
  {
    id: "16",
    name: "Hyaluronic Acid Booster",
    brand: "The Inkey List",
    price: 7.99,
    imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300&h=300&fit=crop",
    skinConcerns: ["dryness", "wrinkles"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "2% hyaluronic acid serum for deep hydration and plumping.",
    rating: 4.5,
    reviewsCount: 18700
  },
  {
    id: "17",
    name: "Clay Purifying Mask",
    brand: "Origins",
    price: 28.00,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "oily", "whiteheads"],
    skinType: ["oily", "normal"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Kaolin clay mask that deeply cleanses and tightens pores.",
    rating: 4.4,
    reviewsCount: 7890
  },
  {
    id: "18",
    name: "Soothing Aloe Gel",
    brand: "Holika Holika",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=300&h=300&fit=crop",
    skinConcerns: ["redness", "dryness"],
    skinType: ["dry", "normal", "oily"],
    ageGroup: ["teen", "adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "99% aloe vera gel for instant soothing and hydration.",
    rating: 4.6,
    reviewsCount: 24500
  },
  {
    id: "19",
    name: "Anti-Wrinkle Night Cream",
    brand: "Estée Lauder",
    price: 78.00,
    imageUrl: "https://images.unsplash.com/photo-1556228720-da98e18b5b3e?w=300&h=300&fit=crop",
    skinConcerns: ["wrinkles", "dryness"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "unisex"],
    description: "Luxurious night cream with advanced anti-aging technology.",
    rating: 4.7,
    reviewsCount: 6340
  },
  {
    id: "20",
    name: "Charcoal Pore Strips",
    brand: "Bioré",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop",
    skinConcerns: ["whiteheads", "oily"],
    skinType: ["oily", "normal"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Deep-cleansing strips that remove blackheads and impurities.",
    rating: 4.0,
    reviewsCount: 31200
  },
  {
    id: "21",
    name: "Men's Face Wash",
    brand: "Jack Black",
    price: 21.00,
    imageUrl: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "oily"],
    skinType: ["oily", "normal"],
    ageGroup: ["adult"],
    gender: ["male"],
    description: "Dual-action face wash designed for men's thicker skin.",
    rating: 4.5,
    reviewsCount: 8760
  },
  {
    id: "22",
    name: "Teen Acne Kit",
    brand: "Proactiv",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop",
    skinConcerns: ["acne", "whiteheads", "oily"],
    skinType: ["oily"],
    ageGroup: ["teen"],
    gender: ["female", "male", "unisex"],
    description: "Complete 3-step system for teenage acne-prone skin.",
    rating: 4.1,
    reviewsCount: 19800
  },
  {
    id: "23",
    name: "Collagen Booster Serum",
    brand: "Tatcha",
    price: 95.00,
    imageUrl: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=300&h=300&fit=crop",
    skinConcerns: ["wrinkles", "dryness"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "unisex"],
    description: "Japanese botanical serum that boosts collagen production.",
    rating: 4.8,
    reviewsCount: 4120
  },
  {
    id: "24",
    name: "Oil Control Lotion",
    brand: "Clinique",
    price: 32.00,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a10?w=300&h=300&fit=crop",
    skinConcerns: ["oily", "acne"],
    skinType: ["oily"],
    ageGroup: ["teen", "adult"],
    gender: ["female", "male", "unisex"],
    description: "Oil-free formula that controls shine without over-drying.",
    rating: 4.4,
    reviewsCount: 10340
  },
  {
    id: "25",
    name: "Barrier Repair Cream",
    brand: "First Aid Beauty",
    price: 36.00,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a07?w=300&h=300&fit=crop",
    skinConcerns: ["redness", "dryness"],
    skinType: ["dry", "normal"],
    ageGroup: ["adult", "senior"],
    gender: ["female", "male", "unisex"],
    description: "Ultra-repairing cream for sensitive, irritated skin.",
    rating: 4.6,
    reviewsCount: 7650
  }
];

// Condition name mappings for recommendation matching
export const conditionMappings: Record<string, string[]> = {
  acne: ["acne"],
  wrinkles: ["wrinkles"],
  dark_circles: ["dark_circles"],
  eye_bags: ["eye_bags"],
  redness: ["redness"],
  freckles: ["freckles"],
  whiteheads: ["whiteheads"],
  pigmentation: ["pigmentation"],
  dryness: ["dryness"],
};

export const skinTypeLabels: Record<string, string> = {
  dry: "Dry",
  oily: "Oily",
  normal: "Normal",
};

export const ageGroupLabels: Record<string, string> = {
  teen: "Teen (13-19)",
  adult: "Adult (20-59)",
  senior: "Senior (60+)",
};
