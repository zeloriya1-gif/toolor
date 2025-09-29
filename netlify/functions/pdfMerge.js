const multipart = require("parse-multipart");
const { PDFDocument } = require("pdf-lib");

exports.handler = async function(event) {
  try {
    // event.body is base64 when content-type is multipart/form-data
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return { statusCode: 400, body: "Content-Type must be multipart/form-data" };
    }

    const b64 = event.body;
    const bodyBuffer = Buffer.from(b64, "base64");
    const boundary = multipart.getBoundary(contentType);
    const parts = multipart.Parse(bodyBuffer, boundary);

    // collect pdf parts with filename
    const pdfParts = parts.filter(p => p.filename && p.type === "application/pdf");
    if (!pdfParts.length) return { statusCode: 400, body: "No PDF files uploaded" };

    const mergedPdf = await PDFDocument.create();
    for (const p of pdfParts) {
      const donor = await PDFDocument.load(p.data);
      const copied = await mergedPdf.copyPages(donor, donor.getPageIndices());
      copied.forEach(pg => mergedPdf.addPage(pg));
    }
    const mergedBytes = await mergedPdf.save();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=merged.pdf" },
      isBase64Encoded: true,
      body: Buffer.from(mergedBytes).toString("base64")
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Merge failed" };
  }
};
