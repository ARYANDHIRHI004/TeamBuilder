import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Pin, PinOff, Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { extractUser } from "@/lib/authUtils";
import {
  deleteTeamChatMessage,
  getTeamChatMessages,
  pinTeamChatMessage,
  sendTeamChatMessage,
  teamChatResourceUrl,
  type TeamChatMessage,
} from "@/lib/teamChatApis";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface TeamChatPanelProps {
  teamId: string;
  teamName: string;
  isMember: boolean;
  teamBlocked?: boolean;
}

export default function TeamChatPanel({
  teamId,
  teamName,
  isMember,
  teamBlocked,
}: TeamChatPanelProps) {
  const rawUser = useSelector((state: any) => state.auth.user);
  const currentUser = extractUser(rawUser);
  const currentUserId = currentUser?.id || rawUser?._id;

  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    if (!teamId || !isMember) return;
    setLoading(true);
    setError("");
    try {
      const res = await getTeamChatMessages(teamId);
      setMessages(res.data || []);
    } catch {
      setError("Could not load team chat.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, isMember]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || teamBlocked || (!draft.trim() && !file)) return;
    setSending(true);
    setError("");
    try {
      await sendTeamChatMessage(teamId, { content: draft, file: file || undefined });
      setDraft("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadMessages();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const togglePin = async (msg: TeamChatMessage) => {
    try {
      await pinTeamChatMessage(teamId, msg.id, !msg.isPinned);
      await loadMessages();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not update pin.");
    }
  };

  const removeMessage = async (msg: TeamChatMessage) => {
    if (!confirm("Delete this message for everyone?")) return;
    try {
      await deleteTeamChatMessage(teamId, msg.id);
      await loadMessages();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not delete message.");
    }
  };

  if (!isMember) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Team chat</CardTitle>
          <CardDescription>Join {teamName} to participate in discussions.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-[32rem] flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-base">Team chat</CardTitle>
        <CardDescription>
          Discuss with your team. Pin important messages or share files.
        </CardDescription>
        {teamBlocked && (
          <Badge variant="destructive" className="mt-1 w-fit">Team blocked — chat is read-only</Badge>
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 pb-4">
        <ScrollArea className="flex-1 rounded-md border bg-muted/20 p-3">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                const deleted = msg.isDeleted;
                return (
                  <li
                    key={msg.id}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      msg.isPinned ? "border-amber-400/60 bg-amber-500/5" : "bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {initialsOf(msg.sender?.name || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {msg.sender?.name || "Member"}
                            {isMine && <span className="text-muted-foreground font-normal"> (you)</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                      {!deleted && (
                        <div className="flex shrink-0 gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title={msg.isPinned ? "Unpin" : "Pin"}
                            onClick={() => togglePin(msg)}
                          >
                            {msg.isPinned ? (
                              <PinOff className="h-3.5 w-3.5" />
                            ) : (
                              <Pin className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            title="Delete"
                            onClick={() => removeMessage(msg)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {msg.isPinned && !deleted && (
                      <Badge variant="outline" className="mt-1 text-[10px] border-amber-500 text-amber-600">
                        Pinned
                      </Badge>
                    )}
                    <div className="mt-2">
                      {deleted ? (
                        <p className="italic text-muted-foreground">Message removed</p>
                      ) : (
                        <>
                          {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                          {msg.resourceUrl && msg.resourceName && (
                            <a
                              href={teamChatResourceUrl(msg.resourceUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex text-xs font-medium text-primary underline"
                            >
                              📎 {msg.resourceName}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div ref={bottomRef} />
        </ScrollArea>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {!teamBlocked && (
          <form onSubmit={handleSend} className="shrink-0 space-y-2">
            {file && (
              <p className="text-xs text-muted-foreground truncate">Attached: {file.name}</p>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the team..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || (!draft.trim() && !file)}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
