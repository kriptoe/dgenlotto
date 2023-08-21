import { fetchTokenURI } from "./utils"; // Adjust the path as needed
import React, {  useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContractRead } from "wagmi";
import { ethers } from "ethers";
//import lotteryContract from "../contracts/Lottery.json"; // Raw ABI import (pulled from etherscan)
import lotteryContract from "../contracts/Lottery.json"; // Raw ABI import (pulled from etherscan)//
import nftContract from "../contracts/NFT.json"; // Raw ABI import (pulled from etherscan)
import Navbar from "./Navbar"; // Import the Navbar component
import styles from "../styles/index.module.css";
import Image from 'next/image';


export default function NumberSelection() {

  const FLOOR101_ADDRESS = "0xdC9E96d58903289E2A4771c63fa930d9d56384bA";   // sep polygon  
 // const Lotto_ADDRESS = "0x6c90b24Bb6ca8556C09a1b328388B602d32B7266";  // base goerli
 const Lotto_ADDRESS = "0x55Ff01197C771E1f7f97772aC9860C1F00C5F083";
  //const {address, isConnected} = useAccount();
  const [ethSale, setEthSale] = useState(0);  // cost of NFTs being purchased 
  const [txHash, setTxHash] = useState(0);
   // State to store selected numbers for each game
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [saleSucceeded, setSaleSucceeded] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState('Submit');
  const [nftImageUrl, setNftImageUrl] = useState(''); // State to store the NFT image URL
  const [isPulsing, setIsPulsing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [numGames, setNumGames] = useState(1); // State to store the number of games selected
  const [nftPurchased, setNftPurchased] = useState(false); // New state for tracking NFT purchase

  const [contractBalance, setContractBalance] = useState(ethers.BigNumber.from(0));
  const entryFee = 0.1;  // entryFee approx 10cents at $1650
  const entryFeeWEI = ethers.BigNumber.from("100000000000000000"); // 0.0001 ETH in wei

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const contractConfig = {
    address: Lotto_ADDRESS,
    abi: lotteryContract,
  };

  const contractConfigFLOOR = {
    address: FLOOR101_ADDRESS,
    abi: nftContract,
  };

  const { data: getSupply, error: getFError } = useContractRead({
    ...contractConfigFLOOR,
    functionName: "totalSupply",
  });

  const { data: getEth, error: lotteryNumberError } = useContractRead({
    ...contractConfig,
    functionName: "s_lotteryNumber",
  });


  useEffect(() => {
    if (getEth) {
      let temp = getEth;
      setEthSale(temp);
    }
    // Initialize selectedNumbers state with an array of arrays for each game
    setSelectedNumbers(Array.from({ length: numGames }, () => []));
  }, [getEth, numGames]);

useEffect(() => {
  if (saleSucceeded) {
    // Reset the number of games to 1
    setNumGames(1);
    setNftPurchased(true); // Set nftPurchased to true to display the NFT image
  }
}, [saleSucceeded]);


useEffect(() => {
  try {
    if (typeof window !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const floor101Contract = new ethers.Contract(FLOOR101_ADDRESS, nftContract, provider);

      const handleMintEvent = async (sender, NFTid) => {
        console.log("mintEvent:", sender, NFTid.toString());
        const nftId = NFTid.toString();
        try {
          const imageUrl = await fetchTokenURI(nftId, floor101Contract);
          if (imageUrl) {
            setNftImageUrl(imageUrl);
          }
        } catch (error) {
          console.log("Error fetching token URI:", error);
        }
      };

      // Remove previous event listener
      floor101Contract.off("mintEvent", handleMintEvent);
      
      // Add a new event listener
      floor101Contract.on("mintEvent", handleMintEvent);
    }
  } catch (error) {
    console.log("An error occurred within useEffect:", error);
  }
}, [saleSucceeded]);


function handleNumGamesChange(event) {
  const selectedValue = parseInt(event.target.value);
  const maxNumGames = 10; // Maximum number of games
  const newNumGames = Math.min(selectedValue, maxNumGames);
  console.log('New numGames value:', newNumGames); // Add this line
  setNumGames(newNumGames);
}


  const buyLottoTicket = async (numberOfTickets) => {
    let nftID;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(Lotto_ADDRESS, lotteryContract, provider);
    const marketWithSigner = marketContract.connect(signer);
  
    try {

      console.log ("flatten total price" )
      // Flatten the selectedNumbers array to a 1-dimensional array
      const flatSelectedNumbers = selectedNumbers.flat();
      // Calculate the total price based on the number of tickets
      const totalPrice =entryFeeWEI.mul(numberOfTickets);
      
      // Call enterLotteryBULK function with the flattened array and the dynamic price
      let tx = await marketWithSigner.enterLotteryBULK(flatSelectedNumbers, { value: totalPrice });
      setSubmitButtonText('Pending');
      setIsPulsing(true); // Start the pulse animation
      const receipt = await tx.wait();
      setTxHash(`https://goerli.basescan.org/tx/${tx.hash}`);
      // Reset the selected numbers after a successful transaction
      setSelectedNumbers(Array.from({ length: numGames }, () => []));
      setNftPurchased(true); // Set nftPurchased to true after a successful transaction

    } catch (e) {
      if (e.code === "UNPREDICTABLE_GAS_LIMIT") {
        alert("Sorry, an error occurred while estimating gas. Has the lottery ended?.", e);
      }
     // alert(e);
    } finally {
      // Reset the submit button text after the transaction completes
      setSubmitButtonText('Submit');
      setIsPulsing(false); // Start the pulse animation
      setSaleSucceeded(true); // Set saleSucceeded to true to trigger the useEffect
     // Reset numGames to 1 after the successful transaction
     console.log("resetting")
      setNumGames(1);
      setSelectedNumbers(Array.from({ length: numGames }, () => [])); // Reset selectedNumbers array
    }
  };
  
// Function to handle number selection for each game
function selectNumber(number, gameIndex) {
  setSelectedNumbers((prevSelectedNumbers) => {
    const updatedSelectedNumbers = [...prevSelectedNumbers];
    if (!updatedSelectedNumbers[gameIndex]) {
      updatedSelectedNumbers[gameIndex] = [];
    }
    if (updatedSelectedNumbers[gameIndex].includes(number)) {
      // Number is already selected, remove it from the array
      updatedSelectedNumbers[gameIndex] = updatedSelectedNumbers[gameIndex].filter(
        (n) => n !== number
      );
    } else {
      // Number is not selected, add it to the array
      if (updatedSelectedNumbers[gameIndex].length < 3) {
        updatedSelectedNumbers[gameIndex] = [
          ...updatedSelectedNumbers[gameIndex],
          number,
        ];
      }
    }
    console.log('Updated selectedNumbers array:', updatedSelectedNumbers); // Add this line
    return updatedSelectedNumbers;
  });
}

// This function makes an entry into the lotto draw
const enterLotto = async () => {
  const selectedNumbersCount = selectedNumbers.reduce(
    (total, numbers) => total + (numbers ? numbers.length : 0),
    0
  );
  
  if (selectedNumbersCount !== numGames * 3) {
    alert('Please select exactly 3 numbers for each game.');
    return;
  }
  console.log("enter lotto numGames", numGames)
  buyLottoTicket(numGames);
};

 
  function truncate(str, maxDecimalDigits) {
    if (str.includes('.')) {
        const parts = str.split('.');
        return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits);
    }
    return str;
}

  // Function to randomly select numbers for each game
  const generateRandomNumbers = () => {
    const randomNumbers = Array.from({ length: numGames }, () => []);

    for (let gameIndex = 0; gameIndex < numGames; gameIndex++) {
      const availableNumbers = Array.from({ length: 30 }, (_, index) => index + 1);
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const selectedNumber = availableNumbers.splice(randomIndex, 1)[0];
        randomNumbers[gameIndex].push(selectedNumber);
      }
    }
   console.log("numGAmes in random - ", numGames)
    setSelectedNumbers(randomNumbers);
  };

  return (
    
<div className="second-background-container">
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
  
  <div style={{ textAlign: 'center' }}>
  <h1>DGEN Lotto Draw #{ethSale.toString()}</h1>
</div>
    <h1 className="second-h1" style={{ textAlign: 'center' }}>Live draw 8pm (Singapore timezone) Sunday 27 August. </h1>
    <h1 className="second-h1" style={{ textAlign: 'center' }}>Current Prizepool 1604 MATIC</h1>
    <div style={{ textAlign: 'center'}}>Select 3 Numbers: 0.1 matic per game</div>

      {/* Add the select box to choose the number of games */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <label htmlFor="numGamesSelect">Select Number of Games: </label>
        <select
  id="numGamesSelect"
  value={numGames}
  onChange={handleNumGamesChange}
  className="select-box" // Apply the class name
>
  {[...Array(10)].map((_, num) => (
    <option key={num + 1} value={num + 1}>
      {num + 1}
    </option>
  ))}
</select>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          className="randomButton"
          onClick={generateRandomNumbers}
        >
         Pick Numbers FOR ME
        </button>
      </div>


      {/* Generates the 30 numbers used to select from */}
      <div id="numberSelection">  
  {Array.from({ length: numGames }).map((_, gameIndex) => (
    <div key={gameIndex}>
      <div id={`numberSelectionGame${gameIndex + 1}`}>
        {[...Array(5)].map((_, rowIndex) => (
          <div className="numberRow" key={rowIndex}>
            {[...Array(6)].map((_, colIndex) => {
              const number = rowIndex * 6 + colIndex + 1;
              return (
                <button
                  key={number}
                  className={`numberButton ${
                    selectedNumbers[gameIndex]?.includes(number) ? "selected" : ""
                  }`}
                  onClick={() => selectNumber(number, gameIndex)}
                >
                  {number}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {/* Display selected numbers for each game */}
      <div style={{ textAlign: "center" }}>
        Game {gameIndex + 1}:{" "}
        {selectedNumbers[gameIndex]?.join(", ") || "No numbers selected"}
      </div>
    </div>
  ))}
</div>



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
  </div>
  <div style={{ display: 'flex', justifyContent: 'center' }}>
  {nftPurchased && nftImageUrl && (
    <Image src={nftImageUrl} alt="NFT" width={350} height={500} />
  )}
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
        View TX on block explorer
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