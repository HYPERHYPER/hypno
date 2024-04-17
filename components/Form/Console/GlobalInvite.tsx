import axios from "axios";
import clsx from "clsx";
import _, { debounce } from "lodash";
import { useEffect, useState } from "react";
import useUserStore from "@/store/userStore";
import useOrgAccessStore from "@/store/orgAccessStore";
import { useForm } from "react-hook-form";
import { SaveStatus } from "@/components/Form/AutosaveStatusText";
import FormControl from "@/components/Form/FormControl";

const userRoles = [
  { name: "member", id: 3 },
  { name: "admin", id: 2 },
];

const GlobalInvite = () => {
  const token = useUserStore.useToken();
  const organizations = useOrgAccessStore.useOrganizations();
  const getOrganizations = useOrgAccessStore.useGetOrganizations();
  const isLoadingOrgs = useOrgAccessStore.useIsLoading();

  useEffect(() => {
    if (!!organizations.length) {
      getOrganizations();
    }
  }, []);

  const [status, setStatus] = useState<SaveStatus>("ready");

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      organization_id: _.first(organizations)?.id || 1,
      email: "",
      role: 3,
      price_id: "",
    },
  });

  const inviteData = watch();

  const inviteUser = async (data: any) => {
    setStatus("saving");

    if (!_.isEmpty(errors)) {
      console.log("submitForm errors", { errors });
      setStatus("error");
      return;
    }

    let payload = {
      invite: {
        ...data,
      },
    };

    console.log(payload);

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/global_invite`;
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
      onSubmit={handleSubmit(inviteUser)}
      className="border-t-2 border-white/20"
    >
      <FormControl label="organization">
        {organizations.length < 0 && isLoadingOrgs ? (
          <span className="loading loading-spinner loading-sm sm:loading-md" />
        ) : (
          <select
            onChange={(e) =>
              setValue("organization_id", Number(e.target.value))
            }
            value={inviteData.organization_id}
            className="select pro-form pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl"
          >
            {_.map(organizations, (o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        )}
      </FormControl>

      <FormControl label="email">
        <input
          className="input pro flex-1"
          placeholder="invitee@hypno.com"
          {...register("email")}
        />
      </FormControl>

      <FormControl label="role">
        <div className="flex gap-3 text-xl sm:text-4xl">
          {_.map(userRoles, (u, i) => (
            <span
              key={i}
              onClick={() => setValue("role", u.id)}
              className={clsx(
                "cursor-pointer transition",
                u.id == inviteData.role ? "text-primary" : "text-primary/40",
              )}
            >
              {u.name}
            </span>
          ))}
        </div>
      </FormControl>

      <FormControl label={status === "ready" ? "ready?" : ""}>
        <div className="text-xl sm:text-4xl ">
          {status === "ready" && (
            <button
              type="submit"
              className="tracking-[-0.03em] text-black bg-primary disabled:text-white/20 disabled:bg-white/10 py-1 px-3 sm:py-3 sm:px-5 rounded-[10px] sm:rounded-[15px] transition-colors"
              disabled={!inviteData.email}
            >
              send invite
            </button>
          )}
          {status === "saving" && (
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
    </form>
  );
};

export default GlobalInvite;
