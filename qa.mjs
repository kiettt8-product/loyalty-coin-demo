import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/lap14883/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 912 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", error => consoleErrors.push(error.message));

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
const columnHeaders = await page.locator("thead th").allTextContents();
if (columnHeaders[1] !== "MKT Code" || columnHeaders[2] !== "MKT Name") throw new Error("MKT Code/MKT Name column order is incorrect");

const definedStatuses = ["Draft", "FA Review", "Auto Approved", "Approved", "Rejected", "In Use", "Ended"];
const listedStatuses = await page.locator("tbody .status").allTextContents();
for (const status of definedStatuses) if (!listedStatuses.includes(status)) throw new Error(`Missing mock status: ${status}`);

const userManagementClosed = await page.locator("#userManagementMenu").isHidden();
const userProfileClosed = await page.locator("#userProfileMenu").isHidden();
if (!userManagementClosed || !userProfileClosed) throw new Error("User menus must be closed by default");

const rowFor = status => page.locator("tbody tr").filter({ has: page.locator(`.status.${status.toLowerCase().replaceAll(" ", "-")}`) }).first();
const statusActions = {};
for (const status of definedStatuses) statusActions[status] = await rowFor(status).locator(".row-actions button").allTextContents();
const expectedActions = {
  Draft: ["View", "Edit", "Delete"],
  "FA Review": ["View"],
  "Auto Approved": ["View", "Edit"],
  Approved: ["View", "Edit"],
  Rejected: ["View", "Edit", "Delete"],
  "In Use": ["View", "Edit"],
  Ended: ["View"]
};
for (const status of definedStatuses) {
  if (JSON.stringify(statusActions[status]) !== JSON.stringify(expectedActions[status])) throw new Error(`Incorrect actions for ${status}`);
}

const mainOutline = await page.locator("main").evaluate(node => getComputedStyle(node).outlineStyle);
const logoText = await page.locator(".zalopay-logo").innerText();
await page.screenshot({ path: "demo-list.png", fullPage: true });

await rowFor("Draft").getByRole("button", { name: "View" }).click();
const viewUsesCreateForm = await page.locator("#campaignForm").isVisible();
const viewEnabledControlCount = await page.locator("#campaignForm input:enabled, #campaignForm select:enabled").count();
const viewPackageCount = await page.locator(".package-block").count();
if (!viewUsesCreateForm || viewEnabledControlCount !== 0 || viewPackageCount < 1) throw new Error("View must reuse the create form in read-only mode");
if (await page.locator(".pkg-present").count()) throw new Error("Draft must not display Present ID before generation");
await page.screenshot({ path: "demo-view.png", fullPage: true });
await page.getByRole("button", { name: "Back" }).click();

await rowFor("Approved").getByRole("button", { name: "Edit" }).click();
const limitedEditableIds = await page.locator("#campaignForm input:enabled, #campaignForm select:enabled").evaluateAll(nodes => nodes.map(node => node.id).filter(Boolean).sort());
const expectedLimitedEditableIds = ["emailInput", "thresholdInput"].sort();
if (JSON.stringify(limitedEditableIds) !== JSON.stringify(expectedLimitedEditableIds)) throw new Error("Approved editability does not match PRD");
const approvedLabelDisabled = await page.locator("#campaignLabel").isDisabled();
if (!approvedLabelDisabled) throw new Error("Approved Label must be disabled");
const approvedPresentId = await page.locator(".pkg-present").first().inputValue();
if (approvedPresentId !== "1173") throw new Error("Approved package must display its generated Present ID");
const packageFieldOrder = await page.locator(".package-block").first().locator(".field > span").allTextContents();
const expectedPackageFieldOrder = ["Package Budget", "Consumed Budget", "Remaining Budget", "Coin Distribution Method", "Coin Per User", "Estimated Users", "Present ID"];
if (JSON.stringify(packageFieldOrder) !== JSON.stringify(expectedPackageFieldOrder)) throw new Error("Package field order is incorrect");
if (await page.getByText("Description", { exact: true }).count()) throw new Error("Campaign Description must not exist in Basic Information");
const approvedPackageBudgetEnabled = await page.locator(".pkg-budget").first().isEnabled();
const approvedPackageControlsDisabled = await page.locator(".pkg-consumed, .pkg-remaining, .pkg-method, .pkg-coin, .pkg-users, .pkg-present").evaluateAll(nodes => nodes.every(node => node.disabled));
const approvedConsumedBudget = await page.locator(".pkg-consumed").first().inputValue();
const approvedRemainingBudget = await page.locator(".pkg-remaining").first().inputValue();
if (!approvedPackageBudgetEnabled || !approvedPackageControlsDisabled) throw new Error("Approved must only allow Package Budget and Budget Alert editing");
if (approvedConsumedBudget !== "120.000.000" || approvedRemainingBudget !== "180.000.000") throw new Error("Approved consumed/remaining budget is incorrect");
await page.locator(".pkg-budget").first().fill("290000000");
await page.getByRole("button", { name: "Save changes" }).click();
const extendOnlyError = await page.locator(".package-budget .field-error").textContent();
if (extendOnlyError !== "Package Budget can only be increased.") throw new Error("Extend-only validation is incorrect");
await page.locator(".pkg-budget").first().fill("330000000");
const recalculatedRemaining = await page.locator(".pkg-remaining").first().inputValue();
if (recalculatedRemaining !== "210.000.000") throw new Error("Remaining Budget must recalculate while editing");
await page.waitForTimeout(3300);
await page.screenshot({ path: "demo-edit-approved.png", fullPage: true });
await page.getByRole("button", { name: "Save changes" }).click();
await page.waitForTimeout(500);

