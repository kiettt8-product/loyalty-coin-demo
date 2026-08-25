import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/lap14883/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 912 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", error => consoleErrors.push(error.message));

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });

const activeRoute = await page.locator(".campaign-menu button.active").innerText();
if (activeRoute !== "Promotion Code") throw new Error("Promotion Code must be the default active route");

const headers = await page.locator("thead th").allTextContents();
const expectedHeaders = ["ID", "MKT Name", "MKT Code", "Total Budget", "Reward ID", "Code", "Code Type", "Active Time", "Status", "Label", "Created by", "Action"];
if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) throw new Error("Promotion list headers are incorrect");

const firstCodeType = await page.locator("#promoCampaignRows tr").nth(1).locator("td").nth(6).textContent();
const firstDisplayedCode = await page.locator("#promoCampaignRows tr").nth(1).locator("td").nth(5).textContent();
if (firstCodeType !== "Unique Code" || firstDisplayedCode !== "BAYHE") throw new Error("Unique code list display must truncate to 5 characters");

await page.getByRole("button", { name: "+ Add new" }).click();
await page.getByRole("button", { name: "Save", exact: true }).click();
const requiredErrors = await page.locator(".field-error").allTextContents();
for (const message of ["MKT Code is required", "MKT Name is required", "Budget Control is required", "Code Value is required", "Budget Sponsor is Required", "Reward ID is Required", "Segment is required", "Reward Active Time is required"]) {
  if (!requiredErrors.includes(message)) throw new Error(`Missing create validation: ${message}`);
}

await page.locator("#promoMktCode").selectOption("campaign");
await page.locator("#promoMktName").selectOption("quantm6_CB3_22");
await page.locator("#promoCodeValue").fill("hello#promo");
const sanitizedCode = await page.locator("#promoCodeValue").inputValue();
if (sanitizedCode !== "HELLOPROMO") throw new Error("Mass Code must sanitize to uppercase A-Z0-9");
await page.locator("#promoBudgetSponsor").selectOption("ZaloPay");
await page.locator("#promoRewardId").selectOption("1173");
await page.locator("#promoSegment").selectOption("New User");
await page.locator("#promoActiveStart").fill("2026-09-01T00:00");
await page.locator("#promoActiveEnd").fill("2026-12-31T23:59");
await page.locator("#promoMaxApplyQty").fill("1");
await page.locator("#promoStockLimitQty").fill("500");
await page.locator("#promoEmailInput").fill("kiettt8");
await page.locator("#promoEmailInput").press("Enter");
await page.locator("#promoThresholdInput").fill("10");
await page.locator("#promoThresholdInput").press("Enter");
await page.getByRole("button", { name: "Save & Submit" }).click();
await page.waitForTimeout(500);

const newRow = page.locator("#promoCampaignRows tr").first();
if (await newRow.locator("td").nth(8).textContent() !== "Auto Approved") throw new Error("Submitted Promotion Code should auto approve for low-cap reward");

await page.locator("#promoCampaignRows tr").filter({ hasText: "1098" }).getByRole("button", { name: "Edit" }).click();
if (!await page.locator("#promoMktCode").isDisabled()) throw new Error("Approved core fields must be locked");
if (await page.locator("#promoSegment").isDisabled()) throw new Error("Approved Segment must remain editable");
if (await page.locator("#promoUserTypes .choice-pill").first().isDisabled()) throw new Error("Approved User Type must remain editable");
if (!await page.locator("#promoActiveStart").isDisabled() || await page.locator("#promoActiveEnd").isDisabled()) throw new Error("Approved active time must be end-time extend only");

await page.getByRole("button", { name: "Cancel" }).click();
await page.locator("#promoCampaignRows tr").filter({ hasText: "1023" }).getByRole("button", { name: "Edit" }).click();
const processingButton = await page.locator("#promoExportCode").textContent();
if (processingButton !== "Processing codes...") throw new Error("Processing state for unique code export is missing");
await page.getByRole("button", { name: "Cancel" }).click();

await page.locator("#promoCampaignRows tr").filter({ hasText: "1019" }).getByRole("button", { name: "Edit" }).click();
const retryVisible = await page.getByRole("button", { name: "Retry" }).isVisible();
if (!retryVisible) throw new Error("Failed unique code generation must expose Retry");
await page.getByRole("button", { name: "Cancel" }).click();

await page.locator("#promoCampaignRows tr").filter({ hasText: "1020" }).getByRole("button", { name: "Delete" }).click();
if (await page.locator("#promoCampaignRows tr").filter({ hasText: "1020" }).count()) throw new Error("Ended campaign delete must soft remove row");

if (consoleErrors.length) throw new Error(`Console errors detected: ${consoleErrors.join(" | ")}`);
await page.screenshot({ path: "promotion-demo-final.png", fullPage: true });

await browser.close();
