import create from 'zustand'

interface PreviewReport {
    previewReport: boolean;
    setPreviewReport: (previewReport: boolean) => void;
}

export const usePreviewReport = create<PreviewReport>((set) => ({
    // default false on mobile and true on desktop
    previewReport: window.navigator.userAgent.includes('Mobile') ? false : true,
    setPreviewReport: (previewReport: boolean) => set({ previewReport }),
}));