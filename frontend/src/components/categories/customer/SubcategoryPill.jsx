import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './SubcategoryPill.module.css';

const SubcategoryPill = ({ subcategory, onClick }) => {
  return (
    <button className={styles.pill} onClick={onClick}>
      <span className={styles.text}>{subcategory}</span>
      <ArrowRight size={18} className={styles.arrow} />
    </button>
  );
};

export default SubcategoryPill;
