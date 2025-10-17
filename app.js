// app.js — ارسال درخواست به سرور

async function createOnServer(payload) {
  const SERVER = 'http://localhost:3000';  // یا آدرس سرور واقعی
  const SECRET = 'mysecret123';            // همان SHARED_SECRET در سرور

  const resp = await fetch(`${SERVER}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SHARED-SECRET': SECRET
    },
    body: JSON.stringify(payload)
  });
  return resp.json();
}

document.getElementById('createBtn').addEventListener('click', async () => {
  const owner = document.getElementById('owner').value.trim() || 'rdnsparham-rgb';
  const repo  = document.getElementById('repo').value.trim() || 'V1';
  const prefix = document.getElementById('prefix').value.trim() || 'V1';
  const filesText = document.getElementById('files').value.trim();
  if (!filesText) return alert('لطفا فایل‌ها را مشخص کنید');

  const lines = filesText.split('\n');
  const files = lines.map(line => {
    const i = line.indexOf('=');
    if (i === -1) return { filename: line.trim(), content: '' };
    return { filename: line.slice(0,i).trim(), content: line.slice(i+1).trim() };
  });

  const payload = { owner, repo, prefix, files };
  try {
    const result = await createOnServer(payload);
    if (result.ok) {
      alert('ساخته شد: پوشه: ' + result.folder + '\n' + result.results.map(r=>r.url).join('\n'));
      console.log(result);
    } else {
      alert('خطا: ' + JSON.stringify(result));
    }
  } catch (e) {
    alert('خطا در ارتباط با سرور: ' + e.message);
  }
});
