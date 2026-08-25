function money(value) { return new Intl.NumberFormat("vi-VN").format(Number(value || 0)); }
function number(value) { return Number(String(value || "").replace(/[^0-9]/g, "")); }
function formattedNumber(value) { return number(value) ? money(number(value)) : ""; }
function statusClass(value) { return value.toLowerCase().replaceAll(" ", "-"); }
function packageKey() { return `pkg-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function escapeHtml(value) { return String(value || "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]); }
function newPackage() { return { id: packageKey(), method: "budget", budget: "", originalBudget: "", consumedBudget: "0", coin: "", historyContent: "" }; }
function clonePackages(packages) {
  return packages.map(pkg => ({
    ...pkg,
    id: packageKey(),
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
    { id: 1101, name: "Loyalty_Coin_Draft", code: "ZPI_190726_001", budget: 5000000, packageIds: [], coins: [300, 500], time: "31/12/2026 23:59", status: "Draft", label: "ZPO", owner: "kiettt8" },
    { id: 1100, name: "Loyalty_Coin_Rejected", code: "ZPI_180726_009", budget: 9000000, packageIds: [], coins: [900], time: "30/11/2026 23:59", status: "Rejected", label: "BAU", owner: "kiettt8" },
    { id: 1098, name: "quantm6_CB3_22", code: "quantm6_CB3", budget: 360000000, budgetMethod: "package", packageBudgets: [300000000], consumedBudgets: [120000000], packageIds: [1173], coins: [30000], time: "31/03/2029 00:00", status: "Approved", label: "ZPO", owner: "nghiatn" },
    { id: 1023, name: "quantm6_CB2_21", code: "quantm6_CB2", budget: 360000000, budgetMethod: "package", packageBudgets: [150000000, 150000000], consumedBudgets: [80000000, 100000000], packageIds: [1157, 1136], coins: [10000, 30000], time: "28/02/2027 00:00", status: "Approved", label: "BAU", owner: "nghiatn" },
    { id: 2893, name: "[28/05/2026][DLS_260528_563][BAU]", code: "DLS_260528_563", budget: 30000000, consumedBudgets: [5000000, 8000000], packageIds: [20535, 20711], coins: [304, 30000], time: "15/05/2027 00:00", status: "Auto Approved", label: "BAU", owner: "kiettt8" },
    { id: 1026, name: "quantm6_CB2_14", code: "quantm6_CB2", budget: 300000000, packageIds: [1157, 1108], coins: [5000, 20000], time: "28/02/2027 00:00", status: "Approved", label: "ZPO", owner: "nghiatn" },
    { id: 1017, name: "Voucher_Discount_721", code: "quantm6_Voucher_discount7", budget: 200000, budgetMethod: "package", packageBudgets: [150000], consumedBudgets: [0], packageIds: [1007], coins: [1000], time: "01/02/2027 00:00", status: "Auto Approved", label: "BAU", owner: "nghiatn" },
    { id: 1020, name: "Voucher_Discount_706", code: "quantm6_Voucher_discount7", budget: 200000, packageIds: [1151], coins: [500], time: "01/02/2027 00:00", status: "Ended", label: "ZPO", owner: "nghiatn" },
    { id: 998, name: "New_User_Coin", code: "ZPI_290426_118", budget: 18000000, budgetMethod: "package", packageBudgets: [12000000], consumedBudgets: [11000000], packageIds: [19882], coins: [10000], time: "31/12/2026 23:59", status: "In Use", label: "Growth", owner: "linhnt22" },
    { id: 992, name: "Retention_Coin", code: "ZPI_250426_031", budget: 8000000, packageIds: [], coins: [800], time: "15/09/2026 23:59", status: "FA Review", label: "ZPO", owner: "kiettt8" }
  ]
};

const assetCampaigns = [
  { id: 1371, name: "TRONG_260526_TEST_62", code: "TRONG_260526_TEST", budget: 3000000, rewards: "2134", type: "Massive", time: "01/07/2027 00:00", target: "test tier", status: "Draft", label: "annhg_test_icon, ZPO_a, Enablers", owner: "trongdd2" },
  { id: 1570, name: "TRONG_260526_TEST_79", code: "TRONG_260526_TEST", budget: 3000000, rewards: "1827", type: "Massive", time: "01/07/2027 00:00", target: "test tier", status: "Approved", label: "annhg_test_icon, ZPO_a, Enablers", owner: "trongdd2" },
  { id: 1023, name: "quantm6_CB2_21", code: "quantm6_CB2", budget: 300000000, rewards: "1157, 1136", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved", label: "", owner: "nghiatn" },
  { id: 1025, name: "quantm6_CB2_20", code: "quantm6_CB2", budget: 300000000, rewards: "1162, 1007, 1108", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved", label: "", owner: "nghiatn" },
  { id: 1026, name: "quantm6_CB2_14", code: "quantm6_CB2", budget: 300000000, rewards: "1157, 1108", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved", label: "", owner: "nghiatn" },
  { id: 1027, name: "quantm6_CB2_15", code: "quantm6_CB2", budget: 300000000, rewards: "1157, 1138", type: "Massive", time: "28/02/2027 00:00", target: "TestSQL", status: "Approved", label: "", owner: "nghiatn" },
  { id: 1017, name: "Voucher_Discount_721", code: "quantm6_Voucher_discount7", budget: 200000, rewards: "1007", type: "Massive", time: "01/02/2027 00:00", target: "503", status: "Auto Approved", label: "", owner: "nghiatn" },
  { id: 1018, name: "Voucher_Discount_703", code: "quantm6_Voucher_discount7", budget: 200000, rewards: "1108", type: "Massive", time: "01/02/2027 00:00", target: "503", status: "Approved", label: "", owner: "nghiatn" },
  { id: 2893, name: "[28/05/2026][DLS_260528_563][BAU]", code: "DLS_260528_563", budget: 30000000, packageIds: "20535, 20711", type: "Loyalty Coin", time: "15/05/2027 00:00", target: "Trigger Campaign", status: "Auto Approved", label: "BAU", owner: "kiettt8" },
  { id: 998, name: "New_User_Coin", code: "ZPI_290426_118", budget: 18000000, packageIds: "19882", type: "Loyalty Coin", time: "31/12/2026 23:59", target: "Trigger Campaign", status: "In Use", label: "Growth", owner: "linhnt22" }
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
      packageId: campaign.packageIds[packageIndex] || "",
      historyContent: campaign.historyContents?.[packageIndex] || `Nhận xu từ chương trình ${campaign.name}`
    })),
    ...campaign
  };
});

const promotionCatalog = {
  riskControl: "Đánh giá rủi ro toàn hệ thống",
  userTypes: ["Normal User", "Casual Abuser", "Malicious"],
  recurringPeriods: [
    "Display Continuously",
    "Recur Daily",
    "Recur Weekly",
    "Recur Monthly",
    "Recur in Some Days in a Week",
    "Recur in Some Days in a Month"
  ],
  periodOptions: ["Each Hour", "Each Day", "Each Week", "Each Month", "Each Campaign"],
  weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  monthDays: Array.from({ length: 31 }, (_, index) => String(index + 1)),
  mkts: {
    shared: {
      code: "DLS_260528_563",
      allocatedBudget: 30000000,
      names: [
        { value: "[28/05/2026][DLS_260528_563][BAU]", label: "[28/05/2026][DLS_260528_563][BAU]" }
      ]
    },
    campaign: {
      code: "quantm6_CB3",
      allocatedBudget: 300000000,
      names: [
        { value: "quantm6_CB3_22", label: "quantm6_CB3_22" },
        { value: "quantm6_CB3_21", label: "quantm6_CB3_21 (used by Direct Discount)", disabled: true }
      ]
    },
    package: {
      code: "quantm6_CB2",
      allocatedBudget: 200000,
      names: [
        { value: "Voucher_Discount_721", label: "Voucher_Discount_721" },
        { value: "Voucher_Discount_703", label: "Voucher_Discount_703 (used by Promo Store)", disabled: true }
      ]
    }
  },
  rewards: {
    "1173": { id: "1173", title: "Voucher 50K", description: "Giảm 50.000đ cho hóa đơn đủ điều kiện", expiry: "HSD 31/12/2026", approvalCap: 50000, status: "active" },
    "1157": { id: "1157", title: "Voucher 30K", description: "Giảm 30.000đ cho user mới", expiry: "HSD 28/02/2027", approvalCap: 30000, status: "active" },
    "1151": { id: "1151", title: "Voucher 70K", description: "Giảm 70.000đ cho merchant partner", expiry: "HSD 01/02/2027", approvalCap: 70000, status: "expired" },
    "1108": { id: "1108", title: "Voucher 20K", description: "Giảm 20.000đ cho chiến dịch retention", expiry: "HSD 01/02/2027", approvalCap: 20000, status: "active" }
  }
};

function promotionCodeDisplay(campaign) {
  const raw = String(campaign.rawCode || campaign.codeValue || "").toUpperCase();
  return campaign.codeType === "Unique Code" ? raw.slice(0, 5) : raw;
}

function promotionListTime(campaign) {
  return isoToDisplay(campaign.activeEnd || campaign.rewardActiveEnd || campaign.endTime || "");
}

function clonePromotionCampaign(campaign) {
  return JSON.parse(JSON.stringify(campaign));
}

function defaultPromotionForm() {
  return {
    mktType: "",
    mktCode: "",
    mktName: "",
    budgetControl: "",
    allocatedBudget: "",
    rewardBudget: "",
    consumedBudget: "0",
    type: "Single Reward",
    codeType: "Unique Code",
    codeValue: "",
    rawCode: "",
    numbersOfCode: "",
    rewardId: "",
    budgetSponsor: "",
    segment: "",
    riskControl: promotionCatalog.riskControl,
    userTypes: ["Normal User"],
    activeStart: "",
    activeEnd: "",
    recurringPeriod: "Display Continuously",
    recurringConfig: {
      timeStart: "09:00",
      timeEnd: "21:00",
      startDay: "Monday",
      endDay: "Friday",
      monthStartDay: "1",
      monthEndDay: "30",
      selectedWeekDays: ["Tuesday", "Thursday"],
      selectedMonthDays: ["10", "20", "30"]
    },
    maxApplyQty: "",
    maxApplyPeriod: "Each Campaign",
    stockLimitQty: "",
    stockLimitPeriod: "Each Day",
    emails: [],
    thresholds: [],
    label: "ZPO",
    owner: "kiettt8",
    status: "Draft",
    exportState: "ready"
  };
}

const promotionState = {
  formMode: "create",
  editingId: null,
  form: defaultPromotionForm(),
  campaigns: [
    {
      id: 1098,
      mktType: "campaign",
      mktCode: "quantm6_CB3",
      mktName: "quantm6_CB3_22",
      budgetControl: "campaign",
      allocatedBudget: "300000000",
      rewardBudget: "300000000",
      consumedBudget: "0",
      type: "Single Reward",
      codeType: "Mass Code",
      codeValue: "BAYHE50K",
      rawCode: "BAYHE50K",
      numbersOfCode: "",
      rewardId: "1173",
      budgetSponsor: "ZaloPay",
      segment: "Campus Segment",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User"],
      activeStart: "2026-08-01T00:00",
      activeEnd: "2029-03-31T00:00",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Campaign",
      stockLimitQty: "3000",
      stockLimitPeriod: "Each Campaign",
      label: "ZPO",
      owner: "nghiatn",
      status: "Approved",
      emails: ["nghiatn@vng.com.vn"],
      thresholds: [10],
      exportState: "ready"
    },
    {
      id: 1023,
      mktType: "campaign",
      mktCode: "quantm6_CB2",
      mktName: "quantm6_CB2_21",
      budgetControl: "campaign",
      allocatedBudget: "300000000",
      rewardBudget: "300000000",
      consumedBudget: "0",
      type: "Single Reward",
      codeType: "Unique Code",
      codeValue: "",
      rawCode: "BAYHE30K-9F2D",
      numbersOfCode: "600000",
      rewardId: "1157",
      budgetSponsor: "ZaloPay",
      segment: "New User",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User", "Casual Abuser"],
      activeStart: "2026-08-01T00:00",
      activeEnd: "2027-02-28T00:00",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Day",
      stockLimitQty: "2000",
      stockLimitPeriod: "Each Campaign",
      label: "BAU",
      owner: "nghiatn",
      status: "Auto Approved",
      emails: ["nghiatn@vng.com.vn"],
      thresholds: [10, 20],
      exportState: "processing"
    },
    {
      id: 1020,
      mktType: "package",
      mktCode: "quantm6_Voucher_discount7",
      mktName: "Voucher_Discount_706",
      budgetControl: "package",
      allocatedBudget: "200000",
      rewardBudget: "150000",
      consumedBudget: "120000",
      type: "Single Reward",
      codeType: "Mass Code",
      codeValue: "BAYHE70K",
      rawCode: "BAYHE70K",
      numbersOfCode: "",
      rewardId: "1151",
      budgetSponsor: "Merchant",
      segment: "Merchant Partner",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User"],
      activeStart: "2026-08-01T00:00",
      activeEnd: "2027-02-01T00:00",
      recurringPeriod: "Recur Daily",
      recurringConfig: {
        timeStart: "09:00",
        timeEnd: "20:00",
        startDay: "Monday",
        endDay: "Friday",
        monthStartDay: "1",
        monthEndDay: "30",
        selectedWeekDays: ["Tuesday", "Thursday"],
        selectedMonthDays: ["10", "20", "30"]
      },
      maxApplyQty: "1",
      maxApplyPeriod: "Each Campaign",
      stockLimitQty: "80",
      stockLimitPeriod: "Each Day",
      label: "ZPO",
      owner: "nghiatn",
      status: "Ended",
      emails: ["nghiatn@vng.com.vn"],
      thresholds: [10],
      exportState: "ready"
    },
    {
      id: 1019,
      mktType: "package",
      mktCode: "quantm6_Voucher_discount7",
      mktName: "Voucher_Discount_725",
      budgetControl: "package",
      allocatedBudget: "200000",
      rewardBudget: "200000",
      consumedBudget: "0",
      type: "Single Reward",
      codeType: "Unique Code",
      codeValue: "",
      rawCode: "BAYHE60K-A12D",
      numbersOfCode: "950000",
      rewardId: "1151",
      budgetSponsor: "Partnership",
      segment: "Retention",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User"],
      activeStart: "2026-09-01T00:00",
      activeEnd: "2027-02-01T00:00",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Campaign",
      stockLimitQty: "100",
      stockLimitPeriod: "Each Day",
      label: "Growth",
      owner: "nghiatn",
      status: "Approved",
      emails: ["nghiatn@vng.com.vn"],
      thresholds: [15],
      exportState: "failed"
    },
    {
      id: 1011,
      mktType: "campaign",
      mktCode: "quantm6_CB3",
      mktName: "quantm6_CB3_19",
      budgetControl: "campaign",
      allocatedBudget: "300000000",
      rewardBudget: "300000000",
      consumedBudget: "0",
      type: "Single Reward",
      codeType: "Mass Code",
      codeValue: "FAPENDING",
      rawCode: "FAPENDING",
      numbersOfCode: "",
      rewardId: "1151",
      budgetSponsor: "Merchant",
      segment: "Retention",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User"],
      activeStart: "2026-09-10T00:00",
      activeEnd: "2027-02-28T00:00",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Campaign",
      stockLimitQty: "300",
      stockLimitPeriod: "Each Week",
      label: "BAU",
      owner: "kiettt8",
      status: "FA Review",
      emails: ["kiettt8@vng.com.vn"],
      thresholds: [20],
      exportState: "ready"
    },
    {
      id: 1008,
      mktType: "shared",
      mktCode: "DLS_260528_563",
      mktName: "[28/05/2026][DLS_260528_563][BAU]",
      budgetControl: "campaign",
      allocatedBudget: "30000000",
      rewardBudget: "30000000",
      consumedBudget: "4500000",
      type: "Single Reward",
      codeType: "Mass Code",
      codeValue: "DLS2026",
      rawCode: "DLS2026",
      numbersOfCode: "",
      rewardId: "1108",
      budgetSponsor: "ZaloPay",
      segment: "New User",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User"],
      activeStart: "2026-08-01T00:00",
      activeEnd: "2026-12-31T23:59",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Day",
      stockLimitQty: "500",
      stockLimitPeriod: "Each Day",
      label: "BAU",
      owner: "kiettt8",
      status: "In Use",
      emails: ["kiettt8@vng.com.vn"],
      thresholds: [10, 30],
      exportState: "ready"
    },
    {
      id: 1002,
      mktType: "campaign",
      mktCode: "quantm6_CB3",
      mktName: "quantm6_CB3_20",
      budgetControl: "campaign",
      allocatedBudget: "300000000",
      rewardBudget: "300000000",
      consumedBudget: "0",
      type: "Single Reward",
      codeType: "Mass Code",
      codeValue: "SUMMER30",
      rawCode: "SUMMER30",
      numbersOfCode: "",
      rewardId: "1157",
      budgetSponsor: "ZaloPay",
      segment: "Campus Segment",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User", "Malicious"],
      activeStart: "2026-09-01T00:00",
      activeEnd: "2027-03-31T00:00",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Campaign",
      stockLimitQty: "3000",
      stockLimitPeriod: "Each Campaign",
      label: "ZPO",
      owner: "linhnt22",
      status: "Rejected",
      emails: ["linhnt22@vng.com.vn"],
      thresholds: [10],
      exportState: "ready"
    },
    {
      id: 999,
      mktType: "campaign",
      mktCode: "quantm6_CB3",
      mktName: "quantm6_CB3_18",
      budgetControl: "campaign",
      allocatedBudget: "300000000",
      rewardBudget: "300000000",
      consumedBudget: "0",
      type: "Single Reward",
      codeType: "Mass Code",
      codeValue: "DRAFT50",
      rawCode: "DRAFT50",
      numbersOfCode: "",
      rewardId: "1173",
      budgetSponsor: "ZaloPay",
      segment: "New User",
      riskControl: promotionCatalog.riskControl,
      userTypes: ["Normal User"],
      activeStart: "2026-09-01T00:00",
      activeEnd: "2026-12-31T23:59",
      recurringPeriod: "Display Continuously",
      recurringConfig: defaultPromotionForm().recurringConfig,
      maxApplyQty: "1",
      maxApplyPeriod: "Each Campaign",
      stockLimitQty: "1000",
      stockLimitPeriod: "Each Day",
      label: "ZPO",
      owner: "kiettt8",
      status: "Draft",
      emails: ["kiettt8@vng.com.vn"],
      thresholds: [],
      exportState: "ready"
    }
  ]
};

promotionState.campaigns.splice(2, 0,
  {
    ...clonePromotionCampaign(promotionState.campaigns[1]),
    id: 1026,
    mktName: "quantm6_CB2_14",
    rewardId: "1157",
    rawCode: "BAYHE10K-A72C",
    numbersOfCode: "100000",
    status: "Approved",
    exportState: "ready"
  },
  {
    ...clonePromotionCampaign(promotionState.campaigns[0]),
    id: 1025,
    mktCode: "quantm6_CB2",
    mktName: "quantm6_CB2_20",
    rewardId: "1162, 1007, 1108",
    codeValue: "BAYHE20K",
    rawCode: "BAYHE20K"
  }
);

const main = document.getElementById("mainContent");
const templates = {
  list: document.getElementById("listTemplate"),
  form: document.getElementById("formTemplate"),
  trigger: document.getElementById("triggerTemplate"),
  "asset-list": document.getElementById("assetListTemplate"),
  "asset-massive": document.getElementById("assetMassiveTemplate"),
  "asset-coin-create": document.getElementById("formTemplate"),
  "promotion-list": document.getElementById("promotionListTemplate"),
  "promotion-form": document.getElementById("promotionFormTemplate")
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
  document.body.classList.toggle("asset-mode", name.startsWith("asset-") || name.startsWith("promotion-"));
  main.onclick = null;
  main.replaceChildren(templates[name].content.cloneNode(true));
  document.querySelectorAll("[data-route]").forEach(button => button.classList.toggle("active",
    button.dataset.route === name
    || (name === "form" && button.dataset.route === "list")
    || (["asset-massive", "asset-coin-create"].includes(name) && button.dataset.route === "asset-list")
    || (name.startsWith("promotion-") && button.dataset.route === "promotion-list")
  ));
  if (name === "list") initList();
  if (name === "form") initForm(payload);
  if (name === "trigger") initTrigger();
  if (name === "asset-list") initAssetList();
  if (name === "asset-massive") initAssetMassive();
  if (name === "asset-coin-create") initForm({ mode: "create", returnRoute: "asset-list" });
  if (name === "promotion-list") initPromotionList();
  if (name === "promotion-form") initPromotionForm(payload);
  document.getElementById("sidebar").classList.remove("open");
  main.focus();
}

function assetActionIcon(kind, label) {
  return `<button class="asset-icon-button ${kind}" aria-label="${label}" title="${label}"><img src="assets/action-${kind}.svg" alt="" aria-hidden="true"></button>`;
}

function assetIdentifierCell(item) {
  const isCoin = item.type === "Loyalty Coin";
  const value = (isCoin ? item.packageIds : item.rewards)?.trim();
  if (!value) {
    const title = isCoin
      ? "Package ID được generate sau khi campaign được Approved hoặc Auto Approved"
      : "Campaign chưa có Reward ID";
    return `<span class="asset-empty-value" title="${title}">—</span>`;
  }
  const label = isCoin ? "Package ID" : "Reward ID";
  return `<span class="asset-identifier" data-identifier-kind="${label}" title="${label}: ${value}" aria-label="${label}: ${value}">${value}</span>`;
}

function renderAssetRows(rows = assetCampaigns) {
  const body = document.getElementById("assetCampaignRows");
  body.innerHTML = rows.map(item => `<tr>
    <td>${item.id}</td><td title="${item.name}">${item.name}</td><td title="${item.code}">${item.code}</td><td>${money(item.budget)}</td><td>${assetIdentifierCell(item)}</td><td>${item.type}</td><td>${item.time}</td><td><a href="#" title="${item.target}">${item.target}</a></td><td><span class="status ${statusClass(item.status)}">${item.status}</span></td><td title="${item.label}">${item.label}</td><td>${item.owner}</td>
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
    const label = document.getElementById("assetFilterLabel").value;
    const owner = document.getElementById("assetFilterOwner").value;
    renderAssetRows(assetCampaigns.filter(item => (!id || String(item.id).includes(id) || item.rewards?.includes(id) || item.packageIds?.includes(id)) && (!mkt || item.name.toLowerCase().includes(mkt) || item.code.toLowerCase().includes(mkt)) && (!type || item.type === type) && (!status || item.status === status) && (!label || item.label.includes(label)) && (!owner || item.owner === owner)));
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
    <td>${item.id}</td><td>${item.code}</td><td>${item.name}</td><td>${money(item.allocatedBudget)}</td><td>${item.packageIds.join(", ") || "-"}</td><td>${item.time}</td>
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
    renderRows(state.campaigns.filter(item => (!id || String(item.id).includes(id) || item.packageIds.some(packageId => String(packageId).includes(id))) && (!mkt || item.name.toLowerCase().includes(mkt) || item.code.toLowerCase().includes(mkt)) && (!label || item.label === label) && (!owner || item.owner === owner) && (!status || item.status === status)));
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
  const showPackageId = campaign && ["Auto Approved", "Approved", "In Use", "Distributing", "Ended"].includes(campaign.status);
  const packageLayout = `${showConsumption ? "with-consumption" : "without-consumption"} ${showPackageId ? "with-package-id" : "without-package-id"}`;
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
        ${showPackageId ? `<label class="field"><span>Package ID</span><input class="pkg-package-id" value="${pkg.packageId}" disabled></label>` : ""}
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
  const packageIds = status === "Auto Approved" ? state.packages.map((_, index) => 21020 + index) : [];
  if (packageIds.length) data.packages = data.packages.map((pkg, index) => ({ ...pkg, packageId: packageIds[index] }));
  state.campaigns.unshift({ ...data, id, packageIds, status, owner: "kiettt8" });
  toast(draft ? `Campaign ${id} đã Save Draft.` : `Campaign ${id}: ${status}${status === "Auto Approved" ? ", Package ID đã generate." : "."}`);
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
  const packageSelect = document.getElementById("triggerPackage");
  const eligible = state.campaigns.filter(item => ["Approved", "Auto Approved", "In Use"].includes(item.status) && item.packageIds.length);
  campaignSelect.innerHTML += eligible.map(item => `<option value="${item.id}">${item.id} - ${item.name}</option>`).join("");
  campaignSelect.onchange = () => {
    const campaign = eligible.find(item => item.id === Number(campaignSelect.value));
    packageSelect.disabled = !campaign;
    packageSelect.innerHTML = campaign ? `<option value="">Chọn Package ID - Số xu phát</option>${campaign.packageIds.map((id, index) => `<option value="${id}">ID ${id} - ${money(campaign.coins[index])} coin per user</option>`).join("")}` : "<option>Chọn Package ID - Số xu phát đã cấu hình</option>";
  };
  document.getElementById("triggerForm").onsubmit = event => {
    event.preventDefault();
    if (!campaignSelect.value || !packageSelect.value) return toast("Chọn Campaign trước, sau đó chọn Package ID.", "error");
    toast("Trigger Based Campaign đã được approve và distribute.");
  };
  document.querySelectorAll("[data-route]").forEach(button => button.onclick = () => route(button.dataset.route));
}

