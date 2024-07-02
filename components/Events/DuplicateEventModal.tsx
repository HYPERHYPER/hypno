import axios from "axios";
import Modal from "../Modal";
import useUserStore from "@/store/userStore";
import { useState } from "react";
import { SaveStatus } from "../Form/AutosaveStatusText";
import _ from "lodash";
import clsx from "clsx";
import { useRouter } from "next/router";

interface Props {
  modalId: string;
  eventId: string;
  eventName: string;
}

export default function DuplicateEventModal({
  modalId,
  eventId,
  eventName,
}: Props) {
  const router = useRouter();
  const { access_token } = useUserStore.useToken();
  const [duplicateScreens, setDuplicateScreens] = useState(true);
  const [status, setStatus] = useState<SaveStatus>("ready");
  const [countdown, setCountdown] = useState(3);

  const handleToggle = () => {
    setDuplicateScreens(!duplicateScreens);
  };

  const handleDuplicateEvent = async () => {
    setStatus("saving");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}/duplicate_event`;
    const token = access_token;
    let payload = {
      duplicate_screens: duplicateScreens,
    };
    await axios
      .post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then(async (res) => {
        if (res.status === 200) {
          setStatus("success");
          startCountdown(res.data.event.id);
          // setTimeout(() => {
          //   router.push(
          //     `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/e/${res.data.id}`,
          //   );
          //   // setStatus("ready");
          // }, 3000);
        }
      })
      .catch((e) => {
        console.log(e);
        setStatus("error");
      });
  };

  const startCountdown = (newEventId: number) => {
    setCountdown(3);
    const intervalId = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(intervalId);
          (document.getElementById(modalId) as HTMLInputElement).checked =
            false;
          router.push(
            `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/e/${newEventId}`,
          );
          setStatus("ready");
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  return (
    <Modal
      id={modalId}
      title={"duplicate event"}
      actionBtn={{
        status,
        text: "confirm",
        onClick: () => handleDuplicateEvent(),
      }}
    >
      <div className="list pro">
        <div className="item">
          <h2 className="text-white truncate">{eventName}</h2>
          <div className="inline-flex items-center gap-2">
            <h2 className="text-white/50 whitespace-nowrap">copy screens?</h2>
            <input
              type="checkbox"
              className="toggle pro toggle-lg"
              checked={duplicateScreens}
              onChange={() => handleToggle()}
            />
          </div>
        </div>

        {status == "success" && (
          <div className="item">redirecting in {countdown}...</div>
        )}
      </div>
    </Modal>
  );
}
