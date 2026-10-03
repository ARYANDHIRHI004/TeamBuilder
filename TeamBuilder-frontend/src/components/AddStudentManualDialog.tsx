import { useState } from "react";
import { Loader2, UserPlus, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addStudentsManual } from "@/lib/courseApis";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailsFromText(text: string): string[] {
  const parts = text.split(/[\n,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return Array.from(new Set(parts));
}

interface AddStudentManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName?: string;
  onEnrolled?: () => void;
}

export function AddStudentManualDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  onEnrolled,
}: AddStudentManualDialogProps) {
  const [tab, setTab] = useState("single");
  const [email, setEmail] = useState("");
  const [bulk, setBulk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const reset = () => {
    setEmail("");
    setBulk("");
    setError("");
    setResult(null);
    setTab("single");
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const submit = async (emails: string[]) => {
    const valid = emails.filter((e) => EMAIL_RE.test(e));
    const invalid = emails.length - valid.length;
    if (valid.length === 0) {
      setError(invalid > 0 ? "Enter at least one valid email address." : "Email is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await addStudentsManual(courseId, valid);
      const data = res.data || {};
      setResult({
        added: data.addedCount ?? 0,
        skipped: data.skippedCount ?? 0,
      });
      onEnrolled?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not enroll student(s).");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingle = (e: React.FormEvent) => {
    e.preventDefault();
    submit([email.trim().toLowerCase()]);
  };

  const handleBulk = (e: React.FormEvent) => {
    e.preventDefault();
    submit(parseEmailsFromText(bulk));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add students manually</DialogTitle>
          <DialogDescription>
            Enroll by email{courseName ? ` in ${courseName}` : ""}. No CSV file needed.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-semibold">
              {result.added} added
              {result.skipped > 0 ? `, ${result.skipped} already enrolled` : ""}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Add more
              </Button>
              <Button size="sm" onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">One student</TabsTrigger>
              <TabsTrigger value="bulk">Multiple</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="mt-4">
              <form onSubmit={handleSingle} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="student-email">Student email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter className="px-0">
                  <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enroll student
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            <TabsContent value="bulk" className="mt-4">
              <form onSubmit={handleBulk} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="student-bulk">Emails (one per line or comma-separated)</Label>
                  <Textarea
                    id="student-bulk"
                    rows={5}
                    placeholder={"alice@school.edu\nbob@school.edu"}
                    value={bulk}
                    onChange={(e) => setBulk(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter className="px-0">
                  <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enroll all
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface AddStudentManualButtonProps {
  isAdmin: boolean;
  courseId: string;
  courseName?: string;
  onEnrolled?: () => void;
}

export function AddStudentManualButton({
  isAdmin,
  courseId,
  courseName,
  onEnrolled,
}: AddStudentManualButtonProps) {
  const [open, setOpen] = useState(false);
  if (!isAdmin) return null;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Add student
      </Button>
      <AddStudentManualDialog
        open={open}
        onOpenChange={setOpen}
        courseId={courseId}
        courseName={courseName}
        onEnrolled={onEnrolled}
      />
    </>
  );
}
