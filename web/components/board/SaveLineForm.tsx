"use client";
import { FormEvent, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { api, errorMessage } from "@/lib/api";
import { useMessageStore } from "@/store/messageStore";
import { useSoundStore } from "@/store/useSoundStore";
import { BoardFlip } from "@/types/types";

type Props = {
  endpoint: string;
  moves: string[];
  side: BoardFlip;
  saveLabel: string;
  savedMessage: string;
  onSaved: () => void;
};

// Shared by Record and PGNs: name the line, describe it, save it.
export default function SaveLineForm({
  endpoint,
  moves,
  side,
  saveLabel,
  savedMessage,
  onSaved,
}: Props) {
  const addMessage = useMessageStore((s) => s.addMessage);
  const playSound = useSoundStore((s) => s.playSound);
  const [saving, setSaving] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const { title, description } = Object.fromEntries(new FormData(form));
    setSaving(true);
    try {
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify({ title, description, moves, boardflip: side }),
      });
      addMessage({ content: savedMessage, type: "success" });
      playSound("complete");
      form.reset();
      onSaved();
    } catch (err) {
      addMessage({
        content: errorMessage(err, "Couldn't save the line."),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <Field
        label="Name"
        id="title"
        required
        maxLength={100}
        placeholder="Advance Variation, Short System"
      />
      <Field
        label="What's the idea?"
        id="description"
        multiline
        rows={3}
        maxLength={1000}
        placeholder="Optional"
      />
      <Button type="submit" disabled={saving || moves.length === 0}>
        {saving ? "Saving…" : saveLabel}
      </Button>
      {moves.length === 0 && (
        <p className="text-sm text-muted">Play at least one move first.</p>
      )}
    </form>
  );
}
