import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RoutineRequest {
  skinType: string;
  conditions: string[];
  ageGroup: string;
  gender: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skinType, conditions, ageGroup, gender }: RoutineRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional skincare consultant with expertise in dermatology. Generate evidence-based, personalized skincare routines.

IMPORTANT: You MUST respond with valid JSON only, no markdown, no additional text.

The JSON structure must be exactly:
{
  "morning": [
    {"step": 1, "name": "Step Name", "description": "Description", "keyIngredients": ["ingredient1", "ingredient2"]}
  ],
  "evening": [
    {"step": 1, "name": "Step Name", "description": "Description", "keyIngredients": ["ingredient1", "ingredient2"]}
  ],
  "weeklyTreatments": ["Treatment 1", "Treatment 2"],
  "additionalTips": ["Tip 1", "Tip 2"]
}`;

    const userPrompt = `Create a personalized skincare routine for someone with:
- Skin Type: ${skinType}
- Skin Conditions: ${conditions.length > 0 ? conditions.join(", ") : "None specific"}
- Age Group: ${ageGroup}
- Gender: ${gender}

Generate a comprehensive routine with:
- Morning routine: 5-6 steps
- Evening routine: 5-6 steps
- Weekly treatments: 2-3 recommendations
- Lifestyle tips: 3-4 tips

Consider the specific conditions and skin type when recommending products and ingredients. Be specific about ingredient benefits.

Remember: Respond with ONLY valid JSON, no markdown formatting.`;

    console.log("Calling Lovable AI Gateway for skincare routine generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response content:", content);

    // Parse the JSON response, handling potential markdown code blocks
    let routine;
    try {
      // Try to extract JSON from markdown code block if present
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      routine = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Content was:", content);
      
      // Return a fallback routine
      routine = {
        morning: [
          { step: 1, name: "Gentle Cleanser", description: `Start with a gentle cleanser suitable for ${skinType} skin.`, keyIngredients: ["Glycerin", "Ceramides"] },
          { step: 2, name: "Toner", description: "Balance your skin's pH with an alcohol-free toner.", keyIngredients: ["Hyaluronic Acid", "Niacinamide"] },
          { step: 3, name: "Serum", description: `Apply a targeted serum for your ${conditions.length > 0 ? conditions[0] : 'skin'} concerns.`, keyIngredients: ["Vitamin C", "Peptides"] },
          { step: 4, name: "Moisturizer", description: `Use a ${skinType === 'oily' ? 'lightweight gel' : 'rich cream'} moisturizer.`, keyIngredients: ["Ceramides", "Squalane"] },
          { step: 5, name: "Sunscreen", description: "Apply broad-spectrum SPF 30+ sunscreen.", keyIngredients: ["Zinc Oxide", "Titanium Dioxide"] }
        ],
        evening: [
          { step: 1, name: "Double Cleanse", description: "Remove makeup and sunscreen with an oil-based cleanser first.", keyIngredients: ["Jojoba Oil", "Vitamin E"] },
          { step: 2, name: "Water-Based Cleanser", description: "Follow with a gentle water-based cleanser.", keyIngredients: ["Ceramides", "Aloe Vera"] },
          { step: 3, name: "Exfoliant (2-3x/week)", description: "Use a chemical exfoliant to remove dead skin cells.", keyIngredients: ["AHA", "BHA"] },
          { step: 4, name: "Treatment Serum", description: "Apply targeted treatment for your skin concerns.", keyIngredients: ["Retinol", "Niacinamide"] },
          { step: 5, name: "Eye Cream", description: "Gently pat eye cream around the orbital bone.", keyIngredients: ["Peptides", "Caffeine"] },
          { step: 6, name: "Night Moisturizer", description: "Lock in moisture with a nourishing night cream.", keyIngredients: ["Shea Butter", "Ceramides"] }
        ],
        weeklyTreatments: [
          "Clay mask once a week to deep clean pores",
          "Hydrating sheet mask 1-2 times weekly",
          "Gentle physical exfoliation once a week"
        ],
        additionalTips: [
          "Drink at least 8 glasses of water daily for hydration",
          "Get 7-8 hours of quality sleep for skin repair",
          "Avoid touching your face throughout the day",
          "Change your pillowcase at least twice a week"
        ]
      };
    }

    return new Response(JSON.stringify(routine), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-routine function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
