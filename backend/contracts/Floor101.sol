// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/utils/Counters.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/utils/Strings.sol";
    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
    import "./SVGNFT.sol";
    import "./HexStrings.sol";
    import "hardhat/console.sol";

contract Floor101 is ERC721Enumerable, Ownable  {

// -------------------------ERRORS -------------------------------
   using Strings for uint256;
   using HexStrings for uint160;  
   using Counters for Counters.Counter;
   Counters.Counter private _tokenIds; 
   string promo; // promotional message that scrolls across the nft

    // Define a struct to hold the string and uint256 data
    struct NFTData {
        string numbersChosen;
        uint256 drawNumber;
    }
    // Mapping to store NFT data by NFT ID
    mapping(uint256 => NFTData) public nftData;


// -------------------------EVENTS -------------------------------
   event mintEvent(address indexed sender, uint256 NFTid);

   constructor() ERC721("NFT Lotto", "flr") {
      promo = "Current Prizepool is ";
     }

    function setPromo(string memory _promo) public{
       promo = _promo;
    }

    // mints a FLoor101 NFT
   function mintNFT(uint256 _drawNumber, string memory _numbers, address _purchaser) public  {
      _tokenIds.increment();   
      _safeMint(_purchaser, _tokenIds.current());
      emit mintEvent(_purchaser, _tokenIds.current());
      // Store the draw number and numbers chosen in the mapping using the NFT ID
      nftData[_tokenIds.current()] = NFTData(_numbers, _drawNumber);  
  }

  function tokenURI(uint256 _id) public view override returns (string memory) {
      require(_exists(_id), "not exist");
      string memory name = string(abi.encodePacked('ID #',_id.toString()));
      string memory description = string(abi.encodePacked('Crypto Lotto'));
      string memory image = Base64.encode(bytes(NFTSVG.generateSVG(_id.toString(), nftData[_id].numbersChosen, uint160(ownerOf(_id)).toHexString(20), nftData[_id].drawNumber.toString(), promo)));

      return
          string(
              abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                          abi.encodePacked(
                              '{"name":"',
                              name,
                              '", "description":"',
                              description,
                              '", "external_url":"https://floor101.com/',
                              _id.toString(),
                              '", "attributes": [{"trait_type": "Numbers Chosen ", "value": "',
                               nftData[_id].numbersChosen,
                              '"}], "owner":"',
                              (uint160(ownerOf(_id))).toHexString(20),
                              '", "image": "',
                              'data:image/svg+xml;base64,',
                              image,
                              '"}'
                          )
                        )
                    )
              )
          );
  }


}