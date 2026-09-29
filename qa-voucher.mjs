import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/lap14883/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 878 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", error => errors.push(error.message));

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Asset Management" }).click();
await page.getByRole("button", { name: "Voucher", exact: true }).click();
await page.locator(".voucher-list-screen").waitFor();

const headers = (await page.locator(".voucher-table th").allTextContents()).map(value => value.replace("◆", "").trim());
const expected = ["ID", "Demo", "Status", "Updated time", "Label", "Created by", "Action"];
if (JSON.stringify(headers) !== JSON.stringify(expected)) throw new Error(`Voucher list headers mismatch: ${JSON.stringify(headers)}`);
if (await page.locator(".voucher-table tbody tr").count() !== 10) throw new Error("Voucher list must render 10 rows");
if (!await page.getByRole("button", { name: "Voucher", exact: true }).evaluate(node => node.classList.contains("active"))) throw new Error("Voucher navigation must be active");
await page.screenshot({ path: "voucher-asset-list.png", fullPage: true });
await page.screenshot({ path: "voucher-asset-list-viewport.png" });

await page.getByRole("button", { name: "Add New" }).click();
await page.locator("#voucherCreateForm").waitFor();
const sections = await page.locator(".voucher-form-section > h1").allTextContents();
if (sections.length !== 4 || !sections[0].includes("Discount Scheme") || !sections[3].includes("Voucher TnC")) throw new Error("Create Voucher Asset sections do not match Figma");
if (!await page.locator(".voucher-sticky-actions").isVisible()) throw new Error("Sticky create actions are missing");
if (!await page.getByRole("button", { name: "Voucher", exact: true }).evaluate(node => node.classList.contains("active"))) throw new Error("Voucher navigation must remain active on create page");
await page.screenshot({ path: "voucher-asset-create.png", fullPage: true });
await page.screenshot({ path: "voucher-asset-create-viewport.png" });

await page.getByRole("button", { name: "Cancel", exact: true }).click();
await page.locator(".voucher-list-screen").waitFor();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

console.log(JSON.stringify({ headers, rows: 10, sections: sections.map(value => value.trim()), browserErrors: errors }, null, 2));
await browser.close();
