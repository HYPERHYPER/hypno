import { getFromLocalStorage } from "@/lib/localStorage";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import useUserStore from "@/store/userStore";

export interface WithAuthProps {
  user: any;
}

const HOME_ROUTE = '/dashboard';
const LOGIN_ROUTE = '/login';

const ROUTE_ROLES = [
  /**
   * For authentication pages
   * @example /login /signup
   */
  'auth',
  /**
   * Optional authentication
   * It doesn't push to login page if user is not authenticated
   */
  'optional',
  /**
   * For all authenticated user
   * will push to login if user is not authenticated
   */
  'protected',
] as const;
type RouteRole = (typeof ROUTE_ROLES)[number];

/**
 * Add role-based access control to a component
 *
 * @see https://react-typescript-cheatsheet.netlify.app/docs/hoc/full_example/
 */
export default function withAuth<T>(
  Component: React.ComponentType<T>,
  routeRole: RouteRole
) {
  const ComponentWithAuth = (props: Omit<T, keyof WithAuthProps>) => {
    const router = useRouter();
    const { query } = router;
    const { accessToken } = query;

    //*=========== STORE START ===========
    const isLoggedIn = useUserStore.useIsLoggedIn();
    const isLoading = useUserStore.useIsLoading();
    const login = useUserStore.useLogin();
    const logout = useUserStore.useLogout();
    const stopLoading = useUserStore.useStopLoading();
    const user = useUserStore.useUser();
    //*=========== STORE END ===========

    const checkAuth = useCallback(() => {
      if (!user) {
          isLoggedIn && logout();
          stopLoading();
        return;
      }
      const loadUser = async () => {
        // TODO if accessToken passed from admin
        stopLoading();
        // try {
        //   const res = await apiMock.get<ApiReturn<User>>('/me');

        //   login({
        //     ...res.data.data,
        //     token: token + '',
        //   });
        // } catch (err) {
        //   localStorage.removeItem('token');
        // } finally {
        //   stopLoading();
        // }
      };

      // if (!isLoggedIn) {
      //   loadUser();
      // }
      stopLoading();
    }, [isLoggedIn, login, logout, stopLoading]);

    useEffect(() => {
      // run checkAuth every page visit
      checkAuth();

      // run checkAuth every focus changes
      window.addEventListener('focus', checkAuth);
      return () => {
        window.removeEventListener('focus', checkAuth);
      };
    }, [checkAuth]);

    useEffect(() => {
      if (!isLoading) {
        if (isLoggedIn) {
          // Prevent authenticated user from accessing auth or other role pages
          if (routeRole === 'auth') {
            if (query?.redirect) {
              router.replace(query.redirect as string);
            } else {
              router.replace(HOME_ROUTE);
            }
          }
        } else {
          // Prevent unauthenticated user from accessing protected pages
          if (routeRole !== 'auth' && routeRole !== 'optional') {
            router.replace(
              `${LOGIN_ROUTE}?redirect=${router.asPath}`,
              `${LOGIN_ROUTE}`
            );
          }
        }
      }
    }, [isLoggedIn, isLoading, query, router, user]);

    if (
      // If unauthenticated user want to access protected pages
      (isLoading || !isLoggedIn) &&
      // auth pages and optional pages are allowed to access without login
      routeRole !== 'auth' &&
      routeRole !== 'optional'
    ) {
      return (
        <div className='flex min-h-screen flex-col items-center justify-center text-gray-800'>
          <p>Loading...</p>
        </div>
      );
    }

    return <Component {...(props as T)} user={user} />;
  }

  return ComponentWithAuth;
}