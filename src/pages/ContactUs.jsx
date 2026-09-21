import { useState } from "react";
import Seo from "../components/Seo";
import CmsHero from "../components/CmsHero";
import Icon from "../components/Icon";
import { Loading, ErrorState } from "../components/States";
import { cms } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import { useSite } from "../context/SiteContext";
import styles from "./ContactUs.module.css";
import { t } from "../i18n";

const SOCIALS = [
  ["social_facebook", "facebook", "Facebook"],
  ["social_twitter", "twitter", "X"],
  ["social_instagram", "instagram", "Instagram"],
  ["social_linkedin", "linkedin", "LinkedIn"],
  ["social_youtube", "youtube", "YouTube"],
  ["social_flickr", "flickr", "Flickr"],
];

export default function ContactUs() {
  const { settings } = useSite();
  const formSlug = settings.contact_form || "contact-us";

  const { data: form, loading, error, reload } = useCms(() => cms.form(formSlug), [formSlug]);

  const [values, setValues] = useState({});
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState([]);

  const change = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    setFieldErrors([]);
    try {
      const res = await cms.submitForm(formSlug, values);
      setStatus({ ok: true, message: res.message });
      setValues({});
      if (res.redirect) window.location.href = res.redirect;
    } catch (err) {
      setStatus({ ok: false, message: err.message });
      setFieldErrors(err.details?.missing || []);
    } finally {
      setSending(false);
    }
  }

  function renderField(field) {
    const common = {
      id: `f-${field.name}`,
      name: field.name,
      required: field.required,
      placeholder: field.placeholder || "",
      value: values[field.name] ?? field.defaultValue ?? "",
      onChange: (e) => change(field.name, e.target.value),
    };

    return (
      <label key={field.name} className={field.width === "half" ? styles.half : styles.full}>
        <span>
          {field.label}
          {field.required && " *"}
        </span>

        {field.type === "textarea" ? (
          <textarea {...common} rows={7} />
        ) : field.type === "select" ? (
          <select {...common}>
            <option value="">{t("Please choose…")}</option>
            {(field.options || []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input {...common} type={field.type === "date" ? "date" : field.type} />
        )}
      </label>
    );
  }

  return (
    <>
      <Seo title={t("Contact Us")} description="Get in touch with T-TEL. Ministries, funders, researchers and school leaders are welcome at every level of the system." />
      <CmsHero
        slug="contact-us"
        title={t("Contact Us")}
        crumb={t("Contact Us")}
        subtitle="Have questions or enquiries? Reach us using the details below or complete the enquiry form."
        image="/images/focus/laptop-review.jpg"
      />

      <section className="section">
        <div className={`container ${styles.layout}`}>
          <div className={`${styles.info} reveal`}>
            <span className="eyebrow">{t("Get in touch")}</span>
            <h2>{t("Talk to the team")}</h2>

            <ul className={styles.details}>
              {settings.contact_address && (
                <li>
                  <Icon name="pin" size={19} />
                  <div>
                    <strong>{t("Office")}</strong>
                    {String(settings.contact_address).split("\n").map((line) => (
                      <span key={line} style={{ display: "block" }}>{line}</span>
                    ))}
                  </div>
                </li>
              )}
              {settings.contact_email && (
                <li>
                  <Icon name="mail" size={19} />
                  <div>
                    <strong>{t("Email")}</strong>
                    <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                  </div>
                </li>
              )}
              {settings.contact_phone && (
                <li>
                  <Icon name="phone" size={19} />
                  <div>
                    <strong>{t("Phone")}</strong>
                    <a href={`tel:${String(settings.contact_phone).replace(/[^\d+]/g, "")}`}>
                      {settings.contact_phone}
                    </a>
                  </div>
                </li>
              )}
              {settings.contact_hours && (
                <li>
                  <Icon name="document" size={19} />
                  <div>
                    <strong>{t("Opening hours")}</strong>
                    {String(settings.contact_hours).split("\n").map((line) => (
                      <span key={line} style={{ display: "block" }}>{line}</span>
                    ))}
                  </div>
                </li>
              )}
            </ul>

            <div className={styles.socialRow}>
              <span>{t("Connect with us")}</span>
              <div>
                {SOCIALS.filter(([key]) => settings[key]).map(([key, icon, label]) => (
                  <a key={key} href={settings[key]} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon name={icon} size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.formCard} reveal`} data-delay="1">
            {loading && <Loading rows={5} />}
            {error && <ErrorState error={error} onRetry={reload} label={t("form")} />}

            {form && (
              <>
                <h3>{form.title}</h3>
                {form.description && <p className={styles.formIntro}>{form.description}</p>}

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <div className={styles.fieldRow}>
                    {form.fields.filter((f) => f.width === "half").map(renderField)}
                  </div>
                  {form.fields.filter((f) => f.width !== "half").map(renderField)}

                  {/* honeypot: hidden from people, tempting to bots */}
                  <input
                    type="text"
                    name="_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className={styles.honeypot}
                    value={values._hp ?? ""}
                    onChange={(e) => change("_hp", e.target.value)}
                  />

                  <button type="submit" className="btn" disabled={sending}>
                    {sending ? "Sending…" : form.settings?.submitLabel || "Send message"}
                    {!sending && <Icon name="arrowRight" size={18} />}
                  </button>

                  {status && (
                    <p className={status.ok ? styles.status : styles.statusError} role="status">
                      {status.message}
                      {fieldErrors.length > 0 && `: ${fieldErrors.join(", ")}`}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {settings.contact_map_embed && (
        <section className={styles.mapSection}>
          <iframe title={t("T-TEL office location")} src={settings.contact_map_embed} loading="lazy" />
        </section>
      )}
    </>
  );
}
