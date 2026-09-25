import React from 'react';
import * as LucideIcons from 'lucide-react';
import styles from './CategoryCard.module.css';

const CategoryCard = ({ category, isActive, onClick }) => {
  // Safe icon resolution: fallback to LayoutGrid if the icon string doesn't match a Lucide export
  const IconComponent = (category.icon && LucideIcons[category.icon]) 
    ? LucideIcons[category.icon] 
    : LucideIcons.LayoutGrid;

  const serviceCount = category.subcategories?.length || 0;

  return (
    <div 
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.iconWrapper}>
        <IconComponent size={28} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{category.name}</h3>
      <p className={styles.serviceCount}>{serviceCount} services</p>
    </div>
  );
};

export default CategoryCard;
