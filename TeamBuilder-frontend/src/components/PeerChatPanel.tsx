import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { extractUser } from "@/lib/authUtils";
import {
  getConversation,
  sendDirectMessage,
  type DirectMessage,
} from "@/lib/messageApis";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";

export interface ChatPeer {
  id: string;
  name: string;
  email: string;
  courseId: string;
  course: string;
}

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

interface PeerChatPanelProps {
  peer: ChatPeer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PeerChatPanel: React.FC<PeerChatPanelProps> = ({ peer, open, onOpenChange }) => {
  const rawUser = useSelector((state: any) => state.auth.user);
  const currentUser = extractUser(rawUser);
  const currentUserId = currentUser?.id;

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!peer?.courseId || !peer?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await getConversation(peer.courseId, peer.id);
      setMessages(res.data || []);
    } catch {
      setError("Could not load messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [peer?.courseId, peer?.id]);

  useEffect(() => {
    if (open && peer) {
      loadMessages();
    } else {
      setDraft("");
      setMessages([]);
    }
  }, [open, peer, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peer || !draft.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await sendDirectMessage(peer.courseId, peer.id, draft.trim());
      const newMsg = res.data as DirectMessage;
      setMessages((prev) => [...prev, newMsg]);
      setDraft("");
    } catch {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        {peer && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                    {initialsOf(peer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <SheetTitle>{peer.name}</SheetTitle>
                  <SheetDescription>{peer.course}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1 px-4 py-4">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No messages yet. Say hello!
                </p>
              ) : (
                <BubbleGroup className="gap-3">
                  {messages.map((m) => {
                    const isMine = m.senderId === currentUserId;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                        <Bubble align={isMine ? "end" : "start"} variant={isMine ? "default" : "muted"}>
                          <BubbleContent>{m.content}</BubbleContent>
                        </Bubble>
                        <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </BubbleGroup>
              )}
            </ScrollArea>

            <form onSubmit={handleSend} className="flex gap-2 border-t p-4">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            {error && <p className="px-4 pb-3 text-xs text-destructive">{error}</p>}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PeerChatPanel;
