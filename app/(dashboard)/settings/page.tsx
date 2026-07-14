"use client";

// Net-new: neither uploaded phase included a Settings implementation.
// Minimal profile + preferences panel wired to the existing auth-context,
// so the route is functional rather than left as a stub.

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(user, { displayName });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <form onSubmit={handleSave} className="glass-card rounded-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-grey">Profile</h2>
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Trader name"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>Save changes</Button>
          {saved && <span className="text-sm text-profit">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
