"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ban, Loader2, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function UserAdminActions({ userId, banned, role }: { userId: string; banned: boolean; role: "USER" | "ADMIN" }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function run(action: "BAN" | "UNBAN" | "MAKE_ADMIN" | "MAKE_USER") {
    setLoading(action);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action })
    });
    setLoading("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant={banned ? "secondary" : "destructive"} onClick={() => run(banned ? "UNBAN" : "BAN")} disabled={loading !== ""}>
        {loading === "BAN" || loading === "UNBAN" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
        {banned ? "Unban" : "Ban"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => run(role === "ADMIN" ? "MAKE_USER" : "MAKE_ADMIN")} disabled={loading !== ""}>
        {role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        {role === "ADMIN" ? "User" : "Admin"}
      </Button>
    </div>
  );
}

export function TopicCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    theory: "",
    notes: "",
    visualGuide: ""
  });

  async function submit() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        commonMistakes: ["Missing edge cases", "Unclear invariant"],
        prerequisites: [],
        nextTopics: []
      })
    });
    const payload = await response.json();
    setSaving(false);
    setMessage(response.ok ? "Topic created." : payload.error ?? "Topic creation failed.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Topic title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      <Textarea placeholder="Theory" value={form.theory} onChange={(event) => setForm({ ...form, theory: event.target.value })} />
      <Textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      <Textarea placeholder="Visual guide" value={form.visualGuide} onChange={(event) => setForm({ ...form, visualGuide: event.target.value })} />
      <Button onClick={submit} disabled={saving}>
        {saving ? "Creating..." : "Create topic"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

export function ContestCreateForm({ problems }: { problems: { id: string; title: string }[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>(problems.slice(0, 3).map((problem) => problem.id));
  const [form, setForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: ""
  });

  async function submit() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/contests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, problemIds: selected })
    });
    const payload = await response.json();
    setSaving(false);
    setMessage(response.ok ? "Contest created." : payload.error ?? "Contest creation failed.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Contest title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <Textarea placeholder="Contest description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: new Date(event.target.value).toISOString() })} />
        <Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: new Date(event.target.value).toISOString() })} />
      </div>
      <Select value={selected[0] ?? ""} onChange={(event) => setSelected(Array.from(new Set([event.target.value, ...selected])).filter(Boolean).slice(0, 5))}>
        <option value="">Add problem</option>
        {problems.map((problem) => (
          <option key={problem.id} value={problem.id}>
            {problem.title}
          </option>
        ))}
      </Select>
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {selected.map((id) => problems.find((problem) => problem.id === id)?.title).filter(Boolean).join(", ")}
      </div>
      <Button onClick={submit} disabled={saving || selected.length === 0}>
        {saving ? "Creating..." : "Create contest"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
