const http = require('http');

const randomName = 'test' + Date.now();
const registerData = JSON.stringify({
  username: randomName,
  email: randomName + '@example.com',
  password: 'password123'
});

const loginData = JSON.stringify({
  email: randomName + '@example.com',
  password: 'password123'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(registerData)
  }
}, (res) => {
  res.on('data', () => {});
  res.on('end', () => {
    // Now LOGIN
    const loginReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, (loginRes) => {
      let data = '';
      loginRes.on('data', chunk => data += chunk);
      loginRes.on('end', () => {
        console.log('Login Status:', loginRes.statusCode);
        const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
        console.log('Login Cookie:', cookie);

        http.get({
          hostname: 'localhost',
          port: 3000,
          path: '/chat/room',
          headers: {
            'Cookie': cookie
          }
        }, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            if (data2.includes('Guest_')) {
              console.log('Test Failed: Logged in but got Guest user.');
            } else if (data2.includes('Connected as: <strong id="myName">')) {
              const match = data2.match(/<strong id="myName">(.*?)<\/strong>/);
              console.log('Test Passed: Logged in as', match ? match[1] : 'Unknown');
            } else {
              console.log('Unexpected response');
            }
          });
        });
      });
    });
    loginReq.write(loginData);
    loginReq.end();
  });
});

req.write(registerData);
req.end();
