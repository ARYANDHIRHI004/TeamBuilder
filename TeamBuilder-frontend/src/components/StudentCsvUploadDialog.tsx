import React, { useRef, useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ──────────────────────────────────────────────────────────────────
export interface StudentRow {
  email: string;
}

interface ParsedRow extends StudentRow {
  rowNumber: number;
  valid: boolean;
  errors: string[];
}

export interface UploadResult {
  successCount: number;
  failedEmails?: string[];
}

interface StudentCsvUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Persist the valid rows. Throw (or return failedEmails) to surface errors. */
  onUpload: (students: StudentRow[]) => Promise<UploadResult | void>;
}

interface UploadStudentsButtonProps {
  isAdmin: boolean;
  onUpload: (students: StudentRow[]) => Promise<UploadResult | void>;
  label?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_TEMPLATE = "email\naryan.verma@university.edu\n";

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s_]+/g, "");
}

function validateRow(raw: Record<string, string>, rowNumber: number): ParsedRow {
  const entries = Object.fromEntries(Object.entries(raw).map(([k, v]) => [normalizeKey(k), (v ?? "").trim()]));
  const email = entries["email"] || entries["emailaddress"] || "";

  const errors: string[] = [];
  if (!email) errors.push("Missing email");
  else if (!EMAIL_RE.test(email)) errors.push("Invalid email");

  return { rowNumber, email, valid: errors.length === 0, errors };
}

function downloadTemplate() {
  const blob = new Blob([REQUIRED_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Dialog ─────────────────────────────────────────────────────────────────
export function StudentCsvUploadDialog({ open, onOpenChange, onUpload }: StudentCsvUploadDialogProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const reset = () => {
    setRows([]);
    setFileName("");
    setParseError("");
    setResult(null);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const parseFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    setParsing(true);
    setParseError("");
    setResult(null);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (!res.data.length) {
          setParseError("That file doesn't contain any rows.");
          setRows([]);
        } else {
          setRows(res.data.map((r, i) => validateRow(r, i + 2))); // +2: header row + 1-indexed
        }
        setParsing(false);
      },
      error: (err) => {
        setParseError(err.message || "Couldn't read that file.");
        setParsing(false);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    setParseError("");
    try {
      const res = await onUpload(validRows.map(({ email }) => ({ email })));
      setResult(res || { successCount: validRows.length });
    } catch (err: any) {
      setParseError(err?.response?.data?.message || err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Students CSV</DialogTitle>
          <DialogDescription>
            Bulk-add students from a CSV file with an <code className="rounded bg-muted px-1 py-0.5 text-[11px]">email</code> column.
          </DialogDescription>
        </DialogHeader>

        {/* ── Success state ── */}
        {result ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-semibold text-foreground">
              {result.successCount} student{result.successCount === 1 ? "" : "s"} uploaded successfully
            </p>
            {!!result.failedEmails?.length && (
              <p className="max-w-sm text-xs text-muted-foreground">
                Couldn't add: {result.failedEmails.join(", ")}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Upload Another File
              </Button>
              <Button size="sm" onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Drop zone (shown until a file is parsed) ── */}
            {rows.length === 0 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                )}
              >
                {parsing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {parsing ? "Reading file..." : "Drag & drop your CSV, or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Only .csv files are supported</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) parseFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {parseError && <p className="text-sm text-destructive">{parseError}</p>}

            {/* ── Preview ── */}
            {rows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                      {validRows.length} valid
                    </Badge>
                    {invalidRows.length > 0 && (
                      <Badge variant="secondary" className="border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        {invalidRows.length} invalid
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">Row</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.rowNumber} className={cn(!r.valid && "bg-destructive/5")}>
                          <TableCell className="text-xs text-muted-foreground">{r.rowNumber}</TableCell>
                          <TableCell className="text-xs font-medium text-foreground">{r.email || "—"}</TableCell>
                          <TableCell>
                            {r.valid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <span title={r.errors.join(", ")}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {uploading && <Progress value={undefined} className="h-1.5 animate-pulse" />}
              </div>
            )}
          </>
        )}

        {!result && (
          <DialogFooter className="flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" /> Download Template
            </Button>
            <div className="flex gap-2">
              {rows.length > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={reset}>
                  Choose Different File
                </Button>
              )}
              <Button
                size="sm"
                disabled={validRows.length === 0 || uploading}
                className="gap-2"
                onClick={handleUpload}
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? "Uploading..." : `Upload ${validRows.length || ""} Student${validRows.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Trigger button, gated to admins only ────────────────────────────────────
export function UploadStudentsButton({ isAdmin, onUpload, label = "Upload Students CSV" }: UploadStudentsButtonProps) {
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        {label}
      </Button>
      <StudentCsvUploadDialog open={open} onOpenChange={setOpen} onUpload={onUpload} />
    </>
  );
}

export default StudentCsvUploadDialog;