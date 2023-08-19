import React, { useState } from "react";
import Link from "next/link";
import { FaFacebook, FaYoutube, FaTwitter } from 'react-icons/fa';
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.menuToggle} onClick={toggleMenu}>
        {isMenuOpen ? "Close" : "Menu"}
      </div>
      <ul className={`${styles.menuVertical} ${isMenuOpen ? styles.activeMenu : styles.hiddenMenu}`}>
        <li className={styles.menuItem}>
          <Link href="/" passHref>
            <span className={styles.menuLink}>Home</span>
          </Link>
        </li>     
        <li className={styles.menuItem}>
          <Link href="/PastWinners" passHref>
            <span className={styles.menuLink}>Past Winners</span>
          </Link>
        </li>
        <li className={styles.menuItem}>
          <a
            href="https://polygonscan.com/address/0xd58b6c882d163b4d9d63fc4f3f86be8dad7df36a"
            className={styles.menuLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Contract
          </a>
        </li>
        {/* New menu item for social media icons */}
  {/* Social media icons */}
  <li className={styles.menuItem}>
    <div className={styles.socialIcons}>
      <a href="https://www.facebook.com/profile.php?id=61550067459554" target="_blank" rel="noopener noreferrer">
        <FaFacebook className={styles.socialIcon} />
      </a>
      <a href="https://www.youtube.com/channel/UCgifxfTTMXiEVTMpDF-INxQ" target="_blank" rel="noopener noreferrer">
        <FaYoutube className={styles.socialIcon} />
      </a>
      <a href="https://twitter.com/pcashpeso" target="_blank" rel="noopener noreferrer">
        <FaTwitter className={styles.socialIcon} />
      </a>
    </div>
  </li>
      </ul>
    </nav>
  );
}
