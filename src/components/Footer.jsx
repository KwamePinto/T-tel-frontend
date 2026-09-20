import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useSite } from "../context/SiteContext";
import styles from "./Footer.module.css";

const SOCIALS = [
  ["social_facebook", "social_facebook_icon", "Facebook"],
  ["social_twitter", "social_twitter_icon", "X"],
  ["social_instagram", "social_instagram_icon", "Instagram"],
  ["social_linkedin", "social_linkedin_icon", "LinkedIn"],
  ["social_youtube", "social_youtube_icon", "YouTube"],
  ["social_flickr", "social_flickr_icon", "Flickr"],
];

function FooterLink({ item }) {
  const external = /^https?:\/\//i.test(item.url || "");
  if (external) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer">
        {item.label}
      </a>
    );
  }
  return <Link to={item.url || "/"}>{item.label}</Link>;
}

export default function Footer() {
  const { settings, menu, flag } = useSite();

  const columns = [
    { heading: settings.footer_links_heading || "About Us", items: menu(settings.footer_menu_1 || "about-us") },
    { heading: settings.footer_links_2_heading || "Useful Links", items: menu(settings.footer_menu_2 || "footer-ii") },
  ].filter((c) => c.items.length);

  const addressLines = String(settings.contact_address || "").split("\n").filter(Boolean);
  const socials = SOCIALS.filter(([key]) => settings[key]);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {columns.map((col) => (
          <div key={col.heading}>
            <h4>{col.heading}</h4>
            <ul className={styles.links}>
              {col.items.map((item) => (
                <li key={item.id || item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4>Contact Us</h4>
          <ul className={styles.contact}>
            {settings.contact_email && (
              <li>
                <Icon name="mail" size={17} />
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </li>
            )}
            {settings.contact_phone && (
              <li>
                <Icon name="phone" size={17} />
                <a href={`tel:${String(settings.contact_phone).replace(/[^\d+]/g, "")}`}>
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {addressLines.length > 0 && (
              <li>
                <Icon name="pin" size={17} />
                <span>
                  {addressLines.map((line) => (
                    <span key={line} style={{ display: "block" }}>{line}</span>
                  ))}
                </span>
              </li>
            )}
          </ul>
        </div>

        {socials.length > 0 && (
          <div>
            <h4>Connect With Us</h4>
            <div className={styles.socials}>
              {socials.map(([key, iconKey, label]) => (
                <a key={key} href={settings[key]} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon name={settings[iconKey] || key.replace("social_", "")} size={17} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="container">
        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} {settings.copyright_text || "T-TEL. All rights reserved."}
          </p>
          {flag("enable_back_to_top") && (
            <button
              className={styles.toTop}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to top <Icon name="arrowUp" size={15} />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
