// app.js
const el = id => document.getElementById(id);
const out = txt => el('out').textContent = txt;

function parseFiles(text){
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  const arr = [];
  for(const line of lines){
    const idx = line.indexOf('=');
    if(idx === -1) continue;
    const name = line.slice(0,idx).trim();
    const content = line.slice(idx+1).trim();
    arr.push({ filename: name, content });
  }
  return arr;
}

el('sendBtn').addEventListener('click', async ()=>{
  const owner = el('owner').value.trim();
  const repo = el('repo').value.trim();
  const branch = el('branch').value.trim() || 'main';
  const prefix = el('prefix').value.trim() || 'V1';
  const token = el('triggerToken').value.trim();
  if(!owner || !repo){ alert('owner و repo را وارد کن'); return; }
  if(!token){ if(!confirm('توکنی وارد نکردی — ادامه می‌دی؟ (نیاز به token برای ارسال از مرورگر هست)')){} }

  const files = parseFiles(el('files').value);
  if(files.length===0){ alert('فایلی تنظیم نشده'); return; }

  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
  const payload = {
    event_type: "create_project",
    client_payload: {
      branch,
      prefix,
      files
    }
  };

  try {
    out('در حال ارسال request به GitHub API...');
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        // برای ارسال از مرورگر باید توکن بفرستی — این توکن قابل دیدن است!
        'Authorization': token ? `token ${token}` : ''
      },
      body: JSON.stringify(payload)
    });

    if(resp.status === 204){
      out('✅ درخواست ثبت شد. Action باید اجرا شود. (ممکن است چند ثانیه طول بکشد)');
    } else {
      const data = await resp.json();
      out('⚠️ خطا: ' + JSON.stringify(data, null, 2));
    }
  } catch (e){
    out('خطا در ارسال: ' + e.message);
  }
});
