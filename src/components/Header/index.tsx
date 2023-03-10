import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.Container}>
      <Link href="/">
        <img src="/images/Logo.svg" alt="logo" />
      </Link>
    </div>
  );
}
