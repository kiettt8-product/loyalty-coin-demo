function money(value) { return new Intl.NumberFormat("vi-VN").format(Number(value || 0)); }
function number(value) { return Number(String(value || "").replace(/[^0-9]/g, "")); }
function formattedNumber(value) { return number(value) ? money(number(value)) : ""; }
function statusClass(value) { return value.toLowerCase().replaceAll(" ", "-"); }
function packageId() { return `pkg-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function escapeHtml(value) { return String(value || "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]); }
function newPackage() { return { id: packageId(), method: "budget", budget: "", originalBudget: "", consumedBudget: "0", coin: "", historyContent: "" }; }
function clonePackages(packages) {
  return packages.map(pkg => ({
    ...pkg,
    id: packageId(),
    originalBudget: String(pkg.budget || pkg.originalBudget || ""),
    consumedBudget: String(pkg.consumedBudget || 0),
    historyContent: String(pkg.historyContent || "")
  }));
}
function displayToIso(value) {
  const match = String(value || "").match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}` : "2026-12-31T23:59";
}
function isoToDisplay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = part => String(part).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const state = {
  route: "list",
  formMode: "create",
  formReturnRoute: "list",
  editingCampaignId: null,
  packages: [],
  emails: [],
  thresholds: [],
  campaigns: [
    { id: 1101, name: "Loyalty_Coin_Draft", code: "ZPI_190726_001", budget: 5000000, presents: [], coins: [300, 500], time: "31/12/2026 23:59", status: "Draft", label: "ZPO", owner: "kiettt8" },
    { id: 1100, name: "Loyalty_Coin_Rejected", code: "ZPI_180726_009", budget: 9000000, presents: [], coins: [900], time: "30/11/2026 23:59", status: "Rejected", label: "BAU", owner: "kiettt8" },
    { id: 1098, name: "quantm6_CB3_22", code: "quantm6_CB3", budget: 360000000, budgetMethod: "package", packageBudgets: [300000000], consumedBudgets: [120000000], presents: [1173], coins: [30000], time: "31/03/2029 00:00", status: "Approved", label: "ZPO", owner: "nghiatn" },
    { id: 1023, name: "quantm6_CB2_21", code: "quantm6_CB2", budget: 360000000, budgetMethod: "package", packageBudgets: [150000000, 150000000], consumedBudgets: [80000000, 100000000], presents: [1157, 1136], coins: [10000, 30000], time: "28/02/2027 00:00", status: "Approved", label: "BAU", owner: "nghiatn" },
    { id: 2893, name: "[28/05/2026][DLS_260528_563][BAU]", code: "DLS_260528_563", budget: 30000000, consumedBudgets: [5000000, 8000000], presents: [20535, 20711], coins: [304, 30000], time: "15/05/2027 00:00", status: "Auto Approved", label: "BAU", owner: "kiettt8" },
    { id: 1026, name: "quantm6_CB2_14", code: "quantm6_CB2", budget: 300000000, presents: [1157, 1108], coins: [5000, 20000], time: "28/02/2027 00:00", status: "Approved", label: "ZPO", owner: "nghiatn" },
    { id: 1017, name: "Voucher_Discount_721", code: "quantm6_Voucher_discount7", budget: 200000, budgetMethod: "package", packageBudgets: [150000], consumedBudgets: [0], presents: [1007], coins: [1000], time: "01/02/2027 00:00", status: "Auto Approved", label: "BAU", owner: "nghiatn" },
    { id: 1020, name: "Voucher_Discount_706", code: "quantm6_Voucher_discount7", budget: 200000, presents: [1151], coins: [500], time: "01/02/2027 00:00", status: "Ended", label: "ZPO", owner: "nghiatn" },
    { id: 998, name: "New_User_Coin", code: "ZPI_290426_118", budget: 18000000, budgetMethod: "package", packageBudgets: [12000000], consumedBudgets: [11000000], presents: [19882], coins: [10000], time: "31/12/2026 23:59", status: "In Use", label: "Growth", owner: "linhnt22" },
    { id: 992, name: "Retention_Coin", code: "ZPI_250426_031", budget: 8000000, presents: [], coins: [800], time: "15/09/2026 23:59", status: "FA Review", label: "ZPO", owner: "kiettt8" }
  ]
};

