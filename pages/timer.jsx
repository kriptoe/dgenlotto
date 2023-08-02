import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const targetTime = new Date(targetDate).getTime();
    const timeDifference = targetTime - now;

    if (timeDifference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const totalSeconds = Math.floor(timeDifference / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const remainingSeconds = totalSeconds % 86400;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [targetDate]); // Include targetDate as a dependency

  const padZero = (num) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div>
      <div className="clock-container">
        <div className="box">
          <div className="box-container">
            {padZero(timeLeft.days).split('').map((digit, index) => (
              <span key={index} className="number">
                {digit}
              </span>
            ))}
          </div>
        </div>
        <span className="separator"> : </span>
        <div className="box">
          <div className="box-container">
            {padZero(timeLeft.hours).split('').map((digit, index) => (
              <span key={index} className="number">
                {digit}
              </span>
            ))}
          </div>
        </div>
        <span className="separator"> : </span>
        <div className="box">
          <div className="box-container">
            {padZero(timeLeft.minutes).split('').map((digit, index) => (
              <span key={index} className="number">
                {digit}
              </span>
            ))}
          </div>
        </div>
        <span className="separator"> : </span>
        <div className="box">
          <div className="box-container">
            {padZero(timeLeft.seconds).split('').map((digit, index) => (
              <span key={index} className="number">
                {digit}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="clock-container">
      <div className="box white-bg">
          <div className="label">days</div>
        </div>
        <span className="separator white-bg">:</span>
        <div className="box white-bg">
        <div className="label">hours</div>
        </div>
        <span className="separator white-bg">:</span>
        <div className="box white-bg">
          <div className="box-container">
          <div className="label">mins</div>
          </div>
        </div>
        <span className="separator white-bg">:</span>
        <div className="box white-bg">
        <div className="label">secs</div>
        </div>
      </div>    
    </div>
  );
};

export default CountdownTimer;
