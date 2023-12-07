import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import useUserStore from "@/store/userStore";
import _ from 'lodash';

export interface WithAuthProps {
  // isLoggedIn: boolean;
  // user: any;
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
    /**
   * For pages that are extensions of admin
   */
    'admin',
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
    const [hasMounted, setHasMounted] = useState<boolean>(false);
    useEffect(() => {
      setHasMounted(true);
    }, []);

    //*=========== STORE START ===========
    const isLoggedIn = useUserStore.useIsLoggedIn();
    const login = useUserStore.useLogin();
    const logout = useUserStore.useLogout();
    const user = useUserStore.useUser();
    const isProUser = useUserStore.useIsProUser() || !_.isEmpty(user?.username);
    const hasHydrated = useUserStore.use_hasHydrated();
    //*=========== STORE END ===========

    const checkAuth = useCallback(() => {
      if (!user) {
        isLoggedIn && logout();
        return;
      }
    }, [isLoggedIn, login, logout]);

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
      if (hasHydrated) {
        if (routeRole !== 'admin') {
          if (isLoggedIn) {
            if (!isProUser) {
              // Redirect to finish pro user registration
              router.replace('/finish');
            } else {
              // Prevent authenticated user from accessing auth or other role pages
              if (routeRole === 'auth' || router.pathname === '/finish') {
                if (query?.redirect) {
                  router.replace(query.redirect as string);
                } else {
                  router.replace(HOME_ROUTE);
                }
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

      }
    }, [isLoggedIn, hasHydrated, query, router, user]);

    if (!hasMounted) return null;
    if (!hasHydrated || (!isLoggedIn &&
      routeRole !== 'auth' &&
      routeRole !== 'optional'))
      return (
        <div className='flex min-h-screen flex-col items-center justify-center'>
          <span className="loading loading-ring loading-lg sm:w-[200px] text-primary"></span>
        </div>
      )
    // if (
    //   // If unauthenticated user want to access protected pages
    //   (isLoading || !isLoggedIn) &&
    //   // auth pages and optional pages are allowed to access without login
    //   routeRole !== 'auth' &&
    //   routeRole !== 'optional'
    // ) {
    //   return (
    //     <div className='flex min-h-screen flex-col items-center justify-center text-gray-800'>
    //       <p>Loading...</p>
    //     </div>
    //   );
    // }


    return <Component {...(props as T)} isLoggedIn={isLoggedIn} />;
  }

  return ComponentWithAuth;
}