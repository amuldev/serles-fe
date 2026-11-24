import Link from "next/link";
import styles from './Breadcrumb.module.scss';

/**
 * Page title band with a breadcrumb trail.
 *
 * The title renders as the page's `<h1>` by default. Pages that already render
 * their own `<h1>` in the body (blog, contact, the legal pages) pass
 * `headingLevel="h2"`; the label is then a paragraph so it doesn't precede the
 * real H1 in the outline.
 *
 * Restyled 24 Nov 2026 (ui-ux-pro-max pass): the template rendered a grey
 * uppercase title and a trail that ended in a bare "Home |" on most pages. The
 * trail now always ends with the current page and is a real <nav> list.
 */
export default function Breadcrumb({ title, items = [], headingLevel = "h1" }) {
  const Heading = headingLevel === "h1" ? "h1" : "p";
  const crumbs = items.length > 0 ? items : [{ label: title }];

  return (
    <div className={styles.band}>
      <div className="container">
        <Heading className={styles.title}>{title}</Heading>
        <nav aria-label="Breadcrumb">
          <ol className={styles.trail}>
            <li><Link href="/">Home</Link></li>
            {crumbs.map((item, index) => {
              const label = item.label || item.name;
              const last = index === crumbs.length - 1;
              return (
                <li key={`${label}-${index}`}>
                  {item.href && !last
                    ? <Link href={item.href}>{label}</Link>
                    : <span aria-current={last ? 'page' : undefined}>{label}</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
