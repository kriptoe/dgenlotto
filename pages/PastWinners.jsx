import React, {  useState, useEffect } from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {useContractRead } from "wagmi";
import { ethers } from "ethers";
import lotteryContract from "../contracts/Lottery.json"; // Raw ABI import (pulled from etherscan)
import styles from "../styles/index.module.css";

export default function PastWinners() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const Lotto_ADDRESS = "0x83fd9423A512356C9234227c650AF5040AedF126";
  const [results, setResults] = useState(0);  // the lotto results
  const [resultsPrize, setResultsPrize]  = useState(BigInt(0));  // the lotto results
  const [winner, setWinner] = useState("");
  const [winnerBOOL, setWinnerBOOL] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const contractConfig = {
    address: Lotto_ADDRESS,
    abi: lotteryContract,
  };

  const { data: getResults, error: getResultsError } = useContractRead({
    ...contractConfig,
    functionName: "lotteryResults",
    args: [1], //gets how much eth the user will receive for selling nft
  });
  
  useEffect(() => {
    if (getResults) {
      let temp = getResults[0]; // winning numbers string
      let temp3 = getResults[3];     
      let temp2= getResults[2];  // 0 = no winner
      setWinnerBOOL(temp2);
      setResults(temp);
      setResultsPrize(temp3);
      if (temp2 == 0) {
        setWinner("😢 No Winning Entries 😢");
      } else {
        setWinner(" The Winning addresses are : ");
      }

    }
  }, [getResults]);

   // rounds a number string to the specified number of digits
   function truncate(str, maxDecimalDigits) {
    if (str.includes('.')) {
      const parts = str.split('.');
      const decimalPart = parts[1].slice(0, maxDecimalDigits);
  
      // Check if the decimal part rounds to zero
      if (Number(decimalPart) === 0) {
        return parts[0]; // Remove the decimal point and decimal part
      } else {
        return parts[0] + '.' + decimalPart;
      }
    }

    return str;
  }

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

      <h1 className="second-h1" style={{ textAlign: 'center', color: '#200aa0' }}>Winning Numbers:  {results}</h1>
      <h1 className="second-h1" style={{ textAlign: 'center', color: '#200aa0' }}>{winner} </h1> 
      <div style={{ textAlign: 'center' }}><a
        href='https://polygonscan.com/tx/0x8fd932a680c9961fce6e4fa1598614b7ef0a972ee8bab330c0a6d6f71d17bd7e#eventlog'
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2"
        style={{ textDecoration: 'underline' }}
      >
      Check Random Number TX</a></div>
      <h1 className="second-h1" style={{ textAlign: 'center', color: '#200aa0' }}>Jackpot : {truncate(ethers.utils.formatEther((resultsPrize)),0)} MATIC</h1>
    </div>


    {/* CSS Styles */}
    <style>
      {`
        .horizontalGap {
          width: 20px; /* Set the width of the horizontal gap */
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
  