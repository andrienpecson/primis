// AI-generated (authored with Claude): HTML report generation.
import type { CountryRow } from "./transform.ts";

interface Column {
  label: string;
  sortable: boolean;
  type?: "number";
};

const COLUMNS: Column[] = [
  { label: "Country Name", sortable: true },
  { label: "Capital", sortable: true },
  { label: "Population", sortable: true, type: "number" },
  { label: "Languages", sortable: true },
  { label: "Currency", sortable: true },
  { label: "Flag", sortable: false },
];

const PAGE_TITLE = "European Countries Report";

export function toHtml(rows: CountryRow[], generatedAt: Date = new Date()): string {
  const headerCells = COLUMNS.map(toHeaderCell).join("");
  const bodyRows = rows.map(toTableRow).join("\n");
  const timestamp = formatTimestamp(generatedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(PAGE_TITLE)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 2rem;
      color: #1a1a1a;
      background: #f7f7f8;
    }
    h1 { margin: 0 0 0.25rem; font-size: 1.6rem; }
    .meta { margin: 0 0 1rem; color: #666; font-size: 0.9rem; }
    #search {
      width: 100%;
      max-width: 320px;
      padding: 8px 12px;
      margin: 0 0 1rem;
      font-size: 0.95rem;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }
    thead th {
      background: #2c3e50;
      color: #fff;
      text-align: left;
      padding: 12px 16px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    thead th.sortable { cursor: pointer; user-select: none; }
    thead th.sortable:hover { background: #34506b; }
    .sort-indicator { display: inline-block; width: 1.1em; text-align: center; }
    tbody td {
      padding: 10px 16px;
      border-top: 1px solid #eee;
      font-size: 0.92rem;
    }
    tbody tr:nth-child(even) { background: #f4f6f8; }
    tbody tr:hover { background: #eef4fb; }
    td.population { text-align: right; font-variant-numeric: tabular-nums; }
    td.flag img { display: block; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>${escapeHtml(PAGE_TITLE)}</h1>
  <p class="meta"><span id="count">${rows.length}</span> of ${rows.length} countries &middot; Generated ${escapeHtml(timestamp)}</p>
  <input type="search" id="search" placeholder="Search countries&hellip;" aria-label="Search countries">
  <table id="countries">
    <thead>
      <tr>${headerCells}</tr>
    </thead>
    <tbody>
${bodyRows}
    </tbody>
  </table>
  <script>
    (function () {
      var table = document.getElementById("countries");
      var tbody = table.querySelector("tbody");
      var search = document.getElementById("search");
      var countEl = document.getElementById("count");
      var headers = table.querySelectorAll("th.sortable");
      var sortIndex = -1;
      var ascending = true;

      function rows() {
        return Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      }

      // Filter rows by a case-insensitive substring match across all cells.
      search.addEventListener("input", function () {
        var term = search.value.trim().toLowerCase();
        var visible = 0;
        rows().forEach(function (row) {
          var match = row.textContent.toLowerCase().indexOf(term) !== -1;
          row.style.display = match ? "" : "none";
          if (match) visible++;
        });
        countEl.textContent = visible;
      });

      // Numeric parse for the Population column ("1,234,567" -> 1234567).
      function toNumber(text) {
        var n = parseFloat(text.replace(/[^0-9.]/g, ""));
        return isNaN(n) ? -Infinity : n;
      }

      headers.forEach(function (th) {
        th.addEventListener("click", function () {
          var index = Number(th.getAttribute("data-index"));
          var numeric = th.getAttribute("data-type") === "number";
          if (sortIndex === index) { ascending = !ascending; }
          else { sortIndex = index; ascending = true; }

          var sorted = rows().sort(function (a, b) {
            var av = a.children[index].textContent.trim();
            var bv = b.children[index].textContent.trim();
            var cmp = numeric
              ? toNumber(av) - toNumber(bv)
              : av.localeCompare(bv, "en", { sensitivity: "base" });
            return ascending ? cmp : -cmp;
          });
          sorted.forEach(function (row) { tbody.appendChild(row); });

          headers.forEach(function (h) {
            h.querySelector(".sort-indicator").textContent =
              Number(h.getAttribute("data-index")) === sortIndex
                ? (ascending ? "▲" : "▼")
                : "";
          });
        });
      });
    })();
  </script>
</body>
</html>
`;
};

function toHeaderCell(column: Column, index: number): string {
  if (!column.sortable) {
    return `<th>${escapeHtml(column.label)}</th>`;
  }
  const typeAttr = column.type ? ` data-type="${column.type}"` : "";
  return `<th class="sortable" data-index="${index}"${typeAttr}>${escapeHtml(column.label)}<span class="sort-indicator"></span></th>`;
};

function toTableRow(row: CountryRow): string {
  return `      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.capital)}</td>
        <td class="population">${escapeHtml(row.population)}</td>
        <td>${escapeHtml(row.languages)}</td>
        <td>${escapeHtml(row.currency)}</td>
        <td class="flag">${flagCell(row)}</td>
      </tr>`;
};

/** Renders the flag as a 32px-wide <img>, or "N/A" when no URL is available. */
function flagCell(row: CountryRow): string {
  if (!row.flagUrl) return "N/A";
  const alt = escapeHtml(`Flag of ${row.name}`);
  return `<img src="${escapeHtml(row.flagUrl)}" width="32" alt="${alt}" loading="lazy">`;
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "long" });
};

/** Escapes text for safe use in HTML element and quoted-attribute contexts. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};