import { create } from "zustand";
import { PaperFormData } from "@/lib/validation";

interface Paper {
  title: string;
  authors: string;
  description: string;
  domains: string;
  paperFile: File;
  paperImage?: File;
}

interface PaperStore {
  papers: Paper[];
  isLoading: boolean;
  error: string | null;
  fetchPapers: () => Promise<void>;
  addPaper: (
    paper: PaperFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  setError: (error: string | null) => void;
}

export const usePaperStore = create<PaperStore>((set) => ({
  papers: [] as Paper[],
  isLoading: false,
  error: null,
  fetchPapers: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/research-paper");
      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }
      const papers = await response.json();
      set({ papers, isLoading: false, error: null });
    } catch (error) {
      set({ error: "Failed to fetch papers", isLoading: false });
    }
  },
  addPaper: async (paper) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(paper).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch("/api/research-paper", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create paper");
      }

      const newPaper = await response.json();
      set((state) => ({
        papers: [...state.papers, newPaper],
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
  setError: (error) => set({ error }),
}));