await rowFor("Auto Approved").getByRole("button", { name: "View" }).click();
const campaignConsumedValues = await page.locator(".pkg-consumed").evaluateAll(nodes => nodes.map(node => node.value));
const campaignRemainingValues = await page.locator(".pkg-remaining").evaluateAll(nodes => nodes.map(node => node.value));
if (campaignConsumedValues.some(value => value !== "13.000.000") || campaignRemainingValues.some(value => value !== "17.000.000")) {
  throw new Error("Control by campaign must display shared campaign-level consumed/remaining budget");
}
await page.getByRole("button", { name: "Back" }).click();

await rowFor("In Use").getByRole("button", { name: "Edit" }).click();
const inUseLabelDisabled = await page.locator("#campaignLabel").isDisabled();
const inUseEditableIds = await page.locator("#campaignForm input:enabled, #campaignForm select:enabled").evaluateAll(nodes => nodes.map(node => node.id).filter(Boolean).sort());
const inUsePackageBudgetEnabled = await page.locator(".pkg-budget").first().isEnabled();
if (!inUseLabelDisabled || !inUsePackageBudgetEnabled || JSON.stringify(inUseEditableIds) !== JSON.stringify(["emailInput", "thresholdInput"].sort())) throw new Error("In Use must allow Package Budget and Budget Alert editing only");
const disabledRangeBackground = await page.locator(".time-field .range-field").evaluate(node => getComputedStyle(node).backgroundColor);
const disabledRangeInputBackgrounds = await page.locator(".time-field input").evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor));
if (disabledRangeBackground !== "rgb(243, 244, 246)" || disabledRangeInputBackgrounds.some(color => color !== "rgba(0, 0, 0, 0)")) throw new Error("Disabled distribute time must use one continuous grey background");
await page.screenshot({ path: "demo-edit-in-use.png", fullPage: true });
await page.getByRole("button", { name: "Cancel" }).click();

await rowFor("Draft").getByRole("button", { name: "Edit" }).click();
const draftPackageCoinEnabled = await page.locator(".pkg-coin").first().isEnabled();
const draftAddPackageVisible = await page.getByRole("button", { name: "Add new Package" }).isVisible();
if (!draftPackageCoinEnabled || !draftAddPackageVisible) throw new Error("Draft package config must be editable");
const distributionMethods = await page.locator(".pkg-method option").allTextContents();
if (distributionMethods.some(option => option === "By Quantity") || distributionMethods.some(option => option !== "By Budget")) throw new Error("Only By Budget must be available");
const distributionMethodsDisabled = await page.locator(".pkg-method").evaluateAll(nodes => nodes.every(node => node.disabled));
if (!distributionMethodsDisabled) throw new Error("Coin Distribution Method must remain disabled");
const disabledDistributionArrow = await page.locator(".pkg-method").first().evaluate(node => getComputedStyle(node).backgroundImage);
if (!disabledDistributionArrow || disabledDistributionArrow === "none") throw new Error("Disabled Coin Distribution Method must retain dropdown arrow");
await page.getByRole("button", { name: "Cancel" }).click();