function getPromotionCampaign() {
  return promotionState.campaigns.find(item => item.id === promotionState.editingId);
}

function promotionCanEditCore(campaign = getPromotionCampaign()) {
  return !campaign || ["Draft", "Rejected"].includes(campaign.status);
}

function promotionCanEditRewardBudget(campaign = getPromotionCampaign()) {
  return !campaign || campaign.status !== "Ended";
}

function promotionCanEditSegment(campaign = getPromotionCampaign()) {
  return !campaign || ["Draft", "Rejected", "Approved", "Auto Approved", "In Use"].includes(campaign.status);
}

function promotionCanEditUserTypes(campaign = getPromotionCampaign()) {
  return !campaign || ["Draft", "Rejected", "Approved", "Auto Approved"].includes(campaign.status);
}

function promotionCanEditActiveTime(campaign = getPromotionCampaign()) {
  return !campaign || ["Draft", "Rejected", "Approved", "Auto Approved", "In Use"].includes(campaign.status);
}

function promotionCanEditRecurring(campaign = getPromotionCampaign()) {
  return !campaign || ["Draft", "Rejected"].includes(campaign.status);
}

function promotionCanEditApplyLimit(campaign = getPromotionCampaign()) {
  return !campaign || ["Draft", "Rejected"].includes(campaign.status);
}

