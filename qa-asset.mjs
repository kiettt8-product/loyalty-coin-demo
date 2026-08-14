import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/lap14883/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 912 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", error => consoleErrors.push(error.message));

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Promo Asset Campaign" }).click();

const assetHeaders = await page.locator(".asset-table th").allTextContents();
const expectedHeaders = ["ID ◆", "MKT Name", "MKT Code", "Total Budget", "Reward ID", "Distribution Type", "Distribute time ◆", "Distribute to", "Status", "Action"];
if (JSON.stringify(assetHeaders) !== JSON.stringify(expectedHeaders)) throw new Error("Promo Asset listing columns do not match Figma");
if (await page.locator(".asset-table tbody tr").count() !== 10) throw new Error("Promo Asset list must render 10 mock rows");
await page.screenshot({ path: "demo-asset-list.png", fullPage: true });

await page.getByRole("button", { name: "Add new" }).click();
const dialog = page.getByRole("dialog", { name: "How you want to distribute the voucher" });
if (!await dialog.isVisible()) throw new Error("Add new distribution modal is missing");
const choices = await dialog.locator('input[name="distributionChoice"]').count();
if (choices !== 3 || !await dialog.locator('input[value="massive"]').isChecked()) throw new Error("Distribution options do not match Figma");
await page.screenshot({ path: "demo-asset-add-new.png", fullPage: true });

await dialog.getByRole("button", { name: "OK" }).click();
await page.locator("#assetMassiveForm").waitFor({ state: "visible" });
if (!await page.locator("#assetMassiveForm").isVisible()) throw new Error("Distribute Massive form did not open");
const sectionHeadings = await page.locator(".asset-form-section > h1").allTextContents();
if (JSON.stringify(sectionHeadings) !== JSON.stringify(["Basic Information", "Reward Package", "Budget Alert"])) throw new Error("Massive form sections do not match Figma");
if (await page.locator(".asset-reward-block").count() !== 1) throw new Error("Massive form must start with one reward");
await page.screenshot({ path: "demo-asset-massive.png", fullPage: true });

await page.getByRole("button", { name: "Add More Reward" }).click();
if (await page.locator(".asset-reward-block").count() !== 2) throw new Error("Add More Reward is not interactive");
await page.getByRole("button", { name: "Save & Submit" }).click();
const validationCount = await page.locator(".asset-field-error").count();
if (validationCount < 7) throw new Error("Massive form validation is incomplete");
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);

console.log(JSON.stringify({ assetHeaders, choices, sectionHeadings, validationCount, consoleErrors }, null, 2));
await browser.close();
