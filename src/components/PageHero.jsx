import { Link } from "react-router-dom";
import Icon from "./Icon";
import styles from "./PageHero.module.css";

export default function PageHero({ title, subtitle, image, crumb, band }) {
  return (
    <>
      <section
        className={styles.hero}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        <div className={`container ${styles.inner}`}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <Icon name="chevronRight" size={14} />
            <span>{crumb || title}</span>
          </nav>
          <h1>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.tricolour} aria-hidden="true">
          <span /><span /><span />
        </div>
      </section>

      {band && (
        <div className={styles.band} style={{ background: band.color }}>
          <div className="container">
            <span>{band.label}</span>
          </div>
        </div>
      )}
    </>
  );
}
