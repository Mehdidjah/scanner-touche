// Product recommendation engine using cosine similarity
import { products, Product, conditionMappings } from "@/data/products";

export interface RecommendationResult {
  product: Product;
  similarityScore: number;
  matchingConcerns: string[];
}

// Simple TF-IDF-like vectorization for profile matching
function createProfileVector(
  conditions: string[],
  skinType: string,
  ageGroup: string,
  gender: string
): Map<string, number> {
  const vector = new Map<string, number>();

  // Weight conditions more heavily
  conditions.forEach((condition) => {
    const mapped = conditionMappings[condition] || [condition];
    mapped.forEach((c) => {
      vector.set(`concern_${c}`, (vector.get(`concern_${c}`) || 0) + 2);
    });
  });

  // Add skin type
  vector.set(`skintype_${skinType}`, 1.5);

  // Add age group
  vector.set(`age_${ageGroup}`, 1);

  // Add gender
  vector.set(`gender_${gender}`, 0.5);

  return vector;
}

// Create product vector
function createProductVector(product: Product): Map<string, number> {
  const vector = new Map<string, number>();

  // Concerns
  product.skinConcerns.forEach((concern) => {
    vector.set(`concern_${concern}`, 2);
  });

  // Skin types
  product.skinType.forEach((type) => {
    vector.set(`skintype_${type}`, 1.5);
  });

  // Age groups
  product.ageGroup.forEach((age) => {
    vector.set(`age_${age}`, 1);
  });

  // Genders
  product.gender.forEach((g) => {
    vector.set(`gender_${g}`, 0.5);
  });

  return vector;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number {
  const keys = new Set([...vec1.keys(), ...vec2.keys()]);

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  keys.forEach((key) => {
    const v1 = vec1.get(key) || 0;
    const v2 = vec2.get(key) || 0;
    dotProduct += v1 * v2;
    magnitude1 += v1 * v1;
    magnitude2 += v2 * v2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// Get product recommendations
export function getRecommendations(
  conditions: string[],
  skinType: string,
  ageGroup: string,
  gender: string,
  topK: number = 10
): RecommendationResult[] {
  const profileVector = createProfileVector(conditions, skinType, ageGroup, gender);

  const recommendations: RecommendationResult[] = [];

  products.forEach((product) => {
    // Check if product matches age and gender filters
    const matchesAge = product.ageGroup.includes(ageGroup) || product.ageGroup.includes("all");
    const matchesGender = product.gender.includes(gender) || product.gender.includes("unisex");

    if (!matchesAge || !matchesGender) return;

    const productVector = createProductVector(product);
    const similarity = cosineSimilarity(profileVector, productVector);

    // Find which concerns this product addresses
    const matchingConcerns = conditions.filter((condition) => {
      const mapped = conditionMappings[condition] || [condition];
      return mapped.some((c) => product.skinConcerns.includes(c));
    });

    // Also check if product matches skin type
    const matchesSkinType = product.skinType.includes(skinType);

    // Boost score if product matches more criteria
    let adjustedScore = similarity;
    if (matchesSkinType) adjustedScore += 0.1;
    if (matchingConcerns.length > 0) adjustedScore += 0.05 * matchingConcerns.length;

    recommendations.push({
      product,
      similarityScore: Math.min(adjustedScore, 1),
      matchingConcerns,
    });
  });

  // Sort by similarity score and return top K
  return recommendations
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topK);
}
