import { useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Send, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProjectRow } from "@/hooks/useProjectData";
import { formatZAR } from "@/lib/format";

interface BudgetContext {
  project: ProjectRow;
  ticketRevenue?: number;
  actualSpend?: number;
}

interface AIAdvice {
  summary: string;
  recommendation: "increase" | "decrease" | "maintain" | "charge_more";
  reasoning: string;
  actions: string[];
  riskLevel: "low" | "medium" | "high";
}

function RecommendationChip({ rec }: { rec: AIAdvice["recommendation"] }) {
  const config: Record<AIAdvice["recommendation"], { label: string; icon: React.ReactNode; cls: string }> = {
    increase: {
      label: "Increase budget",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      cls: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    decrease: {
      label: "Decrease budget",
      icon: <TrendingDown className="h-3.5 w-3.5" />,
      cls: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    maintain: {
      label: "Maintain budget",
      icon: <Sparkles className="h-3.5 w-3.5" />,
      cls: "bg-green-500/10 text-green-400 border-green-500/30",
    },
    charge_more: {
      label: "Charge more for event",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      cls: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
  };
  const c = config[rec];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function RiskBadge({ level }: { level: AIAdvice["riskLevel"] }) {
  const cls = {
    low: "bg-green-500/10 text-green-400",
    medium: "bg-amber-500/10 text-amber-400",
    high: "bg-red-500/10 text-red-400",
  }[level];
  return <Badge className={`${cls} border-0`}>{level.charAt(0).toUpperCase() + level.slice(1)} risk</Badge>;
}

interface AIBudgetTabProps {
  project: ProjectRow;
}

export function AIBudgetTab({ project }: AIBudgetTabProps) {
  const [ticketRevenue, setTicketRevenue] = useState<string>("");
  const [actualSpend, setActualSpend] = useState<string>("");
  const [extraContext, setExtraContext] = useState<string>("");
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [followUp, setFollowUp] = useState("");

  async function fetchAdvice() {
    setLoading(true);
    setAdvice(null);
    setRawResponse("");

    const systemPrompt = `You are a financial advisor specialising in South African events and field activations. 
You analyse event budgets and provide practical, actionable advice. 
Always respond with a valid JSON object (no markdown fences) matching this structure exactly:
{
  "summary": "one paragraph summary",
  "recommendation": "increase" | "decrease" | "maintain" | "charge_more",
  "reasoning": "detailed paragraph explaining the recommendation",
  "actions": ["action 1", "action 2", "action 3"],
  "riskLevel": "low" | "medium" | "high"
}`;

    const userMsg = `Project: ${project.name}
Type: ${project.type}
Event date: ${project.event_date ?? "TBD"}
Location: ${project.location ?? "TBD"}
Allocated budget: ${formatZAR(project.budget_zar)}
Ticket revenue (so far): ${ticketRevenue ? `R ${Number(ticketRevenue).toLocaleString("en-ZA")}` : "Unknown"}
Actual spend (so far): ${actualSpend ? `R ${Number(actualSpend).toLocaleString("en-ZA")}` : "Unknown"}
Additional context: ${extraContext || "None provided"}

Please analyse this event budget and advise whether to increase, decrease, maintain the budget, or charge more for the event.`;

    const newHistory = [...chatHistory, { role: "user" as const, content: userMsg }];
    setChatHistory(newHistory);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newHistory,
        }),
      });

      const data = await res.json();
      const text = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("") ?? "";
      setRawResponse(text);

      try {
        const parsed: AIAdvice = JSON.parse(text);
        setAdvice(parsed);
        setChatHistory([...newHistory, { role: "assistant", content: text }]);
      } catch {
        setAdvice(null);
      }
    } catch (err) {
      console.error(err);
      setRawResponse("Failed to fetch AI advice. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function sendFollowUp() {
    if (!followUp.trim()) return;
    setLoading(true);

    const newHistory = [...chatHistory, { role: "user" as const, content: followUp }];
    setChatHistory(newHistory);
    setFollowUp("");

    const systemPrompt = `You are a financial advisor specialising in South African events and field activations.
Answer follow-up questions conversationally but concisely. Keep responses under 200 words.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("") ?? "";
      setChatHistory([...newHistory, { role: "assistant", content: text }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const followUpMessages = chatHistory.filter((_, i) => i > 1); // skip the initial analysis pair (0 & 1)

  return (
    <div className="mt-4 space-y-5">
      {/* Input card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Budget Advisor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Allocated budget</label>
              <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm font-semibold text-primary">
                {formatZAR(project.budget_zar)}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ticket revenue so far (ZAR)</label>
              <input
                type="number"
                min={0}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                placeholder="e.g. 45000"
                value={ticketRevenue}
                onChange={(e) => setTicketRevenue(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Actual spend so far (ZAR)</label>
              <input
                type="number"
                min={0}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                placeholder="e.g. 30000"
                value={actualSpend}
                onChange={(e) => setActualSpend(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Additional context</label>
            <Textarea
              placeholder="e.g. Venue cost increased by 20%, unexpected equipment rental needed, sponsor pulled out…"
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              className="min-h-[70px] resize-none"
            />
          </div>

          <Button onClick={fetchAdvice} disabled={loading} className="gap-2">
            {loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Analysing…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Get AI advice</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Result */}
      {advice && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="pt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <RecommendationChip rec={advice.recommendation} />
              <RiskBadge level={advice.riskLevel} />
            </div>

            <p className="text-sm text-foreground/90">{advice.summary}</p>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reasoning</p>
              <p className="text-sm text-foreground/80">{advice.reasoning}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended actions</p>
              <ul className="space-y-1.5">
                {advice.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback raw text */}
      {!advice && rawResponse && (
        <Card>
          <CardContent className="pt-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground/80">{rawResponse}</pre>
          </CardContent>
        </Card>
      )}

      {/* Follow-up chat */}
      {chatHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ask a follow-up question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Follow-up messages */}
            {followUpMessages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary/10 text-foreground ml-6"
                    : "bg-muted/50 text-foreground/90 mr-6"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  {msg.role === "user" ? "You" : "AI Advisor"}
                </span>
                {msg.content}
              </div>
            ))}

            <div className="flex gap-2">
              <Textarea
                placeholder="e.g. What if ticket sales drop by 30%? Should I reduce marketing spend?"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendFollowUp();
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={sendFollowUp}
                disabled={loading || !followUp.trim()}
                className="shrink-0 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">⌘+Enter to send</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
