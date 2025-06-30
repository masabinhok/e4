import { create } from "zustand";



export interface Message {
  content: string, 
  type: 'success' | 'error' | 'info',
  onClose?: () => void;
  id?: number,
}

export interface MessageStore {
  messages : Message[],
  setMessages: (message: Message[]) => void;
  addMessage: (message: Message) => void;
  removeMessage: (id: number) =>void;
}


export const useMessageStore = create<MessageStore>((set, get) => ({
    messages: [],
    addMessage: (message) => {  
      const id = Date.now()+ Math.random()
        set((state)=> ({
          messages: [...state.messages, {...message, id}]
        }))
    },
    setMessages: (messages) => {
      set({messages})
    },  
    removeMessage: (id) => {
        const messageToRemove = get().messages.find(msg => msg.id === id)
        if(messageToRemove?.onClose){
          messageToRemove.onClose();
        }
        set((state)=>({
            messages: state.messages.filter((msg) => msg.id!== id)
        }))
    }
}))


