// small helper
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

document.getElementById('year').innerText = new Date().getFullYear();

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  themeToggle.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
});

// show docs (placeholder)
function openDocs(name){
  alert('Documentation for '+name+'. Backend endpoints: /.netlify/functions/'+name);
}

/* ---------- Writing tools (calls to serverless functions) ---------- */
async function doParaphrase(){
  const text = document.getElementById('paraInput').value.trim();
  if(!text){ alert('Please paste some text'); return; }
  const out = document.getElementById('paraOutput');
  out.value = 'Processing...';
  try {
    const res = await fetch('/.netlify/functions/paraphrase', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    });
    if(!res.ok) throw new Error('Server error');
    const json = await res.json();
    out.value = json.result || '';
  } catch(e){
    out.value = '';
    alert('Paraphrase failed: '+e.message);
  }
}

async function doGrammar(){
  const text = document.getElementById('grammarInput').value.trim();
  if(!text){ alert('Please paste text'); return; }
  const box = document.getElementById('grammarResult');
  box.innerHTML = 'Checking...';
  try {
    const res = await fetch('/.netlify/functions/grammar', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    });
    if(!res.ok) throw new Error('Server error');
    const json = await res.json();
    if(json.suggestions && json.suggestions.length){
      box.innerHTML = '<ul>' + json.suggestions.map(s => `<li><strong>Line ${s.line}:</strong> ${s.issue} → <em>${s.suggestion}</em></li>`).join('') + '</ul>';
    } else {
      box.innerHTML = '<div style="color:green">No major issues found.</div>';
    }
  } catch(e){
    box.innerHTML = '';
    alert('Grammar check failed: '+e.message);
  }
}

async function doSummarize(){
  const text = document.getElementById('sumInput').value.trim();
  if(!text){ alert('Please paste text'); return; }
  const out = document.getElementById('sumOutput');
  out.value = 'Summarizing...';
  try {
    const res = await fetch('/.netlify/functions/summarize', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    });
    if(!res.ok) throw new Error('Server error');
    const json = await res.json();
    out.value = json.summary || '';
  } catch(e){
    out.value = '';
    alert('Summarize failed: '+e.message);
  }
}

function copyOutput(id){
  const el = document.getElementById(id);
  if(!el || !el.value) return alert('Nothing to copy');
  navigator.clipboard.writeText(el.value).then(()=> alert('Copied to clipboard'));
}

/* ---------- PDF tools (file inputs + calls) ---------- */

/* helper to download blob */
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename || 'file.bin';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Merge PDFs */
document.getElementById('mergePdfInput').addEventListener('change', async function(e){
  const files = Array.from(e.target.files);
  if(!files.length) return;
  const form = new FormData();
  files.forEach((f,i)=> form.append('file'+i, f, f.name));
  try {
    const res = await fetch('/.netlify/functions/pdfMerge', { method:'POST', body: form });
    if(!res.ok) throw new Error('Merge failed');
    const blob = await res.blob();
    downloadBlob(blob, 'merged.pdf');
  } catch(err){
    alert(err.message);
  }
});

/* Split PDF */
document.getElementById('splitPdfInput').addEventListener('change', async function(e){
  const file = e.target.files[0];
  const pages = document.getElementById('splitPages').value.trim();
  if(!file) return;
  const form = new FormData();
  form.append('file', file, file.name);
  if(pages) form.append('pages', pages);
  try {
    const res = await fetch('/.netlify/functions/pdfSplit', { method:'POST', body: form });
    if(!res.ok) throw new Error('Split failed');
    const blob = await res.blob();
    downloadBlob(blob, 'extracted.pdf');
  } catch(err){
    alert(err.message);
  }
});

/* PDF->Word (basic) */
document.getElementById('pdfToWordInput').addEventListener('change', async function(e){
  const file = e.target.files[0]; if(!file) return;
  const form = new FormData(); form.append('file', file, file.name);
  try {
    const res = await fetch('/.netlify/functions/pdfToWord', { method:'POST', body: form });
    if(!res.ok) throw new Error('Conversion failed');
    const blob = await res.blob();
    downloadBlob(blob, 'converted.docx');
  } catch(err){
    alert(err.message);
  }
});

/* Word->PDF */
document.getElementById('wordToPdfInput').addEventListener('change', async function(e){
  const file = e.target.files[0]; if(!file) return;
  const form = new FormData(); form.append('file', file, file.name);
  try {
    const res = await fetch('/.netlify/functions/wordToPdf', { method:'POST', body: form });
    if(!res.ok) throw new Error('Conversion failed');
    const blob = await res.blob();
    downloadBlob(blob, 'converted.pdf');
  } catch(err){
    alert(err.message);
  }
});
