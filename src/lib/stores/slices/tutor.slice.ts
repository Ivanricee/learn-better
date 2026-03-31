import type { StateCreator } from "zustand";

import type { TutorMessage } from "../../types";

export type TutorSlice = {
  conversations: Record<string, TutorMessage[]>;
  activeConversationId: string | null;
  tutorConsultsDuringRoleplay: number;

  addMessage: (categoryId: string, message: TutorMessage) => void;
  clearConversation: (categoryId: string) => void;
  incrementRoleplayConsults: () => void;
  resetRoleplayConsults: () => void;
};

export type TutorStore = TutorSlice;

export const createTutorSlice: StateCreator<TutorStore, [], [], TutorSlice> = (
  set,
) => ({
  conversations: {},
  activeConversationId: null,
  tutorConsultsDuringRoleplay: 0,

  addMessage: (categoryId, message) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [categoryId]: [...(state.conversations[categoryId] || []), message],
      },
    })),

  clearConversation: (categoryId) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [categoryId]: [],
      },
    })),

  incrementRoleplayConsults: () =>
    set((state) => ({
      tutorConsultsDuringRoleplay: state.tutorConsultsDuringRoleplay + 1,
    })),

  resetRoleplayConsults: () => set({ tutorConsultsDuringRoleplay: 0 }),
});