const assetCampaigns = [
  { id: 1371, name: "TRONG_260526_TEST_62", code: "TRONG_260526_TEST", budget: 3000000, rewards: "2134", type: "Massive", time: "01/07/2027 00:00", target: "test tier", status: "Draft" },
  { id: 1570, name: "TRONG_260526_TEST_79", code: "TRONG_260526_TEST", budget: 3000000, rewards: "1827", type: "Massive", time: "01/07/2027 00:00", target: "test tier", status: "Approved" },
  { id: 1023, name: "quantm6_CB2_21", code: "quantm6_CB2", budget: 300000000, rewards: "1157, 1136", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved" },
  { id: 1025, name: "quantm6_CB2_20", code: "quantm6_CB2", budget: 300000000, rewards: "1162, 1007, 1108", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved" },
  { id: 1026, name: "quantm6_CB2_14", code: "quantm6_CB2", budget: 300000000, rewards: "1157, 1108", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved" },
  { id: 1027, name: "quantm6_CB2_15", code: "quantm6_CB2", budget: 300000000, rewards: "1157, 1138", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved" },
  { id: 1017, name: "Voucher_Discount_721", code: "quantm6_Voucher_discount7", budget: 200000, rewards: "1007", type: "Massive", time: "01/02/2027 00:00", target: "503", status: "Auto Approved" },
  { id: 1018, name: "Voucher_Discount_703", code: "quantm6_Voucher_discount7", budget: 200000, rewards: "1108", type: "Massive", time: "01/02/2027 00:00", target: "503", status: "Approved" },
  { id: 1019, name: "Voucher_Discount_725", code: "quantm6_Voucher_discount7", budget: 200000, rewards: "1108", type: "Massive", time: "01/02/2027 00:00", target: "503", status: "Approved" },
  { id: 1024, name: "quantm6_CB2_22", code: "quantm6_CB2", budget: 300000000, rewards: "1007, 1162", type: "Massive", time: "01/02/2027 00:00", target: "TestSQL", status: "Approved" }
];

state.campaigns = state.campaigns.map((campaign, campaignIndex) => {
  const coins = campaign.coins.length ? campaign.coins : [300];
  const packageBudget = Math.floor(campaign.budget / coins.length);
  return {
    budgetMethod: campaign.budgetMethod || "campaign",
    budgetType: campaign.code.startsWith("DLS_") ? "shared" : "campaign",
    allocatedBudget: campaign.budget,
    startTime: "2026-08-01T00:00",
    endTime: displayToIso(campaign.time),
    emails: [`${campaign.owner}@vng.com.vn`],
    thresholds: [10, 20],
    packages: coins.map((coin, packageIndex) => ({
      id: `mock-${campaignIndex}-${packageIndex}`,
      method: "budget",
      budget: String(campaign.packageBudgets?.[packageIndex] ?? packageBudget),
      originalBudget: String(campaign.packageBudgets?.[packageIndex] ?? packageBudget),
      consumedBudget: String(campaign.consumedBudgets?.[packageIndex] ?? 0),
      coin: String(coin),
      presentId: campaign.presents[packageIndex] || "",
      historyContent: campaign.historyContents?.[packageIndex] || `Nhận xu từ chương trình ${campaign.name}`
    })),
    ...campaign
  };
});

const main = document.getElementById("mainContent");
const templates = {
  list: document.getElementById("listTemplate"),
  form: document.getElementById("formTemplate"),
  trigger: document.getElementById("triggerTemplate"),
  "asset-list": document.getElementById("assetListTemplate"),
  "asset-massive": document.getElementById("assetMassiveTemplate"),
  "asset-coin-create": document.getElementById("formTemplate")
};

function toast(message, type = "") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  document.getElementById("toastStack").append(node);
  setTimeout(() => node.remove(), 3200);
}

function getEditingCampaign() {
  return state.campaigns.find(item => item.id === state.editingCampaignId);
}
function canEditAll() {
  const campaign = getEditingCampaign();
  return state.formMode === "create" || (state.formMode === "edit" && ["Draft", "Rejected"].includes(campaign?.status));
}
function canEditBudgetAlert() {
  const campaign = getEditingCampaign();
  return state.formMode === "create" || (state.formMode === "edit" && ["Draft", "Rejected", "Auto Approved", "Approved", "In Use"].includes(campaign?.status));
}
function canEditPackageBudget(campaign = getEditingCampaign()) {
  return state.formMode === "edit" && ["Auto Approved", "Approved", "In Use"].includes(campaign?.status) && campaign?.budgetMethod === "package";
}

function budgetSnapshot(control, pkg) {
  const allocatedBudget = number(document.getElementById("allocatedBudget")?.value);
  if (control === "campaign") {
    const consumedBudget = state.packages.reduce((sum, item) => sum + number(item.consumedBudget), 0);
    return {
      budget: allocatedBudget,
      consumedBudget,
      remainingBudget: Math.max(allocatedBudget - consumedBudget, 0)
    };
  }
  const budget = number(pkg.budget);
  const consumedBudget = number(pkg.consumedBudget);
  return {
    budget,
    consumedBudget,
    remainingBudget: Math.max(budget - consumedBudget, 0)
  };
}

function route(name, payload = {}) {
  state.route = name;
  document.body.classList.toggle("asset-mode", name.startsWith("asset-"));
  main.onclick = null;
  main.replaceChildren(templates[name].content.cloneNode(true));
  document.querySelectorAll("[data-route]").forEach(button => button.classList.toggle("active", button.dataset.route === name || (name === "form" && button.dataset.route === "list") || (["asset-massive", "asset-coin-create"].includes(name) && button.dataset.route === "asset-list")));
  if (name === "list") initList();
  if (name === "form") initForm(payload);
  if (name === "trigger") initTrigger();
  if (name === "asset-list") initAssetList();
  if (name === "asset-massive") initAssetMassive();
  if (name === "asset-coin-create") initForm({ mode: "create", returnRoute: "asset-list" });
  document.getElementById("sidebar").classList.remove("open");
  main.focus();
}

function assetActionIcon(kind, label) {
  return `<button class="asset-icon-button ${kind}" aria-label="${label}" title="${label}"><img src="assets/action-${kind}.svg" alt="" aria-hidden="true"></button>`;
}

function renderAssetRows(rows = assetCampaigns) {
  const body = document.getElementById("assetCampaignRows");
  body.innerHTML = rows.map(item => `<tr>
    <td>${item.id}</td><td>${item.name}</td><td>${item.code}</td><td>${money(item.budget)}</td><td>${item.rewards}</td><td>${item.type}</td><td>${item.time}</td><td><a href="#">${item.target}</a></td><td><span class="status ${statusClass(item.status)}">${item.status}</span></td>
    <td><div class="asset-row-actions">${assetActionIcon(item.status === "Draft" ? "approve" : "stop", item.status === "Draft" ? "Approve" : "Stop")}${assetActionIcon("clone", "Clone")}${assetActionIcon("edit", "Edit")}${item.status === "Draft" ? assetActionIcon("delete", "Delete") : ""}</div></td>
  </tr>`).join("");
  document.getElementById("assetItemCount").textContent = rows.length ? `1-${rows.length} of 940 items` : "0 items";
}

function initAssetList() {
  renderAssetRows();
  const dialog = document.getElementById("assetChoiceDialog");
  document.getElementById("assetAddNew").onclick = () => dialog.showModal();
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "confirm") return;
    const choice = dialog.querySelector('input[name="distributionChoice"]:checked')?.value;
    if (choice === "massive") route("asset-massive");
    else if (choice === "coin-trigger") route("asset-coin-create");
    else toast("Demo hiện tại tập trung flow Distribute Massive.");
  });
  document.getElementById("assetCollapseFilter").onclick = event => {
    const controls = [...document.querySelectorAll("#assetFilterGrid > :not(.asset-filter-actions)")];
    const hide = !controls[0].hidden;
    controls.forEach(control => control.hidden = hide);
    event.currentTarget.innerHTML = `${hide ? "Expand" : "Collapse"} <span aria-hidden="true">${hide ? "⌄" : "⌃"}</span>`;
  };
  document.getElementById("assetResetFilter").onclick = () => {
    document.querySelectorAll(".asset-filter-panel input, .asset-filter-panel select").forEach(control => control.value = "");
    renderAssetRows();
  };
  document.getElementById("assetSearchFilter").onclick = () => {
    const id = document.getElementById("assetFilterId").value.toLowerCase().trim();
    const mkt = document.getElementById("assetFilterMkt").value.toLowerCase().trim();
    const type = document.getElementById("assetFilterType").value;
    const status = document.getElementById("assetFilterStatus").value;
    renderAssetRows(assetCampaigns.filter(item => (!id || String(item.id).includes(id) || item.rewards.includes(id)) && (!mkt || item.name.toLowerCase().includes(mkt) || item.code.toLowerCase().includes(mkt)) && (!type || item.type === type) && (!status || item.status === status)));
  };
  main.onclick = event => {
    const action = event.target.closest(".asset-icon-button");
    if (action) toast(`${action.getAttribute("aria-label")} action — demo only.`);
  };
}

