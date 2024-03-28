import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router"; // Import useRouter
import useUserStore from "@/store/userStore";
import debounce from "lodash/debounce";
import clsx from "clsx";
import _ from "lodash";

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
interface ErrorResponse {
  message: string;
}

export default function UniversalSearch() {
  const router = useRouter();
  const { access_token: token } = useUserStore.useToken();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    organizations: [],
    events: [],
  });
  const [isChecked, setIsChecked] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentTab, setCurrentTab] = useState<String>('events');

  const clearInputAndResults = () => {
    setInput("");
    setSearchResults({ users: [], organizations: [], events: [] });
  };

  const fetchResults = async (query: string) => {
    setLoading(true);
    setHasError(false);
    setErrorMessage("");
    try {
      const searchUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/search?query=${query}`;
      const response = await fetch(searchUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("something unexpected happened");
      }

      const data = await response.json();
      setSearchResults({
        users: data.results.users,
        organizations: data.results.organizations,
        events: data.results.events,
      });
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as ErrorResponse).message);
    } finally {
      setLoading(false);
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
    router.push(`/${route}/${id}`);
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

  const noResultsFound = !loading && input.length > 0 && _.isEmpty(searchResults[currentTab as keyof SearchResults]) && !hasError

  const renderCategory = (category: keyof SearchResults) => {
    return (
      <tbody key={category + "_content"}>
        {searchResults[category].length > 0 &&
          searchResults[category].map(
            (item: UserResult | OrganizationResult | EventResult, index) =>
              category === "events" && isEventResult(item) ? (
                <tr
                  key={category + index}
                  className="bg-base-100 cursor-pointer hover:bg-neutral-800 font-medium"
                  onClick={() => handleClick("e", item.id)}
                >
                  <td>
                    <span className="text-sm">{`${item.name}`}</span>
                    <br />
                    <div className="flex gap-2">
                      <span className="badge badge-sm badge-outline badge-primary">
                        {item.id}
                      </span>
                      <span
                        className={
                          item.event_type == "hypno"
                            ? "badge badge-sm badge-outline"
                            : "badge badge-sm badge-outline badge-primary"
                        }
                      >
                        {item.event_type === "hypno" ? "iPad" : "iPhone"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : category === "organizations" &&
                isOrganizationResult(item) ? (
                <tr
                  key={category + index}
                  className="bg-base-100 cursor-pointer hover:bg-neutral-800 font-medium"
                  onClick={() => handleClick("organizations", item.id)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content w-8 rounded-full">
                          <span className="text-xs">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">{`${item.name}`}</div>
                        <span className="badge badge-sm badge-outline badge-primary">
                          {item.id}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                isUserResult(item) && (
                  <tr
                    key={category + index}
                    className="bg-base-100 cursor-pointer hover:bg-neutral-800 font-medium"
                    onClick={() => handleClick("users", item.id)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        {item.avatar === null ? (
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content w-8 rounded-full">
                              <span className="text-xs">{`${item.first_name.charAt(0).toUpperCase() +
                                item.last_name.charAt(0).toUpperCase()
                                }`}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="avatar">
                            <div className="mask mask-circle h-8 w-8">
                              <img src={item.avatar} alt="avatar" />
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm">{`${item.first_name} ${item.last_name}`}</div>
                          <div className="text-sm opacity-50">
                            {item.username}
                          </div>
                          <div className="text-xs opacity-50">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ),
          )}
      </tbody>
    );
  };

  return (
    <>
      <label
        htmlFor="search_modal"
        className="btn border-0 bg-transparent p-0"
        onClick={() => handleSearchModal}
      >
        <span className="text-primary hover:text-white text-lg font-normal sm:text-xl transition">
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-7 w-7 sm:h-9 sm:w-9"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
        </span>
      </label>
      <input
        type="checkbox"
        id="search_modal"
        className="modal-toggle"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
      />
      <div className="modal modal-top z-10 backdrop-blur-sm cursor-pointer" role="dialog">
        <div className="modal-box pt-16 sm:px-12 bg-black">
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => setIsChecked(false)}
              className="h-9 sm:h-12 w-9 sm:w-12 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="max-w-2xl m-auto">
            <label className="flex items-center gap-2 bg-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-7 w-7 sm:h-9 sm:w-9 opacity-25"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                className={`input pro left text-md block w-full grow p-4 ${hasError ? "input-bordered input-error" : ""
                  } rounded-lg `}
                placeholder="search hypno"
                id="search_input"
                ref={searchInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Search"
              />
              {input.length > 0 && (
                loading ? (
                  <span className="loading loading-spinner h-7 w-7 sm:h-9 sm:w-9 opacity-25"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={clearInputAndResults}
                    className="h-7 w-7 sm:h-9 sm:w-9 cursor-pointer opacity-25"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )
              )}
            </label>
            <div role="tablist" className="tabs tabs-bordered pb-1 sm:pb-5 border-b-[1px] border-white/20">
              {([
                "events",
                "organizations",
                "users"
              ]).map((category) => (
                <a role="tab"
                  key={`${category}-tab`}
                  className={clsx(
                    "tab text-white/80 text-lg sm:text-3xl pl-1 pr-4",
                    currentTab == category && "tab-active"
                  )}
                  onClick={() => setCurrentTab(category)}
                >
                  {category}
                </a>
              ))}
            </div>
            {hasError && (
              <div className="mt-2 p-4">
                <h2 className="text-error">error{errorMessage}</h2>
              </div>
            )}
            {noResultsFound && (
              <div className="mt-2 p-4">
                <h2 className="text-white/40">no results found 😢</h2>
              </div>
            )}
            {input && (
              <div
                className="w-auto overflow-y-auto overflow-x-hidden max-h-[350px] sm:max-h-[400px] lg:max-h-[60vh]"
              >
                <table className="table-pin-rows table">
                  {renderCategory(currentTab as keyof SearchResults)}
                </table>
              </div>
            )}
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="search_modal"></label>
      </div>
    </>
  );
}
