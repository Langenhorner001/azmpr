import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageCircle, Phone, Mail, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";
import { trackWhatsAppClick, trackFormSubmit } from "../utils/analytics";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP_BASE = "https://wa.me/923184214075?text=";

const ContactSection = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Name is required";
    if (!form.business_name.trim()) errs.business_name = "Business name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/contact`, form);
      setStatus("success");
      setForm({ full_name: "", business_name: "", phone: "", email: "", message: "" });
      trackFormSubmit(true);
    } catch {
      setStatus("error");
      trackFormSubmit(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = `Hello AZ Distribution!\n\nName: ${form.full_name || "N/A"}\nBusiness: ${form.business_name || "N/A"}\nPhone: ${form.phone || "N/A"}\n\n${form.message || "Interested in bulk purchase. Please share catalog and pricing."}`;
    trackWhatsAppClick("contact_form");
    window.open(`${WHATSAPP_BASE}${encodeURIComponent(msg)}`, "_blank");
  };

  const contactItems = [
    {
      icon: MessageCircle,
      label: "WhatsApp Orders",
      value: "+92 318 4214075",
      note: "Click to chat instantly",
      link: "https://wa.me/923184214075",
      color: "#25D366",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+92 318 4214075",
      link: "tel:+923184214075",
      color: "#D4AF37",
    },
    {
      icon: Mail,
      label: "Email",
      value: "contactazdist@gmail.com",
      link: "mailto:contactazdist@gmail.com",
      color: "#D4AF37",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Mirpur, Azad Kashmir, Pakistan",
      link: "https://share.google/9VrVBnGZ4VPILKoYT",
      color: "#D4AF37",
    },
  ];

  return (
    <section
      id="contact"
      className="py-14 md:py-20 bg-secondary/40 dark:bg-[#0F0F0F]"
      data-testid="contact-section"
      ref={ref}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-4">
            Get In Touch
          </p>
          <h2 className={`text-4xl md:text-5xl font-poppins font-black text-foreground section-gold-divider ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("contact.heading")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            data-testid="contact-form-container"
          >
            {/* Status Messages */}
            {status === "success" && (
              <div className="flex items-center gap-3 p-4 border border-green-500/40 bg-green-500/10 mb-6 text-green-600 dark:text-green-400">
                <CheckCircle size={18} />
                <p className={`text-sm font-inter ${lang === "ur" ? "font-urdu" : ""}`}>{t("contact.success")}</p>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-3 p-4 border border-red-500/40 bg-red-500/10 mb-6 text-red-600 dark:text-red-400">
                <AlertCircle size={18} />
                <p className={`text-sm font-inter ${lang === "ur" ? "font-urdu" : ""}`}>{t("contact.error")}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {[
                { name: "full_name", label: "Full Name *", type: "text", placeholder: "Your full name" },
                { name: "business_name", label: "Business Name *", type: "text", placeholder: "Your store or business name" },
                { name: "phone", label: "Phone Number *", type: "tel", placeholder: "+92 3XX XXXXXXX" },
                { name: "email", label: "Email (Optional)", type: "email", placeholder: "your@email.com" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-montserrat font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent border-b-2 border-border focus:border-[#D4AF37] outline-none py-3 text-foreground text-base font-inter placeholder:text-muted-foreground/40 transition-colors duration-300"
                    data-testid={`contact-${field.name}`}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1 font-inter">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-montserrat font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                  Message / Order Details
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your order requirements, quantities, etc."
                  rows={4}
                  className="w-full bg-transparent border-2 border-border focus:border-[#D4AF37] outline-none p-3 text-foreground text-base font-inter placeholder:text-muted-foreground/40 transition-colors duration-300 resize-none"
                  data-testid="contact-message"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  data-testid="contact-submit-btn"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Sending..." : "Send Inquiry"}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#25D366] text-[#25D366] font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#25D366] hover:text-white transition-all duration-300"
                  data-testid="contact-whatsapp-btn"
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </button>
              </div>
            </form>
          </motion.div>

          {/* Contact Info + Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-6"
            data-testid="contact-info"
          >
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-5 group"
                  data-testid={`contact-info-item-${i}`}
                >
                  <div
                    className="w-12 h-12 border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-[#D4AF37]/10"
                    style={{ borderColor: `${item.color}40` }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-montserrat font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                      {item.label}
                    </p>
                    <p className="text-base font-poppins font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors">
                      {item.value}
                    </p>
                    {item.note && (
                      <p className="text-xs font-inter text-muted-foreground mt-0.5">{item.note}</p>
                    )}
                  </div>
                </a>
              );
            })}

            {/* Google Map */}
            <div className="mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53232.77!2d73.68!3d33.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f00aecc36e951%3A0x25de26d9f72cbfe3!2sMirpur%2C%20Azad%20Kashmir!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                width="100%"
                height="280"
                style={{ border: 0, filter: "grayscale(20%) contrast(1.1)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AZ Distribution Location — Mirpur, Azad Kashmir"
                data-testid="google-map"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
