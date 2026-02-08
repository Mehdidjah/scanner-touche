import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FaceScanCamera } from "@/components/FaceScanCamera";
import { DemographicForm } from "@/components/DemographicForm";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { analyzeImage, AnalysisResult } from "@/lib/skinAnalysis";
import { getRecommendations, RecommendationResult } from "@/lib/recommendations";
import { generateSkincareRoutine } from "@/lib/api";
import { SkincareRoutine } from "@/components/SkincareRoutineDisplay";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Shield, Zap, ArrowRight, Check } from "lucide-react";

type AnalysisStage = "uploading" | "detecting" | "classifying" | "recommending" | "generating" | "complete";

const Index = () => {
  const { toast } = useToast();

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>("uploading");
  const [progress, setProgress] = useState(0);

  // Results state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  }, []);

  const handleClearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const canSubmit = imageFile && ageGroup && gender;

  const handleAnalyze = async () => {
    if (!imageFile || !ageGroup || !gender) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and select your age group and gender.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisStage("uploading");

    try {
      // Stage 1: Uploading
      setProgress(10);
      await new Promise((r) => setTimeout(r, 500));

      // Stage 2: Detection
      setAnalysisStage("detecting");
      setProgress(30);

      const result = await analyzeImage(imageFile);
      setAnalysisResult(result);
      setProgress(50);

      // Stage 3: Classification (already done in analyzeImage)
      setAnalysisStage("classifying");
      setProgress(60);
      await new Promise((r) => setTimeout(r, 500));

      // Stage 4: Recommendations
      setAnalysisStage("recommending");
      setProgress(70);

      const conditionNames = result.detections.map((d) => d.name);
      const recs = getRecommendations(
        conditionNames,
        result.classification.skinType,
        ageGroup,
        gender
      );
      setRecommendations(recs);
      setProgress(85);

      // Stage 5: Generate routine
      setAnalysisStage("generating");
      setRoutineLoading(true);

      try {
        const generatedRoutine = await generateSkincareRoutine({
          skinType: result.classification.skinType,
          conditions: conditionNames,
          ageGroup,
          gender,
        });
        setRoutine(generatedRoutine);
      } catch (routineError) {
        console.error("Routine generation error:", routineError);
        toast({
          title: "Routine Generation Notice",
          description: "We couldn't generate your personalized routine. Please try again later.",
          variant: "default",
        });
      } finally {
        setRoutineLoading(false);
      }

      setProgress(100);
      setAnalysisStage("complete");

      await new Promise((r) => setTimeout(r, 500));
      setShowResults(true);
      setIsAnalyzing(false);

      toast({
        title: "Analysis Complete!",
        description: "Your personalized skin analysis is ready.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    setShowResults(false);
    setImageFile(null);
    setImagePreview(null);
    setAgeGroup("");
    setGender("");
    setAnalysisResult(null);
    setRecommendations([]);
    setRoutine(null);
    setProgress(0);
  };

  // Show results dashboard
  if (showResults && analysisResult && imagePreview) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">SkinSense AI</span>
            </div>
          </div>
        </header>
        <main className="container py-4 sm:py-8 px-4 sm:px-6">
          <ResultsDashboard
            imagePreview={imagePreview}
            analysisResult={analysisResult}
            recommendations={recommendations}
            routine={routine}
            routineLoading={routineLoading}
            onStartOver={handleStartOver}
          />
        </main>
        <footer className="border-t border-border py-4 sm:py-6 mt-8 sm:mt-12">
          <div className="container text-center text-xs sm:text-sm text-muted-foreground px-4">
            <p>© 2024 SkinSense AI. For informational purposes only. Not medical advice.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Show analysis progress
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnalysisProgress stage={analysisStage} progress={progress} />
        </div>
      </div>
    );
  }

  // Show main landing/form page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container py-3 sm:py-4 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">SkinSense AI</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Privacy First</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-16 md:py-24 border-b border-border">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI-Powered Skin Analysis & Personalized Care
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your photo and get instant skin condition detection, type classification,
              and personalized product recommendations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 sm:pt-4">
              {[
                "Detection",
                "Analysis",
                "Products",
                "Routine",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left: Image Capture (Camera Scan or Upload) */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Scan Your Face
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Position your face in the frame for automatic capture.
                  </p>
                </div>

                {/* Face Scanner (integrated in place of manual image upload) */}
                <FaceScanCamera onCapture={handleImageSelect} />
              </div>

              {/* Right: Demographics & Submit */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">Your Profile</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Help us personalize your recommendations.
                  </p>
                </div>

                <DemographicForm
                  ageGroup={ageGroup}
                  gender={gender}
                  onAgeGroupChange={setAgeGroup}
                  onGenderChange={setGender}
                />

                <Button
                  size="lg"
                  className="w-full gap-2 h-12 sm:h-14 text-base sm:text-lg"
                  onClick={handleAnalyze}
                  disabled={!canSubmit}
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analyze My Skin
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Privacy Notice */}
                <div className="p-3 sm:p-4 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-muted-foreground">
                      <strong>Privacy First:</strong> Your image is analyzed in real-time
                      and immediately deleted. We do not store your photos.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-card border-y border-border">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Advanced AI technology for comprehensive skin analysis
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Condition Detection",
                description: "Our AI detects acne, wrinkles, dark circles, pigmentation, and more with precision.",
                icon: "🔍",
              },
              {
                title: "Skin Classification",
                description: "Accurately classifies your skin as dry, oily, or normal with confidence scores.",
                icon: "📊",
              },
              {
                title: "Personalized Care",
                description: "Get matched with products and a custom skincare routine tailored to you.",
                icon: "✨",
              },
            ].map((feature) => (
              <div key={feature.title} className="p-4 sm:p-6 border border-border bg-background rounded-xl">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-border">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>SkinSense AI</span>
            </div>
            <p className="text-center sm:text-left">
              © 2024 SkinSense AI. AI-generated recommendations, not medical diagnoses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
