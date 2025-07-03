import { v2 as cloudinary } from 'cloudinary';

/**
 * Validate Cloudinary configuration and test connection
 */
export const validateCloudinary = async () => {
  console.log('🔍 Validating Cloudinary configuration...');

  // Check environment variables
  const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required Cloudinary environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('Please set these variables in your .env file');
    return false;
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful!');
      console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      return true;
    } else {
      console.error('❌ Cloudinary connection failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:');
    console.error('   Error:', error.message);
    
    if (error.http_code === 401) {
      console.error('   This usually means your API credentials are incorrect.');
    } else if (error.http_code === 404) {
      console.error('   This usually means your cloud name is incorrect.');
    }
    
    return false;
  }
};
