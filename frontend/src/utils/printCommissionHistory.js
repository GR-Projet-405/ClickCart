export default function printCommissionHistory(entries) {
  const frame = document.createElement("iframe");
  frame.title = "Recent commission history PDF";
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", width: "1px", height: "1px", left: "-10000px", border: "0" });
  document.body.appendChild(frame);
  const printDocument = frame.contentDocument;
  printDocument.open();
  printDocument.write(`<!doctype html><html><head><title>Recent commission history</title><style>
    @page { size: A4 landscape; margin: 15mm; }
    body { font: 11px Arial, sans-serif; color: #172b21; margin: 0; }
    h1 { font-size: 22px; margin: 0 0 18px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { padding: 9px 7px; border-bottom: 1px solid #d6dfda; text-align: left; overflow-wrap: anywhere; }
    th { background: #edf5ef; font-size: 10px; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th:nth-child(4), th:nth-child(5), td:nth-child(4), td:nth-child(5) { text-align: right; }
  </style></head><body><h1>Recent commission history</h1></body></html>`);
  printDocument.close();
  const table = printDocument.createElement("table");
  const header = table.createTHead().insertRow();
  ["Transaction", "Date", "Service", "Booking (LKR)", "Commission (LKR)", "Status"].forEach((label) => {
    const cell = printDocument.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    header.appendChild(cell);
  });
  const body = table.createTBody();
  entries.forEach((entry) => {
    const row = body.insertRow();
    [entry.publicId || entry.transactionId, entry.date, entry.service, entry.bookingAmount, entry.commissionAmount, entry.status]
      .forEach((value) => { row.insertCell().textContent = value ?? "—"; });
  });
  printDocument.body.appendChild(table);
  if (!entries.length) {
    const empty = printDocument.createElement("p");
    empty.textContent = "No commission transactions recorded yet.";
    printDocument.body.appendChild(empty);
  }
  // Print an isolated document so navigation, dashboard cards and other tables are excluded.
  setTimeout(() => {
    frame.contentWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 60000);
  }, 250);
}
