exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const text = (body.text || "").trim();
    if (!text) return { statusCode: 400, body: "No text provided" };

    const suggestions = [];
    const lines = text.split(/\n/);
    lines.forEach((ln,i) => {
      if (/\bteh\b/i.test(ln)) suggestions.push({ line: i+1, issue: 'typo "teh"', suggestion: ln.replace(/\bteh\b/gi,'the') });
      if (/\brecieve\b/i.test(ln)) suggestions.push({ line: i+1, issue: 'typo "recieve"', suggestion: ln.replace(/\brecieve\b/gi,'receive') });
      if (/\b(\w+)\s+\1\b/i.test(ln)) suggestions.push({ line: i+1, issue: 'Repeated word', suggestion: ln.replace(/\b(\w+)\s+\1\b/gi,'$1') });
    });

    return { statusCode: 200, body: JSON.stringify({ suggestions }) };
  } catch(e) {
    return { statusCode: 500, body: "Server error" };
  }
};
