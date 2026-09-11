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
if (await page.locator("#promoCampaignType").count()) throw new Error("Promotion Type must be inferred from reward count, not shown as a field");
if (await page.locator(".field-error:visible").count()) throw new Error("Add New must not show validation errors before an action");
if (await page.locator(".promo-user-type-field > span").textContent() !== "User Type") throw new Error("Required User Type label must be visible");
await page.locator("#promoUserTypeSearch").click();
if (!await page.locator("#promoUserTypeMenu").isVisible()) throw new Error("User Type menu must open from the search input");
if (await page.locator("#promoUserTypeMenu .promo-user-type-option").count() !== 3) throw new Error("User Type menu must show all PRD options");
if (await page.getByRole("option", { name: "Normal User", exact: true }).getAttribute("aria-disabled") !== "true") throw new Error("Normal User must remain selected and locked");
await page.locator("#promoUserTypeSearch").fill("casual");
if (await page.locator("#promoUserTypeMenu .promo-user-type-option:visible").count() !== 1) throw new Error("User Type search must filter options");
await page.getByRole("option", { name: "Casual abuser" }).click();
if (!await page.locator("#promoUserTypeTags .promo-user-type-tag.casual-abuser").isVisible()) throw new Error("Selected User Type must render as a tag");
await page.locator("#promoUserTypeSearch").fill("");
await page.keyboard.press("Escape");
if (await page.locator("#promoUserTypeMenu").isVisible()) throw new Error("Escape must close the User Type menu");
await page.locator("#promoCodeType").selectOption("Mass Code");
await page.locator("#promoCodeValue").fill("hihi");
await page.locator("#promoCodeValue").press("Enter");
await page.locator("#promoCodeValue").fill("haha");
await page.locator("#promoCodeValue").press("Enter");
if (JSON.stringify(await page.locator("#promoCodeTags .tag").allTextContents()) !== JSON.stringify(["HIHI×", "HAHA×"])) throw new Error("Each Enter must create one Mass Code tag");
await page.locator("#promoAddReward").click();
if (await page.locator(".promo-reward-item").count() !== 2) throw new Error("Add more reward must generate another Reward Info block");
if (await page.getByRole("heading", { name: "Display Users" }).count() !== 1) throw new Error("New rewards must share Reward #1 rules by default");
if (await page.locator(".promo-rule-mode").nth(1).locator("option:checked").textContent() !== "Use same rules as Reward #1") throw new Error("New rewards must default to Reward #1 rules");
if (!await page.locator(".promo-shared-rule-note").isVisible()) throw new Error("Shared rule mode must clearly identify Reward #1 as the source");
if (await page.locator(".promo-reward-order-button").count() !== 4) throw new Error("Each reward must expose up and down priority controls");
if (!await page.getByRole("button", { name: "Move Reward #1 up" }).isDisabled()) throw new Error("The first reward cannot move up");
if (!await page.getByRole("button", { name: "Move Reward #2 down" }).isDisabled()) throw new Error("The last reward cannot move down");
if (await page.locator("#promoCodeType").inputValue() !== "Mass Code" || !await page.locator("#promoCodeType").isDisabled()) throw new Error("Multiple rewards must force and lock Mass Code");
await page.locator(".promo-remove-reward").last().click();
if (await page.locator(".promo-reward-item").count() !== 1 || await page.locator("#promoCodeType").isDisabled()) throw new Error("Removing back to one reward must unlock Code type");
await page.getByRole("button", { name: "Save", exact: true }).click();
const requiredErrors = await page.locator(".field-error").allTextContents();
if (JSON.stringify(requiredErrors) !== JSON.stringify(["MKT Code is required"])) throw new Error("Save draft must only require MKT Code");