function promotionCanEditBudgetAlert(campaign = getPromotionCampaign()) {
  return !campaign || campaign.status !== "Ended";
}

function promotionActiveExtendOnly(campaign = getPromotionCampaign()) {
  return Boolean(campaign && ["Approved", "Auto Approved", "In Use"].includes(campaign.status));
}

function promotionSelectedFilterStatuses() {
  return [...document.querySelectorAll("#promoStatusFilterBox input:checked")].map(input => input.value);
}

function promotionUpdateStatusSummary() {
  const selected = promotionSelectedFilterStatuses();
  document.getElementById("promoStatusSummary").textContent = selected.length ? `Status (${selected.length})` : "Status";
}

function promotionActionButtons(campaign) {
  return `<button type="button" data-promo-view="${campaign.id}">View</button><button type="button" data-promo-edit="${campaign.id}">Edit</button>`;
}

function renderPromotionRows(rows = promotionState.campaigns) {
  const ordered = [...rows].sort((left, right) => right.id - left.id);
  const body = document.getElementById("promoCampaignRows");
  body.innerHTML = ordered.map(item => `<tr>
    <td>${item.id}</td>
    <td title="${escapeHtml(item.mktName)}">${escapeHtml(item.mktName)}</td>
    <td title="${escapeHtml(item.mktCode)}">${escapeHtml(item.mktCode)}</td>
    <td>${money(item.allocatedBudget)}</td>
    <td>${escapeHtml(item.rewardId)}</td>
    <td>${escapeHtml(promotionCodeDisplay(item))}</td>
    <td>${escapeHtml(item.codeType)}</td>
    <td>${promotionListTime(item)}</td>
    <td><span class="status ${statusClass(item.status)}">${item.status}</span></td>
    <td>${escapeHtml(item.label)}</td>
    <td>${escapeHtml(item.owner)}</td>
    <td><div class="row-actions">${promotionActionButtons(item)}</div></td>
  </tr>`).join("");
  document.getElementById("promoEmptyState").hidden = ordered.length > 0;
  document.getElementById("promoItemCount").textContent = ordered.length ? `1-${Math.min(ordered.length, 10)} of 733 items` : "0 items";
}

