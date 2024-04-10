// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery{
    address public owner;
    uint256 public drawNumber;
    uint256 public ticketNumber; // resets to one every new draw
    bool public raffleOpen;
    address public winner; // Address of the winner for the current raffle
    uint256 public prize; // Prize amount for the winner
    mapping(uint256 => mapping(address => uint256)) public entries;  // draw number to address to ticket number
    address[] public entriesByRaffle; // 2D array to store entries

    mapping(uint256 => address[]) public drawnumberEntriesMapping;
    mapping(uint256 => address)  public winnerHistory; // drawNumber -> winner addresss 
    event RaffleEntered(uint256 indexed drawNumber, address indexed participant, uint256 entryNumber);
    event RaffleEnded(uint256 indexed drawNumber, address indexed winner, uint256 winningNumber);
    event PrizeClaimed(uint256 indexed drawNumber, address indexed winner, uint256 gcash);

    constructor() {
        owner = msg.sender;
        drawNumber = 1;
        ticketNumber = 1;
        raffleOpen = true;
        prize = 500000000000000 ; // 0.0005 matic
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier raffleIsOpen() {
        require(raffleOpen, "Raffle is not open");
        _;
    }
 
    function enter(address _ParticleAddress) external raffleIsOpen {
        require(entries[drawNumber][_ParticleAddress] == 0, "User has already entered the raffle");
        entries[drawNumber][_ParticleAddress] = ticketNumber;
        // if the array already has a value in it re use it else push value into it
        if(entriesByRaffle.length < ticketNumber)
          entriesByRaffle.push(_ParticleAddress);
        else  
         entriesByRaffle[ticketNumber-1]=(_ParticleAddress);

        emit RaffleEntered(drawNumber, _ParticleAddress, ticketNumber);
        ticketNumber++;
       
    }

    function getTicketNumber(uint256 _drawNumber, address  _addr) public view returns(uint256){
     return entries[_drawNumber][_addr];
    }

    function setLotteryStatus(bool _isOpen) external onlyOwner {
        raffleOpen = _isOpen;
    }

// this function picks the winner of the lottery
function endLottery() external onlyOwner returns (address) {
    require(raffleOpen, "Cannot end a closed raffle");
    // Select a random index from entriesByRaffle for the winner
    uint256 randomIndex = generateRandomNumber(ticketNumber-1);

    winner = entriesByRaffle[randomIndex-1];
    emit RaffleEnded(drawNumber, winner, randomIndex);
    drawNumber++;
    raffleOpen = false;
    ticketNumber=1;       // ticketNumbers are re used for each new draw
    return winner;
}

// this function picks the winner of the lottery
function endLotteryManual(uint256 _winningNumber) external onlyOwner returns (address) {
    require(raffleOpen, "Cannot end a closed raffle");
    require(entriesByRaffle[_winningNumber-1] != address(0), "Invalid winning number");
    require(_winningNumber < ticketNumber, "Invalid winning number");   
    winner = entriesByRaffle[_winningNumber -1];
    emit RaffleEnded(drawNumber, winner, _winningNumber-1);
    drawNumber++;
    raffleOpen = false;
    ticketNumber=1;       // ticketNumbers are re used for each new draw
    return winner;
}

    function generateRandomNumber(uint256 range) public view returns (uint256) {
        require(range > 0, "Range must be greater than 1");

        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, blockhash(block.number - 1))
            )
        ) % range + 1;

        return randomNumber;
    }

   // _gcash value of 0 means user wants prize in crypto
    function claimPrizeParticle(address _addr, uint256 _gcash) external {
        require(msg.sender == winner, "Only the winner can claim the prize");
        require(!raffleOpen, "Raffle must be ended to claim the prize");
        winner = address(0);
        // if gcash value == 0 send them prize in crypto
        if (_gcash == 0)
         {payable(_addr).transfer(prize);} 

        raffleOpen = true;
        emit PrizeClaimed(drawNumber - 1, winner, _gcash );
        winnerHistory[drawNumber - 1]= _addr;
    }

    receive() external payable {}

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function deposit() external payable {
        require(msg.value > 0, "You must send Ether with the deposit");
    // You can add additional logic here if needed.
    }

}
