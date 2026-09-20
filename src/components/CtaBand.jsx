import { Link } from "react-router-dom";
import { mediaUrl } from "../lib/cms";
import { useSite } from "../context/SiteContext";
import styles from "./CtaBand.module.css";

export default function CtaBand() {
  const { settings, flag } = useSite();
  if (!flag("show_cta_band")) return null;

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
            src={mediaUrl(settings.cta_image) || "/images/cta-illustration.svg"}
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        <div className={`${styles.copy} reveal`} data-delay="1">
          <h2>{settings.cta_heading || "Working on education in Ghana? Let’s talk."}</h2>
          <p>{settings.cta_body || "Ministries, funders, researchers and school leaders – we’re open to partnership at every level of the system."}</p>
          <div className={styles.actions}>
            <a href={`mailto:${settings.cta_email || "info@t-tel.org"}`} className="btn btn-light btn-pill">
              {settings.cta_email_label || "Email the team"}
            </a>
            <Link to={settings.cta_contact_url || "/contact-us"} className="btn btn-ghost-light btn-pill">
              {settings.cta_contact_label || "Find our office"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
