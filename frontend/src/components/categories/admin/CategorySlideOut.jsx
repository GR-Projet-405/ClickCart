import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import styles from './CategorySlideOut.module.css';

const PRESET_ICONS = ['Wrench', 'MonitorSmartphone', 'Heart', 'Car', 'BookOpen', 'PartyPopper', 'Home', 'Scissors'];

const CategorySlideOut = ({ isOpen, onClose, onSave, category = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    icon: 'Wrench',
    active: true,
    subcategories: []
  });

  const [subInput, setSubInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          parentCategory: category.parentCategory || '',
          icon: category.icon || 'Wrench',
          active: category.active !== false,
          subcategories: category.subcategories || []
        });
        setSubInput('');
      } else {
        setFormData({
          name: '',
          description: '',
          parentCategory: '',
          icon: 'Wrench',
          active: true,
          subcategories: []
        });
        setSubInput('');
      }
    }
  }, [isOpen, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubcategory = () => {
    const trimmed = subInput.trim();
    if (trimmed && !formData.subcategories.includes(trimmed)) {
      setFormData(prev => ({ ...prev, subcategories: [...prev.subcategories, trimmed] }));
      setSubInput('');
    }
  };

  const handleSubcategoryKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSubcategory();
    }
  };

  const handleRemoveSubcategory = (subToRemove) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(sub => sub !== subToRemove)
    }));
  };

  const handleIconSelect = (iconName) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
  };

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={`${styles.slideOut} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>{category ? 'Edit Category' : 'New Category'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <LucideIcons.X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label>Category Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Home & Maintenance"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Description for the category..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Parent Category</label>
            <div className={styles.selectWrapper}>
              <select 
                name="parentCategory" 
                value={formData.parentCategory} 
                onChange={handleChange}
              >
                <option value="">None (Is Top Level)</option>
                <option value="Home">Home</option>
                <option value="Tech">Tech</option>
              </select>
              <LucideIcons.ChevronDown className={styles.selectIcon} size={16} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Subcategories</label>
            <div className={styles.tagInputContainer}>
              <div className={styles.tagInputWrapper}>
                <input 
                  type="text" 
                  value={subInput} 
                  onChange={(e) => setSubInput(e.target.value)} 
                  onKeyDown={handleSubcategoryKeyDown} 
                  placeholder="Type subcategory name..."
                  className={styles.subcatInput}
                />
                <button 
                  type="button" 
                  className={styles.addTagBtn} 
                  onClick={handleAddSubcategory}
                >
                  Add
                </button>
              </div>
              
              <div className={styles.tagsWrapper}>
                {formData.subcategories && formData.subcategories.length > 0 ? (
                  formData.subcategories.map(sub => (
                    <div key={sub} className={styles.tagPill}>
                      {sub}
                      <button type="button" className={styles.removeTagBtn} onClick={() => handleRemoveSubcategory(sub)}>
                        <LucideIcons.X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTagsText}>No subcategories added yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Category Icon</label>
            <div className={styles.iconSelection}>
              {PRESET_ICONS.map(iconName => {
                const IconComp = LucideIcons[iconName] || LucideIcons.Circle;
                const isSelected = formData.icon === iconName;
                return (
                  <div 
                    key={iconName}
                    className={`${styles.iconOption} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleIconSelect(iconName)}
                  >
                    <IconComp size={20} color={isSelected ? '#ffffff' : '#4b5563'} />
                  </div>
                );
              })}
              <div className={styles.addIconBtn}>
                <LucideIcons.Plus size={20} />
              </div>
            </div>
          </div>

          <div className={styles.toggleGroup}>
            <div>
              <label>Category Status</label>
              <p className={styles.helperText}>Visible to public marketplace</p>
            </div>
            <ActiveToggle isActive={formData.active} onToggle={handleToggle} />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            Save Changes
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default CategorySlideOut;
