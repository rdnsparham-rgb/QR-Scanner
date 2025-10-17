// Node.js — اجرا: node Node.js
// نیاز: npm i express body-parser @octokit/rest dotenv cors

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SHARED_SECRET = process.env.SHARED_SECRET || 'change-this-secret';
const PORT = process.env.PORT || 3000;

if (!GITHUB_TOKEN) {
  console.error('Error: set GITHUB_TOKEN in env (Personal Access Token)');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function makeId(len = 8) {
  return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len);
}

app.post('/create', async (req, res) => {
  try {
    const clientSecret = req.get('X-SHARED-SECRET') || '';
    if (!clientSecret || clientSecret !== SHARED_SECRET) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const body = req.body || {};
    const owner = body.owner || process.env.DEFAULT_OWNER;
    const repo  = body.repo  || process.env.DEFAULT_REPO;
    const branch = body.branch; // optional
    const prefix = (body.prefix || 'V1').replace(/[^A-Za-z0-9_\-]/g, '');
    const files = body.files || [];

    if (!owner || !repo) return res.status(400).json({ ok:false, message: 'owner and repo required' });
    if (!Array.isArray(files) || files.length === 0) return res.status(400).json({ ok:false, message: 'files array required' });

    const rnd = makeId(7);
    const folder = `${prefix}/${rnd}`;
    const results = [];

    for (const f of files) {
      const filename = (f.filename || 'index.html').replace(/^\/*/, '');
      const content = (f.content || '');
      const path = `${folder}/${filename}`;

      const base64content = Buffer.from(content, 'utf8').toString('base64');

      const params = {
        owner,
        repo,
        path,
        message: `Create ${path} via web UI`,
        content: base64content,
        committer: { name: "Auto Creator", email: "no-reply@example.com" },
        author:    { name: "Auto Creator", email: "no-reply@example.com" },
      };
      if (branch) params.branch = branch;

      const resp = await octokit.repos.createOrUpdateFileContents(params);
      results.push({ path, url: resp.data.content.html_url });
    }

    return res.json({ ok: true, folder, results });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const details = err.response && err.response.data ? err.response.data : undefined;
    return res.status(status).json({ ok: false, message: err.message, details });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
