import React from "react";
import styles from "../styles/footer.module.css"; // Import your footer styles if needed
import { FaTwitter,  FaFacebook, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
<footer className={styles.footer}>
  <div className={styles.socialLinks}>
    <a href="https://twitter.com/pcashpeso" target="_blank" rel="noopener noreferrer">
      <FaTwitter size={30} />
    </a>
    <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
      <FaFacebook size={30} />
    </a>
    <a href="https://www.youtube.com/channel/UCgifxfTTMXiEVTMpDF-INxQ" target="_blank" rel="noopener noreferrer">
      <FaYoutube size={30} />
    </a>
    {/* Add more social media icons/links as needed */}
  </div>
</footer>
  );
}

export default Footer;
