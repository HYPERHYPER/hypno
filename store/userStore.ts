import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { destroyCookie, setCookie } from "nookies";
import { NewUser, UserInvite } from "@/types/users";
import axios from "axios";
import useOrgAccessStore from "./orgAccessStore";
// import { isHypnoUser } from '@/helpers/user-privilege';

type UserState = {
  user: any;
  token: any;
  error: string;
  isLoading: boolean;
  isProUser: boolean;
  isLoggedIn: boolean;
  _hasHydrated: boolean;
};

type UserAction = {
  updateUser: (updatedUser: UserState["user"]) => void;
  isHypnoUser: () => boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (user: NewUser, invite?: UserInvite) => void;
  finishProSignup: (
    first_name: string,
    last_name: string,
    username: string,
  ) => void;
  stopLoading: () => void;
  setHasHydrated: (state: any) => void;
};

const useUserStoreBase = create<UserState & UserAction>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: "",
      isLoggedIn: false,
      isLoading: false,
      isProUser: false,
      _hasHydrated: false,
      updateUser: (updatedUser) =>
        set(() => ({ user: { ...get().user, ...updatedUser } })),
      isHypnoUser: () => {
        const user = get().user;
        const isHypnoUser =
          user.role == "admin" && user.organization.id == 1 ? true : false;
        return isHypnoUser;
      },
      login: async (email, password) => {
        try {
          // call your authentication API and set the user state
          const authenticatedUser = await authenticateUser(email, password);
          const token = authenticatedUser.token.access_token;

          const checkUserProRegistration = await checkExistingUser(email);
          const isProUser = checkUserProRegistration.already_pro;
          // console.log("checkUser", checkUserProRegistration);

          set({ ...authenticatedUser, isLoggedIn: true, isProUser, error: "" });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      logout: async () => {
        // clear the user state
        try {
          await logoutUser(get().token);
          const resetOrgStore = useOrgAccessStore.getState().reset;
          resetOrgStore();
          set({
            user: null,
            token: null,
            isLoggedIn: false,
            isProUser: false,
            error: "",
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      signup: async (newUser, invite) => {
        try {
          // call your registration API and set the user state
          const registeredUser = await signupUser(newUser, invite);
          // console.log("registered success");
          try {
            // login user after successful account creation
            const authenticatedUser = await authenticateUser(
              newUser.email,
              newUser.password,
            );
            set({
              ...authenticatedUser,
              isLoggedIn: true,
              isProUser: true,
              error: "",
            });
          } catch (error: any) {
            set({ error: error.messsage });
          }
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      finishProSignup: async (first_name, last_name, username) => {
        // user must be logged in
        if (!get().isLoggedIn) return;
        const user = get().user;
        const token = get().token.access_token;
        try {
          const proUser = await completeProRegistration(
            {
              email: user.email,
              first_name,
              last_name,
              username,
            },
            token,
          );
          set({ user: proUser, isProUser: true });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      stopLoading: () => set(() => ({ isLoading: false })),
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "hypno",
      partialize: (state) => ({
        // ...state,
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

async function authenticateUser(email: string, password: string) {
  const payload = {
    username: email,
    password: password,
    grant_type: "password",
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  };

  // Call your authentication API here and return the user object if the credentials are valid
  // If the credentials are invalid, throw an error
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth/token`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("Invalid email or password");
  } else if (response.status === 404) {
    throw new Error("User not found");
  } else if (!response.ok) {
    throw new Error("Something went wrong, please try again later");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid response from server");
  }

  // setCookie({}, 'hypno_token', data.access_token, {
  //   encode: (v: any) => v,
  //   path: "/",
  //   httpOnly: true
  // });
  axios
    .post("/api/setCookie", { value: data.access_token })
    .then((response) => {
      // Cookie has been set on the server
      // You can perform any necessary actions here
    })
    .catch((error) => {
      // Handle any errors that occurred during the request
    });

  return {
    token: {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    },
    user: {
      ...data.user,
      organization: data.organization,
    },
  };
}

async function checkExistingUser(email: string) {
  const payload = {
    user: {
      email,
    },
  };

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/existing_user`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Something went wrong, please try again later");
  }

  const data = await response.json();
  // Resonse example -> { user_exists: true, already_pro: true }
  return data;
}

async function completeProRegistration(
  {
    email,
    first_name,
    last_name,
    username,
  }: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  },
  token: string,
) {
  const payload = {
    user: {
      email,
      first_name,
      last_name,
      username,
    },
  };

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/complete_pro_registration`;
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json(); // user object

  if (response.status === 422) {
    throw new Error(data.error);
  } else if (!response.ok) {
    throw new Error("Something went wrong, please try again later");
  }

  return data;
}

async function signupUser(user: NewUser, invite?: UserInvite) {
  // Call your registration API here and return the registered user object
  const payload = {
    user,
    ...(invite && { invite }),
  };

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/sign_up`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (response.status === 422) {
    throw new Error(data.error);
  } else if (!response.ok) {
    throw new Error("Something went wrong, please try again later");
  }

  return data;
}

async function logoutUser(token: string) {
  const payload = {
    token: token,
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  };

  // Call your authentication API here and return the user object if the credentials are valid
  // If the credentials are invalid, throw an error
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth/revoke`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Something went wrong, please try again later");
  }

  // destroyCookie(null, 'hypno');
  axios
    .delete("/api/deleteCookie")
    .then((response) => {
      // console.log('response', response);
      // Cookie has been deleted on the server
      // You can perform any necessary actions here
    })
    .catch((error) => {
      // Handle any errors that occurred during the request
    });
}

const useUserStore = createSelectorHooks(useUserStoreBase);

export default useUserStore;