function initPromotionList() {
  renderPromotionRows();
  promotionUpdateStatusSummary();
  document.querySelectorAll("#promoStatusFilterBox input").forEach(input => input.addEventListener("change", promotionUpdateStatusSummary));
  document.getElementById("promoAddNew").onclick = () => route("promotion-form", { mode: "create" });
  document.getElementById("promoCollapseFilter").onclick = event => {
    const controls = [...document.querySelectorAll("#promoFilterGrid > :not(.asset-filter-actions)")];
    const hide = !controls[0].hidden;
    controls.forEach(control => { control.hidden = hide; });
    event.currentTarget.innerHTML = `${hide ? "Expand" : "Collapse"} <span>${hide ? "⌄" : "⌃"}</span>`;
  };
  document.getElementById("promoResetFilter").onclick = () => {
    document.querySelectorAll(".promo-filter-panel input, .promo-filter-panel select").forEach(control => { control.value = ""; });
    document.querySelectorAll("#promoStatusFilterBox input").forEach(input => { input.checked = false; });
    promotionUpdateStatusSummary();
    renderPromotionRows();
  };
  document.getElementById("promoSearchFilter").onclick = () => {
    const idValue = document.getElementById("promoFilterId").value.trim();
    const rewardId = number(idValue);
    const id = Number.isInteger(rewardId) && rewardId > 0 ? String(rewardId) : "";
    const mkt = document.getElementById("promoFilterMkt").value.trim().toLowerCase();
    const code = document.getElementById("promoFilterCode").value.trim().toUpperCase();
    const from = document.getElementById("promoFilterFrom").value;
    const to = document.getElementById("promoFilterTo").value;
    const statuses = promotionSelectedFilterStatuses();
    const label = document.getElementById("promoFilterLabel").value;
    const owner = document.getElementById("promoFilterOwner").value;
    renderPromotionRows(promotionState.campaigns.filter(item => {
      const activeDate = String(item.activeStart || "").slice(0, 10);
      return (!id || String(item.id) === id || String(item.rewardId) === id)
        && (!mkt || item.mktName.toLowerCase().includes(mkt) || item.mktCode.toLowerCase().includes(mkt))
        && (!code || promotionCodeDisplay(item) === code || String(item.rawCode || "").toUpperCase() === code)
        && (!from || activeDate >= from)
        && (!to || activeDate <= to)
        && (!statuses.length || statuses.includes(item.status))
        && (!label || item.label === label)
        && (!owner || item.owner === owner);
    }));
  };
  main.onclick = event => {
    const action = event.target.closest("button");
    if (!action) return;
    if (action.dataset.promoView) route("promotion-form", { mode: "view", id: Number(action.dataset.promoView) });
    if (action.dataset.promoEdit) route("promotion-form", { mode: "edit", id: Number(action.dataset.promoEdit) });
  };
}

