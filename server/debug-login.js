const { spawn } = require('child_process');
const axios = require('axios');

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url);
      return true;
    } catch (error) {
      console.log(`Waiting for server... (attempt ${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function debugLogin() {
  console.log('🚀 Starting server and testing login...\n');
  
  // Start the server
  const server = spawn('node', ['server.js'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });
  
  server.stdout.on('data', (data) => {
    console.log(`SERVER: ${data.toString().trim()}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`SERVER ERROR: ${data.toString().trim()}`);
  });
  
  // Wait for server to be ready
  console.log('Waiting for server to start...');
  const serverReady = await waitForServer('http://localhost:5001');
  
  if (!serverReady) {
    console.error('❌ Server failed to start within timeout');
    server.kill();
    process.exit(1);
  }
  
  console.log('✅ Server is ready! Running authentication tests...\n');
  
  // Run the auth test
  const testAuth = require('./test-auth');
  await testAuth();
  
  // Keep server running for manual testing
  console.log('\n✨ Server is still running on http://localhost:5001');
  console.log('📋 You can now test login from the frontend at http://localhost:5173');
  console.log('🛑 Press Ctrl+C to stop the server');
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill();
    process.exit(0);
  });
}

debugLogin().catch(error => {
  console.error('❌ Debug script failed:', error);
  process.exit(1);
});
