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

  const daysLeft = padZero(timeLeft.days).split('');
  const hoursLeft = padZero(timeLeft.hours).split('');
  const minutesLeft = padZero(timeLeft.minutes).split('');
  const secondsLeft = padZero(timeLeft.seconds).split('');

  return (
    <div>
      <div className="clock-container">
        <div className="box">
          <div className="box-container">
            <span className="number">{daysLeft[0]}</span>
          </div>
        </div>
        <div className="box">
          <div className="box-container">
            <span className="number">{daysLeft[1]}</span>
          </div>
        </div>
        <span className="separator"> : </span>
        <div className="box">
          <div className="box-container">
            <span className="number">{hoursLeft[0]}</span>
          </div>
        </div>
        <div className="box">
          <div className="box-container">
            <span className="number">{hoursLeft[1]}</span>
          </div>
        </div>
        <span className="separator"> : </span>
        <div className="box">
          <div className="box-container">
            <span className="number">{minutesLeft[0]}</span>
          </div>
        </div>
        <div className="box">
          <div className="box-container">
            <span className="number">{minutesLeft[1]}</span>
          </div>
        </div>
        <span className="separator"> : </span>
        <div className="box">
          <div className="box-container">
            <span className="number">{secondsLeft[0]}</span>
          </div>
        </div>
        <div className="box">
          <div className="box-container">
            <span className="number">{secondsLeft[1]}</span>
          </div>
        </div>
      </div>

      <div className="clock-container">       
      <div className="box white-bg double-box">
          <div className="label">days</div>
        </div>
    
        <span className="separator white-bg">.</span>
        <div className="box white-bg double-box">
          <div className="label">hours</div>
        </div>

        <span className="separator white-bg">.</span>
        <div className="box white-bg double-box">
          <div className="label">mins</div>
        </div>
        <span className="separator white-bg">.</span>
        <div className="box white-bg double-box">
          <div className="label">secs</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
