const multipart = require("parse-multipart");
const { PDFDocument } = require("pdf-lib");

exports.handler = async function(event) {
  try {
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    const b64 = event.body;
    const bodyBuffer = Buffer.from(b64, "base64");
    const boundary = multipart.getBoundary(contentType);
    const parts = multipart.Parse(bodyBuffer, boundary);

    // file part
    const filePart = parts.find(p => p.filename && p.type === "application/pdf");
    if (!filePart) return { statusCode: 400, body: "No PDF uploaded" };

    // optional pages field (as plain part)
    const pagesPart = parts.find(p => p.name === "pages");
    let pagesStr = pagesPart ? Buffer.from(pagesPart.data).toString() : "";
    // parse pages like "1,3-5"
    const pagesToUse = [];
    if (pagesStr) {
      pagesStr.split(",").map(p => p.trim()).forEach(token => {
        if (token.includes("-")) {
          const [a,b] = token.split("-").map(Number);
          for (let i=a; i<=b; i++) pagesToUse.push(i-1);
        } else {
          const n = Number(token); if (!isNaN(n)) pagesToUse.push(n-1);
        }
      });
    }

    const src = await PDFDocument.load(filePart.data);
    const out = await PDFDocument.create();
    if (pagesToUse.length === 0) {
      // default: first page
      const [p] = await out.copyPages(src, [0]);
      out.addPage(p);
    } else {
      const copied = await out.copyPages(src, pagesToUse);
      copied.forEach(p => out.addPage(p));
    }

    const buf = await out.save();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=extracted.pdf" },
      isBase64Encoded: true,
      body: Buffer.from(buf).toString("base64")
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Split failed" };
  }
};