function assetRewardMarkup(index) {
  return `<div class="asset-reward-block" data-reward-index="${index}">
    <label class="asset-field required"><span>Reward ID</span><select class="asset-reward-id"><option value="">Reward ID</option><option>2134 - Voucher 50K</option><option>1827 - Voucher 20K</option></select></label>
    <label class="asset-field required"><span>Each user will receive <span class="help-mark" title="Voucher per user">?</span></span><div class="asset-reward-amount"><input class="asset-each-user" type="number" min="1" value="1"><b>vouchers</b></div></label>
    <label class="asset-field required"><span>Available start date</span><select class="asset-start-date"><option>Available at the distributed time</option><option>Custom date</option></select></label>
    <label class="asset-field required"><span>Expired time</span><select class="asset-expired-time"><option value="">Expired time</option><option>30 days after distributed time</option><option>31/12/2027 23:59</option></select></label>
    <div class="asset-voucher-preview"><span>HSD: ../../..</span><strong>Dùng ngay</strong></div>
    <button type="button" class="asset-icon-button delete asset-remove-reward" aria-label="Remove reward" title="Remove reward"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 5h10M7 5V3h4v2M5.5 5l.6 11h5.8l.6-11"></path></svg></button>
  </div>`;
}

function clearAssetValidation() {
  document.querySelectorAll(".asset-field.invalid").forEach(field => field.classList.remove("invalid"));
  document.querySelectorAll(".asset-field-error").forEach(error => error.remove());
}

function validateAssetMassive() {
  clearAssetValidation();
  const required = [
    ["assetDistributeTo", "Distribute to is required"], ["assetSize", "Size is required"], ["assetDistributeTime", "Distribute time is required"], ["assetMktCode", "MKT Code is required"]
  ];
  document.querySelectorAll(".asset-budget-sponsor").forEach((node, index) => required.push([node, `Budget sponsor is required`]));
  document.querySelectorAll(".asset-reward-id").forEach(node => required.push([node, "Reward ID is required"]));
  document.querySelectorAll(".asset-expired-time").forEach(node => required.push([node, "Expired time is required"]));
  let firstInvalid = null;
  required.forEach(([target, message]) => {
    const control = typeof target === "string" ? document.getElementById(target) : target;
    if (control?.value) return;
    const field = control.closest(".asset-field");
    field.classList.add("invalid");
    field.insertAdjacentHTML("beforeend", `<small class="asset-field-error">${message}</small>`);
    firstInvalid ||= control;
  });
  firstInvalid?.focus();
  return !firstInvalid;
}

