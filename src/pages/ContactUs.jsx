import { useState } from "react";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { SOCIAL_LINKS, CONTACT_DETAILS } from "../data/footer";
import styles from "./ContactUs.module.css";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: POST to the enquiry endpoint once the backend exists.
    setStatus("Thanks for reaching out — we'll get back to you shortly.");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <>
      <PageHero
        title="Contact Us"
        crumb="Contact Us"
        subtitle="Have questions or enquiries? Reach us using the details below or complete the enquiry form."
        image="/images/focus/laptop-review.jpg"
      />

      <section className="section">
        <div className={`container ${styles.layout}`}>
          <div className={`${styles.info} reveal`}>
            <span className="eyebrow">Get in touch</span>
            <h2>Talk to the team</h2>

            <ul className={styles.details}>
              <li>
                <Icon name="pin" size={19} />
                <div>
                  <strong>Office</strong>
                  {CONTACT_DETAILS.street}, Accra, Ghana
                  <br />
                  Digital address: {CONTACT_DETAILS.digitalAddress}
                </div>
              </li>
              <li>
                <Icon name="mail" size={19} />
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a>
                </div>
              </li>
              <li>
                <Icon name="phone" size={19} />
                <div>
                  <strong>Phone</strong>
                  <a href={`tel:+233${CONTACT_DETAILS.phone.replace(/^0/, "")}`}>
                    (+233) {CONTACT_DETAILS.phone}
                  </a>
                </div>
              </li>
              <li>
                <Icon name="document" size={19} />
                <div>
                  <strong>Post</strong>
                  {CONTACT_DETAILS.poBox}
                </div>
              </li>
            </ul>

            <div className={styles.socialRow}>
              <span>Connect with us</span>
              <div>
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                  >
                    <Icon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.formCard} reveal`} data-delay="1">
            <h3>Enquiry Form</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldRow}>
                <label>
                  <span>Name *</span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  <span>Email *</span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <label>
                <span>Subject</span>
                <input type="text" name="subject" value={form.subject} onChange={handleChange} />
              </label>
              <label>
                <span>Message</span>
                <textarea name="message" rows={7} value={form.message} onChange={handleChange} />
              </label>
              <button type="submit" className="btn">
                Send message
                <Icon name="arrowRight" size={18} />
              </button>
              {status && <p className={styles.status}>{status}</p>}
            </form>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <iframe
          title="T-TEL Office, Accra"
          src="https://maps.google.com/maps?q=TTEL%20Office%2C%20Accra&t=m&z=16&output=embed&iwloc=near"
          loading="lazy"
        />
      </section>
    </>
  );
}
