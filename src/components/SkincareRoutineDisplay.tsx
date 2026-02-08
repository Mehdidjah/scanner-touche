import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Calendar, Lightbulb, AlertTriangle } from "lucide-react";

// Import routine step images
import cleanserImg from "@/assets/routine/cleanser.png";
import tonerImg from "@/assets/routine/toner.png";
import serumImg from "@/assets/routine/serum.png";
import moisturizerImg from "@/assets/routine/moisturizer.png";
import sunscreenImg from "@/assets/routine/sunscreen.png";
import eyeCreamImg from "@/assets/routine/eye-cream.png";
import exfoliantImg from "@/assets/routine/exfoliant.png";
import maskImg from "@/assets/routine/mask.png";
import treatmentImg from "@/assets/routine/treatment.png";

export interface SkincareRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weeklyTreatments: string[];
  additionalTips: string[];
}

export interface RoutineStep {
  step: number;
  name: string;
  description: string;
  keyIngredients: string[];
}

interface SkincareRoutineDisplayProps {
  routine: SkincareRoutine;
  isLoading?: boolean;
}

// Map step names to images
const getStepImage = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("cleans") || lowerName.includes("wash")) return cleanserImg;
  if (lowerName.includes("toner") || lowerName.includes("tonic")) return tonerImg;
  if (lowerName.includes("serum") || lowerName.includes("essence")) return serumImg;
  if (lowerName.includes("moistur") || lowerName.includes("cream") || lowerName.includes("hydrat")) return moisturizerImg;
  if (lowerName.includes("sunscreen") || lowerName.includes("spf") || lowerName.includes("sun")) return sunscreenImg;
  if (lowerName.includes("eye")) return eyeCreamImg;
  if (lowerName.includes("exfoli") || lowerName.includes("scrub") || lowerName.includes("peel")) return exfoliantImg;
  if (lowerName.includes("mask")) return maskImg;
  if (lowerName.includes("treatment") || lowerName.includes("oil") || lowerName.includes("retinol")) return treatmentImg;
  return serumImg; // default
};

// Get color theme for step
const getStepTheme = (step: number, isEvening: boolean) => {
  const morningColors = [
    "from-amber-100 to-orange-100 border-amber-200",
    "from-sky-100 to-blue-100 border-sky-200",
    "from-amber-100 to-yellow-100 border-amber-200",
    "from-rose-100 to-pink-100 border-rose-200",
    "from-orange-100 to-amber-100 border-orange-200",
    "from-emerald-100 to-green-100 border-emerald-200",
  ];
  const eveningColors = [
    "from-indigo-100 to-purple-100 border-indigo-200",
    "from-violet-100 to-purple-100 border-violet-200",
    "from-blue-100 to-indigo-100 border-blue-200",
    "from-purple-100 to-pink-100 border-purple-200",
    "from-slate-100 to-gray-100 border-slate-200",
    "from-fuchsia-100 to-pink-100 border-fuchsia-200",
  ];
  const colors = isEvening ? eveningColors : morningColors;
  return colors[(step - 1) % colors.length];
};

function RoutineStepCard({ step, isEvening = false }: { step: RoutineStep; isEvening?: boolean }) {
  const image = getStepImage(step.name);
  const colorTheme = getStepTheme(step.step, isEvening);

  return (
    <div className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-br ${colorTheme} border`}>
      {/* Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-white/50 flex items-center justify-center p-2">
        <img src={image} alt={step.name} className="w-full h-full object-contain" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
        <div className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-foreground text-background text-xs sm:text-sm font-bold shrink-0">
            {step.step}
          </span>
          <h4 className="font-semibold text-sm sm:text-base leading-tight">{step.name}</h4>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
          {step.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {step.keyIngredients.slice(0, 3).map((ingredient) => (
            <Badge key={ingredient} variant="secondary" className="text-xs px-1.5 py-0.5">
              {ingredient}
            </Badge>
          ))}
          {step.keyIngredients.length > 3 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              +{step.keyIngredients.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function RoutineSection({ 
  title, 
  icon: Icon, 
  steps, 
  isEvening = false 
}: { 
  title: string; 
  icon: typeof Sun; 
  steps: RoutineStep[];
  isEvening?: boolean;
}) {
  const bgColor = isEvening ? "from-indigo-50 to-purple-50" : "from-amber-50 to-orange-50";
  const iconColor = isEvening ? "text-indigo-500" : "text-amber-500";
  
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bgColor} p-4 sm:p-6 space-y-4`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`p-2 sm:p-2.5 rounded-xl bg-white shadow-sm ${iconColor}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{steps.length} steps</p>
        </div>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <RoutineStepCard key={step.step} step={step} isEvening={isEvening} />
        ))}
      </div>
    </div>
  );
}

function TreatmentCard({ treatments }: { treatments: string[] }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl bg-white shadow-sm text-emerald-500">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg">Weekly Treatments</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{treatments.length} treatments</p>
        </div>
      </div>
      <div className="grid gap-2 sm:gap-3">
        {treatments.map((treatment, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-emerald-200"
          >
            <img src={maskImg} alt="Treatment" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <p className="text-xs sm:text-sm flex-1 pt-1">{treatment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipsCard({ tips }: { tips: string[] }) {
  const tipIcons = ["💧", "😴", "🥗", "🧘", "☀️", "💤"];
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl bg-white shadow-sm text-amber-500">
          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg">Lifestyle Tips</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{tips.length} tips for healthy skin</p>
        </div>
      </div>
      <div className="grid gap-2 sm:gap-3">
        {tips.map((tip, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-amber-200"
          >
            <span className="text-xl sm:text-2xl shrink-0">{tipIcons[index % tipIcons.length]}</span>
            <p className="text-xs sm:text-sm flex-1 pt-0.5 sm:pt-1">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkincareRoutineDisplay({ routine, isLoading }: SkincareRoutineDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 sm:h-40 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Disclaimer */}
      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-xs sm:text-sm">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Medical Disclaimer</p>
          <p className="text-muted-foreground mt-1">
            This AI-generated routine is for informational purposes only. Please consult a dermatologist for professional guidance.
          </p>
        </div>
      </div>

      {/* Routines Grid */}
      <div className="grid gap-4 sm:gap-6">
        {/* Morning Routine */}
        <RoutineSection 
          title="Morning Routine" 
          icon={Sun} 
          steps={routine.morning} 
          isEvening={false}
        />

        {/* Evening Routine */}
        <RoutineSection 
          title="Evening Routine" 
          icon={Moon} 
          steps={routine.evening} 
          isEvening={true}
        />

        {/* Weekly & Tips Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <TreatmentCard treatments={routine.weeklyTreatments} />
          <TipsCard tips={routine.additionalTips} />
        </div>
      </div>
    </div>
  );
}
