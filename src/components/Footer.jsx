import { Link } from "react-router-dom";
import { FOOTER_COLUMNS, SOCIAL_LINKS, CONTACT_DETAILS } from "../data/footer";
import Icon from "./Icon";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4>{col.heading}</h4>
            <ul className={styles.links}>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4>Contact Us</h4>
          <ul className={styles.contact}>
            <li>
              <Icon name="mail" size={17} />
              <a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a>
            </li>
            <li>
              <Icon name="phone" size={17} />
              <a href={`tel:+233${CONTACT_DETAILS.phone.replace(/^0/, "")}`}>
                (+233) {CONTACT_DETAILS.phone}
              </a>
            </li>
            <li>
              <Icon name="pin" size={17} />
              <span>
                {CONTACT_DETAILS.street}, Accra, Ghana
                <br />
                {CONTACT_DETAILS.poBox} &middot; {CONTACT_DETAILS.digitalAddress}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4>Connect With Us</h4>
          <div className={styles.socials}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
              >
                <Icon name={s.icon} size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} Transforming Teaching, Education &amp; Learning
            (T-TEL). All rights reserved.
          </p>
          <button
            className={styles.toTop}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top <Icon name="arrowUp" size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
