// ------------------------------------------------------------------
// Field map: form input id  ->  preview element id
// ------------------------------------------------------------------
const fieldMap = {
  name: "pv-name",
  studentId: "pv-studentId",
  courseTitle: "pv-courseTitle",
  courseCode: "pv-courseCode",
  section: "pv-section",
  experiment: "pv-experiment",
  toName: "pv-toName",
  toDesignation: "pv-toDesignation",
  toDepartment: "pv-toDepartment"
};

// Session year always reflects the current year and isn't user-editable.
document.getElementById("sessionYear").value = new Date().getFullYear();

function formatDate(isoValue) {
  if (!isoValue) return "";
  const [y, m, d] = isoValue.split("-");
  if (!y || !m || !d) return isoValue;
  return `${d}.${m}.${y}`;
}

function updatePreview() {
  Object.entries(fieldMap).forEach(([inputId, previewId]) => {
    const val = document.getElementById(inputId).value.trim();
    document.getElementById(previewId).textContent = val || "\u00A0";
  });

  const toName = document.getElementById("toName").value.trim();
  document.getElementById("pv-toName").textContent = toName
    ? toName
    : "\u00A0";

  const semester = document.getElementById("session").value;
  const year = document.getElementById("sessionYear").value;
  document.getElementById("pv-session").textContent =
    semester && year ? `${semester} ${year}` : "\u00A0";

  const docTitle = document.getElementById("docTitle").value;
  document.getElementById("pv-docTitle").textContent = docTitle;

  const dateVal = document.getElementById("subDate").value;
  document.getElementById("pv-subDate").textContent =
    formatDate(dateVal) || "\u00A0";
}

// Wire up live updates
document.querySelectorAll("#cover-form input, #cover-form select")
  .forEach(el => el.addEventListener("input", updatePreview));

updatePreview();

// ------------------------------------------------------------------
// PDF generation + download counter
// ------------------------------------------------------------------
const downloadBtn = document.getElementById("downloadBtn");
const btnLabel = document.getElementById("btnLabel");
const downloadCount = document.getElementById("downloadCount");

async function generatePdf() {
  const node = document.getElementById("cover-page");

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.98);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const yOffset = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
  pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, Math.min(imgHeight, pageHeight));

  const name = document.getElementById("name").value.trim() || "cover-page";
  const safeName = name.replace(/[^a-z0-9]+/gi, "_");
  pdf.save(`${safeName}_cover_page.pdf`);
}

async function bumpCounter() {
  try {
    const res = await fetch("counter.php", { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.count === "number") {
      downloadCount.textContent = `Total downloads so far: ${data.count}`;
    }
  } catch (err) {
    // Counter is a nice-to-have; failure here should never block the PDF.
    console.warn("Counter update failed:", err);
  }
}

downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  btnLabel.textContent = "Preparing PDF…";
  try {
    await generatePdf();
    await bumpCounter();
  } catch (err) {
    console.error(err);
    alert("Something went wrong while creating the PDF. Please try again.");
  } finally {
    downloadBtn.disabled = false;
    btnLabel.textContent = "Download PDF";
  }
});
