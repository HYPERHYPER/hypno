import axios from "axios";
import _, { debounce } from "lodash";
import { useEffect, useCallback, useRef, useState } from "react";
import useUserStore from "@/store/userStore";
import { useForm } from "react-hook-form";
import FormControl from "@/components/Form/FormControl";

interface ErrorResponse {
  message: string;
}

const subscriptionTiers = [
  {
    name: "creator_yearly",
    id: process.env.NEXT_PUBLIC_CREATOR_YEARLY as string,
  },
  {
    name: "studio_yearly",
    id: process.env.NEXT_PUBLIC_STUDIO_YEARLY as string,
  },
  { name: "brand_yearly", id: process.env.NEXT_PUBLIC_BRAND_YEARLY as string },
  {
    name: "creator_monthly",
    id: process.env.NEXT_PUBLIC_CREATOR_MONTHLY as string,
  },
  {
    name: "studio_monthly",
    id: process.env.NEXT_PUBLIC_STUDIO_MONTHLY as string,
  },
  {
    name: "brand_monthly",
    id: process.env.NEXT_PUBLIC_BRAND_MONTHLY as string,
  },
];

const couponType = [{ name: "percentage" }, { name: "amount" }];

const monthlyDurations = [
  { name: "once" },
  { name: "forever" },
  { name: "repeating" },
];

const yearlyDurations = [{ name: "once" }, { name: "forever" }];