await page.locator("#promoMktCode").selectOption("campaign");
await page.locator("#promoMktName").selectOption("quantm6_CB3_22");
await page.locator("#promoCodeType").selectOption("Mass Code");
await page.locator("#promoCodeValue").fill("hello#promo");
const sanitizedCode = await page.locator("#promoCodeValue").inputValue();
if (sanitizedCode !== "HELLOPROMO") throw new Error("Mass Code must sanitize to uppercase A-Z0-9");
await page.locator("#promoCodeValue").press("Enter");
await page.locator("#promoBudgetSponsor").selectOption("ZaloPay");
await page.locator("#promoRewardId").selectOption("1173");
await page.locator("#promoAddReward").click();
await page.locator("#promoBudgetSponsor-2").selectOption("Merchant");
await page.locator("#promoRewardId-2").selectOption("1157");
await page.locator(".promo-rule-mode").nth(1).selectOption("own");
if (await page.getByRole("heading", { name: "Display Users" }).count() !== 2) throw new Error("Separate mode must reveal the complete rule configuration inside Reward #2");
await page.locator("#promoSegment").selectOption("New User");
await page.locator("#promoSegment-2").selectOption("Retention");
await page.locator(".promo-rule-mode").nth(1).selectOption({ label: "Use same rules as Reward #1" });
if (await page.getByRole("heading", { name: "Display Users" }).count() !== 1) throw new Error("Shared mode must collapse Reward #2 rules");
await page.locator(".promo-rule-mode").nth(1).selectOption("own");
if (await page.locator("#promoSegment-2").inputValue() !== "Retention") throw new Error("Switching back to separate mode must restore its previous configuration");
await page.locator("#promoActiveStart").fill("2026-09-01T00:00");
await page.locator("#promoActiveEnd").fill("2026-12-31T23:59");
await page.locator("#promoActiveStart-2").fill("2026-09-15T00:00");
await page.locator("#promoActiveEnd-2").fill("2026-12-15T23:59");
await page.locator("#promoRecurringPeriod-2").selectOption("Recur Weekly");
await page.locator("#promoRecurringWeekStart-2").selectOption("Tuesday");
await page.locator("#promoRecurringWeekEnd-2").selectOption("Friday");
await page.locator("#promoMaxApplyQty").fill("1");
await page.locator("#promoStockLimitQty").fill("500");
await page.locator("#promoMaxApplyQty-2").fill("2");
await page.locator("#promoStockLimitQty-2").fill("300");
await page.locator("#promoAddReward").click();
await page.locator("#promoBudgetSponsor-3").selectOption("Partnership");
await page.locator("#promoRewardId-3").selectOption("1173");
await page.locator("#promoAddReward").click();
await page.locator("#promoBudgetSponsor-4").selectOption("ZaloPay");
await page.locator("#promoRewardId-4").selectOption("1108");
await page.locator(".promo-rule-mode").nth(3).selectOption("own");
const rewardFour = page.locator(".promo-reward-item").nth(3);
await rewardFour.locator(".promo-segment").selectOption("Campus Segment");
await rewardFour.locator(".promo-active-start").fill("2026-09-20T00:00");
await rewardFour.locator(".promo-active-end").fill("2026-12-20T23:59");
await rewardFour.locator(".promo-max-apply-qty").fill("3");
await rewardFour.locator(".promo-stock-limit-qty").fill("200");
await page.locator(".promo-rule-mode").nth(1).selectOption({ label: "Use same rules as Reward #4" });
await page.locator(".promo-rule-mode").nth(2).selectOption({ label: "Use same rules as Reward #4" });
if (await page.getByRole("heading", { name: "Display Users" }).count() !== 2) throw new Error("Reward #2 and #3 must be able to share Reward #4 rules");
if (await page.locator(".promo-shared-rule-note").allTextContents().then(values => values.some(value => !value.includes("Reward #4")))) throw new Error("Shared rule notes must identify Reward #4 as the source");
await page.locator(".promo-remove-reward").last().click();
if (await page.locator(".promo-reward-item").count() !== 4 || !await page.locator(".toast.error").last().textContent().then(value => value.includes("use its rules"))) throw new Error("A source reward cannot be removed while other rewards use its rules");
await page.locator(".promo-rule-mode").nth(3).selectOption({ label: "Use same rules as Reward #1" });
if (await page.locator(".promo-rule-mode").nth(3).inputValue() !== "own") throw new Error("A source reward cannot switch away from its own rules while followers exist");
await page.getByRole("button", { name: "Move Reward #4 up" }).click();
await page.getByRole("button", { name: "Move Reward #3 up" }).click();
await page.getByRole("button", { name: "Move Reward #2 up" }).click();
if (JSON.stringify(await page.locator(".promo-reward-id").evaluateAll(selects => selects.map(select => select.value))) !== JSON.stringify(["1108", "1173", "1157", "1173"])) throw new Error("Reorder must swap complete reward packages");
if (await page.locator(".promo-reward-item").first().locator(".promo-segment").inputValue() !== "Campus Segment") throw new Error("Reorder must preserve the source reward rule configuration");
const movedRuleLabels = await page.locator(".promo-rule-mode option:checked").allTextContents();
if (JSON.stringify(movedRuleLabels) !== JSON.stringify(["Configure separate rules", "Configure separate rules", "Use same rules as Reward #1", "Use same rules as Reward #1"])) throw new Error("Reorder must preserve shared rule relationships and update source labels");
await page.locator("#promoEmailInput").fill("kiettt8");
await page.locator("#promoEmailInput").press("Enter");
await page.locator("#promoThresholdInput").fill("10");
await page.locator("#promoThresholdInput").press("Enter");
await page.getByRole("button", { name: "Save & Submit" }).click();
await page.waitForTimeout(500);

