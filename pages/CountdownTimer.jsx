import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
 
  const calculateTimeLeft = () => {
    if (targetDate <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
     
    const targetInSeconds = Number(targetDate);
    const days = Math.floor(targetInSeconds / 86400);
    const remainingSeconds = targetInSeconds % 86400;
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
  }, [targetDate]);

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
        <span className="separator">:</span>
        <div className="box">
          <div className="box-container">
            {padZero(timeLeft.minutes).split('').map((digit, index) => (
              <span key={index} className="number">
                {digit}
              </span>
            ))}
          </div>
        </div>
        <span className="separator">:</span>
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
