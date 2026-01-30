import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuickDump } from "./QuickDump";
import { KnowledgeItemCard } from "./KnowledgeItemCard";
import { TrajectoryLogo } from "@/components/TrajectoryLogo";
import { 
  ArrowLeft, 
  Sparkles,
  Inbox,
  Clock,
  Ban,
  BookOpen
} from "lucide-react";
import { 
  KnowledgeItem, 
  KnowledgeItemType, 
  KnowledgePriority,
  KnowledgeItemInsert,
  extractDomain,
} from "@/types/knowledge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeWorkspaceProps {
  onBack: () => void;
  className?: string;
}

type FilterTab = "all" | "now" | "later" | "ignore" | "consumed";

export const KnowledgeWorkspace = ({ onBack, className }: KnowledgeWorkspaceProps) => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDumping, setIsDumping] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check auth and load items
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        loadItems(session.user.id);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadItems(session.user.id);
      } else {
        setUserId(null);
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadItems = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading knowledge items:", error);
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems((data as KnowledgeItem[]) || []);
    }
    setIsLoading(false);
  };

  const handleDump = async (data: { type: KnowledgeItemType; content?: string; url?: string; title?: string }) => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save knowledge items.",
        variant: "destructive",
      });
      return;
    }

    setIsDumping(true);

    const newItem: KnowledgeItemInsert & { source_domain?: string } = {
      user_id: userId,
      type: data.type,
      title: data.title,
      content: data.content,
      url: data.url,
      source_domain: data.url ? extractDomain(data.url) : undefined,
    };

    const { data: inserted, error } = await supabase
      .from("knowledge_items")
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error("Error saving knowledge item:", error);
      toast({
        title: "Error saving item",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems((prev) => [inserted as KnowledgeItem, ...prev]);
      toast({
        title: "Item saved",
        description: "AI will process and prioritize this soon.",
      });
    }

    setIsDumping(false);
  };

  const handleMarkConsumed = async (id: string) => {
    const { error } = await supabase
      .from("knowledge_items")
      .update({ is_consumed: true, consumed_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_consumed: true, consumed_at: new Date().toISOString() } : item
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("knowledge_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Item deleted" });
    }
  };

  const handleChangePriority = async (id: string, priority: KnowledgePriority) => {
    const { error } = await supabase
      .from("knowledge_items")
      .update({ priority })
      .eq("id", id);

    if (!error) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, priority } : item))
      );
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return !item.is_consumed;
    if (activeTab === "consumed") return item.is_consumed;
    return item.priority === activeTab && !item.is_consumed;
  });

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "all", label: "All", icon: <Inbox className="w-4 h-4" />, count: items.filter(i => !i.is_consumed).length },
    { key: "now", label: "Learn Now", icon: <Sparkles className="w-4 h-4" />, count: items.filter(i => i.priority === "now" && !i.is_consumed).length },
    { key: "later", label: "Later", icon: <Clock className="w-4 h-4" />, count: items.filter(i => i.priority === "later" && !i.is_consumed).length },
    { key: "ignore", label: "Ignored", icon: <Ban className="w-4 h-4" />, count: items.filter(i => i.priority === "ignore" && !i.is_consumed).length },
    { key: "consumed", label: "Consumed", icon: <BookOpen className="w-4 h-4" />, count: items.filter(i => i.is_consumed).length },
  ];

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
          <h1 className="font-display text-3xl font-bold mb-2">Knowledge Workspace</h1>
          <p className="text-muted-foreground">
            Dump anything. Trajectory organizes, prioritizes, and connects it to your goals.
          </p>
        </div>

        {/* Quick Dump */}
        <QuickDump onDump={handleDump} isLoading={isDumping} />

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Items List */}
        {!userId ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Sign in to save and organize your knowledge.
            </p>
            <Button variant="trajectory" onClick={onBack}>
              Back to get started
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your knowledge...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-secondary inline-block mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              {activeTab === "all"
                ? "Your workspace is empty. Dump some links or notes above."
                : `No items in "${tabs.find(t => t.key === activeTab)?.label}" yet.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <KnowledgeItemCard
                key={item.id}
                item={item}
                onMarkConsumed={handleMarkConsumed}
                onChangePriority={handleChangePriority}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
