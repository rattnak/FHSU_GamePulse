import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

export default function useCountdownTimer(targetDate: Date): string {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setCountdown("Event started");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown(`${days}D:${hours}H:${minutes}M:${seconds}S`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
}