const newRow = page.locator("#promoCampaignRows tr").first();
const newCampaignId = Number(await newRow.locator("td").first().textContent());
if (await newRow.locator("td").nth(8).textContent() !== "Auto Approved") throw new Error("Submitted Promotion Code should auto approve for low-cap reward");
if (await newRow.locator("td").nth(4).textContent() !== "1108, 1173, 1157, 1173") throw new Error("Submitted Promotion Code must persist Reward IDs in priority order");
if (await newRow.locator("td").nth(5).textContent() !== "HIHI, HAHA, HELLOPROMO") throw new Error("All Mass Codes must share the submitted reward rules");
const activeTime = await newRow.locator("td").nth(7).textContent();
if (!activeTime.includes("01/09/2026") || !activeTime.includes("31/12/2026")) throw new Error("Campaign List Active Time must use the minimum start and maximum end across rule sets");
await newRow.getByRole("button", { name: "Edit" }).click();
const persistedRuleLabels = await page.locator(".promo-rule-mode option:checked").allTextContents();
if (await page.locator(".promo-reward-item").count() !== 4 || JSON.stringify(persistedRuleLabels) !== JSON.stringify(movedRuleLabels)) throw new Error(`Submitted reward priority and shared rule sources must persist: ${JSON.stringify(persistedRuleLabels)} vs ${JSON.stringify(movedRuleLabels)}`);
if (await page.locator(".promo-reward-order-button").count()) throw new Error("Approved campaigns must not expose reorder controls");
await page.getByRole("button", { name: "Cancel" }).click();

await page.locator("#promoFilterCode").fill("hihi");
await page.locator("#promoFilterFrom").fill("2026-12-25");
await page.locator("#promoFilterTo").fill("2026-12-26");
await page.getByRole("button", { name: "Search" }).click();
if (await page.locator("#promoCampaignRows tr").count() !== 1 || Number(await page.locator("#promoCampaignRows tr td").first().textContent()) !== newCampaignId) throw new Error("Active Time search must use aggregate range overlap and match any Mass Code");
await page.getByRole("button", { name: "Reset" }).click();

await page.evaluate(id => {
  const source = promotionState.campaigns.find(campaign => campaign.id === id);
  const conflict = clonePromotionCampaign(source);
  conflict.id = id + 1000;
  conflict.massCodes = ["HIHI"];
  conflict.codeValue = "HIHI";
  conflict.rawCode = "HIHI";
  conflict.ruleSets.forEach(ruleSet => {
    ruleSet.activeStart = "2027-01-10T00:00";
    ruleSet.activeEnd = "2027-01-20T23:59";
  });
  conflict.activeStart = "2027-01-10T00:00";
  conflict.activeEnd = "2027-01-20T23:59";
  promotionState.campaigns.push(conflict);
}, newCampaignId);
await page.locator(`[data-promo-edit="${newCampaignId}"]`).click();
await page.locator(".promo-reward-item").nth(1).locator(".promo-active-end").fill("2027-01-31T23:59");
await page.getByRole("button", { name: "Save changes" }).click();
if (!await page.locator(".field-error").filter({ hasText: "already used in the extended time range" }).isVisible()) throw new Error("Extending a Mass Code into an overlapping duplicate-code period must be blocked");
await page.getByRole("button", { name: "Cancel" }).click();

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

await page.setViewportSize({ width: 768, height: 900 });
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Add new" }).click();
if (await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth)) throw new Error("Promotion form must not overflow horizontally on tablet");
if ((await page.locator(".promo-display-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length)) !== 2) throw new Error("Promotion form must use a two-column tablet layout");
if ((await page.locator(".promo-basic-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length)) !== 2) throw new Error("Basic Information must use a two-column tablet layout");
if ((await page.locator(".promo-form-screen .asset-alert-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length)) !== 2) throw new Error("Budget Alert must use a two-column tablet layout");
if ((await page.locator(".promo-user-type-field").evaluate(node => getComputedStyle(node).gridColumnEnd)) !== "-1") throw new Error("User Type must span the tablet row");

await page.setViewportSize({ width: 390, height: 844 });
if (await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth)) throw new Error("Promotion form must not overflow horizontally on mobile");
if ((await page.locator(".promo-display-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length)) !== 1) throw new Error("Promotion form must use a one-column mobile layout");
if (await page.locator(".promo-reward-preview:visible").count()) throw new Error("Empty reward preview must not reserve mobile space");

await browser.close();
