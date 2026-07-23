import { StateCreator } from "zustand";
import type { AppStore } from "../useAppStore";
import { toast } from "sonner";
import {
  ChatConversation,
  ChatMessage,
  User,
} from "@/types";

export interface ChatSlice {
  conversations: ChatConversation[];
  activeConversationId: string | null;

  isRoastMode: boolean;
  toggleRoastMode: () => void;
  setRoastMode: (isRoastMode: boolean) => void;

  isMockInterview: boolean;
  toggleMockInterview: () => void;
  setMockInterview: (enabled: boolean) => void;

  isReadingMode: boolean;
  activeReadingMessageId: string | null;
  setReadingMode: (isReadingMode: boolean, activeReadingMessageId?: string | null) => void;

  sendMessage: (
  content: string,
  codeSnippet?: {
    language: string;
    code: string;
  },
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[],
  options?: {
    endInterview?: boolean;
  }
) => void;

  createNewConversation: (title?: string) => string;

  selectConversation: (id: string) => void;

  deleteConversation: (id: string) => void;
}

export const createChatSlice =
(
  INITIAL_CONVERSATIONS: ChatConversation[],
  DEFAULT_USER: User
): StateCreator<AppStore, [], [], ChatSlice> =>
(set, get) => ({

  conversations: INITIAL_CONVERSATIONS,

  activeConversationId: "conv-1",

  isRoastMode: false,
  toggleRoastMode: () => set((state) => {
    const isRoastMode = !state.isRoastMode;
    return { isRoastMode, isMockInterview: isRoastMode ? false : state.isMockInterview };
  }),
  setRoastMode: (isRoastMode) => set((state) => ({
    isRoastMode,
    isMockInterview: isRoastMode ? false : state.isMockInterview
  })),

  isMockInterview: false,
  toggleMockInterview: () => set((state) => {
    const isMockInterview = !state.isMockInterview;
    return { isMockInterview, isRoastMode: isMockInterview ? false : state.isRoastMode };
  }),
  setMockInterview: (enabled) => set((state) => ({
    isMockInterview: enabled,
    isRoastMode: enabled ? false : state.isRoastMode
  })),

  isReadingMode: false,
  activeReadingMessageId: null,
  setReadingMode: (isReadingMode, activeReadingMessageId = null) =>
    set({ isReadingMode, activeReadingMessageId }),

  sendMessage: (content, codeSnippet, attachments, options) =>
    set((state) => {

      const activeId = state.activeConversationId;
      const isRoastMode = state.isRoastMode;
      const isMockInterview = state.isMockInterview;
      const endInterview = options?.endInterview ?? false;

      if (!activeId) return {};

      const newMessage: ChatMessage = {
        id: "msg-usr-" + Math.random().toString(36).substr(2,9),
        role: "user",
        content,
        timestamp: new Date(),
        codeSnippet,
        attachments
      };

      const updatedConversations =
        state.conversations.map(conv=>{
          if(conv.id===activeId){
            return{
              ...conv,
              messages:[...conv.messages,newMessage],
              lastUpdated:new Date()
            };
          }
          return conv;
        });

      const aiMessageId =
        "msg-ai-"+Math.random().toString(36).substr(2,9);

      const initialAiMessage:ChatMessage={
        id:aiMessageId,
        role:"assistant",
        content:"",
        timestamp:new Date()
      };

      const updatedConversationsWithAi =
        updatedConversations.map(conv=>{
          if(conv.id===activeId){
            return{
              ...conv,
              messages:[
                ...conv.messages,
                initialAiMessage
              ]
            };
          }
          return conv;
        });

      (async()=>{

        try{

          const activeConv=get().conversations.find(
            c=>c.id===activeId
          );

          if(!activeConv)return;

          const apiMessages=[
            ...activeConv.messages,
            newMessage
          ].map(m=>({
            role:m.role,
            content:m.content
          }));

          const response=await fetch("/api/chat",{
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({
              messages:apiMessages,
              userContext:get().user||DEFAULT_USER,
              isRoastMode,
              isMockInterview,
              endInterview
            })
          });

          if(response.status===429){
            throw new Error("RATE_LIMIT_EXCEEDED");
          }

          if(!response.ok||!response.body){
            throw new Error("Failed");
          }

          const reader=response.body.getReader();

          const decoder=new TextDecoder();

          let aiContent="";

          while(true){

            const {done,value}=await reader.read();

            if(done)break;

            aiContent+=decoder.decode(value,{stream:true});

            set(s=>({

              conversations:s.conversations.map(c=>{

                if(c.id===activeId){

                  return{

                    ...c,

                    messages:c.messages.map(m=>

                      m.id===aiMessageId
                      ?{...m,content:aiContent}
                      :m
                    ),

                    lastUpdated:new Date()

                  };

                }

                return c;

              })

            }));

          }

        }

        catch(error){

          console.error(error);

          const isRateLimit=
            error instanceof Error &&
            error.message==="RATE_LIMIT_EXCEEDED";

          const errorMessage=isRateLimit
          ?"You have exceeded the rate limit."
          :"Sorry, something went wrong.";

          if(isRateLimit){
            toast.error(
              "Too many requests. Try again later."
            );
          }

          set(s=>({

            conversations:s.conversations.map(c=>{

              if(c.id===activeId){

                return{

                  ...c,

                  messages:c.messages.map(m=>

                    m.id===aiMessageId
                    ?{...m,content:errorMessage}
                    :m

                  )

                };

              }

              return c;

            })

          }));

        }

      })();

      return{

        conversations:updatedConversationsWithAi

      };

    }),

  createNewConversation:(title)=>{

    const id="conv-"+Math.random().toString(36).substr(2,9);

    const conv:ChatConversation={

      id,

      title:title||"New Mentor Guidance Session",

      messages:[

        {

          id:"msg-"+Math.random().toString(36).substr(2,9),

          role:"assistant",

          content:
          "Hello! I am your AI Career Mentor.",

          timestamp:new Date()

        }

      ],

      lastUpdated:new Date()

    };

    set(state=>({

      conversations:[conv,...state.conversations],

      activeConversationId:id

    }));

    return id;

  },

  selectConversation:(id)=>

    set({

      activeConversationId:id

    }),

  deleteConversation:(id)=>

    set(state=>{

      const updated=

        state.conversations.filter(c=>c.id!==id);

      return{

        conversations:updated,

        activeConversationId:

          state.activeConversationId===id

          ?updated[0]?.id??null

          :state.activeConversationId

      };

    })

});
