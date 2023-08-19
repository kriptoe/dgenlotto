import React from 'react';

const UtilsPage = () => {
  return <div>This is a placeholder for the utils page.</div>;
};

export default UtilsPage;

export const fetchTokenURI = async (nftID, contract) => {
  try {
    // Retrieve the token URI from the contract using the updated value of nftID
    let tokenURI = await contract.tokenURI(nftID);

    // Fetch the NFT metadata from the token URI
    const metadataResponse = await fetch(tokenURI);
    const metadata = await metadataResponse.json();

    // Extract the image URL from the metadata
    const imageUrl = metadata.image;
    return imageUrl;
  } catch (error) {
    console.log("Error fetching token URI:", error);
    return null;
  }
};