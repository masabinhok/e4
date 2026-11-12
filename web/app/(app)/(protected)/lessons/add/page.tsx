"use client";
import { FormEvent, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { api, errorMessage } from "@/lib/api";
import { useMessageStore } from "@/store/messageStore";
import { useSoundStore } from "@/store/useSoundStore";

export default function ContributeOpening() {
  const addMessage = useMessageStore((s) => s.addMessage);
  const playSound = useSoundStore((s) => s.playSound);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setSubmitting(true);
    try {
      await api("/openings/add", {
        method: "POST",
        body: JSON.stringify(data),
      });
      addMessage({
        content: "Submitted. An admin will review it.",
        type: "success",
      });
      playSound("achievement");
      form.reset();
    } catch (err) {
      addMessage({ content: errorMessage(err), type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-4 lg:py-10">
      <h1 className="text-3xl">Suggest a new opening</h1>
      <p className="mt-2 text-muted">
        Once an admin approves it, everyone can add lines to it.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Field
          label="Opening name"
          id="name"
          required
          maxLength={100}
          placeholder="Caro-Kann Defense"
        />
        <Field
          label="Short code"
          id="code"
          required
          maxLength={40}
          pattern="[a-z0-9-]+"
          placeholder="caro-kann"
          hint="Lowercase letters, numbers and dashes. Used in the lesson's web address."
        />
        <Field
          label="Description"
          id="description"
          multiline
          rows={4}
          required
          maxLength={1000}
        />
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