await page.getByRole("button", { name: "+ Add new" }).click();
const defaultPackageCount = await page.locator(".package-block").count();
if (defaultPackageCount !== 1) throw new Error("Add new must start with exactly one package");
const initialBudgetMethodValue = await page.locator("#budgetMethod").inputValue();
const initialBudgetMethodText = await page.locator("#budgetMethod option:checked").textContent();
const initialBudgetMethodDisabled = await page.locator("#budgetMethod").isDisabled();
if (initialBudgetMethodValue !== "" || initialBudgetMethodText !== "Select Budget Control Method" || !initialBudgetMethodDisabled) throw new Error("Add new must start with an unresolved Budget Control Method");
await page.locator("#startTime").fill("2026-08-01T00:00");
await page.locator("#endTime").fill("2026-12-31T23:59");
await page.locator(".pkg-coin").first().fill("300");
await page.getByRole("button", { name: "Save Draft" }).click();
const mktCodeErrorText = await page.locator("#mktCode").locator("xpath=ancestor::label").locator(".field-error").textContent();
const initialInlineErrorCount = await page.locator(".field-error").count();
const mktCodeErrorBorder = await page.locator("#mktCode").evaluate(node => getComputedStyle(node).borderColor);
const firstInvalidFocused = await page.locator("#mktCode").evaluate(node => document.activeElement === node);
if (mktCodeErrorText !== "MKT Code is required" || initialInlineErrorCount !== 1 || mktCodeErrorBorder !== "rgb(251, 44, 54)" || !firstInvalidFocused) throw new Error("Single missing MKT Code inline validation is incorrect");
await page.screenshot({ path: "demo-mkt-code-error.png", fullPage: true });
await page.locator("#mktCode").selectOption("campaign");
const mktCodeErrorCleared = await page.locator("#mktCode").locator("xpath=ancestor::label").locator(".field-error").count() === 0;
if (!mktCodeErrorCleared) throw new Error("MKT Code error must clear after selection");
await page.locator("#mktCode").selectOption("");
await page.getByRole("button", { name: "Add new Package" }).click();
const packages = page.locator(".package-block");
const addedBudgetDisabledBeforeMkt = await packages.nth(1).locator(".pkg-budget").isDisabled();
if (!addedBudgetDisabledBeforeMkt) throw new Error("Package budget must be disabled before selecting MKT");
await page.locator("#mktCode").selectOption("campaign");
const allocatedBudgetDisabledForCampaign = await page.locator("#allocatedBudget").isDisabled();
const nonSharedDefaultMethod = await page.locator("#budgetMethod").inputValue();
const campaignBudgetDisabled = await packages.nth(0).locator(".pkg-budget").isDisabled();
const campaignBudgetMappedValue = await packages.nth(0).locator(".pkg-budget").inputValue();
if (nonSharedDefaultMethod !== "campaign" || !campaignBudgetDisabled || campaignBudgetMappedValue !== "5.000.000") throw new Error("Non-shared Control by campaign mapping is incorrect");
await page.locator("#mktCode").selectOption("shared");
const sharedDefaultMethod = await page.locator("#budgetMethod").inputValue();
const sharedMethodDisabled = await page.locator("#budgetMethod").isDisabled();
const sharedPackageBudgetDisabled = await packages.nth(0).locator(".pkg-budget").isDisabled();
const sharedPackageBudgetValue = await packages.nth(0).locator(".pkg-budget").inputValue();
if (sharedDefaultMethod !== "campaign" || !sharedMethodDisabled || !sharedPackageBudgetDisabled || sharedPackageBudgetValue !== "30.000.000") throw new Error("Shared budget mapping is incorrect");
await page.locator("#mktCode").selectOption("campaign");
await page.locator("#budgetMethod").selectOption("package");
const packageBudgetsEnabled = await packages.locator(".pkg-budget").evaluateAll(nodes => nodes.every(node => !node.disabled));
if (!packageBudgetsEnabled) throw new Error("Package budget must only enable for Control by package");
await page.locator("#startTime").fill("2026-08-01T00:00");
await page.locator("#endTime").fill("2026-12-31T23:59");
await page.getByRole("button", { name: "Save & Submit" }).click();
const addedPackageInvalidFieldCount = await packages.nth(1).locator(".field.invalid").count();
if (addedPackageInvalidFieldCount !== 2) throw new Error("Added package validation feedback is missing");
const invalidPackageControlTops = await packages.nth(1).locator(".package-fields input, .package-fields select").evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().top)));
if (new Set(invalidPackageControlTops).size !== 1) throw new Error("Package controls must remain top-aligned when inline errors are displayed");
await page.screenshot({ path: "demo-validation.png", fullPage: true });
await packages.nth(0).locator(".pkg-budget").fill("2500000");
await packages.nth(0).locator(".pkg-coin").fill("304");
await packages.nth(1).locator(".pkg-budget").fill("2500000");
await packages.nth(1).locator(".pkg-coin").fill("300");
if (await packages.nth(0).locator(".pkg-budget").inputValue() !== "2.500.000") throw new Error("Package budget is not formatted in vi-VN format");
if (await packages.nth(0).locator(".pkg-coin").inputValue() !== "304") throw new Error("Coin per user is not formatted in vi-VN format");
await page.locator("#campaignLabel").selectOption("Growth");
await page.locator("#emailInput").fill("kiettt8");
await page.locator("#emailInput").press("Enter");
await page.locator("#thresholdInput").fill("10");
await page.locator("#thresholdInput").press("Enter");
await page.screenshot({ path: "demo-form.png", fullPage: true });
await page.getByRole("button", { name: "Save & Submit" }).click();
await page.waitForTimeout(700);
const createdAutoApprovedRow = page.locator("tbody tr").filter({ hasText: "Auto Approved" }).first();
await createdAutoApprovedRow.getByRole("button", { name: "Edit" }).click();
const generatedPresentIds = await page.locator(".pkg-present").evaluateAll(nodes => nodes.map(node => node.value));
if (generatedPresentIds.length !== 2 || generatedPresentIds.some(value => !value)) throw new Error("Auto Approved Edit must display generated Present ID for every package");
await page.getByRole("button", { name: "Cancel" }).click();

