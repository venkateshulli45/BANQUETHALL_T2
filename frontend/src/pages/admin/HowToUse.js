import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faUpload, 
  faCheckCircle, 
  faMoneyBillWave, 
  faBell,
  faClock,
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import styles from './vendorstyles/HowtoUse.module.css';

const HowToUse = ({ isDarkTheme }) => {
  const steps = [
    {
      icon: faUpload,
      title: "Register Your Hall",
      description: "Fill in all details about your function hall including name, location, capacity, and upload high-quality images. Ensure all information is accurate to attract more customers."
    },
    {
      icon: faCheckCircle,
      title: "Wait for Approval",
      description: "Our admin team will review your submission within 24-48 hours. You'll receive a notification once your hall is approved or if any changes are needed."
    },
    {
      icon: faMoneyBillWave,
      title: "Set Up Bank Details",
      description: "Navigate to the 'Bank Account' section and add your accurate bank information to receive payments directly. Double-check account details to avoid payment issues."
    },
    {
      icon: faBell,
      title: "Manage Bookings",
      description: "Monitor and manage all bookings through your dashboard. You'll receive instant notifications for new bookings and cancellations."
    },
    {
      icon: faClock,
      title: "Payment Processing",
      description: "Payments are automatically processed 3 days after each event. You can view payment status and history in the 'Payments' section."
    }
  ];

  const faqs = [
    {
      question: "How long does approval take?",
      answer: "Approval typically takes 24-48 hours during business days. Complex cases might take up to 72 hours. You'll receive email and in-app notifications about your approval status."
    },
    {
      question: "When do I get paid for bookings?",
      answer: "Payments are processed within 3 business days after the event date. The exact transfer time depends on your bank (usually 1-2 additional days)."
    },
    {
      question: "Can I edit my hall details after approval?",
      answer: "Yes, you can edit most details, but significant changes (like capacity or location) may require re-approval. Basic info updates take effect immediately."
    },
    {
      question: "What's your commission rate?",
      answer: "We charge a competitive ₹2000 on each Hall Registration. This covers platform maintenance, marketing, and payment processing."
    },
    {
      question: "How do I handle cancellations?",
      answer: "Cancellation policies are set by you during hall registration. We recommend clear communication with customers about your policy."
    }
  ];

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.howToUseContainer}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h2 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>Vendor Guide</h2>
            <FontAwesomeIcon 
              icon={faQuestionCircle} 
              className={styles.headerIcon} 
              color={isDarkTheme ? "#ff6b9d" : "#e91e63"}
            />
          </div>
          <p className={styles.subtitle}>Everything you need to know about using EventHaven</p>
        </div>
        
        <div className={styles.guideSection}>
          <h3>Getting Started</h3>
          <p className={styles.sectionDescription}>
            Follow these steps to successfully list your venue and start receiving bookings:
          </p>
          
          <div className={styles.stepsContainer}>
            {steps.map((step, index) => (
              <div className={styles.stepCard} key={index}>
                <div 
                  className={styles.stepIcon}
                  style={{
                    background: isDarkTheme ? "rgba(255, 107, 157, 0.1)" : "rgba(233, 30, 99, 0.1)",
                    color: isDarkTheme ? "#ff6b9d" : "#e91e63"
                  }}
                >
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <div className={styles.stepContent}>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
                <div className={styles.stepNumber}>{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.faqSection}>
          <h3>Frequently Asked Questions</h3>
          <p className={styles.sectionDescription}>
            Quick answers to common vendor questions:
          </p>
          
          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <div className={styles.faqItem} key={index}>
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.contactSection}>
          <h3>Need More Help?</h3>
          <div className={styles.contactMethods}>
            <div className={styles.contactCard}>
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className={styles.contactIcon}
                color={isDarkTheme ? "#ff6b9d" : "#e91e63"}
              />
              <div>
                <h4>Email Support</h4>
                <p>vendorsupport@eventhaven.com</p>
                <p className={styles.responseTime}>Response time: Within 24 hours</p>
              </div>
            </div>
            
            <div className={styles.contactCard}>
              <FontAwesomeIcon 
                icon={faPhone} 
                className={styles.contactIcon}
                color={isDarkTheme ? "#ff6b9d" : "#e91e63"}
              />
              <div>
                <h4>Phone Support</h4>
                <p>+91 98765 43210</p>
                <p className={styles.availability}>Available: Mon-Fri, 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;