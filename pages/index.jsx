import React, {  useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount,useContractRead, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";
import lotteryContract from "../contracts/Lottery.json"; // Raw ABI import (pulled from etherscan)
import nftContract from "../contracts/NFT.json"; // Raw ABI import (pulled from etherscan)
import Navbar from "./Navbar"; // Import the Navbar component

export default function NumberSelection() {

  const FLOOR101_ADDRESS = "0x987DeD735d96d9542Af9d476879C9205BE605091";   //polygon  
  const Lotto_ADDRESS = "0xaFF1207A1e12A724b8Cb571fEE7f57D2518e3A58";
  const {address, isConnected} = useAccount();
  const [ethSale, setEthSale] = useState(0);  // cost of NFTs being purchased
  const [endDate, setEndDate] = useState(0);  // the time/date the lottery ends 
  const [prizepool, setPrizepool] = useState(BigInt(0)); // Initialize prizepool as a BigInt
 
  const [txHash, setTxHash] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [saleSucceeded, setSaleSucceeded] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState('Submit');
  const [nftImageUrl, setNftImageUrl] = useState(''); // State to store the NFT image URL
  const [isPulsing, setIsPulsing] = useState(false);
  
  const contractConfig = {
    address: Lotto_ADDRESS,
    abi: lotteryContract,
  };

  const contractConfigNFT = {
    address: FLOOR101_ADDRESS,
    abi: nftContract,
  };


  const { data: getEth, error: lotteryNumberError } = useContractRead({
    ...contractConfig,
    functionName: "s_lotteryNumber",
  });

  const { data: getEndDate, error: getEndDateError } = useContractRead({
    ...contractConfig,
    functionName: "claimPeriodLeft",
  });

  const { data: getPrizepool, error: getPrizepoolError } = useContractRead({
    ...contractConfig,
    functionName: "getPrizepool",
  });
  

  useEffect(() => {
    if (getPrizepool) {
      let temp = getPrizepool;
      setPrizepool(temp);
    }
  }, [getPrizepool]);

  useEffect(() => {
    if (getEndDate) {
      let temp = getEndDate;
      setEndDate(temp);
    }
  }, [getEndDate]);

  useEffect(() => {
    if (getEth) {
      let temp = getEth;
      setEthSale(temp);
    }
  }, [getEth]);

  const buyLottoTicket = async () => {
    let nftID;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(Lotto_ADDRESS, lotteryContract, provider);
    const marketWithSigner = marketContract.connect(signer);
  
    // Define the fetchTokenURI function
    const fetchTokenURI = async (nftID, contract) => {
      try {
        // Retrieve the token URI from the contract using the updated value of nftID
        const tokenURI = await contract.tokenURI(nftID);
  
        // Fetch the NFT metadata from the token URI
        const metadataResponse = await fetch(tokenURI);
        const metadata = await metadataResponse.json();
  
        // Extract the image URL from the metadata
        const imageUrl = metadata.image;
        setNftImageUrl(imageUrl);
      } catch (error) {
        console.log("Error fetching token URI:", error);
      }
    };
  
    // Create an instance of the Floor101 contract
    const floor101Contract = new ethers.Contract(FLOOR101_ADDRESS, nftContract, provider);
  
    // Listen to the 'mintEvent' event on the Floor101 contract
    floor101Contract.on("mintEvent", async (sender, NFTid) => {
      console.log("mintEvent:", sender, NFTid.toString());
      nftID = NFTid.toString();
      await fetchTokenURI(nftID, floor101Contract);
    });
  
    try {
      // Call enterLottery function
      let tx = await marketWithSigner.enterLottery(selectedNumbers[0], selectedNumbers[1], selectedNumbers[2], { value: ethers.utils.parseEther("0.001") });
      setSubmitButtonText('Pending');
      setIsPulsing(true); // Start the pulse animation     
      const receipt = await tx.wait();
      setTxHash(`https://polygonscan.com/tx/${tx.hash}`);
      setSaleSucceeded(true);
    } catch (e) {
      alert(e);
      console.log(e);
    } finally {
      // Reset the submit button text after the transaction completes
      setSubmitButtonText('Submit');
      setIsPulsing(false); // Start the pulse animation
    }
  };

  function selectNumber(number) {
    if (selectedNumbers.includes(number)) {
      // Number is already selected, remove it from the array
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else {
      // Number is not selected, add it to the array
      if (selectedNumbers.length < 3) {
        setSelectedNumbers([...selectedNumbers, number]);
      }
    }
  }

  const enterLotto = async () => { 
    if (selectedNumbers.length !== 3) {
      alert('Please select exactly 3 numbers.');
      return; 
  }
    buyLottoTicket()
  }

  function getDate() {
    const days = Number(endDate) / 86400;
   // const roundedDays = Number(days.toString());
    return days.toFixed(2);
  }
 
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Navbar /> {/* Include the Navbar component */}
        <ConnectButton />
      </div>
      <h1 style={{ textAlign: 'center' }}>Crypto Lotto Draw #{ethSale.toString()}</h1>
      <h1 style={{ textAlign: 'center' }}>Draw ends {getDate()} days</h1>
      <h1 style={{ textAlign: 'center' }}>Prizepool {ethers.utils.formatEther((prizepool * BigInt(99)) / BigInt(100))} MATIC</h1>
      <h1 style={{ textAlign: 'center', color: '#200aa0' }}>Select 3 Numbers: free entry for beta test</h1>
      <div id="numberSelection">
        <div className="numberRow">
          {[...Array(8)].map((_, index) => (
            <button
              key={index + 1}
              className={`numberButton ${selectedNumbers.includes(index + 1) ? 'selected' : ''}`}
              onClick={() => selectNumber(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="numberRow">
          {[...Array(8)].map((_, index) => (
            <button
              key={index + 9}
              className={`numberButton ${selectedNumbers.includes(index + 9) ? 'selected' : ''}`}
              onClick={() => selectNumber(index + 9)}
            >
              {index + 9}
            </button>
          ))}
        </div>
        <div className="numberRow">
          {[...Array(8)].map((_, index) => (
            <button
              key={index + 17}
              className={`numberButton ${selectedNumbers.includes(index + 17) ? 'selected' : ''}`}
              onClick={() => selectNumber(index + 17)}
            >
              {index + 17}
            </button>
          ))}
        </div>
        <div className="numberRow">
          {[...Array(6)].map((_, index) => (
            <button
              key={index + 25}
              className={`numberButton ${selectedNumbers.includes(index + 25) ? 'selected' : ''}`}
              onClick={() => selectNumber(index + 25)}
            >
              {index + 25}
            </button>
          ))}
        </div>
      </div>
      <h3 style={{ textAlign: 'center' }}>
        <div id="selectedNumbers">Selected Numbers: {selectedNumbers.join(', ')}</div>
      </h3>
      {/* Submit button */}
      <button
        className={`submitButton ${isPulsing ? 'pulsing' : ''}`}
        style={{
          display: 'block',
          margin: '0 auto',
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: '#0d6efd',
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={enterLotto}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#FFA500')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#0d6efd')}
      >
        {submitButtonText}
      </button>
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {nftImageUrl && <img src={nftImageUrl} alt="NFT" style={{ margin: '0' }} />} {/* Render the NFT image if available */}
      </div>
      {saleSucceeded && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href={txHash}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
            style={{ display: 'block' }}
          >
            View TX on polygonscan
          </a>
        </div>
      )}
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
        `}
      </style>
    </div>
  );
  
  
  ;
}