function initAssetMassive() {
  const rewardList = document.getElementById("assetRewardList");
  let rewardCount = 1;
  const renderRewards = () => { rewardList.innerHTML = Array.from({ length: rewardCount }, (_, index) => assetRewardMarkup(index)).join(""); };
  renderRewards();
  document.getElementById("assetDistributionType").onchange = event => {
    if (event.target.value === "coin-trigger") route("asset-coin-create");
  };
  document.getElementById("assetGroupName").oninput = event => document.getElementById("assetGroupCount").textContent = `${event.target.value.length} / 100`;
  document.getElementById("assetMktCode").onchange = event => {
    const selected = event.target.value;
    const name = document.getElementById("assetMktName");
    name.innerHTML = selected ? `<option>${selected === "TRONG_260526_TEST" ? "TRONG_260526_TEST_62" : "ZPI_060426_341_campaign"}</option>` : "<option>MKT Name</option>";
    document.getElementById("assetCampaignBudget").value = selected ? money(selected === "TRONG_260526_TEST" ? 3000000 : 5000000) : "";
    document.querySelectorAll(".asset-package-budget").forEach(input => input.value = selected ? document.getElementById("assetCampaignBudget").value : "");
  };
  document.getElementById("assetAddReward").onclick = () => { rewardCount += 1; renderRewards(); };
  document.getElementById("assetAddPackage").onclick = () => { rewardCount += 1; renderRewards(); toast(`Đã thêm package ${rewardCount}.`); };
  rewardList.onclick = event => {
    if (!event.target.closest(".asset-remove-reward")) return;
    rewardCount = Math.max(1, rewardCount - 1);
    renderRewards();
  };
  document.getElementById("cancelAssetMassive").onclick = () => route("asset-list");
  document.getElementById("saveAssetMassive").onclick = () => toast("Promo Asset Campaign đã Save Draft.");
  document.getElementById("assetMassiveForm").onsubmit = event => {
    event.preventDefault();
    if (!validateAssetMassive()) return toast("Vui lòng nhập đủ mandatory field.", "error");
    toast("Promo Asset Campaign đã Save & Submit.");
  };
  document.querySelectorAll("[data-route]").forEach(button => button.onclick = () => route(button.dataset.route));
}

function actionButtons(item) {
  const actions = [`<button data-view="${item.id}">View</button>`];
  if (["Draft", "Rejected", "Auto Approved", "Approved", "In Use"].includes(item.status)) actions.push(`<button data-edit="${item.id}">Edit</button>`);
  if (["Draft", "Rejected"].includes(item.status)) actions.push(`<button class="danger-action" data-delete="${item.id}">Delete</button>`);
  return actions.join("");
}

function renderRows(rows = state.campaigns) {
  const body = document.getElementById("campaignRows");
  body.innerHTML = rows.map(item => `<tr>
    <td>${item.id}</td><td>${item.code}</td><td>${item.name}</td><td>${money(item.allocatedBudget)}</td><td>${item.presents.join(", ") || "-"}</td><td>${item.time}</td>
    <td><span class="status ${statusClass(item.status)}">${item.status}</span></td><td>${item.label}</td><td>${item.owner}</td>
    <td><div class="row-actions">${actionButtons(item)}</div></td>
  </tr>`).join("");
  document.getElementById("emptyState").hidden = rows.length > 0;
  document.getElementById("itemCount").textContent = rows.length ? `1-${rows.length} of ${rows.length} items` : "0 items";
}

function initList() {
  renderRows();
  document.getElementById("addNew").onclick = () => route("form", { mode: "create" });
  document.getElementById("collapseFilter").onclick = event => {
    const controls = [...document.querySelectorAll("#filterGrid > :not(.filter-actions)")];
    const hidden = controls[0].hidden = !controls[0].hidden;
    controls.slice(1).forEach(control => control.hidden = hidden);
    event.currentTarget.innerHTML = `${hidden ? "Expand" : "Collapse"} <span>${hidden ? "⌄" : "⌃"}</span>`;
  };
  document.getElementById("resetFilter").onclick = () => {
    document.querySelectorAll(".filter-panel input, .filter-panel select").forEach(control => control.value = "");
    renderRows();
  };
  document.getElementById("searchFilter").onclick = () => {
    const id = document.getElementById("filterId").value.toLowerCase().trim();
    const mkt = document.getElementById("filterMkt").value.toLowerCase().trim();
    const label = document.getElementById("filterLabel").value;
    const owner = document.getElementById("filterOwner").value;
    const status = document.getElementById("filterStatus").value;
    renderRows(state.campaigns.filter(item => (!id || String(item.id).includes(id) || item.presents.some(p => String(p).includes(id))) && (!mkt || item.name.toLowerCase().includes(mkt) || item.code.toLowerCase().includes(mkt)) && (!label || item.label === label) && (!owner || item.owner === owner) && (!status || item.status === status)));
  };
  main.onclick = event => {
    const action = event.target.closest("button");
    if (!action) return;
    if (action.dataset.view) route("form", { mode: "view", id: Number(action.dataset.view) });
    if (action.dataset.edit) route("form", { mode: "edit", id: Number(action.dataset.edit) });
    if (action.dataset.delete) {
      const id = Number(action.dataset.delete);
      state.campaigns = state.campaigns.filter(item => item.id !== id);
      renderRows();
      toast(`Campaign ${id} đã soft delete.`);
    }
  };
}

function initForm(options = {}) {
  state.formMode = options.mode || "create";
  state.formReturnRoute = options.returnRoute || "list";
  state.editingCampaignId = options.id || null;
  const campaign = getEditingCampaign();
  if (state.formMode !== "create" && !campaign) return route("list");

  const distributionTypeField = document.getElementById("coinDistributionTypeField");
  const isAssetCoinCreate = state.route === "asset-coin-create";
  distributionTypeField.hidden = !isAssetCoinCreate;
  if (isAssetCoinCreate) {
    document.getElementById("coinDistributionType").onchange = event => {
      if (event.target.value === "massive") route("asset-massive");
    };
  }

  state.packages = campaign ? clonePackages(campaign.packages) : [newPackage()];
  state.emails = campaign ? [...campaign.emails] : [];
  state.thresholds = campaign ? [...campaign.thresholds] : [];

  if (campaign) hydrateCampaignForm(campaign);
  document.getElementById("mktCode").onchange = canEditAll() ? changeMkt : null;
  document.getElementById("budgetMethod").onchange = canEditAll() ? renderPackages : null;
  document.getElementById("addPackage").onclick = () => {
    if (state.packages.length >= 10) return toast("Tối đa 10 package/campaign.", "error");
    state.packages.push(newPackage());
    renderPackages();
  };
  bindTagInput("emailInput", "email");
  bindTagInput("thresholdInput", "threshold");
  renderPackages();
  renderTags("email");
  renderTags("threshold");
  bindValidationClear();
  applyFormAccess(campaign);
  renderFormActions(campaign);
}

