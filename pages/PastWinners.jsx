import React from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function PastWinners() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
  <Navbar /> {/* Include the Navbar component */}
  <ConnectButton />
</div>
<div style={{ display: 'flex', justifyContent: 'center' }}>
<h1>Winning numbers will be displayed on this page</h1></div>
<div style={{ display: 'flex', justifyContent: 'center' }}>
<p>Prizes are automatically sent to the purchasing wallet address.</p>
</div>


</div>

  );
}