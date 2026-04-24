import { useState, useRef } from "react";
import {
  MessageSquare, Paperclip, CheckCircle2, Upload, X,
  Send, ShieldCheck, Clock, Pencil,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import type { TaskRow } from "@/hooks/useProjectData";
import { useUpdateTask } from "@/hooks/useProjectData";
import { useAuth, useRole } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useTaskPersistence } from "@/hooks/useTaskPersistence";
import type { TaskComment, TaskDocument, SignOffRecord } from "@/hooks/useTaskPersistence";
import { toast } from "sonner";
import { format } from "date-fns";
import { PHASES } from "@/lib/templates";

const OWNERS = ["PM", "Marketing", "Executor", "Client", "All", "Other"];

interface TaskDetailDrawerProps {
  task: TaskRow | null;
  open: boolean;
  onClose: () => void;
}

function formatTime(iso: string) {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm");
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskDetailDrawer({ task, open, onClose }: TaskDetailDrawerProps) {
  const { user } = useAuth();
  const { isManager } = useRole();
  const { logAction } = useAuditLog();
  const updateTask = useUpdateTask();

  const { comments, addComment, documents, addDocuments, removeDocument, signOff, setSignOff } =
    useTaskPersistence(task?.id);

  const [newComment, setNewComment] = useState("");
  const [signOffNotes, setSignOffNotes] = useState("");
  const [showSignOffForm, setShowSignOffForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state — re-initialised from task prop
  const [editForm, setEditForm] = useState<{
    name: string;
    phase: TaskRow["phase"];
    owner: string;
    start_day: string;
    duration_days: string;
    priority: TaskRow["priority"];
    critical_path: boolean;
  } | null>(null);

  if (!task) return null;

  function openEdit() {
    setEditForm({
      name: task!.name,
      phase: task!.phase,
      owner: task!.owner ?? "",
      start_day: String(task!.start_day),
      duration_days: String(task!.duration_days),
      priority: task!.priority,
      critical_path: task!.critical_path,
    });
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm || !editForm.name.trim()) return;
    await updateTask.mutateAsync({
      id: task!.id,
      project_id: task!.project_id,
      name: editForm.name.trim(),
      phase: editForm.phase,
      owner: editForm.owner.trim() || null,
      start_day: Math.max(1, Number(editForm.start_day) || 1),
      duration_days: Math.max(1, Number(editForm.duration_days) || 1),
      priority: editForm.priority,
      critical_path: editForm.critical_path,
    });
    setEditForm(null);
  }

  function handleAddComment() {
    if (!newComment.trim() || !user) return;
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      author: user.name,
      role: user.role,
      body: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    addComment(comment);
    logAction("task_comment_added", { taskId: task.id, taskName: task.name });
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
      url: URL.createObjectURL(f),
    }));
    addDocuments(newDocs);
    logAction("task_document_uploaded", { taskId: task.id, files: files.map((f) => f.name) });
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
    logAction("task_signed_off", { taskId: task.id, taskName: task.name, manager: user.name });
    setShowSignOffForm(false);
    setSignOffNotes("");
    toast.success("Task signed off successfully");
  }

  function handleRevokeSignOff() {
    setSignOff(null);
    logAction("task_signed_off_revoked", { taskId: task.id, taskName: task.name });
    toast.success("Sign-off revoked");
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
            <TabsTrigger value="edit" className="flex-1 gap-1.5" onClick={openEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
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
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline truncate block"
                        >
                          {doc.name}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-foreground/60 truncate block" title="Link expired — re-upload to access">
                          {doc.name}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {doc.size} · {doc.uploadedBy} · {formatTime(doc.uploadedAt)}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-destructive border-destructive/30"
                    onClick={handleRevokeSignOff}
                  >
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

          {/* --- EDIT --- */}
          <TabsContent value="edit" className="mt-4">
            {editForm ? (
              <form onSubmit={submitEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-task-name">Task name</Label>
                  <Input
                    id="edit-task-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => f && { ...f, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Phase</Label>
                    <Select
                      value={editForm.phase}
                      onValueChange={(v) => setEditForm((f) => f && { ...f, phase: v as TaskRow["phase"] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PHASES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Owner</Label>
                    <Select
                      value={editForm.owner}
                      onValueChange={(v) => setEditForm((f) => f && { ...f, owner: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-start">Start day</Label>
                    <Input
                      id="edit-start"
                      type="number"
                      min={1}
                      value={editForm.start_day}
                      onChange={(e) => setEditForm((f) => f && { ...f, start_day: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-dur">Duration (days)</Label>
                    <Input
                      id="edit-dur"
                      type="number"
                      min={1}
                      value={editForm.duration_days}
                      onChange={(e) => setEditForm((f) => f && { ...f, duration_days: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select
                      value={editForm.priority}
                      onValueChange={(v) => setEditForm((f) => f && { ...f, priority: v as TaskRow["priority"] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["High", "Medium", "Low"] as const).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-cp"
                    checked={editForm.critical_path}
                    onCheckedChange={(v) => setEditForm((f) => f && { ...f, critical_path: !!v })}
                  />
                  <Label htmlFor="edit-cp" className="cursor-pointer font-normal">Critical path task</Label>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" disabled={updateTask.isPending}>
                    {updateTask.isPending ? "Saving…" : "Save changes"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditForm(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Click the <strong>Edit</strong> tab to edit this task.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