await page.getByRole("button", { name: "Trigger Based Campaign" }).click();
await page.locator("#triggerCampaign").selectOption({ index: 1 });
const presentEnabled = await page.locator("#triggerPresent").isEnabled();
const presentOptions = await page.locator("#triggerPresent option").count();
await page.locator("#triggerPresent").selectOption({ index: 1 });
await page.screenshot({ path: "demo-trigger.png", fullPage: true });
await page.getByRole("button", { name: "Approve and Distribute" }).click();

const result = {
  pageTitle: await page.title(),
  appShell: {
    topbarHeight: await page.locator(".topbar").evaluate(node => getComputedStyle(node).height),
    sidebarWidth: await page.locator(".sidebar").evaluate(node => getComputedStyle(node).width),
    screenPadding: await page.locator(".screen").evaluate(node => getComputedStyle(node).padding)
  },
  definedStatuses,
  statusActions,
  userManagementClosed,
  userProfileClosed,
  viewUsesCreateForm,
  viewEnabledControlCount,
  limitedEditableIds,
  approvedLabelDisabled,
  inUseEditableIds,
  inUseLabelDisabled,
  inUsePackageBudgetEnabled,
  disabledRangeBackground,
  approvedPresentId,
  approvedPackageBudgetEnabled,
  approvedConsumedBudget,
  approvedRemainingBudget,
  extendOnlyError,
  recalculatedRemaining,
  campaignConsumedValues,
  campaignRemainingValues,
  packageFieldOrder,
  generatedPresentIds,
  draftPackageCoinEnabled,
  distributionMethods,
  distributionMethodsDisabled,
  disabledDistributionArrowVisible: disabledDistributionArrow !== "none",
  presentDropdownEnabled: presentEnabled,
  presentOptionCount: presentOptions,
  columnOrder: columnHeaders.slice(0, 3),
  mainOutline,
  logoText,
  defaultPackageCount,
  initialBudgetMethodValue,
  initialBudgetMethodText,
  initialBudgetMethodDisabled,
  mktCodeErrorText,
  initialInlineErrorCount,
  mktCodeErrorBorder,
  firstInvalidFocused,
  mktCodeErrorCleared,
  addedBudgetDisabledBeforeMkt,
  addedPackageInvalidFieldCount,
  invalidPackageControlTops,
  allocatedBudgetDisabledForCampaign,
  nonSharedDefaultMethod,
  campaignBudgetDisabled,
  campaignBudgetMappedValue,
  sharedDefaultMethod,
  sharedMethodDisabled,
  sharedPackageBudgetDisabled,
  sharedPackageBudgetValue,
  packageBudgetsEnabled,
  consoleErrors
};

await browser.close();
console.log(JSON.stringify(result, null, 2));