function hydrateCampaignForm(campaign) {
  const mktCode = document.getElementById("mktCode");
  const budgetType = campaign.budgetType || "campaign";
  const currentOption = mktCode.querySelector(`option[value="${budgetType}"]`);
  if (currentOption) currentOption.textContent = campaign.code;
  mktCode.value = budgetType;
  const mktName = document.getElementById("mktName");
  mktName.innerHTML = `<option>${campaign.name}</option>`;
  const method = document.getElementById("budgetMethod");
  method.innerHTML = budgetType === "shared"
    ? '<option value="campaign">Control budget by campaign</option>'
    : '<option value="campaign">Control budget by campaign</option><option value="package">Control budget by package</option>';
  method.value = campaign.budgetMethod;
  document.getElementById("allocatedBudget").value = money(campaign.allocatedBudget);
  document.getElementById("startTime").value = campaign.startTime;
  document.getElementById("endTime").value = campaign.endTime;
  document.getElementById("campaignLabel").value = campaign.label;
  document.getElementById("formTitle").textContent = `${state.formMode === "view" ? "View" : "Edit"} Campaign #${campaign.id}`;
  document.getElementById("formStatus").innerHTML = `<span class="status ${statusClass(campaign.status)}">${campaign.status}</span>`;
}

function applyFormAccess(campaign) {
  const form = document.getElementById("campaignForm");
  const allControls = form.querySelectorAll("input, select, textarea");
  if (state.formMode === "view") {
    allControls.forEach(control => control.disabled = true);
  } else if (state.formMode === "edit" && !canEditAll()) {
    allControls.forEach(control => control.disabled = true);
    if (canEditBudgetAlert()) ["emailInput", "thresholdInput"].forEach(id => document.getElementById(id).disabled = false);
    if (canEditPackageBudget(campaign)) form.querySelectorAll(".pkg-budget").forEach(control => control.disabled = false);
  } else if (state.formMode === "edit") {
    ["mktCode", "mktName", "startTime", "endTime", "campaignLabel", "emailInput", "thresholdInput"].forEach(id => document.getElementById(id).disabled = false);
    document.getElementById("budgetMethod").disabled = campaign.budgetType === "shared";
    document.getElementById("allocatedBudget").disabled = true;
  }
  document.getElementById("emailControl").classList.toggle("readonly", !canEditBudgetAlert());
  document.getElementById("thresholdControl").classList.toggle("readonly", !canEditBudgetAlert());
}

function renderFormActions(campaign) {
  const holder = document.getElementById("formActions");
  if (state.formMode === "view") {
    holder.innerHTML = '<button type="button" class="btn secondary" id="cancelForm">Back</button>';
  } else if (state.formMode === "edit") {
    holder.innerHTML = '<button type="button" class="btn secondary" id="cancelForm">Cancel</button><button type="button" class="btn primary" id="saveChanges">Save changes</button>';
  }
  document.getElementById("cancelForm").onclick = () => route(state.formReturnRoute);
  if (state.formMode === "create") {
    document.getElementById("saveDraft").onclick = () => submitCampaign(true);
    document.getElementById("campaignForm").onsubmit = event => { event.preventDefault(); submitCampaign(false); };
  } else {
    document.getElementById("campaignForm").onsubmit = event => event.preventDefault();
    document.getElementById("saveChanges")?.addEventListener("click", () => saveCampaignEdit(campaign));
  }
}

function changeMkt() {
  const type = document.getElementById("mktCode").value;
  const name = document.getElementById("mktName");
  const method = document.getElementById("budgetMethod");
  const allocated = document.getElementById("allocatedBudget");
  name.disabled = !type;
  method.disabled = !type || type === "shared";
  name.innerHTML = type ? `<option>${type === "shared" ? "DLS_260528_563" : type === "campaign" ? "ZPI_060426_341_campaign" : "ZPI_060426_342_package"}</option>` : "<option>Select MKT Name</option>";
  if (!type) {
    method.innerHTML = '<option value="">Select Budget Control Method</option>';
    method.value = "";
    allocated.value = "";
  } else if (type === "shared") {
    method.innerHTML = "<option value='campaign'>Control budget by campaign</option>";
    method.value = "campaign";
    allocated.value = money(30000000);
  } else {
    method.innerHTML = "<option value='campaign'>Control budget by campaign</option><option value='package'>Control budget by package</option>";
    method.value = "campaign";
    allocated.value = money(5000000);
  }
  allocated.disabled = true;
  renderPackages();
}

