// Simulated skin analysis using mock AI predictions
// In production, this would call actual YOLOv8 and ResNet-50 models

export interface DetectedCondition {
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ClassificationResult {
  skinType: "dry" | "oily" | "normal";
  confidence: number;
  probabilities: {
    dry: number;
    oily: number;
    normal: number;
  };
}

export interface AnalysisResult {
  detections: DetectedCondition[];
  classification: ClassificationResult;
  processingTimeMs: number;
}

const CONDITIONS = [
  "acne",
  "wrinkles",
  "dark_circles",
  "eye_bags",
  "redness",
  "freckles",
  "whiteheads",
  "pigmentation",
  "dryness",
] as const;

// Simulate YOLOv8 detection with realistic mock results
function simulateDetection(): DetectedCondition[] {
  const numConditions = Math.floor(Math.random() * 4) + 1; // 1-4 conditions
  const selectedConditions: string[] = [];
  const detections: DetectedCondition[] = [];

  while (selectedConditions.length < numConditions) {
    const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    if (!selectedConditions.includes(condition)) {
      selectedConditions.push(condition);
      
      // Generate realistic bounding box coordinates (normalized 0-1)
      const x = 0.15 + Math.random() * 0.5;
      const y = 0.15 + Math.random() * 0.5;
      const width = 0.1 + Math.random() * 0.2;
      const height = 0.1 + Math.random() * 0.15;

      detections.push({
        name: condition,
        confidence: 0.65 + Math.random() * 0.32, // 65-97% confidence
        boundingBox: {
          x: Math.min(x, 0.8),
          y: Math.min(y, 0.8),
          width: Math.min(width, 0.25),
          height: Math.min(height, 0.2),
        },
      });
    }
  }

  return detections.sort((a, b) => b.confidence - a.confidence);
}

// Simulate ResNet-50 classification with realistic mock results
function simulateClassification(): ClassificationResult {
  const skinTypes: ("dry" | "oily" | "normal")[] = ["dry", "oily", "normal"];
  const primaryType = skinTypes[Math.floor(Math.random() * skinTypes.length)];
  
  // Generate realistic probability distribution
  const primaryProb = 0.7 + Math.random() * 0.25; // 70-95%
  const remaining = 1 - primaryProb;
  const secondaryProb = remaining * (0.3 + Math.random() * 0.5);
  const tertiaryProb = remaining - secondaryProb;

  const probabilities = {
    dry: 0,
    oily: 0,
    normal: 0,
  };

  probabilities[primaryType] = primaryProb;
  
  const otherTypes = skinTypes.filter((t) => t !== primaryType);
  probabilities[otherTypes[0]] = secondaryProb;
  probabilities[otherTypes[1]] = tertiaryProb;

  return {
    skinType: primaryType,
    confidence: primaryProb,
    probabilities,
  };
}

// Main analysis function - simulates the AI pipeline
export async function analyzeImage(_imageFile: File): Promise<AnalysisResult> {
  const startTime = performance.now();
  
  // Simulate processing delay (1-2 seconds)
  await new Promise((resolve) => 
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  const detections = simulateDetection();
  const classification = simulateClassification();

  const processingTimeMs = performance.now() - startTime;

  return {
    detections,
    classification,
    processingTimeMs: Math.round(processingTimeMs),
  };
}

// Get condition display name
export function getConditionDisplayName(condition: string): string {
  const displayNames: Record<string, string> = {
    acne: "Acne",
    wrinkles: "Wrinkles",
    dark_circles: "Dark Circles",
    eye_bags: "Eye Bags",
    redness: "Redness",
    freckles: "Freckles",
    whiteheads: "Whiteheads",
    pigmentation: "Pigmentation",
    dryness: "Dryness",
  };
  return displayNames[condition] || condition;
}

// Get condition description
export function getConditionDescription(condition: string): string {
  const descriptions: Record<string, string> = {
    acne: "Inflammatory skin condition causing pimples and blemishes",
    wrinkles: "Fine lines and creases that develop with age",
    dark_circles: "Darkened skin under the eyes from various causes",
    eye_bags: "Puffiness or swelling under the eyes",
    redness: "Skin irritation or inflammation causing red patches",
    freckles: "Small brown spots on skin from sun exposure",
    whiteheads: "Closed comedones from clogged hair follicles",
    pigmentation: "Uneven skin tone or dark patches",
    dryness: "Lack of moisture causing flaky or tight skin",
  };
  return descriptions[condition] || "Skin condition detected";
}

// Get skin type description
export function getSkinTypeDescription(skinType: string): string {
  const descriptions: Record<string, string> = {
    dry: "Your skin lacks natural oils and may feel tight or flaky. Focus on hydration and moisturizing ingredients.",
    oily: "Your skin produces excess sebum and may appear shiny. Look for oil-free and mattifying products.",
    normal: "Your skin is well-balanced with minimal concerns. Maintain with a gentle, consistent routine.",
  };
  return descriptions[skinType] || "";
}
