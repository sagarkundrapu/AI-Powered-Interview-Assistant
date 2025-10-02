import React, { useEffect, useState, useRef } from "react";

const CountdownToast = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  return <div>⏳ You have {timeLeft} second{timeLeft !== 1 ? "s" : ""} left</div>;
};

export default CountdownToast;