import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { create } from 'zustand'

type BannerState = {
    open: boolean;
    dismiss: () => void;
};

const useBannerStoreBase = create<BannerState>((set) => ({
    open: false,
    dismiss: () => set(() => ({ open: false })),
}));

const useBannerStore = createSelectorHooks(useBannerStoreBase);

export default useBannerStore;