"use client";
import styles from './CategoryTabs.module.scss';

/**
 * Category filter pills for the homepage menu and /menu (24 Nov 2026). Replaces
 * two hand-built dark tab bars. Pressed state is exposed with aria-pressed; on
 * phones the row scrolls sideways instead of wrapping into a tall block.
 */
export default function CategoryTabs({ tabs, active, onChange, label = 'Filter cakes by category' }) {
  return (
    <div className={styles.scroller}>
      <div className={styles.row} role="group" aria-label={label}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${active === tab.key ? styles.active : ''}`}
            aria-pressed={active === tab.key}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
            {typeof tab.count === 'number' && <span className={styles.count}>{tab.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
