import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface DemographicFormProps {
  ageGroup: string;
  gender: string;
  onAgeGroupChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

export function DemographicForm({
  ageGroup,
  gender,
  onAgeGroupChange,
  onGenderChange,
}: DemographicFormProps) {
  return (
    <div className="space-y-6">
      {/* Age Group Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Age Group</Label>
        <RadioGroup
          value={ageGroup}
          onValueChange={onAgeGroupChange}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: "teen", label: "Teen", sublabel: "13-19" },
            { value: "adult", label: "Adult", sublabel: "20-59" },
            { value: "senior", label: "Senior", sublabel: "60+" },
          ].map((option) => (
            <Label
              key={option.value}
              htmlFor={`age-${option.value}`}
              className={cn(
                "flex flex-col items-center justify-center p-4 border-2 cursor-pointer transition-all",
                "hover:border-primary/50 hover:bg-accent/30",
                ageGroup === option.value
                  ? "border-primary bg-accent/50"
                  : "border-border bg-card"
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={`age-${option.value}`}
                className="sr-only"
              />
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.sublabel}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Gender Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Gender</Label>
        <RadioGroup
          value={gender}
          onValueChange={onGenderChange}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: "female", label: "Female" },
            { value: "male", label: "Male" },
            { value: "unisex", label: "Any/Prefer not to say" },
          ].map((option) => (
            <Label
              key={option.value}
              htmlFor={`gender-${option.value}`}
              className={cn(
                "flex items-center justify-center p-4 border-2 cursor-pointer transition-all text-center",
                "hover:border-primary/50 hover:bg-accent/30",
                gender === option.value
                  ? "border-primary bg-accent/50"
                  : "border-border bg-card"
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={`gender-${option.value}`}
                className="sr-only"
              />
              <span className="font-medium text-sm">{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
