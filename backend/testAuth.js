const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing admin login with existing credentials...');
    
    // Test login with existing admin
    const response = await axios.post('http://localhost:3001/api/auth/admin/login', {
      email: 'ronak@gmail.com',
      password: 'test123'
    });
    
    console.log('Login successful:', response.data);
    
    // Test session check
    const sessionResponse = await axios.get('http://localhost:3001/api/auth/me', {
      headers: {
        Cookie: response.headers['set-cookie']?.[0] || ''
      }
    });
    
    console.log('Session check:', sessionResponse.data);
    
  } catch (error) {
    console.error('Auth test failed:', error.response?.data || error.message);
  }
}

testAuth();
