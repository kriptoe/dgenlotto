
import React, {  useState} from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from "../styles/index.module.css";


export default function PastWinners() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="background-container">
    {/* Add a vertical gap of 20px */}
    <div style={{ height: '10px' }} />
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className={styles.backgroundContainer}>
        <div className={styles.contentContainer}>
          <div className={styles.navbarContainer}>
            <Navbar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          </div>
          <ConnectButton />
        </div>
      </div>
    </div>
  
    {/* Add a vertical gap of 20px */}
    <div style={{ height: '20px' }} />
    <div className="container" style={{ backgroundColor: '#fff', padding: '10px', margin: '0 auto', borderRadius: '20px', maxWidth: '600px' }}>
      <h1 style={{ textAlign: 'center' }}>Crypto Lotto Draw #1</h1>

      <h1 className="second-h1" style={{ textAlign: 'center', color: '#200aa0' }}>Winning Numbers:  2, 22, 25</h1>
      <h1 className="second-h1" style={{ textAlign: 'center', color: '#200aa0' }}>No winner - <a
        href='https://polygonscan.com/tx/0x8fd932a680c9961fce6e4fa1598614b7ef0a972ee8bab330c0a6d6f71d17bd7e#eventlog'
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2"
        style={{ textDecoration: 'underline' }}
      >
      Check Random Number TX</a></h1>
       
    </div>


    {/* CSS Styles */}
    <style>
      {`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        .pulsing {
          animation: pulse 1s infinite;
        }
        .horizontalGap {
          width: 20px; /* Set the width of the horizontal gap */
        }
        .numberButton {
          margin: 5px;
          padding: 10px 15px;
          font-size: 16px;
          border-radius: 5px;
          border: 1px solid #ccc;
          background-color: #fff;
          cursor: pointer;
          flex: 1;
          text-align: center;
          max-width: 70px; /* Adjust the max-width as needed */
        }
        .numberButton.selected {
          background-color: #0d6efd;
          color: #fff;
        }
        .numberRow {
          display: flex;
          justify-content: center;
        }
  
        /* Media Query for Mobile Phones */
        @media (max-width: 600px) {
          .container {
            width: 90%; /* Reduce width to 90% for better fit on smaller screens */
          }
        }
      `}
    </style>
  </div>
  
  
    );
    
    ;
  }
  