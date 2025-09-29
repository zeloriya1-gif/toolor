// Paraphrase
async function paraphrase(text) {
  const res = await fetch('/.netlify/functions/paraphrase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const j = await res.json();
  return j.result;
}

// Grammar
async function checkGrammar(text) {
  const res = await fetch('/.netlify/functions/grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json(); // { suggestions: [...] }
}

// Summarize
async function summarize(text) {
  const res = await fetch('/.netlify/functions/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json(); // { summary: "..." }
}

// PDF Merge (files array from <input type=file multiple>)
async function mergePDFs(files) {
  const form = new FormData();
  for (let i = 0; i < files.length; i++) form.append('file' + i, files[i], files[i].name);
  // Netlify function expects "application/octet-stream" - parse-multipart will read all parts
  const res = await fetch('/.netlify/functions/pdfMerge', {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error('Merge failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  // create download link
  const a = document.createElement('a'); a.href = url; a.download = 'merged.pdf'; a.click();
}

// PDF Split (single file, optional pages string)
async function splitPDF(file, pages) {
  const form = new FormData();
  form.append('file', file, file.name);
  if (pages) form.append('pages', pages); // e.g. "1,3-4"
  const res = await fetch('/.netlify/functions/pdfSplit', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Split failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'extracted.pdf'; a.click();
}
