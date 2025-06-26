import { create } from "zustand";



export interface Message {
  content: string, 
  type: 'success' | 'error' | 'info',
  onClose?: () => void;
}

export interface MessageStore {
  messages : Message[],
  setMessages: (message: Message[]) => void;
  addMessage: (message: Message) => void;
  removeMessage: (index: number) =>void;
}


export const useMessageStore = create<MessageStore>((set, get) => ({
    messages: [],
    addMessage: (message) => {  
        set((state)=> ({
          messages: [...state.messages, message]
        }))
    },
    setMessages: (messages) => {
      set({messages})
    },  
    removeMessage: (index) => {
        const messageToRemove = get().messages[index];
        if(messageToRemove?.onClose){
          messageToRemove.onClose();
        }
        set((state)=>({
            messages: state.messages.filter((_, i) => i !== index)
        }))
    }
}))