function renderPackages() {
  const control = document.getElementById("budgetMethod")?.value || "";
  const hasMkt = Boolean(document.getElementById("mktCode")?.value);
  const editable = canEditAll();
  const campaign = getEditingCampaign();
  const limitedBudgetEdit = canEditPackageBudget(campaign);
  const showConsumption = campaign && ["In Use", "Distributing", "Ended"].includes(campaign.status);
  const showPresentId = campaign && ["Auto Approved", "Approved", "In Use", "Distributing", "Ended"].includes(campaign.status);
  const packageLayout = `${showConsumption ? "with-consumption" : "without-consumption"} ${showPresentId ? "with-present" : "without-present"}`;
  const holder = document.getElementById("packages");
  holder.innerHTML = state.packages.map(pkg => {
    const packageBudgetEnabled = hasMkt && control === "package" && (editable || limitedBudgetEdit);
    const { budget: packageBudget, consumedBudget, remainingBudget } = budgetSnapshot(control, pkg);
    const users = number(pkg.coin) ? Math.floor(packageBudget / number(pkg.coin)) : 0;
    const historyContent = pkg.historyContent.trim();
    const previewContent = historyContent || "Nội dung lịch sử nhận xu sẽ hiển thị tại đây";
    return `<section class="crm-section package-block" data-id="${pkg.id}">
      <h1>Distribute Loyalty Coin</h1>${editable && state.packages.length > 1 ? "<button type='button' class='remove-package'>×</button>" : ""}
      <div class="package-inner"><div class="package-fields ${packageLayout}">
        <label class="field package-budget ${control === "package" ? "required" : ""}"><span>Package Budget</span><div class="suffix-input"><input class="pkg-budget" inputmode="numeric" value="${formattedNumber(packageBudget)}" ${packageBudgetEnabled ? "" : "disabled"} placeholder="Package Budget"><b>VND</b></div></label>
        ${showConsumption ? `<label class="field"><span>Consumed Budget</span><div class="suffix-input"><input class="pkg-consumed" value="${money(consumedBudget)}" disabled><b>VND</b></div></label>
        <label class="field"><span>Remaining Budget</span><div class="suffix-input"><input class="pkg-remaining" value="${money(remainingBudget)}" disabled><b>VND</b></div></label>` : ""}
        <label class="field required"><span>Coin Distribution Method</span><select class="pkg-method" disabled><option value="budget" selected>By Budget</option></select></label>
        <label class="field required"><span>Coin Per User</span><input class="pkg-coin" inputmode="numeric" value="${formattedNumber(pkg.coin)}" ${editable ? "" : "disabled"}></label>
        <label class="field"><span>Estimated Users</span><input class="pkg-users" value="${money(users)}" disabled></label>
        ${showPresentId ? `<label class="field"><span>Present ID</span><input class="pkg-present" value="${pkg.presentId}" disabled></label>` : ""}
      </div>
      <div class="package-experience">
        <label class="field required coin-history-field"><span>Coin History Content</span><textarea class="pkg-history-content" maxlength="100" rows="3" ${editable ? "" : "disabled"} placeholder="Nhập nội dung hiển thị trong lịch sử nhận xu">${escapeHtml(pkg.historyContent)}</textarea><small><span>Hiển thị tại màn Tích xu trên Zalopay app</span><span class="pkg-history-count">${pkg.historyContent.length} / 100</span></small></label>
        <div class="coin-history-preview" aria-label="Preview nội dung lịch sử nhận xu">
          <div class="coin-history-preview-head"><strong>Preview on Zalopay app</strong><span>Tích xu</span></div>
          <div class="coin-history-month"><strong>Tháng 08/2026</strong><span>Tổng: 4.844 xu</span></div>
          <div class="coin-history-row">
            <img class="coin-history-icon" src="assets/loyalty-coin.svg" alt="">
            <span class="coin-history-copy"><strong class="pkg-history-preview ${historyContent ? "" : "is-placeholder"}">${escapeHtml(previewContent)}</strong><small>10:09 - 12/08/2026</small></span>
            <strong class="pkg-coin-preview">+${money(pkg.coin)} xu</strong>
          </div>
        </div>
      </div></div>
    </section>`;
  }).join("");
  if (editable || limitedBudgetEdit) holder.querySelectorAll(".package-block").forEach(bindPackage);
  const add = document.getElementById("addPackage");
  add.hidden = !editable;
  add.disabled = state.packages.length >= 10;
}

function bindPackage(block) {
  const pkg = state.packages.find(item => item.id === block.dataset.id);
  block.querySelector(".remove-package")?.addEventListener("click", () => { state.packages = state.packages.filter(item => item.id !== pkg.id); renderPackages(); });
  [[".pkg-budget", "budget"], [".pkg-coin", "coin"]].forEach(([selector, key]) => block.querySelector(selector)?.addEventListener("input", event => {
    const numericValue = number(event.target.value);
    pkg[key] = numericValue ? String(numericValue) : "";
    event.target.value = formattedNumber(pkg[key]);
    if (numericValue) {
      clearFieldError(event.target);
    }
    updatePackage(block, pkg);
  }));
  block.querySelector(".pkg-history-content")?.addEventListener("input", event => {
    pkg.historyContent = event.target.value;
    if (pkg.historyContent.trim()) clearFieldError(event.target);
    updatePackage(block, pkg);
  });
}

function updatePackage(block, pkg) {
  const control = document.getElementById("budgetMethod")?.value;
  const { budget, remainingBudget } = budgetSnapshot(control, pkg);
  const users = number(pkg.coin) ? Math.floor(budget / number(pkg.coin)) : 0;
  if (block.querySelector(".pkg-users")) block.querySelector(".pkg-users").value = money(users);
  if (block.querySelector(".pkg-remaining")) block.querySelector(".pkg-remaining").value = money(remainingBudget);
  const preview = block.querySelector(".pkg-history-preview");
  const historyContent = pkg.historyContent.trim();
  if (preview) {
    preview.textContent = historyContent || "Nội dung lịch sử nhận xu sẽ hiển thị tại đây";
    preview.classList.toggle("is-placeholder", !historyContent);
  }
  if (block.querySelector(".pkg-coin-preview")) block.querySelector(".pkg-coin-preview").textContent = `+${money(pkg.coin)} xu`;
  if (block.querySelector(".pkg-history-count")) block.querySelector(".pkg-history-count").textContent = `${pkg.historyContent.length} / 100`;
}

