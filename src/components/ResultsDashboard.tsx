import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DetectionResults } from "./DetectionResults";
import { ClassificationResults } from "./ClassificationResults";
import { ProductRecommendations } from "./ProductRecommendations";
import { SkincareRoutineDisplay, SkincareRoutine } from "./SkincareRoutineDisplay";
import { AnalysisResult, getConditionDisplayName } from "@/lib/skinAnalysis";
import { RecommendationResult } from "@/lib/recommendations";
import { Eye, Droplet, ShoppingBag, ListChecks, RefreshCw, Clock } from "lucide-react";

interface ResultsDashboardProps {
  imagePreview: string;
  analysisResult: AnalysisResult;
  recommendations: RecommendationResult[];
  routine: SkincareRoutine | null;
  routineLoading: boolean;
  onStartOver: () => void;
}

export function ResultsDashboard({
  imagePreview,
  analysisResult,
  recommendations,
  routine,
  routineLoading,
  onStartOver,
}: ResultsDashboardProps) {
  const { detections, classification, processingTimeMs } = analysisResult;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 bg-card border border-border rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Your Skin Analysis Results</h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {detections.length} detected
              </span>
              <span className="flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {classification.skinType}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {(processingTimeMs / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={onStartOver} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Quick Summary - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="p-3 sm:p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary">{detections.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Conditions</div>
        </div>
        <div className="p-3 sm:p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary capitalize">{classification.skinType}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Skin Type</div>
        </div>
        <div className="p-3 sm:p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary">{Math.round(classification.confidence * 100)}%</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Confidence</div>
        </div>
        <div className="p-3 sm:p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary">{recommendations.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Products</div>
        </div>
      </div>

      {/* Detected Conditions Tags - Scrollable on mobile */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {detections.map((detection, index) => (
          <span
            key={index}
            className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full"
          >
            {getConditionDisplayName(detection.name)}
          </span>
        ))}
      </div>

      {/* Tabs for detailed results - Mobile optimized */}
      <Tabs defaultValue="routine" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50">
          <TabsTrigger
            value="analysis"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xs:inline">Analysis</span>
          </TabsTrigger>
          <TabsTrigger
            value="routine"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm"
          >
            <ListChecks className="w-4 h-4" />
            <span className="hidden xs:inline">Routine</span>
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xs:inline">Products</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Detected Conditions</h3>
              <DetectionResults imagePreview={imagePreview} detections={detections} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Skin Type Classification</h3>
              <ClassificationResults classification={classification} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routine">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Personalized Skincare Routine</h3>
            {routine ? (
              <SkincareRoutineDisplay routine={routine} isLoading={routineLoading} />
            ) : routineLoading ? (
              <SkincareRoutineDisplay
                routine={{ morning: [], evening: [], weeklyTreatments: [], additionalTips: [] }}
                isLoading={true}
              />
            ) : (
              <div className="p-6 sm:p-8 text-center bg-card border border-border rounded-xl">
                <p className="text-muted-foreground text-sm sm:text-base">Routine generation failed. Please try again.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <ProductRecommendations recommendations={recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
