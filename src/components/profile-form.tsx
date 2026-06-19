"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({ name }: { name?: string | null }) {
  const [value, setValue] = useState(name ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value })
    });
    const payload = await response.json();
    setSaving(false);
    setMessage(response.ok ? "Profile updated." : payload.error ?? "Update failed.");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input value={value} onChange={(event) => setValue(event.target.value)} />
      <Button onClick={save} disabled={saving || !value.trim()}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save"}
      </Button>
      {message ? <p className="self-center text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
