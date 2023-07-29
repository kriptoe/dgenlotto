import React, { useState } from "react";
import Link from "next/link";
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
            href="https://polygonscan.com/address/0x83fd9423A512356C9234227c650AF5040AedF126#code"
            className={styles.menuLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Contract
          </a>
        </li>
      </ul>
    </nav>
  );
}
