import React, { useState, useEffect } from "react";
import categoryService from "../services/categoryService";
import CategoryCard from "../components/categories/customer/CategoryCard";
import SubcategoryPill from "../components/categories/customer/SubcategoryPill";
import styles from './CustomerExplorePage.module.css';

const CustomerExplorePage = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories();

        //console.log("Fetched API Data:", data);

        // Safely extract array in case data is wrapped
        const dataArray = Array.isArray(data)
          ? data
          : (data?.content || data?.data || data?.categories || []);

        // Filter out inactive categories safely. Allows empty subcategories!
        const activeData = dataArray.filter(cat => cat.active === true);

        // Map ALL active categories - no .slice() or limits applied
        setCategories(activeData);

        // Set default active state to the first category if available
        if (activeData && activeData.length > 0) {
          setActiveCategory(activeData[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError('Failed to load categories.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  // Safely extract subcategories to map over (allow empty array)
  const subcategoriesToRender = activeCategory?.subcategories || [];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>

        {/* Breadcrumbs */}
        <nav className={styles.breadcrumb}>
          <span className={styles.breadcrumbItem}>Home</span>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.breadcrumbActive}>
            {activeCategory ? activeCategory.name : 'Explore'}
          </span>
        </nav>

        {/* Header Section */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Explore Services</h1>
          <p className={styles.pageSubtitle}>
            Connect with trusted local experts for all your home, tech, personal, and auto needs.
          </p>
        </header>

        {/* Categories Grid */}
        <section className={styles.categoriesSection}>
          <div className={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id || category.name || index}
                category={category}
                isActive={activeCategory && (activeCategory.id === category.id || activeCategory.name === category.name)}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
        </section>

        {/* Subcategories Section */}
        {activeCategory && (
          <section className={styles.subcategoriesSection}>
            <div className={styles.subcategoriesHeader}>
              <div className={styles.subcategoriesTitleWrapper}>
                <div className={styles.verticalBar}></div>
                <h2 className={styles.subcategoriesTitle}>
                  {activeCategory.name} Categories
                </h2>
              </div>
              {subcategoriesToRender.length > 0 && (
                <span className={styles.showingText}>Showing most popular</span>
              )}
            </div>

            <div className={styles.subcategoriesGrid}>
              {subcategoriesToRender.length > 0 ? (
                subcategoriesToRender.map((sub, index) => (
                  <SubcategoryPill
                    key={index}
                    subcategory={sub}
                    onClick={() => console.log('Selected subcategory:', sub)}
                  />
                ))
              ) : (
                <div className={styles.emptySubcategories}>
                  No subcategories available for this service yet.
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default CustomerExplorePage;
