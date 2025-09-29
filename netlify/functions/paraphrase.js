exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const text = (body.text || "").trim();
    if (!text) return { statusCode: 400, body: "No text provided" };

    const synonyms = {
      quick: ["fast","speedy"],
      happy: ["joyful","content"],
      good: ["great","excellent"],
      bad: ["poor","subpar"],
      help: ["assist","aid"]
    };

    const result = text.split(/\b/).map(token => {
      const key = token.toLowerCase();
      if (synonyms[key]) {
        const arr = synonyms[key];
        return arr[Math.floor(Math.random()*arr.length)];
      }
      return token;
    }).join("");

    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };
  } catch (err) {
    return { statusCode: 500, body: "Server error" };
  }
};
