import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/lap14883/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 912 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", error => consoleErrors.push(error.message));

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
if (await page.getByRole("button", { name: "Promo Loyalty Coin Campaign" }).count()) throw new Error("Standalone Promo Loyalty Coin Campaign menu must be hidden");
if (!await page.getByRole("button", { name: "Promo Asset Campaign" }).evaluate(node => node.classList.contains("active"))) throw new Error("Promo Asset Campaign must be the default entry point");

const assetHeaders = (await page.locator(".asset-table th").allTextContents()).map(value => value.trim());
const expectedHeaders = ["ID", "MKT Name", "MKT Code", "Total Budget", "Reward / Package ID", "Distribution Type", "Distribute time", "Distribute to", "Status", "Label", "Created by", "Action"];
if (JSON.stringify(assetHeaders) !== JSON.stringify(expectedHeaders)) throw new Error("Promo Asset listing columns do not match Figma");
if (await page.locator(".asset-table tbody tr").count() !== 10) throw new Error("Promo Asset list must render 10 mock rows");
const firstAssetRowCells = (await page.locator(".asset-table tbody tr").first().locator("td").allTextContents()).map(value => value.trim());
if (firstAssetRowCells[9] !== "annhg_test_icon, ZPO_a, Enablers" || firstAssetRowCells[10] !== "trongdd2") throw new Error("Promo Asset Label/Created by data is missing");
const distributionTypeOptions = await page.locator("#assetFilterType option").allTextContents();
if (JSON.stringify(distributionTypeOptions) !== JSON.stringify(["Distribution Type", "Massive", "Trigger Base", "Direct Discount", "Loyalty Coin"])) throw new Error("Distribution Type options are incorrect");
if (await page.locator(".asset-table tbody tr").filter({ hasText: "Loyalty Coin" }).count() !== 2) throw new Error("Loyalty Coin mock campaigns are missing");
const loyaltyRows = page.locator(".asset-table tbody tr").filter({ hasText: "Loyalty Coin" });
if (await loyaltyRows.first().locator("td").nth(4).getAttribute("title") !== null) throw new Error("Identifier tooltip must live on the value, not the table cell");
if (!await loyaltyRows.first().locator(".asset-identifier").getAttribute("title").then(value => value?.startsWith("Package ID:"))) throw new Error("Loyalty Coin identifiers must be presented as Package ID");
await page.locator("#assetFilterId").fill("20535");
await page.getByRole("button", { name: "Search" }).click();
if (await page.locator(".asset-table tbody tr").count() !== 1 || !await page.locator(".asset-table tbody tr").first().getByText("Loyalty Coin", { exact: true }).isVisible()) throw new Error("Package ID search must return its Loyalty Coin campaign");
await page.getByRole("button", { name: "Reset" }).click();
const assetVisualBaseline = await page.evaluate(() => {
  const style = selector => getComputedStyle(document.querySelector(selector));
  return {
    fontFamily: style(".asset-table td").fontFamily,
    tableFontSize: style(".asset-table td").fontSize,
    inputFontSize: style("#assetFilterId").fontSize,
    inputRadius: style("#assetFilterId").borderRadius,
    buttonFontSize: style("#assetAddNew").fontSize,
    buttonRadius: style("#assetAddNew").borderRadius
  };
});
await page.screenshot({ path: "demo-asset-list.png", fullPage: true });
await page.locator(".asset-table-wrap").evaluate(node => { node.scrollLeft = node.scrollWidth; });
await page.screenshot({ path: "demo-asset-list-end.png", fullPage: true });
await page.locator(".asset-table-wrap").evaluate(node => { node.scrollLeft = 0; });

await page.getByRole("button", { name: "Add new" }).click();
const dialog = page.getByRole("dialog", { name: "How you want to distribute the voucher" });
if (!await dialog.isVisible()) throw new Error("Add new distribution modal is missing");
const choices = await dialog.locator('input[name="distributionChoice"]').count();
if (choices !== 4 || !await dialog.locator('input[value="massive"]').isChecked()) throw new Error("Distribution options do not match the expected Promo Asset flow");
if (!await dialog.getByText("Distribute coin based on action trigger", { exact: true }).isVisible()) throw new Error("Coin distribution wording is incorrect");
await page.screenshot({ path: "demo-asset-add-new.png", fullPage: true });

await dialog.locator('input[value="coin-trigger"]').check();
await dialog.getByRole("button", { name: "OK" }).click();
await page.locator("#campaignForm").waitFor({ state: "visible" });
if (!await page.getByRole("button", { name: "Promo Asset Campaign" }).evaluate(node => node.classList.contains("active"))) throw new Error("Promo Asset navigation must remain active in coin create flow");
if (await page.locator(".package-block").count() !== 1) throw new Error("Coin form must start with one package");
if (await page.locator(".pkg-consumed, .pkg-remaining").count()) throw new Error("Coin create form must hide consumption fields");
if (await page.locator("#coinDistributionType").inputValue() !== "coin-trigger") throw new Error("Coin create form must show its selected Distribution Type");
await page.locator("#coinDistributionType").selectOption("massive");
await page.locator("#assetMassiveForm").waitFor({ state: "visible" });
if (await page.locator("#assetDistributionType").inputValue() !== "massive") throw new Error("Distribution Type did not switch to Massive");
await page.locator("#assetDistributionType").selectOption("coin-trigger");
await page.locator("#campaignForm").waitFor({ state: "visible" });
if (await page.locator("#coinDistributionType").inputValue() !== "coin-trigger") throw new Error("Distribution Type did not switch back to Coin");
await page.locator(".pkg-history-content").fill("Nhận xu từ chương trình Quét mã nhận quà");
await page.locator(".pkg-coin").fill("300");
if (await page.locator(".pkg-history-preview").textContent() !== "Nhận xu từ chương trình Quét mã nhận quà") throw new Error("Coin history content preview is incorrect");
if (await page.locator(".pkg-coin-preview").textContent() !== "+300 xu") throw new Error("Coin history amount preview is incorrect");
await page.screenshot({ path: "demo-asset-coin-create.png", fullPage: true });
await page.getByRole("button", { name: "Cancel" }).click();
await page.locator(".asset-list-screen").waitFor({ state: "visible" });

await page.getByRole("button", { name: "Add new" }).click();
await page.getByRole("dialog", { name: "How you want to distribute the voucher" }).locator('input[value="massive"]').check();
const massiveDialog = page.getByRole("dialog", { name: "How you want to distribute the voucher" });
await massiveDialog.getByRole("button", { name: "OK" }).click();
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

await page.evaluate(() => route("list"));
const loyaltyVisualBaseline = await page.evaluate(() => {
  const style = selector => getComputedStyle(document.querySelector(selector));
  return {
    fontFamily: style(".list-screen td").fontFamily,
    tableFontSize: style(".list-screen td").fontSize,
    inputFontSize: style("#filterId").fontSize,
    inputRadius: style("#filterId").borderRadius,
    buttonFontSize: style("#addNew").fontSize,
    buttonRadius: style("#addNew").borderRadius
  };
});
if (JSON.stringify(loyaltyVisualBaseline) !== JSON.stringify(assetVisualBaseline)) throw new Error(`Loyalty Coin visual baseline differs from Promo Asset: ${JSON.stringify({ assetVisualBaseline, loyaltyVisualBaseline })}`);
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);

console.log(JSON.stringify({ assetHeaders, firstAssetRowCells, distributionTypeOptions, choices, coinCreateFlow: "passed", visualBaseline: assetVisualBaseline, sectionHeadings, validationCount, consoleErrors }, null, 2));
await browser.close();
