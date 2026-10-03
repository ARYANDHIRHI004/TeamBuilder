import React, { useState } from "react";
import { createReview } from "@/lib/reviewApis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GiveFeedbackDialogProps {
  targetLabel: string;
  givenToUserId?: string;
  givenToTeamId?: string;
  trigger?: React.ReactNode;
}

const GiveFeedbackDialog: React.FC<GiveFeedbackDialogProps> = ({
  targetLabel,
  givenToUserId,
  givenToTeamId,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await createReview({
        review: text.trim(),
        givenToUserId,
        givenToTeamId,
      });
      setText("");
      setOpen(false);
      alert("Feedback submitted.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not submit feedback.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" size="sm" variant="outline">Give feedback</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback for {targetLabel}</DialogTitle>
          <DialogDescription>Share constructive feedback. It will appear on profiles and the admin feedback tab.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="feedback-text">Your feedback</Label>
            <Textarea
              id="feedback-text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What went well? What could improve?"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving || !text.trim()}>
              {saving ? "Submitting..." : "Submit feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GiveFeedbackDialog;
