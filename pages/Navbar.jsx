import React from "react";
import Link from "next/link";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  return (
    <nav>
      <ul className={styles.menu}>
        <li className={styles.menuItem}>
          <a href="./" className={styles.menuLink}>
            Home
          </a>
        </li>
        <li className={styles.menuItem}>
          <a href="/PastWinners" className={styles.menuLink}>
            Past Winners
          </a>
        </li>
        <li className={styles.menuItem}>
          <a
            href="https://polygonscan.com/address/0x46c4Ef51a238F37B07C588E147f484a3676439c2#code"
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
