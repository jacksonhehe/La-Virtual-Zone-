const axios = require('axios');
require('dotenv').config();

async function testRegister() {
  try {
    const testData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPass123',
      role: 'USER'
    };

    const API_URL = process.env.API_URL || 'http://localhost:3000';
    console.log('Probando registro con datos:', testData);

    const response = await axios.post(`${API_URL}/auth/register`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registro exitoso:', response.data);
  } catch (error) {
    console.error('❌ Error en el registro:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testRegister(); 