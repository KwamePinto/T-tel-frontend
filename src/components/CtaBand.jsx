import { Link } from "react-router-dom";
import styles from "./CtaBand.module.css";

export default function CtaBand() {
  return (
    <section className={styles.band}>
      {/* diagonal backdrop: white behind the illustration, accent behind the copy */}
      <div className={styles.panes} aria-hidden="true">
        <span className={styles.paneLine} />
        <span className={styles.paneAccent} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={`${styles.art} reveal`}>
          <img
            src="/images/cta-illustration.svg"
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        <div className={`${styles.copy} reveal`} data-delay="1">
          <h2>Working on education in Ghana? Let&rsquo;s talk.</h2>
          <p>
            Ministries, funders, researchers and school leaders &ndash; we&rsquo;re open to
            partnership at every level of the system.
          </p>
          <div className={styles.actions}>
            <a href="mailto:info@t-tel.org" className="btn btn-light btn-pill">
              Email the team
            </a>
            <Link to="/contact-us" className="btn btn-ghost-light btn-pill">
              Find our office
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