function bindTagInput(id, type) {
  const input = document.getElementById(id);
  if (!canEditBudgetAlert()) return;
  input.onkeydown = event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const raw = event.target.value.trim();
    if (!raw) return;
    if (type === "email") {
      const email = raw.includes("@") ? raw : `${raw}@vng.com.vn`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Email không hợp lệ.", "error");
      if (!state.emails.includes(email)) state.emails.push(email);
    } else {
      const threshold = Number(raw);
      if (!Number.isInteger(threshold) || threshold < 1 || threshold > 99) return toast("Budget Alert chỉ nhận số nguyên 1-99.", "error");
      if (!state.thresholds.includes(threshold)) state.thresholds.push(threshold);
    }
    event.target.value = "";
    renderTags(type);
  };
}

function renderTags(type) {
  const values = type === "email" ? state.emails : state.thresholds;
  const selector = type === "email" ? "#emailControl .tags" : "#thresholdControl .tags";
  const holder = document.querySelector(selector);
  const editable = canEditBudgetAlert();
  holder.innerHTML = values.map(value => `<span class="tag">${value}${type === "threshold" ? "%" : ""}${editable ? `<button type="button" data-value="${value}">×</button>` : ""}</span>`).join("");
  if (!editable) return;
  holder.querySelectorAll("button").forEach(button => button.onclick = () => {
    if (type === "email") state.emails = state.emails.filter(value => value !== button.dataset.value);
    else state.thresholds = state.thresholds.filter(value => value !== Number(button.dataset.value));
    renderTags(type);
  });
}

function clearFieldError(control) {
  const field = control?.closest(".field");
  if (!field) return;
  field.classList.remove("invalid");
  field.querySelectorAll('[aria-invalid="true"]').forEach(node => node.removeAttribute("aria-invalid"));
  field.querySelector(".field-error")?.remove();
}

function setFieldError(control, message) {
  const field = control?.closest(".field");
  if (!field) return;
  field.classList.add("invalid");
  control.setAttribute("aria-invalid", "true");
  let error = field.querySelector(".field-error");
  if (!error) {
    error = document.createElement("small");
    error.className = "field-error";
    error.setAttribute("role", "alert");
    field.append(error);
  }
  error.textContent = message;
}

function bindValidationClear() {
  document.querySelectorAll("#campaignForm input, #campaignForm select, #campaignForm textarea").forEach(control => {
    const clear = () => { if (control.value) clearFieldError(control); };
    control.addEventListener("input", clear);
    control.addEventListener("change", clear);
  });
}

function resetValidation() {
  document.querySelectorAll(".field.invalid").forEach(field => field.classList.remove("invalid"));
  document.querySelectorAll('[aria-invalid="true"]').forEach(control => control.removeAttribute("aria-invalid"));
  document.querySelectorAll(".field-error").forEach(error => error.remove());
}

function focusFirstInvalid() {
  document.querySelector('[aria-invalid="true"]:not(:disabled)')?.focus();
}

function validatePackageAllocation(campaign, { extendOnly = false } = {}) {
  let valid = true;
  const allocatedBudget = number(document.getElementById("allocatedBudget").value);
  let totalPackageBudget = 0;
  let firstBudgetInput = null;

  state.packages.forEach(pkg => {
    const block = document.querySelector(`.package-block[data-id="${pkg.id}"]`);
    const input = block?.querySelector(".pkg-budget");
    if (!input) return;
    firstBudgetInput ||= input;
    const budget = number(pkg.budget);
    const originalBudget = number(pkg.originalBudget);
    const consumedBudget = number(pkg.consumedBudget);
    totalPackageBudget += budget;

    if (!String(pkg.budget).trim()) {
      setFieldError(input, "Budget is required");
      valid = false;
    } else if (budget <= 0) {
      setFieldError(input, "Package Budget must be greater than 0.");
      valid = false;
    } else if (extendOnly && budget < originalBudget) {
      setFieldError(input, "Package Budget can only be increased.");
      valid = false;
    } else if (budget < consumedBudget) {
      setFieldError(input, "Package Budget cannot be less than consumed budget.");
      valid = false;
    }
  });

  if (valid && totalPackageBudget > allocatedBudget) {
    setFieldError(firstBudgetInput, "Total Package Budget cannot exceed Allocated Budget.");
    valid = false;
  }

  if (!valid) {
    toast("Package Budget chưa hợp lệ.", "error");
    focusFirstInvalid();
  }
  return valid;
}

function validateCampaign() {
  resetValidation();
  let valid = true;
  const mktCode = document.getElementById("mktCode");
  const mktName = document.getElementById("mktName");
  const budgetMethod = document.getElementById("budgetMethod");
  const startTime = document.getElementById("startTime");
  const endTime = document.getElementById("endTime");
  if (!mktCode.value) {
    setFieldError(mktCode, "MKT Code is required");
    valid = false;
  } else {
    if (!mktName.value) { setFieldError(mktName, "MKT Name is required"); valid = false; }
    if (!budgetMethod.value) { setFieldError(budgetMethod, "Budget Control Method is required"); valid = false; }
  }
  if (!startTime.value || !endTime.value) {
    setFieldError(startTime, "Distribute Time is required");
    endTime.setAttribute("aria-invalid", "true");
    valid = false;
  }
  const control = document.getElementById("budgetMethod").value;
  state.packages.forEach(pkg => {
    const block = document.querySelector(`.package-block[data-id="${pkg.id}"]`);
    const rules = [
      [".pkg-coin", !number(pkg.coin), "Coin Per User is required"],
      [".pkg-budget", control === "package" && !number(pkg.budget), "Budget is required"],
      [".pkg-history-content", !pkg.historyContent.trim(), "Coin History Content is required"]
    ];
    rules.forEach(([selector, invalid, message]) => {
      const input = block?.querySelector(selector);
      if (!input || !invalid) return;
      setFieldError(input, message);
      valid = false;
    });
  });
  if (valid && control === "package") valid = validatePackageAllocation(getEditingCampaign());
  if (!valid) {
    if (!document.querySelector(".package-budget.invalid")) toast("Vui lòng nhập đủ mandatory field.", "error");
    focusFirstInvalid();
  }
  return valid;
}

