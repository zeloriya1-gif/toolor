exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const text = (body.text || "").trim();
    if (!text) return { statusCode: 400, body: "No text provided" };

    const sentences = text.match(/[^.!?]+[.!?]?/g) || [];
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean);
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    const scored = sentences.map(s => {
      const ws = s.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean);
      let score = 0;
      ws.forEach(w => score += (freq[w] || 0));
      return { s: s.trim(), score };
    });

    scored.sort((a,b) => b.score - a.score);
    const take = Math.max(1, Math.min(3, Math.ceil(sentences.length * 0.25)));
    const top = scored.slice(0,take).sort((a,b) => text.indexOf(a.s) - text.indexOf(b.s)).map(x => x.s);
    const summary = top.join(" ");
    return { statusCode: 200, body: JSON.stringify({ summary }) };
  } catch(e) {
    return { statusCode: 500, body: "Server error" };
  }
};
