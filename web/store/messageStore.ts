import { create } from "zustand";

export interface Message {
  content: string;
  type: "success" | "error" | "info";
  duration?: number;
  id?: number;
}

export interface MessageStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  removeMessage: (id: number) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  addMessage: (message) => {
    const id = Date.now() + Math.random();
    const newMessage = { ...message, id };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    const duration = message.duration || 3000;
    setTimeout(() => {
      get().removeMessage(id);
    }, duration);
  },
  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },
  clearMessages: () => {
    set({ messages: [] });
  },
}));
