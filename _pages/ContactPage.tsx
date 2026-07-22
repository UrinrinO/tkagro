'use client';
/**
 * TKAG-31 — Contact Page
 * Route: /contact
 *
 * Features:
 * - Contact form with client-side validation
 * - POST /api/contact submission with success/error feedback
 * - WhatsApp CTA card
 * - Contact details and social links
 * - Response time notice
 */

import React, { useState, useCallback, useEffect } from "react";
import styles from "./ContactPage.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubjectOption =
  | ""
  | "General Enquiry"
  | "Order Issue"
  | "Wholesale"
  | "Press";

interface ContactFormState {
  name: string;
  email: string;
  subject: SubjectOption;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS: SubjectOption[] = [
  "General Enquiry",
  "Order Issue",
  "Wholesale",
  "Press",
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/tkaysagrocosmetics",
    icon: "instagram",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/tkaysagrocosmetics",
    icon: "facebook",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@tkaysagrocosmetics",
    icon: "tiktok",
  },
];

const INITIAL_FORM_STATE: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(values: ContactFormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Your name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Your email address is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.subject) {
    errors.subject = "Please select a subject.";
  }

  if (!values.message.trim()) {
    errors.message = "A message is required.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Your message must be at least 10 characters.";
  }

  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldErrorProps {
  message?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  if (!message) return null;
  return (
    <span className={styles.fieldError} role="alert">
      {message}
    </span>
  );
};

// ─── WhatsApp CTA Card ────────────────────────────────────────────────────────

const WhatsAppCard: React.FC<{ whatsappUrl: string }> = ({ whatsappUrl }) => (
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.whatsappCard}
    aria-label="Chat with T.kays Agrocosmetics on WhatsApp"
  >
    {/* WhatsApp SVG icon */}
    <span className={styles.whatsappIconWrapper} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="32"
        height="32"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </span>
    <div className={styles.whatsappContent}>
      <span className={styles.whatsappLabel}>Chat with us on WhatsApp</span>
      <span className={styles.whatsappSub}>
        Quick replies · Mon–Sat, 8am–6pm
      </span>
    </div>
    <span className={styles.whatsappArrow} aria-hidden="true">→</span>
  </a>
);

// ─── Social Icon SVGs ─────────────────────────────────────────────────────────

