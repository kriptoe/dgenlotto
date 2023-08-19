Lotto App - pick the 3 winning numbers and win the jackpot

Developed by @pcashpeso 

Contracts can be viewed at https://polygonscan.com/address/0x83fd9423A512356C9234227c650AF5040AedF126#code

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about this stack, take a look at the following resources:

- [RainbowKit Documentation](https://rainbowkit.com) - Learn how to customize your wallet connection flow.
- [wagmi Documentation](https://wagmi.sh) - Learn how to interact with Ethereum.
- [Next.js Documentation](https://nextjs.org/docs) - Learn how to build a Next.js application.

You can check out [the RainbowKit GitHub repository](https://github.com/rainbow-me/rainbowkit) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


// SPDX-License-Identifier: MIT
  /* @title Decentralised Lotto
  / @author @pcashpeso
  / @notice Decentralised lotto
  / @dev uses chainlink VRF2 to get random number
 */
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Floor101.sol";

    /* Errors */
    error Lottery__TIME_PERIOD_HASNT_ENDED(uint256 _timeEnds);
    error Lottery__already_used_numbers();    // the same address can't enter the same set of numbers twice
    error Lottery__Send_More_To_Enter_Lottery();
    error Lottery__NotOpen();
    error Lottery___has_ended();  
    error Lottery__10_duplicates();  // the same set of numbers can only be used 10 times per lottery draw
    error Lottery___out_of_range();  // entered 0, negative or too big a number 

contract Lottery is VRFConsumerBaseV2, ConfirmedOwner, ReentrancyGuard {
      /* Type declarations */
    enum LotteryState {
        OPEN,
        CALCULATING
    }   

    Floor101 private floor101Contract;  // instance of the NFT contract
  
    /*  Lottery Variables */
    // STRUCTS  - this struct is mapped using the lottery draw number as the key
    struct LotteryResult {
      string winningNumbers;
      bool paidOut;
      uint256 winners;   // number of winners
      uint256 prizePool; // the size of the jackpot
    }
  
    // mapping that stores all the entered numbers
    // the first uint is the lotteryDraw number, the string is a string of the lottery numbers the user chose which maps to the users address
    mapping(uint256 => mapping(string => address[])) public numbersToAddress;
    // the lottery draw number is the key that points to the struct
    mapping(uint256 => LotteryResult) public lotteryResults;  
    // Mapping to store used requestIds so they can't be re-used
    mapping(uint256 => bool) public usedRequestIds;

    uint256 public s_lotteryNumber ;  // the lottery draw number, starts at 1 and goes up by 1 everytime there is a new lottery
    uint256 public s_entranceFee;
    uint256 private s_lastTimeStamp;
    LotteryState private s_lotteryState;
    uint256 private  s_interval;   
    uint256 public s_lottoNumberRange = 30;  // maximum numbers to be selected from eg user can select from numbers ranging 1 to 40
    uint256 public s_rollOver = 95;  // percentage of prizepool that gets kept aside for next lottery 95% means 5% kept aside

    /* Events */
    event RequestedRaffleWinner(uint256 indexed requestId);
    event lotteryEnterEvent(address indexed player, string numberChosen, uint256 lotteryNumber);
    event WinnerPickedEvent(address indexed player, uint256 indexed amount, uint256 lotteryNumber);

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event RandomWordsfulfill(address indexed player, uint256 indexed amount);

   // VRF variables
    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus       maps the chainlink random numbers */   
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#configurations

     // bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c ;  // sepolia
     // bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f ;  // mumbai
     bytes32 keyHash =   0xd729dc84e21ae57ffb6be0053bf2b0668aa2aaf300a2a7b2ddf7dc0bb6e875a8;  // polygon

     //address VRF_SEOPLIA_ADDRESS =  0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;  // sepolia
     // address VRF_MUMBAI_ADDRESS =  0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
     address VRF_POLYGON_ADDRESS =  0xAE975071Be8F8eE67addBC1A82488F1C24858067;

    // Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
     uint32 callbackGasLimit =    2500000; //polygon

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 3 random values in one request.
    uint32 numWords = 3;

    constructor(uint64 subscriptionId, address _floorContract) VRFConsumerBaseV2(VRF_POLYGON_ADDRESS) ConfirmedOwner(msg.sender)
    {
        floor101Contract = Floor101(_floorContract);
        COORDINATOR = VRFCoordinatorV2Interface(VRF_POLYGON_ADDRESS);
        s_subscriptionId = subscriptionId;
        s_lastTimeStamp = block.timestamp;  
        s_interval = 604800;   // 1 week
        s_entranceFee = 100000000000000000 ;  // = 0.1 matic
        s_lotteryState = LotteryState.OPEN;
        s_lotteryNumber = 1;
        addLotteryInfo( s_lotteryNumber, "", false);
    }
   
   // enters values into a struct that tracks each draws details
   // the draw number is the mapping key
    function addLotteryInfo(uint256 _drawNumber, string memory _winningNumbers, bool _paidOut) public onlyOwner {
       lotteryResults[_drawNumber] = LotteryResult( _winningNumbers, _paidOut, 0, 0);
    }


// the time period the lotto draw is open for
   function setInterval(uint256 _interval) public onlyOwner{
       s_interval = _interval;
   }

// the percentage of funds kept aside for next draw, 80 means 20% is kept aside
      function setRollover(uint256 _r) public onlyOwner{
       require (_r > 79 && _r < 101, "Must be between 80 and 100");
       s_rollOver = _r;
   }
   
     // sets the entry fee
   function setEnryFee(uint256 _ef) public onlyOwner{
       s_entranceFee = _ef;
   }

     // sets the Chainlink subscriptionID 
   function setSubscriptionID(uint64 _id) public onlyOwner{
       s_subscriptionId = _id;
   }

  // the iterate function calls this after it has ordered the winning numbers
  // this function check to see if there are any winning entries
 function checkWinners(uint256 _drawNumber, string memory _numbers) internal {
    // Check if the payout has already happened
    require(!lotteryResults[_drawNumber].paidOut, "Already paid");

    // Mark the payout as done
    lotteryResults[_drawNumber].paidOut = true;
   
    // Send 1% of entrant fees to the owner address
    (bool sentOwner, ) = payable(owner()).call{ value: address(this).balance / 100 }("");
    require(sentOwner, "Failed to transfer ETH to owner");

       lotteryResults[_drawNumber].prizePool = address(this).balance ;
    // Check if there is a winner (at least one address stored in the array)
    if (numbersToAddress[_drawNumber][_numbers].length > 0) {
        // Calculate the amount to be sent to each winner (s_lottoNumberRange% of the contract balance divided equally)
        uint256 prizeAmount = (address(this).balance * s_rollOver) / 100;
        uint256 numWinners = numbersToAddress[_drawNumber][_numbers].length;
        uint256 prizePerWinner = prizeAmount / numWinners;
        lotteryResults[_drawNumber].winners = numWinners ;

        // Send the prize amount to each winner
        for (uint256 i = 0; i < numWinners; i++) {
            address payable winner = payable(numbersToAddress[_drawNumber][_numbers][i]);
            (bool sent, ) = winner.call{ value: prizePerWinner }("");
            require(sent, "Failed to transfer ETH to winner");
        }
    } 
    // Create a new lottery
    s_lotteryNumber++;  // Increment the lottery draw number
    addLotteryInfo(s_lotteryNumber,  "", false); // Enter the new draw data into the struct
    // Create a new lottery
    s_lastTimeStamp = block.timestamp;
    s_lotteryState = LotteryState.OPEN;
}

  // generates the random numbers for the current lotto game
  // requires the VRF to call the function fullfillRandomwords (takes around 2 mins)
  // call getRequestStatus to check if number has been generated
  // getRequestStatus() returns fulfilled bool which = true when number has been generated
   function generateWinningNumbers() public nonReentrant {
    // if Lottery time period hasnt ended REVERT
     if (block.timestamp < s_lastTimeStamp + s_interval )
       { revert Lottery__TIME_PERIOD_HASNT_ENDED(s_lastTimeStamp + s_interval); }      
    // put the lottery into calculating mode
     require (s_lotteryState == LotteryState.OPEN, "Lottery is currently in calculating mode");

     s_lotteryState = LotteryState.CALCULATING;  
     requestRandomWords();
   }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords() internal returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });

        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    // this is called by the chainlink VRF may take a couple of minutes
    // you need to have funded the subscription and added the contract address to the subscription for it to work
    function fulfillRandomWords( uint256 _requestId, uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);  
        // VRF will call this function when number is generated and supply the id
        // now we have the id we can sort the winning numbers calling iterateRandomWords
    }

    // gets the randomWords array if the VRF has called fullfullRandomwords
    function getRequestStatus(uint256 _requestId) public view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

   // checks for duplicates , orders the winning numbers from lowest to highest then calls checkwinner()
function iterateRandomWords(uint256 requestId) public nonReentrant {
    require (s_lotteryState == LotteryState.CALCULATING, "Lottery is currently open");   
    require(s_requests[requestId].exists, "request not found");
    // Check if the requestId has not been used before
    require(!usedRequestIds[requestId], "requestId already used");   
    RequestStatus memory request = s_requests[requestId];

    uint256[] memory result = new uint256[](request.randomWords.length);

    uint256 randomWord = request.randomWords[0] % s_lottoNumberRange + 1; // Generate the first random number (cannot have a duplicate)
    result[0] = randomWord;

    for (uint256 i = 1; i < request.randomWords.length; i++) {
        // Access each random word in the array
        randomWord = request.randomWords[i] % s_lottoNumberRange + 1;

        // Check for duplicates
        for (uint256 j = 0; j < i; j++) {
            if (randomWord == result[j]) {
                // Adjust the duplicate value to make it unique
                randomWord = (randomWord % s_lottoNumberRange) + 1;

                // Start the loop again to recheck the adjusted value with previous numbers
                j = 0; // j will be incremented to 1 in the next iteration
            }
        }
        result[i] = randomWord;
    }

    // Sort the result array from lowest to highest
    for (uint256 i = 0; i < result.length - 1; i++) {
        for (uint256 j = i + 1; j < result.length; j++) {
            if (result[i] > result[j]) {
                // Swap the values
                uint256 temp = result[i];
                result[i] = result[j];
                result[j] = temp;
            }
        }
    }

    // Convert sorted numbers to strings
    string memory num1String = uintToString(result[0]);
    string memory num2String = uintToString(result[1]);
    string memory num3String = uintToString(result[2]);

    // Concatenate the numbers and store them as the winning numbers string
    string memory numbersString = string(abi.encodePacked(num1String, " : ", num2String, " : ", num3String));
    lotteryResults[s_lotteryNumber].winningNumbers = numbersString;
    // call function to check if there were winners
           // Mark the requestId as used
    usedRequestIds[requestId] = true;
    checkWinners(s_lotteryNumber, lotteryResults[s_lotteryNumber].winningNumbers);
}


    /* Enter the lottery, buys however many tickets the user has selected
    function enterLottery(uint256 _num1,uint256 _num2, uint256 _num3) public payable {
        if (msg.value < (s_entranceFee )) {
            revert Lottery__Send_More_To_Enter_Lottery();
        }
        if (s_lotteryState != LotteryState.OPEN) {         // lottery needs to be in open state
            revert Lottery__NotOpen();
        }
         // if Lottery time period has ended REVERT
       if (block.timestamp > s_lastTimeStamp + s_interval ){
            revert Lottery___has_ended();
        }

        // Check if numbers are within the valid range
        if (_num1 < 1 || _num1 > s_lottoNumberRange) {
            revert Lottery___out_of_range();
        }
        // Check if numbers are within the valid range
        if (_num2 < 1 || _num2 > s_lottoNumberRange) {
            revert Lottery___out_of_range();
        }
          // Check if numbers are within the valid range
        if (_num3 < 1 || _num3 > s_lottoNumberRange) {
            revert Lottery___out_of_range();
        }      
    // Check for duplicates
    require(_num1 != _num2, "No duplicates");
    require(_num1 != _num3, "No duplicates");
    require(_num2 != _num3, "No duplicates");

        // Sort the numbers
    uint256[] memory sortedNumbers = sortNumbers(_num1, _num2, _num3);

    // Convert sorted numbers to strings
    string memory num1String = uintToString(sortedNumbers[0]);
    string memory num2String = uintToString(sortedNumbers[1]);
    string memory num3String = uintToString(sortedNumbers[2]);

    // Concatenate the numbers into a string to be used as a mapping
    string memory numbersString = string(abi.encodePacked(num1String, " : ", num2String, " : ", num3String));
     
     // can't have more than 10 entries with same numbers
     if (numbersToAddress[s_lotteryNumber][numbersString].length == 10) {
        revert Lottery__10_duplicates();
     }
  // check the user hasn't entered these numbers already
  for (uint256 i = 0; i < numbersToAddress[s_lotteryNumber][numbersString].length; i++) {
     if (numbersToAddress[s_lotteryNumber][numbersString][i] == msg.sender) {
      // Matching address found
      revert Lottery__already_used_numbers();
     }
}
      // Map the numbersString to the address of the sender
       numbersToAddress[s_lotteryNumber][numbersString].push(msg.sender);
       emit lotteryEnterEvent(msg.sender, numbersString, s_lotteryNumber);
       floor101Contract.mintNFT(s_lotteryNumber , numbersString, msg.sender);   // mint an nft
    }
*/

function enterLotteryBULK(uint256[][] memory _numbers) public payable {
    uint256 numEntries = _numbers.length;
    uint256 totalFee = s_entranceFee * numEntries;
    require(msg.value >= totalFee, "Insufficient payment");

    if (s_lotteryState != LotteryState.OPEN) {
        revert Lottery__NotOpen();
    }
    if (block.timestamp > s_lastTimeStamp + s_interval) {
        revert Lottery___has_ended();
    }

    // Create an array to collect numbersString for each entry
    string[] memory numbersStringArray = new string[](numEntries);

    for (uint256 k = 0; k < numEntries; k++) {
        uint256[] memory entry = _numbers[k];

        // Check if numbers are within the valid range
        for (uint256 i = 0; i < 3; i++) {
            if (entry[i] < 1 || entry[i] > s_lottoNumberRange) {
                revert Lottery___out_of_range();
            }
        }

        // Check for duplicates
        for (uint256 i = 0; i < 2; i++) {
            for (uint256 j = i + 1; j < 3; j++) {
                if (entry[i] == entry[j]) {
                    revert Lottery__already_used_numbers();
                }
            }
        }

        // Map the numbers to the address of the sender
        uint256[] memory sortedNumbers = sortNumbers(entry[0], entry[1], entry[2]);

        // Convert sorted numbers to strings
        string memory num1String = uintToString(sortedNumbers[0]);
        string memory num2String = uintToString(sortedNumbers[1]);
        string memory num3String = uintToString(sortedNumbers[2]);

        // Concatenate the numbers into a string and store in the array
        string memory numbersString = string(abi.encodePacked(num1String, " : ", num2String, " : ", num3String));
        numbersStringArray[k] = numbersString;

        // Check if the user has already entered these numbers
        for (uint256 j = 0; j < numbersToAddress[s_lotteryNumber][numbersString].length; j++) {
            if (numbersToAddress[s_lotteryNumber][numbersString][j] == msg.sender) {
                // Matching address found
                revert Lottery__already_used_numbers();
            }
        }

        numbersToAddress[s_lotteryNumber][numbersString].push(msg.sender);
        emit lotteryEnterEvent(msg.sender, numbersString, s_lotteryNumber);
    }

    // Call mintNFT function once, passing the array of numbersString
    floor101Contract.mintNFTBULK(s_lotteryNumber, numbersStringArray, msg.sender);
}


function sortNumbers(uint256 num1, uint256 num2, uint256 num3) internal pure returns (uint256[] memory) {
    uint256[] memory numbers = new uint256[](3);
    numbers[0] = num1;
    numbers[1] = num2;
    numbers[2] = num3;
    // Sort the numbers using a simple bubble sort algorithm
    for (uint256 i = 0; i < 3; i++) {
        for (uint256 j = 0; j < 2; j++) {
            if (numbers[j] > numbers[j + 1]) {
                uint256 temp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = temp;
            }
        }
    }
    return numbers;
}

function uintToString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
        return "0";
    }
    uint256 temp = value;
    uint256 digits;
    
    while (temp != 0) {
        digits++;
        temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    
    while (value != 0) {
        digits -= 1;
        buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
        value /= 10;
    }
    return string(buffer);
}

  // returns the number of seconds remaining until the draw ends
  function claimPeriodLeft() public view returns (uint256) {
    if (s_lastTimeStamp + s_interval >  block.timestamp)
      {return (s_lastTimeStamp + s_interval - block.timestamp);}
    else {
        return 0;
    }
  }

    function getLotteryState() public view returns(LotteryState){
        return s_lotteryState;
    }
     
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        (bool sent, ) = payable(msg.sender).call{ value: amount }("");
        require(sent, "withdraw(): revert in transferring eth to you!");
    }
   
    receive() external payable {}
}