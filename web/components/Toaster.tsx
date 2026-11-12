"use client";
import Message from "@/components/Message";
import { useMessageStore } from "@/store/messageStore";

// The single place toasts render; pages only call addMessage().
export default function Toaster() {
  const { messages, removeMessage } = useMessageStore();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
    >
      {messages.map((msg) => (
        <Message
          key={msg.id}
          message={msg.content}
          type={msg.type}
          onClose={() => removeMessage(msg.id!)}
        />
      ))}
    </div>
  );
}