const SocialIcon: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case "instagram":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
        </svg>
      );
    default:
      return null;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ContactPage: React.FC = () => {
  const [contactEmail, setContactEmail] = useState("hello@tkaysagrocosmetics.com");
  const [contactPhone, setContactPhone] = useState("233XXXXXXXXX");

  useEffect(() => {
    fetch("/api/content/settings.store_info")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const value = json?.data?.value;
        if (value?.contactEmail) setContactEmail(value.contactEmail);
        if (value?.contactPhone) setContactPhone(value.contactPhone);
      })
      .catch(() => {
        // Keep the defaults above — this is a non-critical enhancement fetch,
        // not something that should block or error the Contact page.
      });
  }, []);

  const whatsappUrl = `https://wa.me/${contactPhone}`;

  const [formValues, setFormValues] =
    useState<ContactFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Update a single field and clear its error on change
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormValues((prev) => ({ ...prev, [name]: value }));
      // Clear the specific field error as the user types
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Run client-side validation
      const validationErrors = validateForm(formValues);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitStatus("loading");
      setErrorMessage("");

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formValues.name.trim(),
            email: formValues.email.trim(),
            subject: formValues.subject,
            message: formValues.message.trim(),
          }),
        });

        if (!response.ok) {
          // Attempt to parse a server error message
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data?.message || "Something went wrong. Please try again."
          );
        }

        setSubmitStatus("success");
        setFormValues(INITIAL_FORM_STATE);
        setErrors({});
      } catch (err) {
        setSubmitStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to send your message. Please try again later."
        );
      }
    },
    [formValues]
  );

  const handleReset = useCallback(() => {
    setSubmitStatus("idle");
    setErrorMessage("");
  }, []);

  return (
    <main className={styles.page}>
      {/* ── Page Header ── */}
      <section className={styles.pageHeader}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>We'd love to hear from you</p>
          <h1 className={styles.heading}>Get in Touch</h1>
          <p className={styles.subheading}>
            Whether you have a question about our products, an order, or just
            want to say hello — we're here.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* ── Left Column: Form ── */}
          <section className={styles.formSection} aria-labelledby="form-title">
            <h2 id="form-title" className={styles.sectionTitle}>
              Send us a message
            </h2>

            {/* Success state */}
            {submitStatus === "success" ? (
              <div className={styles.successCard} role="status" aria-live="polite">
                <span className={styles.successIcon} aria-hidden="true">✓</span>
                <h3 className={styles.successTitle}>Message sent!</h3>
                <p className={styles.successText}>
                  Thank you for reaching out. We aim to respond within 24 hours.
                </p>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleReset}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
              >
                {/* Error banner */}
                {submitStatus === "error" && (
                  <div
                    className={styles.errorBanner}
                    role="alert"
                    aria-live="assertive"
                  >
                    <strong>Error:</strong> {errorMessage}
                  </div>
                )}

                {/* Name */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                    placeholder="e.g. Abena Mensah"
                    value={formValues.name}
                    onChange={handleChange}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    aria-invalid={!!errors.name}
                    disabled={submitStatus === "loading"}
                  />
                  <FieldError message={errors.name} />
                </div>

                {/* Email */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    placeholder="you@example.com"
                    value={formValues.email}
                    onChange={handleChange}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    disabled={submitStatus === "loading"}
                  />
                  <FieldError message={errors.email} />
                </div>

                {/* Subject */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="subject" className={styles.label}>
                    Subject <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="subject"
                      name="subject"
                      className={`${styles.select} ${errors.subject ? styles.inputError : ""}`}
                      value={formValues.subject}
                      onChange={handleChange}
                      aria-describedby={
                        errors.subject ? "subject-error" : undefined
                      }
                      aria-invalid={!!errors.subject}
                      disabled={submitStatus === "loading"}
                    >
                      <option value="" disabled>
                        Select a subject…
                      </option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className={styles.selectChevron} aria-hidden="true">
                      ▾
                    </span>
                  </div>
                  <FieldError message={errors.subject} />
                </div>

                {/* Message */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                    placeholder="Tell us how we can help…"
                    value={formValues.message}
                    onChange={handleChange}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                    aria-invalid={!!errors.message}
                    disabled={submitStatus === "loading"}
                  />
                  <FieldError message={errors.message} />
                </div>

                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={submitStatus === "loading"}
                  aria-busy={submitStatus === "loading"}
                >
                  {submitStatus === "loading" ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </section>

          {/* ── Right Column: Info ── */}
          <aside className={styles.infoSection} aria-label="Contact information">
            {/* WhatsApp CTA */}
            <WhatsAppCard whatsappUrl={whatsappUrl} />

            {/* Response time notice */}
            <div className={styles.responseNotice} role="note">
              <span className={styles.responseIcon} aria-hidden="true">🕐</span>
              <p>
                <strong>We aim to respond within 24 hours.</strong>
                <br />
                For urgent order issues, WhatsApp is the fastest way to reach
                us.
              </p>
            </div>

            {/* Contact details */}
            <div className={styles.contactDetails}>
              <h3 className={styles.detailsTitle}>Contact Details</h3>

              <a
                href={`mailto:${contactEmail}`}
                className={styles.contactLink}
              >
                <span className={styles.contactLinkIcon} aria-hidden="true">
                  ✉
                </span>
                {contactEmail}
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <span className={styles.contactLinkIcon} aria-hidden="true">
                  📱
                </span>
                +{contactPhone}
              </a>
            </div>

            {/* Social links */}
            <div className={styles.socialSection}>
              <h3 className={styles.detailsTitle}>Follow Us</h3>
              <div className={styles.socialLinks}>
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={`Follow T.kays Agrocosmetics on ${label}`}
                  >
                    <SocialIcon icon={icon} />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;