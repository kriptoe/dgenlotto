import React from "react";
import Link from "next/link";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  return (
    <nav>
      <ul className={styles.menu}>
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
