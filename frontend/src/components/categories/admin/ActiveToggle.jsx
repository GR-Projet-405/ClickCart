import React from 'react';
import styles from './ActiveToggle.module.css';

const ActiveToggle = ({ isActive, onToggle }) => {
  return (
    <div 
      className={`${styles.toggleContainer} ${isActive ? styles.active : ''}`}
      onClick={onToggle}
    >
      <div className={styles.toggleKnob}></div>
    </div>
  );
};

export default ActiveToggle;
