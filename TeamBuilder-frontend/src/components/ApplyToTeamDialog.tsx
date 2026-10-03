import { useState } from "react";
import { applyToJoinTeam } from "@/lib/teamApis";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApplyToTeamDialogProps {
  teamId: string;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ApplyToTeamDialog({
  teamId,
  teamName,
  open,
  onOpenChange,
  onSuccess,
}: ApplyToTeamDialogProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = coverLetter.trim();
    if (text.length < 10) {
      alert("Please write at least a short cover letter (10+ characters).");
      return;
    }
    setSubmitting(true);
    try {
      await applyToJoinTeam(teamId, text);
      setCoverLetter("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to {teamName}</DialogTitle>
          <DialogDescription>
            Tell the team why you want to join. Team members and the leader can read this cover letter.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover letter</Label>
            <Textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Share your skills, availability, and what you hope to contribute..."
              rows={6}
              required
              disabled={submitting}
            />
            <p className="text-[11px] text-muted-foreground">{coverLetter.trim().length} characters (min. 10)</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || coverLetter.trim().length < 10}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
