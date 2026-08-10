const fs = require('fs');

async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'babuvikas246', password: 'password123' })
    });
    const cookie = loginRes.headers.get('set-cookie');
    console.log('Login:', loginRes.status, await loginRes.text());
    if (!cookie) return;
    
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = '';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="chatId"\r\n\r\n';
    body += '6a772e811111111111111111\r\n';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="type"\r\n\r\n';
    body += 'IMAGE\r\n';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n';
    body += 'Content-Type: image/jpeg\r\n\r\n';
    body += 'fakeimagecontent\r\n';
    body += '--' + boundary + '--\r\n';
    
    const mediaRes = await fetch('http://127.0.0.1:8000/api/v1/media/message', {
      method: 'POST',
      headers: { 
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        Cookie: cookie 
      },
      body: body
    });
    console.log('Media status:', mediaRes.status, await mediaRes.text());
  } catch (err) {
    console.log('Setup error:', err.message);
  }
}
test();
