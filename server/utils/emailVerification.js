import dns from 'dns';
import { promisify } from 'util';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const resolveMx = promisify(dns.resolveMx);

// Verify if a domain has valid MX records
// This indicates if the domain can potentially receive emails
const verifyEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (error) {
    // If there's an error resolving MX records, the domain might not exist
    // or might not be configured for email
    return false;
  }
};

/**
 * Verify email existence using Abstract API
 * Documentation: https://www.abstractapi.com/api/email-verification-validation-api
 * 
 * Results include:
 * - deliverability: DELIVERABLE, UNDELIVERABLE, RISKY, UNKNOWN
 * - quality_score: 0.0 to 1.0
 * - is_disposable_email: true/false
 * - is_free_email: true/false
 */
const verifyEmailWithAbstractAPI = async (email) => {
  try {
    const apiKey = process.env.ABSTRACT_API_KEY;
    
    if (!apiKey) {
      console.warn('Abstract API key not found. Email verification skipped.');
      return { success: false, reason: 'API key not configured' };
    }
    
    const response = await axios.get('https://emailvalidation.abstractapi.com/v1/', {
      params: {
        api_key: apiKey,
        email: email
      },
      timeout: 5000 // 5 second timeout to avoid blocking the request
    });
    
    const data = response.data;
    
    // Check if the email is valid and deliverable
    if (data.deliverability === 'DELIVERABLE' && data.is_valid_format.value) {
      return {
        success: true,
        deliverable: true,
        score: data.quality_score,
        isDisposable: data.is_disposable_email.value,
        isFreeEmail: data.is_free_email.value
      };
    } else {
      return {
        success: true,
        deliverable: false,
        reason: data.deliverability,
        score: data.quality_score,
        isDisposable: data.is_disposable_email.value,
        isFreeEmail: data.is_free_email.value
      };
    }
  } catch (error) {
    console.error('Email API verification error:', error.message);
    // Don't block registration on API failure
    return { 
      success: false, 
      reason: 'API error', 
      error: error.message 
    };
  }
};

/**
 * Verify email existence using EVA (Email Verification API)
 * Documentation: https://eva.pingutil.com/
 * 
 * This is a free alternative if Abstract API is not available
 */
const verifyEmailWithEVA = async (email) => {
  try {
    const response = await axios.get(`https://api.eva.pingutil.com/email?email=${email}`, {
      timeout: 5000 // 5 second timeout
    });
    
    const data = response.data;
    
    if (data.status === 'success') {
      const result = data.data;
      
      return {
        success: true,
        deliverable: result.deliverable === true,
        score: result.deliverable ? 0.8 : 0.2,
        isDisposable: result.disposable,
        isFreeEmail: result.free
      };
    } else {
      return {
        success: false,
        reason: 'API error',
        error: data.message || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('EVA verification error:', error.message);
    // Don't block registration on API failure
    return { 
      success: false, 
      reason: 'API error', 
      error: error.message 
    };
  }
};

/**
 * Verify email using available services
 * Falls back to different services if the primary one fails
 */
const verifyEmailExists = async (email) => {
  // Try Abstract API first (if configured)
  if (process.env.ABSTRACT_API_KEY) {
    const result = await verifyEmailWithAbstractAPI(email);
    if (result.success) {
      return result;
    }
  }
  
  // Fall back to EVA (free service)
  const evaResult = await verifyEmailWithEVA(email);
  if (evaResult.success) {
    return evaResult;
  }
  
  // Fall back to MX record check if APIs fail
  const hasMX = await verifyEmailDomain(email);
  return {
    success: true,
    deliverable: hasMX,
    score: hasMX ? 0.5 : 0.1,
    apiVerified: false
  };
};

export { 
  verifyEmailDomain, 
  verifyEmailExists, 
  verifyEmailWithAbstractAPI, 
  verifyEmailWithEVA 
};
