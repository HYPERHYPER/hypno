import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import useUserStore from '@/store/userStore';
import debounce from 'lodash/debounce';

interface UserResult {
  avatar: string;
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

interface OrganizationResult {
  id: number;
  name: string;
  metadata: object;
}

interface EventResult {
  id: number;
  name: string;
  event_type: string;
}
interface SearchResults {
  users: Array<UserResult>;
  organizations: Array<OrganizationResult>;
  events: Array<EventResult>;
}

export default function UniversalSearch() {
  const router = useRouter();
  const { access_token: token } = useUserStore.useToken();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    organizations: [],
    events: [],
  });
  const [isChecked, setIsChecked] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);


  const clearInputAndResults = () => {
    setInput('');
    setSearchResults({ users: [], organizations: [], events: [] });
  };

  const fetchResults = async (query: string) => {
    setLoading(true);
    try {
      const searchUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/search?query=${query}`;
      const response = await fetch(searchUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSearchResults({
        users: data.results.users,
        organizations: data.results.organizations,
        events: data.results.events,
      });
    } catch (error) {
      console.error('Fetching error:', error);
    } finally {
      setLoading(false);
      console.log('results', searchResults);
    }
  };

  const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);

  useEffect(() => {
    if (input) debouncedFetchResults(input);
    else setSearchResults({ users: [], organizations: [], events: [] });
  }, [input, debouncedFetchResults]);

  useEffect(() => {
    if (isChecked) {
      searchInputRef.current?.focus();
    }
  }, [isChecked]);

  const handleSearchModal = () => {
    setIsChecked(true);
  };

  const handleClick = (route: string, id: number) => {
    router.push(`/${route}/${id}`); // Use router.push to navigate
  };

  function isEventResult(item: any): item is EventResult {
    return (item as EventResult).id !== undefined;
  }
  function isOrganizationResult(item: any): item is OrganizationResult {
    return (item as OrganizationResult).id !== undefined;
  }
  function isUserResult(item: any): item is UserResult {
    return (item as UserResult).id !== undefined;
  }

  const renderCategory = (category: keyof SearchResults) => {
    return (
      <>
        <thead>
          <tr>
            <th className='bg-base-100'>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </th>
          </tr>
        </thead>
        <tbody>
          {searchResults[category].length > 0 &&
            searchResults[category].map(
              (item: UserResult | OrganizationResult | EventResult, index) =>
                category === 'events' && isEventResult(item) ? (
                  <tr
                    key={category + index}
                    className='cursor-pointer bg-base-100 hover:bg-neutral-800'
                    onClick={() => handleClick('e', item.id)}
                  >
                    <td>
                      <span className='text-sm'>{`${item.name}`}</span>
                      <br />
                      <span
                        className={
                          item.event_type == 'hypno'
                            ? 'badge badge-sm badge-outline'
                            : 'badge badge-sm badge-outline badge-primary'
                        }
                      >
                        {item.event_type === 'hypno' ? 'iPad' : 'iPhone'}
                      </span>
                    </td>
                  </tr>
                ) : category === 'organizations' &&
                  isOrganizationResult(item) ? (
                  <tr
                    key={category + index}
                    className='cursor-pointer bg-base-100 hover:bg-neutral-800'
                  >
                    <td>
                      <div className='flex items-center gap-3'>
                        <div className='avatar placeholder'>
                          <div className='bg-neutral text-neutral-content rounded-full w-6'>
                            <span className='text-xs'>
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-bold'>{`${item.name}`}</div>
                          <div className='text-xs opacity-50'>{item.id}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  isUserResult(item) && (
                    <tr
                      key={category + index}
                      className='cursor-pointer bg-base-100 hover:bg-neutral-800'
                    >
                      <td>
                        <div className='flex items-center gap-3'>
                          {item.avatar === null ? (
                            <div className='avatar placeholder'>
                              <div className='bg-neutral text-neutral-content rounded-full w-6'>
                                <span className='text-xs'>{`${
                                  item.first_name.charAt(0).toUpperCase() +
                                  item.last_name.charAt(0).toUpperCase()
                                }`}</span>
                              </div>
                            </div>
                          ) : (
                            <div className='avatar'>
                              <div className='mask mask-squircle w-6 h-6'>
                                <img src={item.avatar} alt='avatar' />
                              </div>
                            </div>
                          )}
                          <div>
                            <div className='text-sm font-bold'>{`${item.first_name} ${item.last_name}`}</div>
                            <div className='text-xs opacity-50'>
                              {item.username}
                            </div>
                            <div className='text-xs opacity-50'>
                              {item.email}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                )
            )}
        </tbody>
      </>
    );
  };

  return (
    <>
      <label
        htmlFor='search_modal'
        className='btn p-0'
        onClick={() => handleSearchModal}
      >
        <span className='text-lg sm:text-xl font-thin'>search</span>
      </label>
      <input
        type='checkbox'
        id='search_modal'
        className='modal-toggle'
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
      />
      <div className='modal backdrop-blur-sm' role='dialog'>
        <div className='modal-box'>
          <label className='input bg-transparent flex items-center gap-2'>
            <input
              type='text'
              className='grow block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:border-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='Search...'
              id='search_input'
              ref={searchInputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label='Search'
            />
            {input.length > 0 ? (
              loading ? (
                <span className='loading loading-spinner h-4 w-4'></span>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  onClick={clearInputAndResults}
                  className='h-4 w-4 cursor-pointer'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              )
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 16 16'
                fill='currentColor'
                className='w-4 h-4 opacity-70'
              >
                <path
                  fillRule='evenodd'
                  d='M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </label>
          {input && (
            <div
              className='overflow-y-auto overflow-x-hidden w-auto mt-1'
              style={{ maxHeight: '400px' }}
            >
              <table className='table table-pin-rows'>
                {(
                  [
                    'events',
                    'organizations',
                    'users',
                  ] as (keyof SearchResults)[]
                ).map((category) => renderCategory(category))}
              </table>
            </div>
          )}
        </div>
        <label className='modal-backdrop' htmlFor='search_modal'>
          Close
        </label>
      </div>
    </>
  );
}
