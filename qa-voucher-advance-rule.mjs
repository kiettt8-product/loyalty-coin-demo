import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const runtimeModules = "/Users/lap60614/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const { chromium } = require(path.join(runtimeModules, "playwright"));
const pixelmatch = require(path.join(runtimeModules, "pixelmatch")).default;
const { PNG } = require(path.join(runtimeModules, "pngjs"));

const outputDir = path.join("qa-artifacts");
const baselinePath = path.join("qa-baselines", "voucher-advance-rule.png");
const screenshotPath = path.join(outputDir, "voucher-advance-rule.png");
const diffPath = path.join(outputDir, "voucher-advance-rule-diff.png");
const updateVisual = process.argv.includes("--update-visual");
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const browserErrors = [];
page.on("console", message => {
  if (message.type() === "error" && !message.text().includes("Failed to load resource")) browserErrors.push(message.text());
});
page.on("pageerror", error => browserErrors.push(error.message));
page.on("requestfailed", request => {
  if (request.url().startsWith("http://127.0.0.1:4173/")) browserErrors.push(`${request.url()}: ${request.failure()?.errorText || "request failed"}`);
});

try {
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("crmRuleFieldCatalogV1", JSON.stringify({
      categories: ["Check user profile", "Account & Segment", "Custom checks"],
      systemCategories: ["Check user profile", "Account & Segment"],
      checks: [{ id: "demo-state-check", name: "Demo State Check", category: "Custom checks", responseField: "demo.userState", dataType: "string", values: ["Ready", "Paused"], surfaces: ["voucher", "ruleEngine"] }]
    }));
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Asset Management" }).click();
  await page.getByRole("button", { name: "Voucher", exact: true }).click();
  await page.locator(".voucher-list-screen").waitFor();
  await page.getByRole("button", { name: "Add New" }).click();
  await page.locator("#voucherCreateForm").waitFor();

  const picker = page.locator("#voucherConditionList .rule-condition-search").first();
  await picker.click();
  await page.getByRole("option", { name: "Check KYC level", exact: true }).click();
  await page.getByRole("button", { name: "+ Add condition", exact: true }).click();
  await page.locator("#voucherConditionList .rule-condition-row").nth(1).locator(".rule-condition-search").click();
  await page.getByRole("option", { name: "Demo State Check", exact: true }).click();

  const geometry = await page.locator("#voucherConditionList .rule-condition-row").evaluateAll(rows => {
    const rect = node => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    return rows.map(row => ({
      row: rect(row),
      field: rect(row.querySelector(".rule-condition-search")),
      operator: rect(row.querySelector(".voucher-single-select-control")),
      value: rect(row.querySelector(".voucher-multi-select-control, .voucher-condition-value .voucher-single-select-control, .rule-simple-value-input")),
      remove: rect(row.querySelector(".voucher-condition-remove"))
    }));
  });
  if (geometry.length !== 2) throw new Error(`Expected 2 configured condition rows; got ${geometry.length}`);
  const baseline = geometry[0];
  for (const [index, item] of geometry.entries()) {
    for (const [name, box] of [["field", item.field], ["operator", item.operator], ["value", item.value], ["remove", item.remove]]) {
      if (!box || box.height !== 32) throw new Error(`Condition ${index + 1} ${name} should be a visible 32px control: ${JSON.stringify(box)}`);
    }
    for (const name of ["field", "operator", "value", "remove"]) {
      const delta = Math.abs(item[name].x - baseline[name].x);
      const widthDelta = Math.abs(item[name].width - baseline[name].width);
      if (delta > 1 || widthDelta > 1) throw new Error(`${name} column differs between rows: ${JSON.stringify({ first: baseline[name], current: item[name] })}`);
    }
    const rowTopDelta = Math.abs(item.field.y - item.operator.y) + Math.abs(item.field.y - item.value.y) + Math.abs(item.field.y - item.remove.y);
    if (rowTopDelta > 3) throw new Error(`Condition ${index + 1} controls do not share a top edge: ${JSON.stringify(item)}`);
  }

  const connector = await page.locator("#voucherConditionList .rule-condition-node").nth(1).evaluate(node => {
    const previousControl = node.previousElementSibling.querySelector(".rule-condition-search").getBoundingClientRect();
    const nextControl = node.querySelector(".rule-condition-search").getBoundingClientRect();
    const outer = node.querySelector(".rule-condition-connector").getBoundingClientRect();
    const control = node.querySelector(".rule-condition-connector select").getBoundingClientRect();
    return {
      previousBottom: previousControl.bottom,
      nextTop: nextControl.top,
      gapCenter: (previousControl.bottom + nextControl.top) / 2,
      outer: { y: outer.y, height: outer.height },
      control: { y: control.y, height: control.height },
      controlCenter: control.y + control.height / 2
    };
  });
  const centerDelta = Math.abs(connector.gapCenter - connector.controlCenter);
  if (centerDelta > 1) throw new Error(`AND/OR selector is not centered between condition rows: ${JSON.stringify(connector)}`);

  await page.locator(".voucher-advanced-rule").scrollIntoViewIfNeeded();
  await page.mouse.move(1590, 15);
  await mkdir(outputDir, { recursive: true });
  const screenshot = await page.locator(".voucher-advanced-rule").screenshot({ animations: "disabled" });
  await writeFile(screenshotPath, screenshot);

  if (updateVisual) {
    await mkdir(path.dirname(baselinePath), { recursive: true });
    await writeFile(baselinePath, screenshot);
    console.log(`Updated visual baseline: ${baselinePath}`);
  } else {
    const expected = PNG.sync.read(await readFile(baselinePath));
    const actual = PNG.sync.read(screenshot);
    if (actual.width !== expected.width || actual.height !== expected.height) {
      throw new Error(`Screenshot dimensions changed: expected ${expected.width}x${expected.height}; got ${actual.width}x${actual.height}`);
    }
    const diff = new PNG({ width: actual.width, height: actual.height });
    const differentPixels = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, { threshold: 0.12 });
    await writeFile(diffPath, PNG.sync.write(diff));
    const maxDiffPixels = Math.max(80, Math.floor(actual.width * actual.height * 0.0005));
    if (differentPixels > maxDiffPixels) throw new Error(`Advance Rule visual diff too large: ${differentPixels} pixels (max ${maxDiffPixels}). Inspect ${diffPath}`);
    console.log(`Visual comparison passed: ${differentPixels} changed pixels (max ${maxDiffPixels}).`);
  }

  if (browserErrors.length) throw new Error(`Browser errors: ${browserErrors.join(" | ")}`);
  console.log(JSON.stringify({ geometry, connector, browserErrors }, null, 2));
} finally {
  await browser.close();
}