function collectFormData() {
  const budgetMethod = document.getElementById("budgetMethod").value;
  const allocatedBudget = number(document.getElementById("allocatedBudget").value);
  const packages = state.packages.map(pkg => ({ ...pkg, budget: String(budgetMethod === "package" ? number(pkg.budget) : allocatedBudget) }));
  const budget = budgetMethod === "package" ? packages.reduce((sum, pkg) => sum + number(pkg.budget), 0) : allocatedBudget;
  return {
    name: document.getElementById("mktName").value,
    code: document.getElementById("mktCode").selectedOptions[0].text.split(" - ")[0],
    budget,
    allocatedBudget: allocatedBudget || budget,
    budgetMethod,
    budgetType: document.getElementById("mktCode").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    time: isoToDisplay(document.getElementById("endTime").value),
    label: document.getElementById("campaignLabel").value,
    packages: clonePackages(packages),
    coins: state.packages.map(pkg => number(pkg.coin)),
    emails: state.emails.length ? [...state.emails] : ["kiettt8@vng.com.vn"],
    thresholds: state.thresholds.length ? [...state.thresholds] : [10]
  };
}

function submitCampaign(draft) {
  if (!validateCampaign()) return;
  const data = collectFormData();
  const maxCoin = Math.max(...data.coins);
  const status = draft ? "Draft" : maxCoin <= 500 ? "Auto Approved" : "FA Review";
  const id = Math.max(...state.campaigns.map(item => item.id)) + 1;
  const presents = status === "Auto Approved" ? state.packages.map((_, index) => 21020 + index) : [];
  if (presents.length) data.packages = data.packages.map((pkg, index) => ({ ...pkg, presentId: presents[index] }));
  state.campaigns.unshift({ ...data, id, presents, status, owner: "kiettt8" });
  toast(draft ? `Campaign ${id} đã Save Draft.` : `Campaign ${id}: ${status}${status === "Auto Approved" ? ", Present ID đã generate." : "."}`);
  setTimeout(() => route(state.formReturnRoute), 500);
}

function saveCampaignEdit(campaign) {
  if (canEditAll()) {
    if (!validateCampaign()) return;
    Object.assign(campaign, collectFormData());
  } else {
    resetValidation();
    if (canEditPackageBudget(campaign)) {
      if (!validatePackageAllocation(campaign, { extendOnly: true })) return;
      campaign.packages = campaign.packages.map((pkg, index) => ({
        ...pkg,
        budget: String(number(state.packages[index].budget)),
        originalBudget: String(number(state.packages[index].budget)),
        consumedBudget: String(number(state.packages[index].consumedBudget))
      }));
      campaign.coins = campaign.packages.map(pkg => number(pkg.coin));
      campaign.budget = campaign.allocatedBudget;
    }
    campaign.emails = state.emails.length ? [...state.emails] : [`${campaign.owner}@vng.com.vn`];
    campaign.thresholds = state.thresholds.length ? [...state.thresholds] : [10];
  }
  toast(`Campaign ${campaign.id} đã cập nhật, status giữ nguyên ${campaign.status}.`);
  setTimeout(() => route("list"), 400);
}

function initTrigger() {
  const campaignSelect = document.getElementById("triggerCampaign");
  const presentSelect = document.getElementById("triggerPresent");
  const eligible = state.campaigns.filter(item => ["Approved", "Auto Approved", "In Use"].includes(item.status) && item.presents.length);
  campaignSelect.innerHTML += eligible.map(item => `<option value="${item.id}">${item.id} - ${item.name}</option>`).join("");
  campaignSelect.onchange = () => {
    const campaign = eligible.find(item => item.id === Number(campaignSelect.value));
    presentSelect.disabled = !campaign;
    presentSelect.innerHTML = campaign ? `<option value="">Chọn Present ID - Số xu phát</option>${campaign.presents.map((id, index) => `<option value="${id}">ID ${id} - ${money(campaign.coins[index])} coin per user</option>`).join("")}` : "<option>Chọn Present ID - Số xu phát đã cấu hình</option>";
  };
  document.getElementById("triggerForm").onsubmit = event => {
    event.preventDefault();
    if (!campaignSelect.value || !presentSelect.value) return toast("Chọn Campaign trước, sau đó chọn Present ID.", "error");
    toast("Trigger Based Campaign đã được approve và distribute.");
  };
  document.querySelectorAll("[data-route]").forEach(button => button.onclick = () => route(button.dataset.route));
}

document.querySelectorAll("[data-route]").forEach(button => button.onclick = () => route(button.dataset.route));
document.querySelectorAll("[data-nav-target]").forEach(button => button.onclick = () => {
  const target = document.getElementById(button.dataset.navTarget);
  target.hidden = !target.hidden;
  button.setAttribute("aria-expanded", String(!target.hidden));
  button.querySelector("span").textContent = target.hidden ? "⌄" : "⌃";
});
document.getElementById("menuToggle").onclick = () => document.getElementById("sidebar").classList.toggle("open");
route("asset-list");
