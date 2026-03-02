import { extraerFlashscore, toCSV } from "./htmlParser.js";

// Sample HTML that mimics FlashScore structure
const sampleHTML = `
<html>
<body>
  <div class="headerLeague__wrapper">
    <span class="headerLeague__category-text">USA:</span>
    <a class="headerLeague__title" href="/basketball/usa/nba/">NBA</a>
  </div>
  <div class="event__match" id="g_1_ABC123">
    <a class="eventRowLink" href="/match/ABC123/#/match-summary"></a>
    <div class="event__participant--home">Los Angeles Lakers</div>
    <div class="event__participant--away">Boston Celtics</div>
    <span class="event__score--home">110</span>
    <span class="event__score--away">105</span>
    <div class="event__stage">Final</div>
  </div>
  <div class="event__match" id="g_1_DEF456">
    <a class="eventRowLink" href="/match/DEF456/#/match-summary"></a>
    <div class="event__participant--home">Miami Heat</div>
    <div class="event__participant--away">Chicago Bulls</div>
    <div class="event__stage">Q2</div>
  </div>
  <div class="headerLeague__wrapper">
    <span class="headerLeague__category-text">SPAIN:</span>
    <a class="headerLeague__title" href="/basketball/spain/acb/">ACB</a>
  </div>
  <div class="event__match" id="g_1_GHI789">
    <div class="event__participant--home">Real Madrid</div>
    <div class="event__participant--away">FC Barcelona</div>
    <span class="event__score--home">88</span>
    <span class="event__score--away">92</span>
  </div>
</body>
</html>
`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ ${message}`);
  }
}

console.log("Test: extraerFlashscore");

const results = extraerFlashscore(sampleHTML);

assert(Array.isArray(results), "returns an array");
assert(results.length === 3, `extracts 3 matches (got ${results.length})`);

// First match — USA / NBA
assert(results[0]["País"] === "USA", `first match country is USA (got "${results[0]["País"]}")`);
assert(results[0]["Liga"] === "NBA", `first match league is NBA (got "${results[0]["Liga"]}")`);
assert(results[0]["Link Liga"] === "https://www.flashscore.com/basketball/usa/nba/", `first match league link correct`);
assert(results[0]["Partido"] === "Los Angeles Lakers vs Boston Celtics", `first match teams correct`);
assert(results[0]["Resultado"] === "110-105", `first match score is 110-105 (got "${results[0]["Resultado"]}")`);
assert(results[0]["Estado"] === "Final", `first match status is Final`);
assert(results[0]["Link Partido"] === "https://www.flashscore.com/match/ABC123/#/match-summary", `first match link correct`);

// Second match — no score (VS)
assert(results[1]["Resultado"] === "VS", `second match without score shows VS (got "${results[1]["Resultado"]}")`);
assert(results[1]["Estado"] === "Q2", `second match status is Q2`);
assert(results[1]["País"] === "USA", `second match inherits USA country`);

// Third match — SPAIN / ACB
assert(results[2]["País"] === "SPAIN", `third match country is SPAIN`);
assert(results[2]["Liga"] === "ACB", `third match league is ACB`);
assert(results[2]["Resultado"] === "88-92", `third match score is 88-92`);
assert(results[2]["Estado"] === "Finalizado", `third match without stage shows Finalizado`);
assert(results[2]["Link Partido"] === "", `third match without link returns empty string`);

console.log("\nTest: toCSV");

const csv = toCSV(results);
const lines = csv.split("\n");

assert(lines.length === 4, `CSV has 4 lines (header + 3 rows), got ${lines.length}`);
assert(lines[0] === "País,Liga,Link Liga,Partido,Resultado,Estado,Link Partido", `CSV header matches expected columns`);
assert(lines[1].includes("Los Angeles Lakers vs Boston Celtics"), "CSV first row includes teams");

console.log("\nTest: toCSV with empty data");

const emptyCSV = toCSV([]);
assert(emptyCSV === "", "toCSV with empty array returns empty string");

const nullCSV = toCSV(null);
assert(nullCSV === "", "toCSV with null returns empty string");

console.log("\nTest: toCSV escapes newlines in values");

const dataWithNewlines = [{
  País: "USA",
  Liga: "NBA\nBasketball",
  "Link Liga": "",
  Partido: "Team A\r\nvs Team B",
  Resultado: "VS",
  Estado: "Scheduled",
  "Link Partido": "",
}];
const csvNewlines = toCSV(dataWithNewlines);
assert(!csvNewlines.includes("NBA\n"), "newlines in values are replaced");

console.log("\nTest: extraerFlashscore with empty HTML");

const emptyResults = extraerFlashscore("<html><body></body></html>");
assert(emptyResults.length === 0, "empty HTML returns empty array");

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