function promotionRenderChoicePills(containerId, values, selectedValues, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const selected = new Set(selectedValues);
  const locked = new Set(options.locked || []);
  container.innerHTML = values.map(value => `<button type="button" class="choice-pill ${selected.has(value) ? "active" : ""}" data-value="${escapeHtml(value)}" ${options.disabled ? "disabled" : ""}>${escapeHtml(value)}</button>`).join("");
  if (options.disabled) return;
  container.querySelectorAll("button").forEach(button => button.onclick = () => {
    const value = button.dataset.value;
    const next = new Set(selected);
    if (options.multiple === false) {
      next.clear();
      next.add(value);
    } else if (next.has(value) && !locked.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    locked.forEach(item => next.add(item));
    options.onChange?.([...next]);
  });
}

function promotionRenderRewardPreview() {
  const holder = document.getElementById("promoRewardPreview");
  const reward = promotionCatalog.rewards[promotionState.form.rewardId];
  if (!reward) {
    holder.innerHTML = "";
    return;
  }
  holder.innerHTML = `<div class="promo-preview-card ${reward.status === "expired" ? "expired" : ""}">
    <div class="promo-preview-copy">
      <strong>${escapeHtml(reward.title)}</strong>
      <span>${escapeHtml(reward.description)}</span>
      <small>${escapeHtml(reward.expiry)}</small>
    </div>
    <span class="promo-preview-badge">${reward.status === "expired" ? "Expired" : "Active"}</span>
  </div>`;
}

function promotionRenderCodeMeta() {
  const holder = document.getElementById("promoCodeMeta");
  const campaign = getPromotionCampaign();
  const showExport = promotionState.form.codeType === "Unique Code" && campaign && ["Approved", "Auto Approved"].includes(campaign.status);
  if (showExport) {
    if (campaign.exportState === "processing") {
      holder.innerHTML = '<button type="button" class="asset-btn secondary promo-code-button warning" id="promoExportCode" disabled>Processing</button>';
    } else if (campaign.exportState === "failed") {
      holder.innerHTML = '<div class="promo-code-feedback"><small class="promo-inline-error">Generate code failed</small><button type="button" class="asset-btn secondary" id="promoRetryCode">Retry</button></div>';
    } else {
      holder.innerHTML = '<button type="button" class="asset-btn primary promo-code-button" id="promoExportCode">Export Code</button>';
    }
  } else {
    holder.innerHTML = "";
  }
  document.getElementById("promoExportCode")?.addEventListener("click", () => toast(`Đã export ${campaign.numbersOfCode || 0} unique codes.`));
  document.getElementById("promoRetryCode")?.addEventListener("click", () => {
    campaign.exportState = "ready";
    promotionRenderCodeMeta();
    toast("Retry generate code thành công.");
  });
}

function promotionSyncMktOptions() {
  const mktName = document.getElementById("promoMktName");
  const budgetControl = document.getElementById("promoBudgetControl");
  if (!promotionState.form.mktType) {
    promotionState.form.mktCode = "";
    promotionState.form.allocatedBudget = "";
    promotionState.form.rewardBudget = "";
    mktName.innerHTML = '<option value="">MKT Name</option>';
    mktName.disabled = true;
    budgetControl.innerHTML = '<option value="">Control budget by campaign</option>';
    budgetControl.disabled = true;
    document.getElementById("promoAllocatedBudget").value = "";
    document.getElementById("promoRewardBudget").value = "";
    return;
  }
  const selected = promotionCatalog.mkts[promotionState.form.mktType];
  promotionState.form.mktCode = selected.code;
  promotionState.form.allocatedBudget = String(selected.allocatedBudget);
  mktName.disabled = false;
  mktName.innerHTML = `<option value="">MKT Name</option>${selected.names.map(item => `<option value="${escapeHtml(item.value)}" ${item.disabled ? "disabled" : ""}>${escapeHtml(item.label)}</option>`).join("")}`;
  if (!selected.names.some(item => item.value === promotionState.form.mktName && !item.disabled)) {
    promotionState.form.mktName = "";
  }
  mktName.value = promotionState.form.mktName;
  budgetControl.innerHTML = promotionState.form.mktType === "shared"
    ? '<option value="campaign">Control budget by campaign</option>'
    : '<option value="campaign">Control budget by campaign</option><option value="package">Control budget by package</option>';
  if (promotionState.form.mktType === "shared") {
    promotionState.form.budgetControl = "campaign";
  } else if (!promotionState.form.budgetControl) {
    promotionState.form.budgetControl = "campaign";
  }
  budgetControl.disabled = false;
  budgetControl.value = promotionState.form.budgetControl;
  if (!promotionState.form.rewardBudget || promotionState.form.budgetControl === "campaign") {
    promotionState.form.rewardBudget = String(selected.allocatedBudget);
  }
  document.getElementById("promoAllocatedBudget").value = money(promotionState.form.allocatedBudget);
}

function promotionRenderRecurringDetail() {
  const holder = document.getElementById("promoRecurringDetail");
  const period = promotionState.form.recurringPeriod;
  const config = promotionState.form.recurringConfig;
  if (period === "Display Continuously") {
    holder.innerHTML = "";
    return;
  }
  if (period === "Recur Daily") {
    holder.innerHTML = `<div class="promo-recurring-grid">
      <label class="field required"><span>Start Time</span><input id="promoRecurringTimeStart" type="time" value="${config.timeStart}"></label>
      <label class="field required"><span>End Time</span><input id="promoRecurringTimeEnd" type="time" value="${config.timeEnd}"></label>
    </div>`;
  }
  if (period === "Recur Weekly") {
    holder.innerHTML = `<div class="promo-recurring-grid">
      <label class="field required"><span>Start Day</span><select id="promoRecurringWeekStart">${promotionCatalog.weekDays.map(day => `<option ${config.startDay === day ? "selected" : ""}>${day}</option>`).join("")}</select></label>
      <label class="field required"><span>End Day</span><select id="promoRecurringWeekEnd">${promotionCatalog.weekDays.map(day => `<option ${config.endDay === day ? "selected" : ""}>${day}</option>`).join("")}</select></label>
      <label class="field required"><span>Start Time</span><input id="promoRecurringTimeStart" type="time" value="${config.timeStart}"></label>
      <label class="field required"><span>End Time</span><input id="promoRecurringTimeEnd" type="time" value="${config.timeEnd}"></label>
    </div>`;
  }
  if (period === "Recur Monthly") {
    holder.innerHTML = `<div class="promo-recurring-grid">
      <label class="field required"><span>Start Day</span><select id="promoRecurringMonthStart">${promotionCatalog.monthDays.map(day => `<option ${config.monthStartDay === day ? "selected" : ""}>${day}</option>`).join("")}</select></label>
      <label class="field required"><span>End Day</span><select id="promoRecurringMonthEnd">${promotionCatalog.monthDays.map(day => `<option ${config.monthEndDay === day ? "selected" : ""}>${day}</option>`).join("")}</select></label>
      <label class="field required"><span>Start Time</span><input id="promoRecurringTimeStart" type="time" value="${config.timeStart}"></label>
      <label class="field required"><span>End Time</span><input id="promoRecurringTimeEnd" type="time" value="${config.timeEnd}"></label>
    </div>`;
  }
  if (period === "Recur in Some Days in a Week") {
    holder.innerHTML = `<div class="promo-recurring-grid wide">
      <label class="field required promo-pill-field"><span>Days of Week</span><div class="choice-pills" id="promoRecurringWeekDays"></div></label>
      <label class="field required"><span>Start Time</span><input id="promoRecurringTimeStart" type="time" value="${config.timeStart}"></label>
      <label class="field required"><span>End Time</span><input id="promoRecurringTimeEnd" type="time" value="${config.timeEnd}"></label>
    </div>`;
    promotionRenderChoicePills("promoRecurringWeekDays", promotionCatalog.weekDays, config.selectedWeekDays, {
      onChange: values => {
        promotionState.form.recurringConfig.selectedWeekDays = values;
        promotionRenderRecurringDetail();
        promotionApplyPromotionAccess();
      }
    });
  }
  if (period === "Recur in Some Days in a Month") {
    holder.innerHTML = `<div class="promo-recurring-grid wide">
      <label class="field required promo-pill-field"><span>Days of Month</span><div class="choice-pills compact" id="promoRecurringMonthDays"></div></label>
      <label class="field required"><span>Start Time</span><input id="promoRecurringTimeStart" type="time" value="${config.timeStart}"></label>
      <label class="field required"><span>End Time</span><input id="promoRecurringTimeEnd" type="time" value="${config.timeEnd}"></label>
    </div>`;
    promotionRenderChoicePills("promoRecurringMonthDays", promotionCatalog.monthDays, config.selectedMonthDays, {
      onChange: values => {
        promotionState.form.recurringConfig.selectedMonthDays = values;
        promotionRenderRecurringDetail();
        promotionApplyPromotionAccess();
      }
    });
  }
  holder.querySelector("#promoRecurringTimeStart")?.addEventListener("input", event => { promotionState.form.recurringConfig.timeStart = event.target.value; });
  holder.querySelector("#promoRecurringTimeEnd")?.addEventListener("input", event => { promotionState.form.recurringConfig.timeEnd = event.target.value; });
  holder.querySelector("#promoRecurringWeekStart")?.addEventListener("change", event => { promotionState.form.recurringConfig.startDay = event.target.value; });
  holder.querySelector("#promoRecurringWeekEnd")?.addEventListener("change", event => { promotionState.form.recurringConfig.endDay = event.target.value; });
  holder.querySelector("#promoRecurringMonthStart")?.addEventListener("change", event => { promotionState.form.recurringConfig.monthStartDay = event.target.value; });
  holder.querySelector("#promoRecurringMonthEnd")?.addEventListener("change", event => { promotionState.form.recurringConfig.monthEndDay = event.target.value; });
}

function promotionUserTypeClass(value) {
  return value.toLowerCase().replaceAll(" ", "-");
}

function promotionUserTypeLabel(value) {
  return value === "Casual Abuser" ? "Casual abuser" : value;
}

function promotionCloseUserTypeMenu() {
  const control = document.getElementById("promoUserTypes");
  const menu = document.getElementById("promoUserTypeMenu");
  if (!control || !menu) return;
  control.setAttribute("aria-expanded", "false");
  menu.hidden = true;
}

function promotionOpenUserTypeMenu() {
  const control = document.getElementById("promoUserTypes");
  const menu = document.getElementById("promoUserTypeMenu");
  if (!control || !menu || document.getElementById("promoUserTypeSearch")?.disabled) return;
  control.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function promotionRenderUserTypeOptions(query = "") {
  const menu = document.getElementById("promoUserTypeMenu");
  if (!menu) return;
  const editable = promotionState.formMode !== "view" && promotionCanEditUserTypes();
  const selected = new Set(promotionState.form.userTypes);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = promotionCatalog.userTypes.filter(value => promotionUserTypeLabel(value).toLowerCase().includes(normalizedQuery));
  menu.innerHTML = visibleOptions.length
    ? visibleOptions.map(value => `<button type="button" class="choice-pill promo-user-type-option ${promotionUserTypeClass(value)} ${selected.has(value) ? "active" : ""}" data-value="${escapeHtml(value)}" role="option" aria-selected="${selected.has(value)}" ${value === "Normal User" ? 'aria-disabled="true"' : ""} ${editable ? "" : "disabled"}><span>${escapeHtml(promotionUserTypeLabel(value))}</span><span class="promo-user-type-option-check" aria-hidden="true">${selected.has(value) ? "✓" : ""}</span></button>`).join("")
    : '<div class="promo-user-type-empty">No result</div>';
  if (!editable) return;
  menu.querySelectorAll(".promo-user-type-option").forEach(button => {
    button.onclick = event => {
      event.stopPropagation();
      const value = button.dataset.value;
      if (value === "Normal User") return;
      const next = new Set(promotionState.form.userTypes);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      next.add("Normal User");
      promotionState.form.userTypes = promotionCatalog.userTypes.filter(item => next.has(item));
      clearFieldError(document.getElementById("promoUserTypes"));
      promotionRenderUserTypes();
      document.getElementById("promoUserTypeSearch").focus();
      promotionOpenUserTypeMenu();
    };
  });
}

function promotionRenderUserTypes() {
  const combobox = document.getElementById("promoUserTypeCombobox");
  const control = document.getElementById("promoUserTypes");
  const tags = document.getElementById("promoUserTypeTags");
  const search = document.getElementById("promoUserTypeSearch");
  if (!combobox || !control || !tags || !search) return;
  const editable = promotionState.formMode !== "view" && promotionCanEditUserTypes();
  promotionState.form.userTypes = promotionCatalog.userTypes.filter(value => promotionState.form.userTypes.includes(value));
  tags.innerHTML = promotionState.form.userTypes.map(value => `<span class="promo-user-type-tag ${promotionUserTypeClass(value)}">${escapeHtml(promotionUserTypeLabel(value))}${editable && value !== "Normal User" ? `<button type="button" data-remove-user-type="${escapeHtml(value)}" aria-label="Remove ${escapeHtml(promotionUserTypeLabel(value))}">×</button>` : ""}</span>`).join("");
  combobox.classList.toggle("readonly", !editable);
  control.setAttribute("aria-disabled", String(!editable));
  search.disabled = !editable;
  if (!editable) promotionCloseUserTypeMenu();
  promotionRenderUserTypeOptions(search.value);
  tags.querySelectorAll("[data-remove-user-type]").forEach(button => {
    button.onclick = event => {
      event.stopPropagation();
      promotionState.form.userTypes = promotionState.form.userTypes.filter(value => value !== button.dataset.removeUserType);
      promotionRenderUserTypes();
      search.focus();
      promotionOpenUserTypeMenu();
    };
  });
  control.onclick = () => { if (editable) search.focus(); };
  search.onfocus = promotionOpenUserTypeMenu;
  search.onclick = promotionOpenUserTypeMenu;
  search.oninput = () => {
    promotionRenderUserTypeOptions(search.value);
    promotionOpenUserTypeMenu();
  };
  search.onkeydown = event => {
    if (event.key === "Escape") {
      promotionCloseUserTypeMenu();
      search.blur();
    }
  };
}

function promotionRenderAlertTags(type) {
  const editable = promotionCanEditBudgetAlert() && promotionState.formMode !== "view";
  const holder = type === "email"
    ? document.querySelector("#promoEmailControl .tags")
    : document.querySelector("#promoThresholdControl .tags");
  const values = type === "email" ? promotionState.form.emails : promotionState.form.thresholds;
  holder.innerHTML = values.map(value => `<span class="tag">${value}${type === "threshold" ? "%" : ""}${editable ? `<button type="button" data-value="${value}">×</button>` : ""}</span>`).join("");
  if (!editable) return;
  holder.querySelectorAll("button").forEach(button => button.onclick = () => {
    if (type === "email") promotionState.form.emails = promotionState.form.emails.filter(value => value !== button.dataset.value);
    else promotionState.form.thresholds = promotionState.form.thresholds.filter(value => value !== Number(button.dataset.value));
    promotionRenderAlertTags(type);
  });
}

function promotionApplyPromotionAccess() {
  const campaign = getPromotionCampaign();
  const isView = promotionState.formMode === "view";
  const setDisabled = (id, disabled) => {
    const node = document.getElementById(id);
    if (node) node.disabled = disabled;
  };
  const disableGroup = (selector, disabled) => {
    document.querySelectorAll(selector).forEach(node => { node.disabled = disabled; });
  };
  const coreEditable = !isView && promotionCanEditCore(campaign);
  const rewardBudgetEditable = !isView && promotionCanEditRewardBudget(campaign) && promotionState.form.budgetControl === "package";
  const activeEditable = !isView && promotionCanEditActiveTime(campaign);
  const recurringEditable = !isView && promotionCanEditRecurring(campaign);
  const extendOnly = promotionActiveExtendOnly(campaign);
  setDisabled("promoMktCode", !coreEditable);
  setDisabled("promoMktName", !coreEditable || !promotionState.form.mktType);
  setDisabled("promoBudgetControl", !coreEditable || !promotionState.form.mktType || promotionState.form.mktType === "shared");
  setDisabled("promoAllocatedBudget", true);
  setDisabled("promoCampaignType", true);
  setDisabled("promoCodeType", !coreEditable);
  setDisabled("promoCodeValue", !coreEditable || promotionState.form.codeType !== "Mass Code");
  setDisabled("promoNumberOfCode", !coreEditable || promotionState.form.codeType !== "Unique Code");
  setDisabled("promoRewardBudget", !rewardBudgetEditable);
  setDisabled("promoBudgetSponsor", !coreEditable);
  setDisabled("promoRewardId", !coreEditable);
  setDisabled("promoSegment", isView || !promotionCanEditSegment(campaign));
  setDisabled("promoRiskControl", true);
  setDisabled("promoActiveStart", !activeEditable || extendOnly);
  setDisabled("promoActiveEnd", !activeEditable);
  setDisabled("promoRecurringPeriod", !recurringEditable);
  disableGroup("#promoRecurringDetail input, #promoRecurringDetail select", !recurringEditable);
  document.querySelectorAll("#promoRecurringDetail .choice-pill").forEach(button => { button.disabled = !recurringEditable; });
  setDisabled("promoMaxApplyQty", isView || !promotionCanEditApplyLimit(campaign));
  setDisabled("promoMaxApplyPeriod", isView || !promotionCanEditApplyLimit(campaign));
  setDisabled("promoStockLimitQty", isView || !promotionCanEditApplyLimit(campaign));
  setDisabled("promoStockLimitPeriod", isView || !promotionCanEditApplyLimit(campaign));
  setDisabled("promoEmailInput", isView || !promotionCanEditBudgetAlert(campaign));
  setDisabled("promoThresholdInput", isView || !promotionCanEditBudgetAlert(campaign));
  document.getElementById("promoEmailControl").classList.toggle("readonly", isView || !promotionCanEditBudgetAlert(campaign));
  document.getElementById("promoThresholdControl").classList.toggle("readonly", isView || !promotionCanEditBudgetAlert(campaign));
  document.getElementById("promoAddReward").disabled = true;
  promotionRenderUserTypes();
  promotionRenderAlertTags("email");
  promotionRenderAlertTags("threshold");
}

function promotionPopulateForm() {
  document.getElementById("promoMktCode").value = promotionState.form.mktType;
  promotionSyncMktOptions();
  document.getElementById("promoMktName").value = promotionState.form.mktName;
  document.getElementById("promoBudgetControl").value = promotionState.form.budgetControl;
  document.getElementById("promoAllocatedBudget").value = promotionState.form.allocatedBudget ? money(promotionState.form.allocatedBudget) : "";
  document.getElementById("promoCampaignType").value = promotionState.form.type;
  document.getElementById("promoCodeType").value = promotionState.form.codeType;
  document.getElementById("promoCodeValue").value = promotionState.form.codeValue;
  document.getElementById("promoNumberOfCode").value = promotionState.form.numbersOfCode;
  document.getElementById("promoRewardBudget").value = promotionState.form.rewardBudget ? money(promotionState.form.rewardBudget) : "";
  document.getElementById("promoBudgetSponsor").value = promotionState.form.budgetSponsor;
  document.getElementById("promoRewardId").value = promotionState.form.rewardId;
  document.getElementById("promoSegment").value = promotionState.form.segment;
  document.getElementById("promoRiskControl").value = promotionState.form.riskControl;
  document.getElementById("promoActiveStart").value = promotionState.form.activeStart;
  document.getElementById("promoActiveEnd").value = promotionState.form.activeEnd;
  document.getElementById("promoRecurringPeriod").value = promotionState.form.recurringPeriod;
  document.getElementById("promoMaxApplyQty").value = promotionState.form.maxApplyQty;
  document.getElementById("promoMaxApplyPeriod").value = promotionState.form.maxApplyPeriod;
  document.getElementById("promoStockLimitQty").value = promotionState.form.stockLimitQty;
  document.getElementById("promoStockLimitPeriod").value = promotionState.form.stockLimitPeriod;
  document.getElementById("promoCodeValueField").hidden = promotionState.form.codeType !== "Mass Code";
  document.getElementById("promoNumberOfCodeField").hidden = promotionState.form.codeType !== "Unique Code";
  const rewardBudgetLabel = promotionState.form.budgetControl === "campaign" ? "Campaign Budget" : "Package Budget";
  document.getElementById("promoRewardBudgetLabel").textContent = rewardBudgetLabel;
  document.getElementById("promoRewardBudget").placeholder = rewardBudgetLabel;
  if (promotionState.form.budgetControl === "campaign") {
    promotionState.form.rewardBudget = promotionState.form.allocatedBudget;
    document.getElementById("promoRewardBudget").value = promotionState.form.rewardBudget ? money(promotionState.form.rewardBudget) : "";
  }
  promotionRenderCodeMeta();
  promotionRenderRewardPreview();
  promotionRenderUserTypes();
  promotionRenderRecurringDetail();
  promotionApplyPromotionAccess();
}

function promotionBindAlertInput(id, type) {
  const input = document.getElementById(id);
  input.onkeydown = event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const raw = event.target.value.trim();
    if (!raw) return;
    if (type === "email") {
      const email = raw.includes("@") ? raw : `${raw}@vng.com.vn`;
      if (!/@vng\.com\.vn$/i.test(email)) return toast("You must use email company", "error");
      if (!promotionState.form.emails.includes(email)) promotionState.form.emails.push(email);
    } else {
      const value = Number(raw);
      if (!Number.isInteger(value) || value <= 0 || value >= 100) return toast("Budget alert must be an integer between 1 and 99.", "error");
      if (!promotionState.form.thresholds.includes(value)) promotionState.form.thresholds.push(value);
    }
    event.target.value = "";
    promotionRenderAlertTags(type);
  };
}

function promotionBindForm() {
  document.addEventListener("click", event => {
    if (!event.target.closest("#promoUserTypeCombobox")) promotionCloseUserTypeMenu();
  });
  document.getElementById("promoMktCode").addEventListener("change", event => {
    promotionState.form.mktType = event.target.value;
    promotionState.form.mktName = "";
    promotionState.form.budgetControl = "";
    promotionSyncMktOptions();
    promotionPopulateForm();
  });
  document.getElementById("promoMktName").addEventListener("change", event => { promotionState.form.mktName = event.target.value; clearFieldError(event.target); });
  document.getElementById("promoBudgetControl").addEventListener("change", event => {
    promotionState.form.budgetControl = event.target.value;
    if (event.target.value === "campaign") promotionState.form.rewardBudget = promotionState.form.allocatedBudget;
    promotionPopulateForm();
  });
  document.getElementById("promoCodeType").addEventListener("change", event => {
    promotionState.form.codeType = event.target.value;
    promotionPopulateForm();
  });
  document.getElementById("promoCodeValue").addEventListener("input", event => {
    const raw = event.target.value.toUpperCase();
    const sanitized = raw.replace(/[^A-Z0-9]/g, "").slice(0, 50);
    promotionState.form.codeValue = sanitized;
    promotionState.form.rawCode = sanitized;
    event.target.value = sanitized;
    if (raw !== sanitized) setFieldError(event.target, "Only letters (A-Z) and numbers (0-9) are allowed");
    else clearFieldError(event.target);
  });
  document.getElementById("promoNumberOfCode").addEventListener("input", event => {
    const numeric = Math.min(number(event.target.value), 1000000);
    promotionState.form.numbersOfCode = numeric ? String(numeric) : "";
    event.target.value = promotionState.form.numbersOfCode;
    if (numeric) clearFieldError(event.target);
  });
  document.getElementById("promoRewardBudget").addEventListener("input", event => {
    const numeric = number(event.target.value);
    promotionState.form.rewardBudget = numeric ? String(numeric) : "";
    event.target.value = promotionState.form.rewardBudget ? money(promotionState.form.rewardBudget) : "";
  });
  document.getElementById("promoBudgetSponsor").addEventListener("change", event => { promotionState.form.budgetSponsor = event.target.value; clearFieldError(event.target); });
  document.getElementById("promoRewardId").addEventListener("change", event => {
    promotionState.form.rewardId = event.target.value;
    promotionRenderRewardPreview();
    clearFieldError(event.target);
  });
  document.getElementById("promoSegment").addEventListener("change", event => { promotionState.form.segment = event.target.value; clearFieldError(event.target); });
  document.getElementById("promoActiveStart").addEventListener("change", event => { promotionState.form.activeStart = event.target.value; clearFieldError(event.target); });
  document.getElementById("promoActiveEnd").addEventListener("change", event => { promotionState.form.activeEnd = event.target.value; clearFieldError(event.target); });
  document.getElementById("promoRecurringPeriod").addEventListener("change", event => {
    promotionState.form.recurringPeriod = event.target.value;
    promotionRenderRecurringDetail();
    promotionApplyPromotionAccess();
  });
  document.getElementById("promoMaxApplyQty").addEventListener("input", event => { promotionState.form.maxApplyQty = String(number(event.target.value) || ""); });
  document.getElementById("promoMaxApplyPeriod").addEventListener("change", event => { promotionState.form.maxApplyPeriod = event.target.value; });
  document.getElementById("promoStockLimitQty").addEventListener("input", event => { promotionState.form.stockLimitQty = String(number(event.target.value) || ""); });
  document.getElementById("promoStockLimitPeriod").addEventListener("change", event => { promotionState.form.stockLimitPeriod = event.target.value; });
  document.getElementById("promoAddReward").onclick = () => toast("Phase 1 chỉ hỗ trợ Single Reward.");
  promotionBindAlertInput("promoEmailInput", "email");
  promotionBindAlertInput("promoThresholdInput", "threshold");
}

function promotionDurationDays() {
  const start = new Date(promotionState.form.activeStart);
  const end = new Date(promotionState.form.activeEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return (end - start) / (1000 * 60 * 60 * 24);
}

function promotionValidateRecurring() {
  const period = promotionState.form.recurringPeriod;
  const startDate = new Date(promotionState.form.activeStart);
  const endDate = new Date(promotionState.form.activeEnd);
  const sameDay = promotionState.form.activeStart.slice(0, 10) === promotionState.form.activeEnd.slice(0, 10);
  const config = promotionState.form.recurringConfig;
  const recurringField = document.getElementById("promoRecurringPeriod");
  if (!period) {
    setFieldError(recurringField, "Recurring Period is required");
    return false;
  }
  if (period === "Display Continuously") return true;
  if (config.timeStart >= config.timeEnd) {
    setFieldError(document.getElementById("promoRecurringTimeStart"), "Start time must be earlier than End time");
    return false;
  }
  if (sameDay && period === "Recur Daily") {
    const startSlot = `${promotionState.form.activeStart.slice(0, 10)}T${config.timeStart}`;
    const endSlot = `${promotionState.form.activeEnd.slice(0, 10)}T${config.timeEnd}`;
    if (new Date(startSlot) < startDate || new Date(endSlot) > endDate) {
      setFieldError(document.getElementById("promoRecurringTimeStart"), "Time slot must be within the selected time range");
      return false;
    }
  }
  if (["Recur Weekly", "Recur in Some Days in a Week"].includes(period) && promotionDurationDays() < 7) {
    setFieldError(recurringField, "Please select a duration of at least 7 days");
    return false;
  }
  if (["Recur Monthly", "Recur in Some Days in a Month"].includes(period) && promotionDurationDays() < 30) {
    setFieldError(recurringField, "Please select a duration of at least 30 days");
    return false;
  }
  if (period === "Recur in Some Days in a Week" && !config.selectedWeekDays.length) {
    const button = document.querySelector("#promoRecurringWeekDays .choice-pill");
    setFieldError(button, "Please select at least one day");
    return false;
  }
  if (period === "Recur in Some Days in a Month" && !config.selectedMonthDays.length) {
    const button = document.querySelector("#promoRecurringMonthDays .choice-pill");
    setFieldError(button, "Please select at least one day");
    return false;
  }
  return true;
}

function validatePromotionForm() {
  resetValidation();
  let valid = true;
  const setRequired = (id, condition, message) => {
    const input = document.getElementById(id);
    if (!condition) return;
    setFieldError(input, message);
    valid = false;
  };
  setRequired("promoMktCode", !promotionState.form.mktType, "MKT Code is required");
  setRequired("promoMktName", !promotionState.form.mktName, "MKT Name is required");
  setRequired("promoBudgetControl", !promotionState.form.budgetControl, "Budget Control is required");
  if (promotionState.form.codeType === "Mass Code") setRequired("promoCodeValue", !promotionState.form.codeValue, "Code Value is required");
  if (promotionState.form.codeType === "Unique Code") {
    setRequired("promoNumberOfCode", !number(promotionState.form.numbersOfCode), "Number of code is required");
    if (number(promotionState.form.numbersOfCode) <= 0) {
      setFieldError(document.getElementById("promoNumberOfCode"), "Numbers of code must be > 0");
      valid = false;
    }
  }
  if (promotionState.form.budgetControl === "package") {
    const rewardBudget = number(promotionState.form.rewardBudget);
    const allocatedBudget = number(promotionState.form.allocatedBudget);
    if (!rewardBudget) {
      setFieldError(document.getElementById("promoRewardBudget"), "Package Budget is required");
      valid = false;
    } else if (rewardBudget > allocatedBudget) {
      setFieldError(document.getElementById("promoRewardBudget"), "Package Budget cannot exceed Allocated Budget.");
      valid = false;
    } else if (rewardBudget < number(promotionState.form.consumedBudget)) {
      setFieldError(document.getElementById("promoRewardBudget"), "Package Budget cannot be less than consumed budget.");
      valid = false;
    }
  }
  setRequired("promoBudgetSponsor", !promotionState.form.budgetSponsor, "Budget Sponsor is Required");
  setRequired("promoRewardId", !promotionState.form.rewardId, "Reward ID is Required");
  setRequired("promoSegment", !promotionState.form.segment, "Segment is required");
  if (!promotionState.form.userTypes.length) {
    setFieldError(document.getElementById("promoUserTypes"), "User Type is required");
    valid = false;
  } else if (!promotionState.form.userTypes.includes("Normal User")) {
    setFieldError(document.getElementById("promoUserTypes"), "Normal User must be selected");
    valid = false;
  }
  if (!promotionState.form.activeStart || !promotionState.form.activeEnd) {
    setFieldError(document.getElementById("promoActiveStart"), "Reward Active Time is required");
    valid = false;
  } else if (promotionState.form.activeStart >= promotionState.form.activeEnd) {
    setFieldError(document.getElementById("promoActiveStart"), "Start time must be earlier than End time");
    valid = false;
  } else if (promotionActiveExtendOnly()) {
    const campaign = getPromotionCampaign();
    const originalEnd = new Date(campaign.activeEnd);
    const nextEnd = new Date(promotionState.form.activeEnd);
    const maxEnd = new Date(originalEnd);
    maxEnd.setMonth(maxEnd.getMonth() + 3);
    if (nextEnd < originalEnd) {
      setFieldError(document.getElementById("promoActiveEnd"), "Approved/In Use chỉ được extend end time.");
      valid = false;
    } else if (nextEnd > maxEnd) {
      setFieldError(document.getElementById("promoActiveEnd"), "End time can only be extended up to 3 months.");
      valid = false;
    }
  }
  if (!promotionValidateRecurring()) valid = false;
  if (promotionCanEditApplyLimit()) {
    if (!number(promotionState.form.maxApplyQty)) {
      setFieldError(document.getElementById("promoMaxApplyQty"), "Maximum Apply is required");
      valid = false;
    }
    if (!number(promotionState.form.stockLimitQty)) {
      setFieldError(document.getElementById("promoStockLimitQty"), "Stock Limit is required");
      valid = false;
    }
  }
  if (!valid) {
    toast("Promotion Code chưa hợp lệ.", "error");
    focusFirstInvalid();
  }
  return valid;
}

function validatePromotionDraft() {
  resetValidation();
  if (promotionState.form.mktType) return true;
  const mktCode = document.getElementById("promoMktCode");
  setFieldError(mktCode, "MKT Code is required");
  focusFirstInvalid();
  return false;
}

function collectPromotionForm() {
  const reward = promotionCatalog.rewards[promotionState.form.rewardId];
  const payload = clonePromotionCampaign(promotionState.form);
  payload.rawCode = payload.codeType === "Mass Code" ? payload.codeValue : (payload.rawCode || `${payload.mktCode}-UNIQUE`);
  payload.allocatedBudget = String(number(payload.allocatedBudget));
  payload.rewardBudget = String(number(payload.budgetControl === "campaign" ? payload.allocatedBudget : payload.rewardBudget));
  payload.consumedBudget = String(number(payload.consumedBudget || 0));
  payload.exportState = payload.codeType === "Unique Code"
    ? (number(payload.numbersOfCode) > 900000 ? "failed" : number(payload.numbersOfCode) > 500000 ? "processing" : "ready")
    : "ready";
  payload.label ||= "ZPO";
  payload.owner ||= "kiettt8";
  payload.rewardName = reward?.title || "";
  return payload;
}

function submitPromotionForm(asDraft) {
  if (asDraft ? !validatePromotionDraft() : !validatePromotionForm()) return;
  const payload = collectPromotionForm();
  const reward = promotionCatalog.rewards[payload.rewardId];
  const status = asDraft ? "Draft" : reward && reward.approvalCap > 50000 ? "FA Review" : "Auto Approved";
  const id = Math.max(...promotionState.campaigns.map(item => item.id)) + 1;
  promotionState.campaigns.unshift({ ...payload, id, status });
  toast(asDraft ? `Promotion Code ${id} đã Save.` : `Promotion Code ${id}: ${status}.`);
  setTimeout(() => route("promotion-list"), 400);
}

function savePromotionEdit() {
  if (!validatePromotionForm()) return;
  const campaign = getPromotionCampaign();
  const payload = collectPromotionForm();
  Object.assign(campaign, payload);
  toast(`Promotion Code ${campaign.id} đã cập nhật, status giữ nguyên ${campaign.status}.`);
  setTimeout(() => route("promotion-list"), 400);
}

function renderPromotionFormActions() {
  const holder = document.getElementById("promoFormActions");
  if (promotionState.formMode === "view") {
    holder.innerHTML = '<button type="button" class="asset-btn secondary" id="promoCancelForm">Back</button>';
  } else if (promotionState.formMode === "edit") {
    holder.innerHTML = '<button type="button" class="asset-btn secondary" id="promoCancelForm">Cancel</button><button type="button" class="asset-btn primary" id="promoSaveChanges">Save changes</button>';
  } else {
    holder.innerHTML = '<button type="button" class="asset-btn secondary" id="promoCancelForm">Cancel</button><button type="button" class="asset-btn primary" id="promoSaveDraft">Save</button><button type="submit" class="asset-btn primary">Save &amp; Submit</button>';
  }
  document.getElementById("promoCancelForm").onclick = () => route("promotion-list");
  if (promotionState.formMode === "create") {
    document.getElementById("promoSaveDraft").onclick = () => submitPromotionForm(true);
    document.getElementById("promotionForm").onsubmit = event => { event.preventDefault(); submitPromotionForm(false); };
  } else if (promotionState.formMode === "edit") {
    document.getElementById("promotionForm").onsubmit = event => event.preventDefault();
    document.getElementById("promoSaveChanges").onclick = savePromotionEdit;
  } else {
    document.getElementById("promotionForm").onsubmit = event => event.preventDefault();
  }
}

function initPromotionForm(options = {}) {
  promotionState.formMode = options.mode || "create";
  promotionState.editingId = options.id || null;
  const campaign = getPromotionCampaign();
  if (promotionState.formMode !== "create" && !campaign) return route("promotion-list");
  promotionState.form = campaign ? clonePromotionCampaign(campaign) : defaultPromotionForm();
  document.getElementById("promoFormTitle").textContent = "Basic Information";
  document.getElementById("promoFormStatus").innerHTML = campaign ? `<span class="status ${statusClass(campaign.status)}">${campaign.status}</span>` : "";
  promotionPopulateForm();
  promotionBindForm();
  renderPromotionFormActions();
}

document.querySelectorAll("[data-route]").forEach(button => button.onclick = () => route(button.dataset.route));
document.querySelectorAll("[data-nav-target]").forEach(button => button.onclick = () => {
  const target = document.getElementById(button.dataset.navTarget);
  target.hidden = !target.hidden;
  button.setAttribute("aria-expanded", String(!target.hidden));
  button.querySelector("span").textContent = target.hidden ? "⌄" : "⌃";
});
document.getElementById("menuToggle").onclick = () => document.getElementById("sidebar").classList.toggle("open");
route("promotion-list");
