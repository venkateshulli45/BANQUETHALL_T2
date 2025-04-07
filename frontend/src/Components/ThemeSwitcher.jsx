// components/ThemeSwitcher.jsx
'use client';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import styles from './ThemeSwitcher.module.css';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} className={styles.switcher}>
      {theme === 'light' ? '🌞' : '🌙'}
    </button>
  );
};

export default ThemeSwitcher;
