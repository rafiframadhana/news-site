import { validationResult } from 'express-validator';
import { verifyEmailExists } from '../utils/emailVerification.js';

// List of common disposable email domains
const disposableEmailDomains = [
  '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'mailinator.com', 
  'yopmail.com', 'sharklasers.com', 'throwawaymail.com', 'getairmail.com', 
  'tempail.com', 'dispostable.com', 'mailnesia.com', 'mytemp.email', 
  'temp-mail.org', 'fake-email.com', 'getnada.com', 'tempinbox.com',
  'burnermail.io', 'temp-mail.io', 'spamgourmet.com', 'trashmail.com',
  'tempr.email', 'emailondeck.com', 'mintemail.com', 'maildrop.cc',
  'fakeinbox.com', 'mailnull.com', 'emailfake.com'
];

// Helper function to check if an email domain is disposable
const isDisposableEmail = (email) => {
  const domain = email.split('@')[1].toLowerCase();
  return disposableEmailDomains.includes(domain);
};

// Helper function for domain validation (MX record check simulation)
// In a real implementation, you would use DNS lookup to check MX records
const hasValidEmailDomain = (email) => {
  const domain = email.split('@')[1].toLowerCase();
  
  // Reject obviously fake domains
  if (domain.includes('example') || domain.includes('test') || 
      domain.includes('fake') || domain.includes('invalid')) {
    return false;
  }
  
  // Additional checks could be implemented here
  return true;
};

// Common patterns that might indicate fake emails
const suspiciousEmailPatterns = [
  /test.*@/i,
  /user.*@/i,
  /sample.*@/i,
  /example.*@/i,
  /[0-9]{8,}.*@/i,  // Many numbers in sequence
  /^(abc|xyz|123|qwerty|asdf).*@/i,
  /^(?:john|jane)\.?doe.*@/i
];

// Enhanced email validation
const validateEmail = (email) => {
  // Basic format validation
  const emailRegex = /^[\w+\-.]+@[a-z\d\-.]+\.[a-z]+$/i;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  // Check for disposable emails
  if (isDisposableEmail(email)) {
    return { isValid: false, message: 'Disposable emails are not allowed' };
  }
  
  // Check domain validity
  if (!hasValidEmailDomain(email)) {
    return { isValid: false, message: 'Email domain appears to be invalid' };
  }
  
  // Check for suspicious patterns
  for (const pattern of suspiciousEmailPatterns) {
    if (pattern.test(email)) {
      return { isValid: false, message: 'This email appears to be invalid or suspicious' };
    }
  }
  
  return { isValid: true };
};

/**
 * Advanced email validation using external API
 * This performs a real-time check if the email actually exists
 * and is deliverable
 * 
 * @param {string} email - The email to validate
 * @param {object} options - Configuration options
 * @param {boolean} options.allowDisposable - Whether to allow disposable emails
 * @param {number} options.minQualityScore - Minimum quality score (0-1) to accept
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
const validateEmailExistence = async (email, options = {}) => {
  const {
    allowDisposable = false,
    minQualityScore = 0.5
  } = options;
  
  // First do basic validation
  const basicValidation = validateEmail(email);
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  try {
    // Call the external API to verify if the email exists
    const verificationResult = await verifyEmailExists(email);
    
    // If API verification failed, fall back to basic validation
    if (!verificationResult.success) {
      console.warn(`Email API verification failed: ${verificationResult.reason}`);
      // Allow the email but log the issue
      return { isValid: true, apiVerified: false };
    }
    
    // Check if it's a disposable email (if not allowed)
    if (!allowDisposable && verificationResult.isDisposable) {
      return { 
        isValid: false, 
        message: 'Disposable emails are not allowed',
        apiVerified: true 
      };
    }
    
    // Check deliverability
    if (!verificationResult.deliverable) {
      return { 
        isValid: false, 
        message: 'This email appears to be invalid or not deliverable',
        apiVerified: true 
      };
    }
    
    // Check quality score
    if (verificationResult.score < minQualityScore) {
      return { 
        isValid: false, 
        message: 'This email appears to be suspicious or low quality',
        apiVerified: true,
        score: verificationResult.score
      };
    }
    
    // All checks passed
    return { 
      isValid: true,
      apiVerified: true,
      score: verificationResult.score 
    };
  } catch (error) {
    console.error('Email validation error:', error);
    // In case of errors, fall back to basic validation
    // to avoid blocking legitimate users
    return { isValid: true, apiVerified: false };
  }
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

export { 
  handleValidationErrors, 
  validateEmail, 
  validateEmailExistence,
  isDisposableEmail 
 };
