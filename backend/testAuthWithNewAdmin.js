const axios = require('axios');

async function testAuthWithNewAdmin() {
  try {
    console.log('Testing admin login with new test credentials...');
    
    // Test login with new test admin
    const response = await axios.post('http://localhost:3001/api/auth/admin/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('Login successful:', response.data);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    console.log('Cookie set:', response.headers['set-cookie'] ? 'Yes' : 'No');
    
    // Test session check
    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      const sessionResponse = await axios.get('http://localhost:3001/api/auth/me', {
        headers: {
          'Cookie': cookies.join('; ')
        }
      });
      
      console.log('Session check successful:', sessionResponse.data);
      console.log('User role:', sessionResponse.data.role);
    }
    
  } catch (error) {
    console.error('Auth test failed:', error.response?.data || error.message);
  }
}

testAuthWithNewAdmin();
