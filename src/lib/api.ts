import { SkincareRoutine } from "@/components/SkincareRoutineDisplay";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface GenerateRoutineParams {
  skinType: string;
  conditions: string[];
  ageGroup: string;
  gender: string;
}

export async function generateSkincareRoutine(
  params: GenerateRoutineParams
): Promise<SkincareRoutine> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-routine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate routine: ${response.status}`);
  }

  const routine = await response.json();
  return routine as SkincareRoutine;
}
