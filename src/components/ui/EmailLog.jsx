import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import "./EmailLog.css";

export default function EmailLog({ isOpen, onClose }) {
  const [emails, setEmails] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem("tf_sent_emails") || "[]");
      setEmails(stored);
    }
  }, [isOpen]);

  function clearAll() {
    localStorage.removeItem("tf_sent_emails");
    setEmails([]);
  }

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="email-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="email-panel"
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ep-header">
            <div className="ep-header-left">
              <Mail size={18} />
              <span>Email Notifications</span>
            </div>
            <div className="ep-header-right">
              {emails.length > 0 && (
                <button className="ep-clear-btn" onClick={clearAll}>
                  Clear all
                </button>
              )}
              <button className="ep-close-btn" onClick={onClose}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="ep-body">
            {emails.length === 0 ? (
              <div className="ep-empty">
                <Inbox size={40} />
                <p>No email notifications yet.</p>
                <span>They appear here when task reminders fire.</span>
              </div>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="ep-email-item">
                  <div
                    className="ep-email-header"
                    onClick={() =>
                      setExpanded(expanded === email.id ? null : email.id)
                    }
                  >
                    <div className="ep-email-icon">📧</div>
                    <div className="ep-email-info">
                      <div className="ep-email-subject">{email.subject}</div>
                      <div className="ep-email-meta">
                        To: {email.to} ·{" "}
                        {new Date(email.sentAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {expanded === email.id ? (
                      <ChevronUp size={14} className="ep-chevron" />
                    ) : (
                      <ChevronDown size={14} className="ep-chevron" />
                    )}
                  </div>
                  <AnimatePresence>
                    {expanded === email.id && (
                      <motion.div
                        className="ep-email-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <pre className="ep-email-pre">{email.body}</pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
