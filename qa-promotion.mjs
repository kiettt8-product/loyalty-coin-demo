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

const actionLabels = await page.locator("#promoCampaignRows tr td:last-child").evaluateAll(cells => cells.map(cell => [...cell.querySelectorAll("button")].map(button => button.textContent).join(" ")));
if (actionLabels.some(label => label !== "View Edit")) throw new Error("Every Promotion Code row must expose View and Edit only");

await page.getByRole("button", { name: "Add new" }).click();
if (await page.locator("#promoCodeType").inputValue() !== "Unique Code") throw new Error("Add New must default to Unique Code per Figma");
if (await page.locator(".field-error:visible").count()) throw new Error("Add New must not show validation errors before an action");
await page.locator("#promoUserTypeSearch").click();
if (!await page.locator("#promoUserTypeMenu").isVisible()) throw new Error("User Type menu must open from the search input");
if (await page.locator("#promoUserTypeMenu .promo-user-type-option").count() !== 3) throw new Error("User Type menu must show all PRD options");
if (await page.getByRole("option", { name: "Normal User", exact: true }).getAttribute("aria-disabled") !== "true") throw new Error("Normal User must remain selected and locked");
await page.locator("#promoUserTypeSearch").fill("casual");
if (await page.locator("#promoUserTypeMenu .promo-user-type-option").count() !== 1) throw new Error("User Type search must filter options");
await page.getByRole("option", { name: "Casual abuser" }).click();
if (!await page.locator("#promoUserTypeTags .promo-user-type-tag.casual-abuser").isVisible()) throw new Error("Selected User Type must render as a tag");
await page.locator("#promoUserTypeSearch").fill("");
await page.keyboard.press("Escape");
if (await page.locator("#promoUserTypeMenu").isVisible()) throw new Error("Escape must close the User Type menu");
await page.getByRole("button", { name: "Save", exact: true }).click();
const requiredErrors = await page.locator(".field-error").allTextContents();
if (JSON.stringify(requiredErrors) !== JSON.stringify(["MKT Code is required"])) throw new Error("Save draft must only require MKT Code");

await page.locator("#promoMktCode").selectOption("campaign");
await page.locator("#promoMktName").selectOption("quantm6_CB3_22");
await page.locator("#promoCodeType").selectOption("Mass Code");
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
if (await page.locator("#promoUserTypeSearch").isDisabled()) throw new Error("Approved User Type must remain editable");
if (!await page.locator("#promoActiveStart").isDisabled() || await page.locator("#promoActiveEnd").isDisabled()) throw new Error("Approved active time must be end-time extend only");

await page.getByRole("button", { name: "Cancel" }).click();
await page.locator("#promoCampaignRows tr").filter({ hasText: "1023" }).getByRole("button", { name: "Edit" }).click();
const processingButton = await page.locator("#promoExportCode").textContent();
if (processingButton !== "Processing") throw new Error("Processing state for unique code export is missing");
await page.getByRole("button", { name: "Cancel" }).click();

await page.locator("#promoCampaignRows tr").filter({ hasText: "1019" }).getByRole("button", { name: "Edit" }).click();
const retryVisible = await page.getByRole("button", { name: "Retry" }).isVisible();
if (!retryVisible) throw new Error("Failed unique code generation must expose Retry");
await page.getByRole("button", { name: "Cancel" }).click();

await page.locator("#promoCampaignRows tr").filter({ hasText: "1020" }).getByRole("button", { name: "Edit" }).click();
if (!await page.locator("#promoMktCode").isDisabled()) throw new Error("Ended campaign fields must remain locked in Edit view");

if (consoleErrors.length) throw new Error(`Console errors detected: ${consoleErrors.join(" | ")}`);
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.screenshot({ path: "promotion-demo-final.png", fullPage: true });

await browser.close();
