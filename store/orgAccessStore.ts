import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { Organization } from "@/types/organizations";
import useUserStore from "./userStore";
import _ from "lodash";

type OrgAccessState = {
  organizations: Organization[]; // organizations that current user has access to
  error: string;
  isLoading: boolean;
  _hasHydrated: boolean;
};

type OrgAccessAction = {
  updateOrganizations: (
    updatedOrganizations: OrgAccessState["organizations"],
  ) => void;
  getOrganizations: () => void;
  setHasHydrated: (state: any) => void;
};

const useOrgAccessStoreBase = create<OrgAccessState & OrgAccessAction>()(
  persist(
    (set, get) => ({
      organizations: [],
      error: "",
      isLoading: false,
      _hasHydrated: false,
      updateOrganizations: (updatedOrganizations) =>
        set(() => ({ organizations: updatedOrganizations })),
      getOrganizations: async () => {
        const token = useUserStore.getState().token;
        if (_.isEmpty(get().organizations)) {
          set({ isLoading: true });
        }
        try {
          const organizations: Organization[] = await fetchOrganizations(
            token?.access_token,
          );
          set({ organizations, isLoading: false, error: "" });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "hypno",
      partialize: (state) => ({ ...state, organizations: state.organizations }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

async function fetchOrganizations(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/dropdown_index`;
  const res = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (res.status != 200) {
    throw new Error("Something went wrong fetching organization access");
  }

  return res.data.organizations;
}

const useOrgAccessStore = createSelectorHooks(useOrgAccessStoreBase);

export default useOrgAccessStore;