const CustomCheckout = () => {
  const token = useUserStore.useToken();

  const [status, setStatus] = useState("ready");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [couponDuration, setCouponDuration] = useState(monthlyDurations);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState<
    null | string
  >(null);
  const [selectedCouponType, setSelectedCouponType] = useState("percentage");
  const [selectedCouponDuration, setSelectedCouponDuration] = useState("once");

  const emailSearchInputRef = useRef<HTMLInputElement>(null);

  const clearInputAndResults = () => {
    setInput("");
    setResult(false);
  };

  const handleEmailInputResponse = (exists: boolean, pro: boolean) => {
    if (exists && !pro) {
      setErrorMessage(
        "User exists, but is not registered for pro. Have them log in to dashboard first.",
      );
      setHasError(true);
    } else if (!exists) {
      setErrorMessage("User does not exist, invite them first");
      setHasError(true);
    } else if (exists && pro) {
      setErrorMessage("");
      setHasError(false);
    }
  };

  const fetchResults = async (query: string) => {
    setLoading(true);
    setHasError(false);
    setErrorMessage("");
    let payload = {
      user: {
        email: query,
      },
    };

    try {
      const searchUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/existing_user`;
      const response = await fetch(searchUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("something unexpected happened");
      }

      const data = await response.json();
      // console.log("here", data);
      let resp = data.user_exists && data.already_pro;
      setResult(resp);
      handleEmailInputResponse(data.user_exists, data.already_pro);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as ErrorResponse).message);
    } finally {
      setLoading(false);
    }
  };

  // const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);
  // const debouncedFetchResults = useCallback(
  //   debounce((query) => fetchResults(query), 300),
  //   [],
  // );
  const debouncedFetchResults = useCallback(
    debounce((query) => fetchResults(query), 300),
    [],
  );

  useEffect(() => {
    if (input) debouncedFetchResults(input);
    else setResult(false);
  }, [input, debouncedFetchResults]);

  useEffect(() => {
    if (selectedSubscriptionType?.split("_")[1] === "yearly") {
      setCouponDuration(yearlyDurations);
    } else {
      setCouponDuration(monthlyDurations);
    }
  }, [selectedSubscriptionType]);

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      price_id: "",
      percent_off: 0, //float
      amount_off: 0,
      currency: "USD", //only required if 'amount_off'
      duration: "once",
      duration_in_months: 0, //only required if duration: "repeating"
      metadata: {},
      max_redemptions: 1,
      redeem_by: "", //expiry
    },
    mode: "onChange",
  });

  const emailInput = register("email", {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address",
    },
  });

  const percentOff = register("percent_off", {
    required: "Number is required",
    min: {
      value: 0,
      message: "Value must be at least 0",
    },
    max: {
      value: 100,
      message: "Value must not be more than 100",
    },
    pattern: {
      value: /^(?:0*(?:\.\d+)?|0*1?\d?\d(?:\.\d+)?)$/,
      message:
        "Invalid input. Please enter a positive number between 0 and 100",
    },
  });

  const amountOff = register("amount_off", {
    required: "Number is required",
    min: {
      value: 0,
      message: "Value must be at least 0",
    },
  });

  const customCheckoutData = watch();

  const sendCustomCheckout = async (data: any) => {
    setStatus("loading");

    if (!_.isEmpty(errors)) {
      console.log("submitForm errors", { errors });
      setStatus("error");
      return;
    }

    if (data.amount_off) {
      data.amount_off = parseInt(data.amount_off) * 100 + "";
    }

    let payload = {
      custom_checkout: {
        ...data,
      },
    };

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/custom_checkout`;
    await axios
      .post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.access_token,
        },
      })
      .then((res) => {
        console.log(res);
        setStatus("success");
        setTimeout(() => {
          setStatus("ready");
          reset();
        }, 3000);
      })
      .catch((e) => {
        console.log(e);
        setStatus("error");
        setTimeout(() => {
          setStatus("ready");
          reset();
        }, 8000);
      });
  };
  return (
    <form
      onSubmit={handleSubmit(sendCustomCheckout)}
      className="border-t-2 border-white/20"
    >
      <FormControl label="email">
        <label className="input flex items-center gap-2 bg-transparent">
          {result && (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.2426 16.3137L6 12.071L7.41421 10.6568L10.2426 13.4853L15.8995 7.8284L17.3137 9.24262L10.2426 16.3137Z"
                fill="currentColor"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
                fill="currentColor"
              />
            </svg>
          )}
          {((input.length > 0 && !result) || hasError) && (
            <div className="mt-2 text-right">
              <p className="label-text text-error text-xs">{errorMessage}</p>
            </div>
          )}
          <input
            {...emailInput}
            onChange={(e) => {
              emailInput.onChange(e); // Default handler from useForm
              setInput(e.target.value); // Custom handler to set input state
              setValue("email", e.target.value);
            }}
            type="text"
            className="input pro flex-1"
            placeholder="existing@user.com"
            id="search_input"
            ref={emailSearchInputRef}
            value={input}
            aria-label="Search"
          />
          {input.length > 0 ? (
            loading ? (
              <span className="loading loading-spinner h-4 w-4"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={clearInputAndResults}
                className="h-4 w-4 cursor-pointer"
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
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      </FormControl>

      {result && (
        <FormControl label="subscription type">
          <select
            onChange={(e) => {
              let option = e.target.selectedOptions[0].innerText;
              let priceId = subscriptionTiers.find(
                (h) => h.name === option,
              )!.id;
              setValue("price_id", priceId);
              setSelectedSubscriptionType(option);
            }}
            className="select pro-form pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl"
          >
            {_.map(subscriptionTiers, (option, i) => (
              <option key={i}>{option.name}</option>
            ))}
          </select>
        </FormControl>
      )}

      {!!result && !!customCheckoutData.price_id && (
        <FormControl label="coupon type">
          <select
            onChange={(e) => {
              setSelectedCouponType(e.target.value);
            }}
            defaultValue="percentage"
            className="select pro-form pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl"
          >
            {_.map(couponType, (option, i) => (
              <option key={i}>{option.name}</option>
            ))}
          </select>
        </FormControl>
      )}

      {!!customCheckoutData.price_id && selectedCouponType === "percentage" && (
        <FormControl label="percentage off">
          <label className="input flex items-center gap-2 bg-transparent">
            <input
              {...percentOff}
              type="number"
              onChange={(e) => {
                percentOff.onChange(e);
                setValue("percent_off", parseInt(e.target.value));
              }}
              className="input pro flex-1"
            />
          </label>
        </FormControl>
      )}

      {!!customCheckoutData.price_id && selectedCouponType === "amount" && (
        <FormControl label="amount off">
          <label className="input flex items-center gap-2 bg-transparent">
            <input
              {...amountOff}
              type="number"
              onChange={(e) => {
                amountOff.onChange(e);
                setValue("amount_off", parseInt(e.target.value));
              }}
              className="input pro flex-1"
            />
          </label>
        </FormControl>
      )}

      {(!!customCheckoutData.amount_off ||
        !!customCheckoutData.percent_off) && (
        <FormControl label="coupon duration">
          <select
            onChange={(e) => {
              setSelectedCouponDuration(e.target.value);
              setValue("duration", e.target.value);
            }}
            defaultValue="once"
            className="select pro-form pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl"
          >
            {_.map(couponDuration, (option, i) => (
              <option key={i}>{option.name}</option>
            ))}
          </select>
        </FormControl>
      )}

      {customCheckoutData.duration === "repeating" && (
        <FormControl label="duration in months">
          <label className="input flex items-center gap-2 bg-transparent">
            <input
              type="number"
              onChange={(e) =>
                setValue("duration_in_months", parseInt(e.target.value))
              }
              defaultValue="0"
              className="input pro flex-1"
            />
          </label>
        </FormControl>
      )}

      {((customCheckoutData.duration === "repeating" &&
        !!customCheckoutData.duration_in_months) ||
        customCheckoutData.duration === "once" ||
        customCheckoutData.duration == "forever") &&
        (!!customCheckoutData.amount_off ||
          !!customCheckoutData.percent_off) && (
          <FormControl label="ready?">
            <div className="text-xl sm:text-4xl ">
              <button
                type="submit"
                className="tracking-[-0.03em] text-black bg-primary disabled:text-white/20 disabled:bg-white/10 py-1 px-3 sm:py-3 sm:px-5 rounded-[10px] sm:rounded-[15px] transition-colors"
                // onClick={() => console.log("click", customCheckoutData)}
              >
                send custom checkout
              </button>

              {status === "loading" && (
                <span className="text-white/40">
                  sending <span className="loading" />
                </span>
              )}
              {status === "success" && (
                <span className="text-white/40">invite sent!</span>
              )}
              {status === "error" && (
                <span className="text-red-500">something went wrong...</span>
              )}
            </div>
          </FormControl>
        )}
    </form>
  );
};

export default CustomCheckout;
