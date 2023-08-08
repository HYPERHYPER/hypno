import { useEffect, useState } from "react";

const useCountdown = (seconds: number) => {
    const [timeLeft, setTimeLeft] = useState<number>(seconds);

    useEffect(() => {
        const countdownTimer = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
    
        return () => clearInterval(countdownTimer);
      }, []);

      return timeLeft;
}

export default useCountdown;