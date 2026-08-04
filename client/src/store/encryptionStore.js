import { create } from 'zustand';

export const useEncryptionStore = create((set) => ({
  // Text encryption
  textResult: null,
  setTextResult: (r) => set({ textResult: r }),

  // File encryption
  fileResult: null,
  setFileResult: (r) => set({ fileResult: r }),

  // Image encryption
  imageResult: null,
  setImageResult: (r) => set({ imageResult: r }),

  // Decryption
  decryptedText: null,
  setDecryptedText: (t) => set({ decryptedText: t }),

  // Analysis
  analysisResults: null,
  setAnalysisResults: (r) => set({ analysisResults: r }),

  // Jobs history
  jobs: [],
  setJobs: (j) => set({ jobs: j }),

  // Loading states
  loading: false,
  setLoading: (v) => set({ loading: v }),

  // Error
  error: null,
  setError: (e) => set({ error: e }),

  // Key settings
  masterKey: '',
  setMasterKey: (k) => set({ masterKey: k }),
  matrixSize: 4,
  setMatrixSize: (s) => set({ matrixSize: s }),
  rounds: 4,
  setRounds: (r) => set({ rounds: r }),

  // Clear
  clear: () => set({ textResult: null, fileResult: null, imageResult: null, decryptedText: null, error: null }),
}));
