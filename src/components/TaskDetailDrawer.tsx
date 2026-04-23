import { useState, useRef } from "react";
import { MessageSquare, Paperclip, CheckCircle2, Upload, X, Send, ShieldCheck, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import type { TaskRow } from "@/hooks/useProjectData";
import { useAuth, useRole } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { format } from "date-fns";

// ---- Types ----

interface TaskComment {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: string;
}

interface TaskDocument {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

interface SignOffRecord {
  signedBy: string;
  role: string;
  signedAt: string;
  notes: string;
}

interface TaskDetailDrawerProps {
  task: TaskRow | null;
  open: boolean;
  onClose: () => void;
}

// ---- Helpers ----

function formatTime(iso: string) {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm");
  } catch {
    return iso;
  }
}

// ---- Component ----

export function TaskDetailDrawer({ task, open, onClose }: TaskDetailDrawerProps) {
  const { user } = useAuth();
  const { isManager } = useRole();
  const { logAction } = useAuditLog();

  // Local state — in prod these would be persisted via Supabase
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [signOff, setSignOff] = useState<SignOffRecord | null>(null);
  const [newComment, setNewComment] = useState("");
  const [signOffNotes, setSignOffNotes] = useState("");
  const [showSignOffForm, setShowSignOffForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task) return null;

  function handleAddComment() {
    if (!newComment.trim() || !user) return;
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      author: user.name,
      role: user.role,
      body: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, comment]);
    logAction("task_comment_added", { taskId: task!.id, taskName: task!.name });
    setNewComment("");
    toast.success("Comment added");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !user) return;

    const newDocs: TaskDocument[] = files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: formatBytes(f.size),
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      // In prod: upload to Supabase Storage and store the URL
      url: URL.createObjectURL(f),
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
    logAction("task_document_uploaded", { taskId: task!.id, files: files.map((f) => f.name) });
    toast.success(`${files.length} document${files.length > 1 ? "s" : ""} attached`);
    e.target.value = "";
  }

  function handleSignOff() {
    if (!user) return;
    const record: SignOffRecord = {
      signedBy: user.name,
      role: user.role,
      signedAt: new Date().toISOString(),
      notes: signOffNotes.trim(),
    };
    setSignOff(record);
    logAction("task_signed_off", { taskId: task!.id, taskName: task!.name, manager: user.name });
    setShowSignOffForm(false);
    setSignOffNotes("");
    toast.success("Task signed off successfully");
  }

  function removeDocument(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    logAction("task_document_removed", { taskId: task!.id });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono text-xs text-muted-foreground">{task.task_code}</span>
              <SheetTitle className="text-lg leading-snug">{task.name}</SheetTitle>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge value={task.status} />
            <PriorityBadge value={task.priority} />
            <Badge variant="outline">{task.phase}</Badge>
            {task.owner && <Badge variant="secondary">{task.owner}</Badge>}
          </div>
        </SheetHeader>

        <Separator className="mb-4" />

        <Tabs defaultValue="comments">
          <TabsList className="w-full">
            <TabsTrigger value="comments" className="flex-1 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 gap-1.5">
              <Paperclip className="h-3.5 w-3.5" />
              Docs ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="signoff" className="flex-1 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sign-off
            </TabsTrigger>
          </TabsList>

          {/* --- COMMENTS --- */}
          <TabsContent value="comments" className="mt-4 space-y-4">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-30" />
                <p className="text-sm">No comments yet. Be the first to add one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.author}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4">{c.role}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Textarea
                placeholder="Add a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment();
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">⌘+Enter to submit</span>
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Post
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* --- DOCUMENTS --- */}
          <TabsContent value="documents" className="mt-4 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv"
            />

            <Button
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload documents
            </Button>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Paperclip className="h-8 w-8 opacity-30" />
                <p className="text-sm">No documents attached yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                    <div className="min-w-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {doc.name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} · Uploaded by {doc.uploadedBy} · {formatTime(doc.uploadedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- SIGN OFF --- */}
          <TabsContent value="signoff" className="mt-4 space-y-4">
            {signOff ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Signed off</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">By:</span> {signOff.signedBy} ({signOff.role})</p>
                  <p><span className="text-muted-foreground">At:</span> {formatTime(signOff.signedAt)}</p>
                  {signOff.notes && (
                    <p><span className="text-muted-foreground">Notes:</span> {signOff.notes}</p>
                  )}
                </div>
                {isManager && (
                  <Button variant="outline" size="sm" className="mt-2 text-destructive border-destructive/30" onClick={() => setSignOff(null)}>
                    Revoke sign-off
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Awaiting manager sign-off.</p>
                </div>

                {isManager ? (
                  showSignOffForm ? (
                    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
                      <p className="text-sm font-medium">Sign off on this task</p>
                      <Textarea
                        placeholder="Optional notes or conditions…"
                        value={signOffNotes}
                        onChange={(e) => setSignOffNotes(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSignOff} className="gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" /> Confirm sign-off
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowSignOffForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setShowSignOffForm(true)} className="w-full gap-2">
                      <ShieldCheck className="h-4 w-4" /> Sign off task
                    </Button>
                  )
                ) : (
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground text-center">
                    Only managers and admins can sign off tasks.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
