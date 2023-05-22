import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import nookies, { destroyCookie, setCookie } from 'nookies'

type UserState = {
  user: any;
  token: any;
  error: string;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (firstName: string, lastName: string, organizationName: string, email: string, password: string) => void;
  stopLoading: () => void;
}

type UserAction = {
  updateUser: (updatedUser: UserState['user']) => void
}

const useUserStoreBase = create<UserState & UserAction>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: '',
      isLoggedIn: false,
      isLoading: true,
      updateUser: (updatedUser) => set(() => ({ user: { ...get().user, ...updatedUser } })),
      login: async (email, password) => {
        try {
          // call your authentication API and set the user state
          const authenticatedUser = await authenticateUser(email, password);
          set({ ...authenticatedUser, isLoggedIn: true, error: '' });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      logout: async () => {
        // clear the user state
        try {
          await logoutUser(get().token);
          set({ user: null, token: null, isLoggedIn: false, error: '' });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      signup: async (firstName, lastName, organizationName, email, password) => {
        try {
          // call your registration API and set the user state
          const registeredUser = await signupUser(firstName, lastName, organizationName, email, password);
          console.log(('registered success'))
          try {
            // login user after successful account creation
            const authenticatedUser = await authenticateUser(email, password);
            set({ ...authenticatedUser, isLoggedIn: true, error: '' });
          } catch (error: any) {
            set({ error: error.messsage });
          }
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      stopLoading: () => set(() => ({ isLoading: false }))
    }),
    { 
      name: "hypno",
      partialize: (state) => ({ token: state.token, user: state.user, isLoggedIn: state.isLoggedIn })
    }
  )
);

async function authenticateUser(email: string, password: string) {
  const payload = {
    username: email,
    password: password,
    grant_type: 'password',
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  };

  // Call your authentication API here and return the user object if the credentials are valid
  // If the credentials are invalid, throw an error
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth/token`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (response.status === 401) {
    throw new Error('Invalid email or password');
  } else if (response.status === 404) {
    throw new Error('User not found');
  } else if (!response.ok) {
    throw new Error('Something went wrong, please try again later');
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('Invalid response from server');
  }

  setCookie({}, 'hypno_token', data.access_token);
  return {
    token: {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    },
    user: {
      ...data.user,
      organization: data.organization
    }
  }
}

async function signupUser(first_name: string, last_name: string, username: string, email: string, password: string) {
  // Call your registration API here and return the registered user object
  const payload = {
    user: {
      first_name,
      last_name,
      username,
      email,
      password,
    },
  };

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/sign_up`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.status === 422) {
    throw new Error('User already exists with this email');
  } else if (!response.ok) {
    throw new Error('Something went wrong, please try again later');
  }

  const data = await response.json();
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
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Something went wrong, please try again later');
  }

  destroyCookie({}, 'hypno_token');
}

const useUserStore = createSelectorHooks(useUserStoreBase);

export default useUserStore;