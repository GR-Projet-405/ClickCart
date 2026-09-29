import React from 'react';
import * as LucideIcons from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import styles from './CategoryTable.module.css';

const iconColors = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // orange
  '#10b981', // green
];

const CategoryTable = ({ categories, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ICON</th>
            <th>CATEGORY NAME</th>
            <th>SUBCATEGORIES</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => {
            const IconComponent = (category.icon && LucideIcons[category.icon])
              ? LucideIcons[category.icon]
              : LucideIcons.LayoutGrid;
            
            const bgColor = iconColors[index % iconColors.length];

            return (
              <tr key={category.id || category.name || index}>
                <td>
                  <div className={styles.iconCircle} style={{ backgroundColor: bgColor }}>
                    <IconComponent size={18} color="#ffffff" />
                  </div>
                </td>
                <td className={styles.categoryName}>{category.name}</td>
                <td className={styles.subcategories}>
                  {category.subcategories?.length || 0} subcategories
                </td>
                <td>
                  <ActiveToggle 
                    isActive={category.active !== false} 
                    onToggle={() => onToggleStatus(category)} 
                  />
                </td>
                <td>
                  <div className={styles.actions}>
                    <button 
                      className={styles.editBtn} 
                      onClick={() => onEdit(category)}
                      title="Edit Category"
                    >
                      <LucideIcons.PenLine size={16} />
                    </button>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => onDelete(category)}
                      title="Delete Category"
                    >
                      <LucideIcons.Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {categories.length === 0 && (
            <tr>
              <td colSpan="5" className={styles.emptyState}>
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
