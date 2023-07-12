import React, {  useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount,useContractRead, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";
import lotteryContract from "../contracts/Lottery.json"; // Raw ABI import (pulled from etherscan)
import nftContract from "../contracts/NFT.json"; // Raw ABI import (pulled from etherscan)

export default function NumberSelection() {

  const Lotto_ADDRESS = "0xcF86A64AfB5194Ad2A0B07E8f02afC72F1C35968";
  const FLOOR101_ADDRESS = "0xE336239b0989dCDD1b12Ba3094309CAbe4509447";   //mumbai
  const {address, isConnected} = useAccount();
  const [ethSale, setEthSale] = useState(0);  // cost of NFTs being purchased
  const [endDate, setEndDate] = useState(0);  // the time/date the lottery ends 
  const [prizepool, setPrizepool] = useState(BigInt(0)); // Initialize prizepool as a BigInt

  const [nft, setName] = useState(0);  // name of NFT       
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

  const { data: getName, error: getNameError } = useContractRead({
    ...contractConfigNFT,
    functionName: "name",
  });

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
    if (getName) {
      let temp = getName;
      setName(temp);
    }
  }, [getName]);

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
      setTxHash(`https://sepolia.etherscan.io/tx/${tx.hash}`);
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
  <ConnectButton />
</div>
      <h1 style={{ textAlign: 'center' }}>Crypto Lotto Draw # {  ethSale.toString() } </h1>
      <h1 style={{ textAlign: 'center' }}>Draw ends {getDate()} days</h1>
      <h1 style={{ textAlign: 'center' }}>Prizepool {ethers.utils.formatEther((prizepool * BigInt(99)) / BigInt(100))} ETH</h1>
      <h1 style={{ textAlign: 'center' }}>Select 3 Numbers</h1>
      <div id="numberSelection">
      <div className="numberRow">
      <button
            className={`numberButton firstRow ${selectedNumbers.includes(1) ? 'selected' : ''}`}
            onClick={() => selectNumber(1)}
            id="numberButton1"
          >
            1
          </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(2) ? 'selected' : ''}`}
    onClick={() => selectNumber(2)}
    id="numberButton2"
  >
    2
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(3) ? 'selected' : ''}`}
    onClick={() => selectNumber(3)}
    id="numberButton3"
  >
    3
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(4) ? 'selected' : ''}`}
    onClick={() => selectNumber(4)}
    id="numberButton4"
  >
    4
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(5) ? 'selected' : ''}`}
    onClick={() => selectNumber(5)}
    id="numberButton5"
  >
    5
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(6) ? 'selected' : ''}`}
    onClick={() => selectNumber(6)}
    id="numberButton6"
  >
    6
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(7) ? 'selected' : ''}`}
    onClick={() => selectNumber(7)}
    id="numberButton7"
  >
    7
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(8) ? 'selected' : ''}`}
    onClick={() => selectNumber(8)}
    id="numberButton8"
  >
    8
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(9) ? 'selected' : ''}`}
    onClick={() => selectNumber(9)}
    id="numberButton9"
  >
    9
  </button>
  <button
    className={`numberButton firstRow ${selectedNumbers.includes(10) ? 'selected' : ''}`}
    onClick={() => selectNumber(10)}
    id="numberButton10"
  >
    10
  </button>
</div>

<div className="numberRow">
  <button
    className={`numberButton ${selectedNumbers.includes(11) ? 'selected' : ''}`}
    onClick={() => selectNumber(11)}
    id="numberButton11"
  >
    11
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(12) ? 'selected' : ''}`}
    onClick={() => selectNumber(12)}
    id="numberButton12"
  >
    12
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(13) ? 'selected' : ''}`}
    onClick={() => selectNumber(13)}
    id="numberButton13"
  >
    13
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(14) ? 'selected' : ''}`}
    onClick={() => selectNumber(14)}
    id="numberButton14"
  >
    14
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(15) ? 'selected' : ''}`}
    onClick={() => selectNumber(15)}
    id="numberButton15"
  >
    15
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(16) ? 'selected' : ''}`}
    onClick={() => selectNumber(16)}
    id="numberButton16"
  >
    16
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(17) ? 'selected' : ''}`}
    onClick={() => selectNumber(17)}
    id="numberButton17"
  >
    17
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(18) ? 'selected' : ''}`}
    onClick={() => selectNumber(18)}
    id="numberButton18"
  >
    18
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(19) ? 'selected' : ''}`}
    onClick={() => selectNumber(19)}
    id="numberButton19"
  >
    19
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(20) ? 'selected' : ''}`}
    onClick={() => selectNumber(20)}
    id="numberButton20"
  >
    20
  </button>
</div>
<div className="numberRow">
  <button
    className={`numberButton ${selectedNumbers.includes(21) ? 'selected' : ''}`}
    onClick={() => selectNumber(21)}
    id="numberButton21"
  >
    21
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(22) ? 'selected' : ''}`}
    onClick={() => selectNumber(22)}
    id="numberButton22"
  >
    22
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(23) ? 'selected' : ''}`}
    onClick={() => selectNumber(23)}
    id="numberButton23"
  >
    23
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(24) ? 'selected' : ''}`}
    onClick={() => selectNumber(24)}
    id="numberButton24"
  >
    24
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(25) ? 'selected' : ''}`}
    onClick={() => selectNumber(25)}
    id="numberButton25"
  >
    25
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(26) ? 'selected' : ''}`}
    onClick={() => selectNumber(26)}
    id="numberButton26"
  >
    26
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(27) ? 'selected' : ''}`}
    onClick={() => selectNumber(27)}
    id="numberButton27"
  >
    27
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(28) ? 'selected' : ''}`}
    onClick={() => selectNumber(28)}
    id="numberButton28"
  >
    28
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(29) ? 'selected' : ''}`}
    onClick={() => selectNumber(29)}
    id="numberButton29"
  >
    29
  </button>
  <button
    className={`numberButton ${selectedNumbers.includes(30) ? 'selected' : ''}`}
    onClick={() => selectNumber(30)}
    id="numberButton30"
  >
    30
  </button>
</div>

      </div>

      <h3 style={{ textAlign: 'center' }}>
        <div id="selectedNumbers">Selected Numbers: {selectedNumbers.join(', ')}</div>
      </h3>
{/* Submit button */}
<button className={`submitButton ${isPulsing ? 'pulsing' : ''}`}
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
  <a href={txHash} target="_blank" rel="noreferrer" className="underline underline-offset-2" style={{ display: 'block' }}
> View TX on etherscan </a></div>
)}
<br />
    <a href="https://sepolia.etherscan.io/address/0x594dBc0D1Ef5B9cBAcAfB76C941BD2a855c106f6#code">
    View Contract</a><br />

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
}
