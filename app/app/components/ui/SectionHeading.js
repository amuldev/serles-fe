import styles from './SectionHeading.module.scss';

/**
 * One heading style for every homepage/listing section (24 Nov 2026,
 * ui-ux-pro-max pass). Replaces the template's mix of pink script labels,
 * grey uppercase Oswald and Bootstrap headings.
 *
 * `as` sets the heading level (the homepage's first section passes "h1").
 */
export default function SectionHeading({ eyebrow, title, intro, as: Tag = 'h2', align = 'left', action = null, id }) {
  return (
    <div className={`${styles.wrap} ${align === 'center' ? styles.center : ''} ${action ? styles.withAction : ''}`}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <Tag className={styles.title} id={id}>{title}</Tag>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
