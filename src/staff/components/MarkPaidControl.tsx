import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * "Mark paid" button that opens a note box + "email them" tick before it
 * records the payment. Used on Payroll (per person) and on a shift's page.
 */
export default function MarkPaidControl({
  label,
  disabled,
  onSubmit,
}: {
  label: string;
  disabled?: boolean;
  onSubmit: (note: string, notify: boolean) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);

  if (!open) {
    return (
      <Button size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }
  return (
    <form
      className="w-full space-y-2 sm:w-72"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await onSubmit(note.trim(), notify);
        setBusy(false);
        if (ok) {
          setOpen(false);
          setNote("");
        }
      }}
    >
      <Input
        placeholder="Note they'll see, e.g. Venmo Nov 9 (optional)"
        value={note}
        maxLength={200}
        onChange={(e) => setNote(e.target.value)}
        autoFocus
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[#1f3a4d]" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Email them that it's paid
      </label>
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={busy || disabled}>
          {busy ? "Saving…" : "Mark paid"}
        </Button>
        <Button size="sm" type="button" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
