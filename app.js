// app.js

function makeId(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

/**
 * باز کردن صفحه GitHub برای ایجاد یک فایل
 */
function openGithubCreateFile({ owner, repo, branch, path, content }) {
  const params = new URLSearchParams();
  params.set('filename', path);
  params.set('value', content);
  const branchSegment = branch ? `/new/${encodeURIComponent(branch)}` : '/new';
  const url = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${branchSegment}?${params.toString()}`;
  window.open(url, '_blank');
}

// پردازش فایل‌ها از textarea و ایجاد لینک‌ها
document.getElementById('createBtn').addEventListener('click', () => {
  const owner = document.getElementById('owner').value.trim() || 'rdnsparham-rgb';
  const repo  = document.getElementById('repo').value.trim() || 'V1';
  const prefix = document.getElementById('prefix').value.trim() || 'V1';
  const filesText = document.getElementById('files').value.trim();
  const branch = 'main'; // یا undefined اگر branch پیشفرض را بخواهی

  if (!filesText) { alert('لطفا فایل‌ها را مشخص کنید'); return; }

  // هر خط = یک فایل با فرمت filename=content
  const lines = filesText.split('\n');
  const rnd = makeId(7); // مسیر رندم اصلی
  lines.forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex > -1) {
      const fname = line.slice(0, eqIndex).trim();
      const content = line.slice(eqIndex+1).trim();
      const path = `${prefix}/${rnd}/${fname}`;
      openGithubCreateFile({ owner, repo, branch, path, content });
    }
  });
});
