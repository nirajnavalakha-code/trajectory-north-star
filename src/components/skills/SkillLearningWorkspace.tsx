import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrajectoryLogo } from "@/components/TrajectoryLogo";
import { SkillCard } from "./SkillCard";
import { LearningPathItemCard } from "./LearningPathItemCard";
import { useSkillLearning } from "@/hooks/useSkillLearning";
import { calculatePathProgress, getMasteryLabel } from "@/types/skills";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Plus,
  Target,
  BookOpen,
  Loader2,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

interface SkillLearningWorkspaceProps {
  onBack: () => void;
  className?: string;
}

export const SkillLearningWorkspace = ({
  onBack,
  className,
}: SkillLearningWorkspaceProps) => {
  const [view, setView] = useState<"list" | "create" | "path">("list");
  const [userId, setUserId] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDescription, setNewSkillDescription] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");

  const {
    skills,
    activePath,
    isLoading,
    isGenerating,
    loadSkills,
    loadPathItems,
    generatePath,
    completePathItem,
    skipPathItem,
    setActivePath,
  } = useSkillLearning();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreatePath = async () => {
    if (!newSkillName.trim()) return;

    const result = await generatePath(newSkillName.trim(), newSkillDescription.trim() || undefined, currentLevel);
    
    if (result?.path?.id) {
      setNewSkillName("");
      setNewSkillDescription("");
      setCurrentLevel("beginner");
      setView("path");
    }
  };

  const handleSelectPath = async (pathId: string) => {
    await loadPathItems(pathId);
    setView("path");
  };

  const handleBackToList = () => {
    setActivePath(null);
    setView("list");
  };

  // Find the skill for the active path
  const activeSkill = activePath
    ? skills.find(s => s.learning_paths.some(p => p.id === activePath.id))
    : null;

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="fixed inset-0 bg-trajectory-radial pointer-events-none opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <TrajectoryLogo size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Skill Learning</h1>
          <p className="text-muted-foreground">
            Learn with structure. Master through application.
          </p>
        </div>

        {!userId ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Sign in to track your skills and learning paths.
            </p>
            <Button variant="trajectory" onClick={onBack}>
              Back to get started
            </Button>
          </div>
        ) : view === "list" ? (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <span className="font-medium">{skills.length} Skills</span>
              </div>
              <Button
                onClick={() => setView("create")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Learn New Skill
              </Button>
            </div>

            {/* Skills Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
                <p className="text-muted-foreground">Loading your skills...</p>
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <div className="p-4 rounded-full bg-secondary inline-block mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No skills yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Start learning a skill and Trajectory will build a personalized
                  path with dependency-ordered steps.
                </p>
                <Button onClick={() => setView("create")} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Learning
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {skills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onSelectPath={handleSelectPath}
                  />
                ))}
              </div>
            )}
          </>
        ) : view === "create" ? (
          /* Create New Skill Path */
          <div className="max-w-lg mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("list")}
              className="mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Skills
            </Button>

            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <div className="text-center mb-6">
                <div className="p-3 rounded-full bg-accent/10 inline-block mb-3">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl font-semibold mb-1">Learn a New Skill</h2>
                <p className="text-sm text-muted-foreground">
                  AI will design a structured path with dependency-ordered steps
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What skill do you want to learn?
                  </label>
                  <Input
                    placeholder="e.g., React, Product Management, Public Speaking"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Why learn this? (optional)
                  </label>
                  <Textarea
                    placeholder="Helps AI tailor the path to your goals..."
                    value={newSkillDescription}
                    onChange={(e) => setNewSkillDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Your current level
                  </label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Just starting</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                      <SelectItem value="advanced">Advanced - Looking to master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreatePath}
                  disabled={!newSkillName.trim() || isGenerating}
                  className="w-full gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Designing your path...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Learning Path
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Learning without application is incomplete. Your path will include
                practice and real-world application steps.
              </p>
            </div>
          </div>
        ) : view === "path" && activePath ? (
          /* Active Learning Path */
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Skills
            </Button>

            {/* Path Header */}
            <div className="p-6 rounded-xl border border-border bg-card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {activeSkill?.name}
                    </Badge>
                    {activeSkill && (
                      <Badge variant="secondary" className="text-xs">
                        {getMasteryLabel(activeSkill.mastery_level)}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{activePath.title}</h2>
                  {activePath.description && (
                    <p className="text-muted-foreground mt-1">
                      {activePath.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span>
                    {activePath.completed_items}/{activePath.total_items} steps
                  </span>
                </div>
                <Progress value={calculatePathProgress(activePath)} className="h-2" />
                {activePath.estimated_hours && (
                  <p className="text-xs text-muted-foreground">
                    ~{activePath.estimated_hours} hours total
                  </p>
                )}
              </div>
            </div>

            {/* Path Items */}
            <div className="space-y-3">
              {activePath.items.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Connection line */}
                  {index < activePath.items.length - 1 && (
                    <div className="absolute left-[22px] top-full h-3 w-0.5 bg-border" />
                  )}
                  <LearningPathItemCard
                    item={item}
                    onComplete={completePathItem}
                    onSkip={skipPathItem}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};
