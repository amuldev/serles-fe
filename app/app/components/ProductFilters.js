import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import styles from "./ProductFilters.module.scss";

export default function ProductFilters({ 
  categories = [], 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy,
  isLoading = false,
  onCategoryChange = null
}) {
  const [isFiltering, setIsFiltering] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by parent component
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setIsFiltering(true);
    setSelectedCategory(newCategory);
    
    // Navigate to category page if category is selected, or to main cakes page if "All Categories"
    if (onCategoryChange) {
      if (newCategory) {
        // Navigate to specific category
        onCategoryChange(newCategory);
      } else {
        // Navigate to main cakes page for "All Categories"
        router.push('/cakes');
      }
    }
    
    // Reset filtering state after a short delay
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleSearchChange = (e) => {
    setIsFiltering(true);
    setSearchTerm(e.target.value);
    // Reset filtering state after a short delay
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleSortChange = (e) => {
    setIsFiltering(true);
    setSortBy(e.target.value);
    // Reset filtering state after a short delay
    setTimeout(() => setIsFiltering(false), 300);
  };

  // Rebuilt 24 Nov 2026 (ui-ux-pro-max pass): labelled controls, no cut-off
  // "All Catego…" select, and the dead list/grid toggles (href="#") removed.
  return (
    <form className={styles.bar} onSubmit={handleSearch} role="search">
      <label className={styles.field}>
        <span className={styles.label}>Category</span>
        <select value={selectedCategory} onChange={handleCategoryChange} disabled={isLoading} className={isFiltering ? styles.filtering : ""}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>{category.name}</option>
          ))}
        </select>
      </label>
      <label className={`${styles.field} ${styles.search}`}>
        <span className={styles.label}>Search</span>
        <span className={styles.searchBox}>
          <FaSearch aria-hidden="true" />
          <input type="search" placeholder="Search cakes, e.g. chocolate" value={searchTerm} onChange={handleSearchChange}
            disabled={isLoading} className={isFiltering ? styles.filtering : ""} />
        </span>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Sort by</span>
        <select value={sortBy} onChange={handleSortChange} disabled={isLoading} className={isFiltering ? styles.filtering : ""}>
          <option value="default">Default</option>
          <option value="a-z">Name: A to Z</option>
          <option value="z-a">Name: Z to A</option>
          <option value="price-low-high">Price: low to high</option>
          <option value="price-high-low">Price: high to low</option>
        </select>
      </label>
    </form>
  );
} 