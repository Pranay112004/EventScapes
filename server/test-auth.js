const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config/.env' });

const BASE_URL = 'http://localhost:5001';

async function testAuth() {
  console.log('🔍 Testing Authentication...');
  
  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };
  
  try {
    let token;
    
    // Try login first
    console.log('\n1. Testing Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', { hasToken: !!loginResponse.data.token });
      token = loginResponse.data.token;
    } catch (loginError) {
      if (loginError.response?.status === 400) {
        console.log('⚠️  User doesn\'t exist, trying registration...');
        
        const registerResponse = await axios.post(`${BASE_URL}/api/users/register`, testUser);
        console.log('✅ Registration successful:', { hasToken: !!registerResponse.data.token });
        token = registerResponse.data.token;
      } else {
        throw loginError;
      }
    }
    
    console.log('\n2. Testing Protected Route...');
    const meResponse = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: { 'x-auth-token': token }
    });
    console.log('✅ Protected route successful:', { userName: meResponse.data.name, email: meResponse.data.email });
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', {
      status: error.response?.status,
      message: error.response?.data?.msg || error.message,
      url: error.config?.url,
      data: error.response?.data
    });
  }
}

// Only run if the server is running
if (require.main === module) {
  testAuth();
}

module.exports = testAuth;
