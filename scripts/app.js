/* =========================
 *  UI refs
 * ========================= */
const menuPage = document.getElementById("menuPage");
const gamePage = document.getElementById("gamePage");

const roundNoEl = document.getElementById("roundNo");
const moneyEl = document.getElementById("money");
const money2El = document.getElementById("money2");

const openCountEl = document.getElementById("openCount");
const deliveryStateEl = document.getElementById("deliveryState");

const progressOuter = document.getElementById("progressOuter");
const progressInner = document.getElementById("progressInner");

const assetGridEl = document.getElementById("assetGrid");
const assetEmptyEl = document.getElementById("assetEmpty");
const assetCountEl = document.getElementById("assetCount");
const settingsDrawerEl = document.getElementById("settingsDrawer");
const cleanupStatusEl = document.getElementById("cleanupStatus");
const cleanupActionsEl = document.getElementById("cleanupActions");
const cleanupConfirmBtn = document.getElementById("cleanupConfirmBtn");
const cleanupToggleBtn = document.getElementById("cleanupToggleBtn");
const reinforceEmbedInlineEl = document.getElementById("reinforceEmbedInline");
const reinforceEmbedTitleEl = document.getElementById("reinforceEmbedTitle");
const reinforceEmbedSubEl = document.getElementById("reinforceEmbedSub");
const reinforceEmbedSelectedEl = document.getElementById("reinforceEmbedSelected");
const reinforceEmbedConfirmBtn = document.getElementById("btnReinforceEmbedConfirm");

const revealGridEl = document.getElementById("revealGrid");
const btnOpen = document.getElementById("btnOpen");
const hallCleanupBtn = document.getElementById("hallCleanupBtn");
const placementHintEl = document.getElementById("placementHint");

const historyListEl = document.getElementById("historyList");

const tooltip = document.getElementById("tooltip");
const mixPile = document.getElementById("mixPile");

const rewardOverlay = document.getElementById("rewardOverlay");
const rewardGrid = document.getElementById("rewardGrid");
const btnRewardSkip = document.getElementById("btnRewardSkip");

const deliveryLeftEl = document.getElementById("deliveryLeft");
const deliveryLeft2El = document.getElementById("deliveryLeft2");
const deliveryBarEl = document.getElementById("deliveryBar");
const deliveryInnerEl = document.getElementById("deliveryInner");

const starterOverlay = document.getElementById("starterOverlay");
const starterGrid = document.getElementById("starterGrid");
const btnStarterOk = document.getElementById("btnStarterOk");

const endOverlay = document.getElementById("endOverlay");
const endTitleEl = document.getElementById("endTitle");
const endSubEl = document.getElementById("endSub");
const endBodyEl = document.getElementById("endBody");

const centerStageEl = document.querySelector(".panel.centerStage");
const centerBodyEl = document.querySelector(".panel.centerStage .centerBody");
const statusPanelEl = document.querySelector(".panel.centerStage .statusPanel");

/* init text */
const _tText = document.getElementById("targetText");
const _tText2 = document.getElementById("targetText2");
if(_tText) _tText.textContent = getTarget();
if(_tText2) _tText2.textContent = getTarget();

function syncStageOverlayOffset(){
  if(!centerStageEl || !centerBodyEl || !statusPanelEl) return;
  const bodyRect = centerBodyEl.getBoundingClientRect();
  const statusRect = statusPanelEl.getBoundingClientRect();
  const top = Math.round((statusRect.bottom - bodyRect.top) + 18);
  centerStageEl.style.setProperty("--stage-overlay-top", `${top}px`);
}

function mountStageOverlays(){
  /* 3.8fix: disabled - keep overlays at body level with fixed positioning */
  return;
}
function _mountStageOverlays_DISABLED(){
  if(!centerStageEl || !centerBodyEl) return;
  const stageAnchor = centerBodyEl.querySelector(".hallActionBar") || centerBodyEl.lastElementChild;
  ["starterOverlay", "rewardOverlay", "reinforceRewardOverlay", "roundStoryOverlay", "roundEndOverlay"].forEach((id)=>{
    const overlay = document.getElementById(id);
    if(!overlay || overlay.dataset.stageMounted === "1") return;
    overlay.dataset.stageMounted = "1";
    overlay.classList.add("stageBoundOverlay");
    if(stageAnchor && stageAnchor.parentNode === centerBodyEl){
      centerBodyEl.insertBefore(overlay, stageAnchor);
    }else{
      centerBodyEl.appendChild(overlay);
    }
  });
  syncStageOverlayOffset();
}

mountStageOverlays();
window.addEventListener("resize", syncStageOverlayOffset);

function initAssetGridDragScroll(){
  if(!assetGridEl) return;
  let isDown = false;
  let startY = 0;
  let startTop = 0;
  assetGridEl.addEventListener("mousedown", (e)=>{
    if(e.button !== 0) return;
    isDown = true;
    startY = e.clientY;
    startTop = assetGridEl.scrollTop;
    assetGridEl.classList.add("dragging");
  });
  window.addEventListener("mousemove", (e)=>{
    if(!isDown) return;
    const dy = e.clientY - startY;
    assetGridEl.scrollTop = startTop - dy;
  });
  window.addEventListener("mouseup", ()=>{
    isDown = false;
    assetGridEl.classList.remove("dragging");
  });
}
initAssetGridDragScroll();

function updateStageFlowState(){
  const ids = ["starterOverlay", "rewardOverlay", "reinforceRewardOverlay", "roundStoryOverlay", "roundEndOverlay"];
  const active = ids.some((id)=>{
    const el = document.getElementById(id);
    return el && el.style.display !== "none";
  });
  document.body.classList.toggle("stage-flow-open", active);
}


/* =========================
 *  Roles
 * ========================= */
const ROLES = GAME_BALANCE.roles.map(r=>({ ...r, startAssets: (r.startAssets || []).map(x=>({ ...x })) }));
ROLES.forEach((role)=>{
  if(role.id === "rookie"){
    role.effectText = "无特效，稳定开局";
    role.startMoney = 0;
    role.startAssets = [];
  }
  if(role.id === "middle"){
    role.effectText = "开局额外 +3 金币";
    role.startMoney = 3;
    role.startAssets = [];
  }
});

const UPGRADES = GAME_BALANCE.upgrades.map(u=>({ ...u }));

let selectedRoleId = null;
let selectedUpgradeId = null;
let metaPoints = 0;
const CONFIG = { starterAssetCount: GAME_BALANCE.starterAssetCount, rewardAssetChoiceCount: GAME_BALANCE.rewardAssetChoiceCount };
let storyStep = 0;
let configReturnTarget = "menu";
let cfgCardFilterMode = "全部";
let cfgCardSearch = "";
let lastRoundDeliverySummary = null;
let cleanupMode = false;
let cleanupSelection = new Set();
let reinforceEmbedMode = false;
let reinforcePeekMode = false;
let pendingReinforceMarker = null;
let pendingReinforceTargetId = null;
let rewardPeekRestore = null;
let rewardPeekLauncherEl = null;
const BOARD_ROWS = [
  { type: "normal", label: "普通池", effect: "无额外效果" },
  { type: "boost", label: "助涨池", effect: "该行股票上涨概率 +10%" },
  { type: "insurance", label: "保险池", effect: "该行股票下跌时额外 +1" }
];
const BOARD_COLS = 4;
let boardRows = BOARD_ROWS.map(()=>[]);
let placementQueue = [];
let starterPlacementPending = false;
let roleStarterCards = [];

function applyStaticUiCopy(){
  const menuSub = document.querySelector("#menuPage .menuSub");
  if(menuSub) menuSub.textContent = "3 行资金池，选好角色就直接开局。";

  const roleHeader = document.querySelector("#rolePage .roleHeader");
  if(roleHeader){
    roleHeader.innerHTML = `
      <div>
        <div class="hFont roleSelectTitle">选择你的风格</div>
        <div class="roleSelectSub">点击角色卡后直接开局</div>
      </div>
    `;
  }

  const roleNextBtn = document.getElementById("btnRoleNext");
  if(roleNextBtn){
    roleNextBtn.style.display = "none";
    roleNextBtn.disabled = true;
  }

  const starterTitle = document.querySelector("#starterOverlay .rewardHeader .h");
  const starterSub = document.querySelector("#starterOverlay .rewardHeader .s");
  const starterBadge = document.querySelector("#starterOverlay .rewardHeader > .s:last-child");
  if(starterTitle) starterTitle.textContent = "开局资产入池";
  if(starterSub) starterSub.textContent = "首轮固定预置 3 张新手股，不再发放小型水电站。";
  if(starterBadge) starterBadge.textContent = "初始配置";

  const starterBtn = document.getElementById("btnStarterOk");
  if(starterBtn) starterBtn.textContent = "入池开盘";
}

applyStaticUiCopy();

const DEFAULT_LEVELS = JSON.parse(JSON.stringify(LEVELS));
const DEFAULT_LIB = JSON.parse(JSON.stringify(LIB));
const DEFAULT_GENERAL_CONFIG = JSON.parse(JSON.stringify(CONFIG));
const DEFAULT_AUDIO_VISUAL_CONFIG = JSON.parse(JSON.stringify(AUDIO_VISUAL_ASSETS));
const FX_ASSETS = JSON.parse(JSON.stringify(AUDIO_VISUAL_ASSETS));
const CONFIG_CARD_CATEGORY_ORDER = ["工具股","人才股","美酒股","农业股","保险股","电力股","科技股","古董股"];
const STOCK_CARD_CATEGORIES = new Set(CONFIG_CARD_CATEGORY_ORDER);

const REINFORCE_MARKERS = [
  { id:'isolate', name:'锁仓', emoji:'🧊', rarity:1, category:'强化标记', eff:'不参与常规交易大厅，但会在资产区保留。', marker:{ type:'isolated' } },
  { id:'innate', name:'做龙头', emoji:'🪨', rarity:1, category:'强化标记', eff:'开盘时更稳定参与交易大厅。', marker:{ type:'innate' } },
  { id:'crazy_up', name:'连板预期', emoji:'🔥', rarity:1, category:'强化标记', eff:'下一次开盘必定上涨，触发后消失。', marker:{ type:'crazy_up' } },
  { id:'demon_stock', name:'妖化', emoji:'🐉', rarity:1, category:'强化标记', eff:'上涨概率大幅提升，上涨时额外赚钱，随后自动清仓。', marker:{ type:'demon_stock' } },
  { id:'boost_up', name:'加仓', emoji:'📈', rarity:1, category:'强化标记', eff:'获得看涨1：上涨概率 +10%。', marker:{ type:'boost_up', value:1 } },
  { id:'price_up', name:'高弹性', emoji:'💰', rarity:1, category:'强化标记', eff:'获得弹性2：上涨时额外 +2 金币。', marker:{ type:'price_up', value:2 } },
  { id:'insurance', name:'避险', emoji:'🛡️', rarity:1, category:'强化标记', eff:'获得防守2：下跌时额外 +2 金币。', marker:{ type:'insurance', value:2 } },
  { id:'leverage', name:'追涨', emoji:'⚡', rarity:1, category:'强化标记', eff:'上涨时额外 +5 金币，下跌时额外 -5 金币。', marker:{ type:'leverage', value:5 } },
  { id:'dividend', name:'现金分红', emoji:'🎁', rarity:1, category:'强化标记', eff:'获得分红3：上涨时额外 +3 金币，逐次衰减。', marker:{ type:'dividend', value:3 } },
  { id:'principal', name:'止盈单', emoji:'🪙', rarity:1, category:'强化标记', eff:'获得清仓价值5：卖出时额外 +5 金币。', marker:{ type:'principal', value:5 } }
];

const STARTER_OPENING_CARDS = [
  { poolType:"normal", name:"新手礼盒", category:"工具股", rarity:1, up:10, down:0, eff:"上涨 1 次后移除", displayEffectText:"上涨 1 次后移除", keywords:[{ type:"remove_after_up" }] },
  { poolType:"boost", name:"新手赠股", category:"人才股", rarity:1, up:3, down:-1, eff:"无", displayEffectText:"无", keywords:[] },
  { poolType:"insurance", name:"新手保险", category:"保险股", rarity:1, up:1, down:2, eff:"无", displayEffectText:"无", keywords:[] }
];

function cloneCardInstance(card, suffix = "clone"){
  return {
    ...card,
    keywords: Array.isArray(card?.keywords) ? card.keywords.map(k=>({ ...k })) : [],
    id: `${card.id || Math.random().toString(16).slice(2)}_${suffix}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`
  };
}

function getAllBoardCards(){
  return boardRows.flat();
}

function syncCardBoardMeta(card, rowIndex, colIndex){
  if(!card) return;
  card.rowIndex = rowIndex;
  card.colIndex = colIndex;
  card.rowType = BOARD_ROWS[rowIndex]?.type || "normal";
}

function syncBoardState(){
  boardRows.forEach((row, rowIndex)=>{
    row.forEach((card, colIndex)=>syncCardBoardMeta(card, rowIndex, colIndex));
  });
  assets.length = 0;
  assets.push(...getAllBoardCards());
  cleanupSelection = new Set([...cleanupSelection].filter(id => assets.some(a => a.id === id)));
}

function resetBoardState(){
  boardRows = BOARD_ROWS.map(()=>[]);
  placementQueue = [];
  starterPlacementPending = false;
  syncBoardState();
}

function getBoardCardById(cardId){
  return getAllBoardCards().find(card => card.id === cardId) || null;
}

function removeBoardCardById(cardId){
  for(let r = 0; r < boardRows.length; r++){
    const idx = boardRows[r].findIndex(card => card.id === cardId);
    if(idx >= 0){
      const [removed] = boardRows[r].splice(idx, 1);
      syncBoardState();
      return removed;
    }
  }
  return null;
}

function canPlaceIntoRow(rowIndex){
  return rowIndex >= 0 && rowIndex < boardRows.length && boardRows[rowIndex].length < getRowCapacity(rowIndex);
}

function getRowCapacity(rowIndex){
  const row = BOARD_ROWS[rowIndex];
  if(!row) return BOARD_COLS;
  return row.tradeNew ? 1 : BOARD_COLS;
}

function getPoolFullReason(rowIndex){
  const row = BOARD_ROWS[rowIndex];
  if(!row) return "本股票池已满";
  return row.tradeNew ? `${row.label} 本轮暂时只能放入 1 张股票` : `${row.label} 已满`;
}

function showPoolFullFeedback(rowIndex){
  const row = BOARD_ROWS[rowIndex];
  addHistoryItem({
    natural:`⚠️ <b style="color:#ff6b6b">${escapeHtml(getPoolFullReason(rowIndex))}</b>，请换一个资金池，或先清仓腾位`,
    title:"⛔ 本股票池已满",
    delta:0,
    good:false
  });
  if(placementHintEl){
    placementHintEl.style.display = "";
    placementHintEl.style.background = 'rgba(255,80,60,0.12)';
    placementHintEl.style.border = '2px solid rgba(255,100,80,0.40)';
    placementHintEl.style.color = '#ffaaa8';
    placementHintEl.innerHTML = `<div style="font-size:15px;font-weight:700;color:#ff6b6b;margin-bottom:4px;">⛔ ${escapeHtml(row?.label || "该资金池")} 已满</div><div>该池仓位已用尽（${boardRows[rowIndex].length}/${getRowCapacity(rowIndex)}），请选择其他资金池或先"清仓模式"腾位。</div>`;
  }

  /* 额外的硬弹窗提示：在规则触发层显示醒目警告 */
  showRuleTriggerFx({
    title: `⛔ ${escapeHtml(row?.label || "")} 已满`,
    sub: `当前 ${boardRows[rowIndex].length}/${getRowCapacity(rowIndex)} 张股票。请换一个池子或先清仓腾位。`,
    kind: 'warning'
  });
}

function clearTemporaryPoolLimits(){
  BOARD_ROWS.forEach((row)=>{
    if(!row) return;
    delete row.tradeNew;
    row.effect = v40PoolEffectText(row);
  });
}

function placeCardIntoRow(card, rowIndex){
  if(!card || !canPlaceIntoRow(rowIndex)) return false;
  boardRows[rowIndex].push(card);
  syncBoardState();
  return true;
}

function boardIsFull(){
  return getAllBoardCards().length >= BOARD_ROWS.length * BOARD_COLS;
}

function queuePlacementCard(card, reasonLabel = "新股票"){
  if(!card) return;
  placementQueue.push(card);
  starterPlacementPending = starterPlacementPending || reasonLabel === "开局发放";
  addHistoryItem({
    natural:`${escapeHtml(card.name)} 等待落位，点击对应资金池行头即可放入`, 
    title: `${reasonLabel}待落位`, 
    delta: 0,
    good: true
  });
  updateOpenAvailability();
  renderBoardGrid();
}

function getPendingPlacementCard(){
  return placementQueue.length ? placementQueue[0] : null;
}

function updateOpenAvailability(){
  const hasPendingPlacement = placementQueue.length > 0;
  const hasAnyBoardCard = getAllBoardCards().length > 0;
  const blocked = runEnded || running || openCount >= getDeliveryOpens() || awaitingStarter || hasPendingPlacement || !hasAnyBoardCard;
  if(btnOpen) btnOpen.disabled = blocked;
  if(placementHintEl){
    if(hasPendingPlacement){
      const card = getPendingPlacementCard();
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = `待落位 <b>${escapeHtml(card?.name || "—")}</b>，点击对应资金池行头即可放入；三行全满时，请先点“清仓模式”腾位。`;
    }else if(cleanupMode){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "清仓模式已开启：点击盘面中的股票即可卖出腾位。";
    }else if(awaitingStarter){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "开局资产尚未全部落位，完成落位后才能开始第一轮开盘。";
    }else{
      placementHintEl.style.display = "none";
      placementHintEl.innerHTML = "";
    }
  }
  if(hallCleanupBtn){
    hallCleanupBtn.classList.toggle("active", cleanupMode);
    hallCleanupBtn.textContent = cleanupMode ? "退出清仓" : "清仓模式";
  }
}


function starsStr2(r){ return r<=0 ? "" : "★".repeat(r); }

function renderRoleGrid(){
  const grid = document.getElementById("roleGrid");
  grid.innerHTML = "";

  ROLES.forEach((r)=>{
    const card = document.createElement("div");
    card.className = "roleCard";
    if(r.disabled) card.classList.add("disabled");
    if(selectedRoleId === r.id) card.classList.add("selected");

    card.innerHTML = `
      <div class="roleTopRow">
        <div class="roleName hFont">${escapeHtml(r.name)}</div>
        <div class="roleStars">${starsStr2(r.stars)}</div>
      </div>
      <div class="roleMeta">
        <span class="tag">${r.disabled ? "敬请期待" : "角色特性"}</span>
      </div>
      <div class="roleDesc">${escapeHtml(r.effectText)}</div>
    `;

    if(!r.disabled){
      card.addEventListener("click", ()=>{
        selectedRoleId = r.id;
        renderRoleGrid();
        startGameFromLobby();
      });
    }
    grid.appendChild(card);
  });
}


function renderUpgradeGrid(){
  return;
}

function goRoleSelect(keepRole=false){
  hideTooltip();
  if(!keepRole){
    selectedRoleId = null;
  }
  menuPage.style.display = "none";
  gamePage.style.display = "none";
  document.getElementById("configPage").style.display = "none";
  const up1 = document.getElementById("upgradePage");
  if(up1) up1.style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "none";
  document.getElementById("configPage").style.display = "none";
  document.getElementById("storyOverlay").style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "none";
  document.getElementById("rolePage").style.display = "flex";
  renderRoleGrid();
}

function goRoleLobby(fromUpgrade=false){
  startGameFromLobby();
  return;
  if(!selectedRoleId) return;
  document.getElementById("rolePage").style.display = "none";
  const up2 = document.getElementById("upgradePage");
  if(up2) up2.style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "none";
  document.getElementById("configPage").style.display = "none";
  document.getElementById("storyOverlay").style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "flex";

  const role = ROLES.find(x=>x.id===selectedRoleId);
  document.getElementById("lobbyRoleName").textContent = role ? role.name : "";
  document.getElementById("lobbyRoleDesc").innerHTML = role
    ? `等级：${starsStr2(role.stars)}<br/>特色效果：<b>${escapeHtml(role.effectText)}</b>`
    : "";

  const p1 = document.getElementById("metaPointsText");
  if(p1) p1.textContent = metaPoints;
}

function goRoleUpgrade(){
  return;
}

function backToMenu(){
  selectedRoleId = null;
  selectedUpgradeId = null;
  lastRoundDeliverySummary = null;
  setDecisionMode(false);
  document.body.classList.remove("reward-open");
  document.getElementById("rolePage").style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "none";
  const up3 = document.getElementById("upgradePage");
  if(up3) up3.style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "none";
  document.getElementById("configPage").style.display = "none";
  document.getElementById("storyOverlay").style.display = "none";
  document.getElementById("configPage").style.display = "none";
  gamePage.style.display = "none";
  menuPage.style.display = "flex";
  cleanupMode = false;
  cleanupSelection.clear();
  reinforceEmbedMode = false;
  reinforcePeekMode = false;
  pendingReinforceTargetId = null;
  pendingReinforceMarker = null;
  document.body.classList.remove('reinforce-targeting-mode');
  document.body.classList.remove('reinforce-peek-mode');
  toggleSettingsDrawer(false);
  syncCleanupUi();
  syncReinforceEmbedPanel();
}

function toggleSettingsDrawer(force){
  if(!settingsDrawerEl) return;
  const next = typeof force === "boolean" ? force : settingsDrawerEl.style.display === "none";
  settingsDrawerEl.style.display = next ? "block" : "none";
}

function syncCleanupUi(){
  if(cleanupToggleBtn){
    cleanupToggleBtn.classList.toggle("active", cleanupMode);
    cleanupToggleBtn.textContent = cleanupMode ? "清仓中" : "清仓";
  }
  if(cleanupStatusEl){
    if(cleanupMode){
      cleanupStatusEl.textContent = `点击勾选股票卡进行清仓（已选 ${cleanupSelection.size} 张）`;
      cleanupStatusEl.style.display = "";
    }else{
      cleanupStatusEl.style.display = "none";
    }
  }
  if(cleanupActionsEl) cleanupActionsEl.style.display = cleanupMode ? "" : "none";
  if(cleanupConfirmBtn) cleanupConfirmBtn.disabled = true;
  updateOpenAvailability();
}

function toggleCleanupMode(force){
  if(reinforceEmbedMode) return;
  const next = typeof force === "boolean" ? force : !cleanupMode;
  cleanupMode = next;
  if(!cleanupMode) cleanupSelection.clear();
  renderLeft();
  renderBoardGrid();
  syncCleanupUi();
}

function syncReinforceEmbedPanel(){
  if(!reinforceEmbedInlineEl) return;
  if(!reinforceEmbedMode || !pendingReinforceMarker){
    reinforceEmbedInlineEl.style.display = "none";
    return;
  }
  reinforceEmbedInlineEl.style.display = "block";
  if(reinforceEmbedTitleEl) reinforceEmbedTitleEl.textContent = `强化股票卡中：${pendingReinforceMarker.emoji || "🪨"} ${pendingReinforceMarker.name}`;
  if(reinforceEmbedSubEl) reinforceEmbedSubEl.textContent = "请点击盘面中的股票选择目标，再点击确认强化";
  if(reinforceEmbedSelectedEl){
    if(pendingReinforceTargetId){
      const card = getBoardCardById(pendingReinforceTargetId);
      reinforceEmbedSelectedEl.textContent = card ? `已选择：${card.name}` : "当前未选中股票";
    }else{
      reinforceEmbedSelectedEl.textContent = "当前未选中股票";
    }
  }
  if(reinforceEmbedConfirmBtn) reinforceEmbedConfirmBtn.disabled = !pendingReinforceTargetId;
  const peekBtn = document.getElementById('btnReinforcePeekToggle');
  if(peekBtn) peekBtn.textContent = reinforcePeekMode ? "展开面板" : "查看盘面";
}

function setReinforcePeekMode(next){
  reinforcePeekMode = !!next;
  const overlay = document.getElementById('reinforceRewardOverlay');
  if(overlay) overlay.classList.toggle('reinforce-peek', reinforcePeekMode);
  document.body.classList.toggle('reinforce-peek-mode', reinforcePeekMode);
  syncReinforceEmbedPanel();
}

function toggleReinforcePeekMode(force){
  if(!reinforceEmbedMode) return;
  const next = typeof force === "boolean" ? force : !reinforcePeekMode;
  setReinforcePeekMode(next);
}

function toggleCleanupCard(cardId){
  if(reinforceEmbedMode){
    selectReinforceTarget(cardId);
    return;
  }
  if(!cleanupMode) return;
  liquidateAssetCard(cardId, 'manual');
  renderBoardGrid();
  syncCleanupUi();
}

function confirmCleanupSelection(){
  return;
}

function beginReinforceEmbed(marker){
  reinforceEmbedMode = true;
  pendingReinforceMarker = marker;
  pendingReinforceTargetId = null;
  cleanupMode = false;
  cleanupSelection.clear();
  const overlay = document.getElementById('reinforceRewardOverlay');
  if(overlay) overlay.classList.add('reinforce-targeting');
  document.body.classList.add('reinforce-targeting-mode');
  setReinforcePeekMode(true);
  renderLeft();
  renderBoardGrid();
  syncCleanupUi();
  syncReinforceEmbedPanel();
}

function selectReinforceTarget(cardId){
  if(!reinforceEmbedMode || !pendingReinforceMarker) return;
  pendingReinforceTargetId = cardId;
  renderLeft();
  renderBoardGrid();
  syncReinforceEmbedPanel();
}

function confirmReinforceEmbed(){
  if(!reinforceEmbedMode || !pendingReinforceMarker || !pendingReinforceTargetId) return;
  const card = getBoardCardById(pendingReinforceTargetId);
  if(!card) return;
  const ok = applyReinforceMarker(card, pendingReinforceMarker);
  if(!ok){
    addHistoryItem({
      natural: `⚠️ <b>${escapeHtml(card.name)}</b> 已有同类强化标记，不能重复嵌入`, 
      title: "强化失败",
      delta: 0,
      good: false
    });
    return;
  }
  addHistoryItem({
    natural: "将强化标记 <b>" + escapeHtml((pendingReinforceMarker.emoji || "🪨") + " " + pendingReinforceMarker.name) + "</b> 嵌入 <b>" + escapeHtml(card.name) + "</b>",
    title: "强化股票卡",
    delta: 0,
    good: true
  });
  sfxForge();
  const pickedId = pendingReinforceMarker.id;
  _reinforcePoolAvail = _reinforcePoolAvail.filter(m=>m.id !== pickedId);
  _reinforcePickRemaining = Math.max(0, _reinforcePickRemaining - 1);
  const pickLeftEl = document.getElementById('reinforcePickLeft');
  if(pickLeftEl) pickLeftEl.textContent = _reinforcePickRemaining;
  reinforceEmbedMode = false;
  setReinforcePeekMode(false);
  pendingReinforceTargetId = null;
  pendingReinforceMarker = null;
  const overlay = document.getElementById('reinforceRewardOverlay');
  if(overlay) overlay.classList.remove('reinforce-targeting');
  document.body.classList.remove('reinforce-targeting-mode');
  renderReinforceRewardGrid();
  renderLeft();
  renderBoardGrid();
  syncCleanupUi();
  syncReinforceEmbedPanel();
  if(_reinforcePickRemaining <= 0){
    const overlay = document.getElementById('reinforceRewardOverlay');
    if(overlay) overlay.style.display = 'none';
    updateStageFlowState();
    setDecisionMode(false);
    renderRevealSnapshot();
    if(_reinforceResolve){
      const done = _reinforceResolve;
      _reinforceResolve = null;
      done();
    }
  }
}

function cancelReinforceEmbed(){
  reinforceEmbedMode = false;
  setReinforcePeekMode(false);
  pendingReinforceTargetId = null;
  pendingReinforceMarker = null;
  const overlay = document.getElementById('reinforceRewardOverlay');
  if(overlay) overlay.classList.remove('reinforce-targeting');
  document.body.classList.remove('reinforce-targeting-mode');
  renderLeft();
  renderBoardGrid();
  syncCleanupUi();
  syncReinforceEmbedPanel();
}

/* =========================
 *  Run setup (role only)
 * ========================= */
function applyRoleToRun(){
  const role = ROLES.find(x=>x.id===selectedRoleId);

  money = Math.max(0, Number(role?.startMoney || 0));
  currentLevel = 0;
  _roundStoryShownForLevel = -1;

  resetBoardState();
  roleStarterCards = [];
  Object.keys(cardNetEarnings).forEach(k => delete cardNetEarnings[k]);

  if(role && Array.isArray(role.startAssets)){
    role.startAssets.forEach((entry)=>{
      const count = Math.max(0, Number(entry.count || 0));
      for(let i=0;i<count;i++){
        const c = createCardByName(entry.name);
        if(c) roleStarterCards.push(cloneCardInstance(c, "role"));
      }
    });
  }
  const uiRoleName = document.getElementById("uiRoleName");
  if(uiRoleName) uiRoleName.textContent = role ? role.name : "未选择";
}

function renderHp(){
  return;
}

function startGameFromLobby(){
  if(!selectedRoleId) return;

  // reset core game state for a new run
  currentLevel = 0;
  round = 1;
  openCount = 0;
  running = false;
  lastRoundDeliverySummary = null;
  _roundStoryShownForLevel = -1;

  // apply role into run state (hp/money/assets)
  applyRoleToRun();

  // hard hide all non-game pages
  const hide = (id)=>{ const el = document.getElementById(id); if(el) el.style.display = "none"; };
  menuPage.style.display = "none";
  hide("rolePage");
  hide("roleLobbyPage");
  hide("upgradePage");
  hide("configPage");
  hide("storyOverlay");
  hide("rewardOverlay");
  hide("reinforceRewardOverlay");
  hide("roundEndOverlay");
  hide("roundStoryOverlay");
  toggleSettingsDrawer(false);
  cleanupMode = false;
  cleanupSelection.clear();
  reinforceEmbedMode = false;
  reinforcePeekMode = false;
  pendingReinforceTargetId = null;
  pendingReinforceMarker = null;
  document.body.classList.remove('reinforce-targeting-mode');
  document.body.classList.remove('reinforce-peek-mode');
  syncCleanupUi();
  syncReinforceEmbedPanel();

  // reset UI blocks
  historyListEl.innerHTML = "";
  renderAll();
  if(!_bgmToggle){ _bgmToggle=true; startBGM(); const b=document.getElementById("bgmBtn"); if(b) b.textContent="🎰 背景音乐"; }
  renderHp();

  const roleObj = ROLES.find(x=>x.id===selectedRoleId);
  addHistoryItem({
    title:"角色已就位 · " + escapeHtml(roleObj ? roleObj.name : "未知"),
    delta:0,
    detail:"准备开始新一局",
    good:true
  });

  if(roleObj && Array.isArray(roleObj.startAssets) && roleObj.startAssets.length){
    const desc = roleObj.startAssets.map(function(x){ return x.name + " x " + x.count; }).join(", ");
    addHistoryItem({
      natural:"开局获得 <b>" + escapeHtml(desc) + "</b>",
      title:"开局资产", delta:0,
      detail: escapeHtml(roleObj.name) + "：已获得 " + escapeHtml(desc) + " 加入资产卡。",
      good:true
    });
  }

  enterGameDirect();
}


/* =========================
 *  Menu ticker
 * ========================= */
(function initTicker(){
  const track = document.getElementById("tickerTrack");
  const items = LIB.map(card => card.name);
  const s = items.concat(items).map(function(x){ return "<span>" + escapeHtml(x) + "</span>"; }).join("");
  track.innerHTML = s;
})();

/* =========================
 *  Page control + Config + Story
 * ========================= */
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
//  閰嶇疆闈㈡澘 JS锛堝叧鍗?+ 鍗℃睜 + 閫氱敤锛?
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲

// 鐢?localStorage 鎸佷箙鍖栫敤鎴烽厤缃?
const CFG_KEY = GAME_BALANCE.cfgStorageKeys.level;
const CARD_CFG_KEY = GAME_BALANCE.cfgStorageKeys.card;
const GENERAL_CFG_KEY = GAME_BALANCE.cfgStorageKeys.general;
const ASSET_CFG_KEY = GAME_BALANCE.cfgStorageKeys.asset;

function cloneJson(v){
  return JSON.parse(JSON.stringify(v));
}

function readJsonStorage(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    return fallback;
  }
}

function writeJsonStorage(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }catch(e){
    return false;
  }
}

function removeStorageKey(key){
  try{ localStorage.removeItem(key); } catch(e){}
}

function isStockConfigCard(card){
  return STOCK_CARD_CATEGORIES.has(card.category);
}

function normalizeInt(value, fallback, lo=-999, hi=999){
  const n = Number(value);
  if(!Number.isFinite(n)) return fallback;
  return clamp(Math.round(n), lo, hi);
}

function stripHtmlTags(value){
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function collectCurrentLevelConfig(){
  return LEVELS.map(lvl=>({
    opens: lvl.opens,
    target: lvl.target,
    stratPick: lvl.stratPick,
    stratShow: lvl.stratShow,
    storySuffix: lvl.storySuffix,
    storyLine1: lvl.storyLine1,
    storyLine2: lvl.storyLine2
  }));
}

function collectCurrentCardConfig(){
  const cardMap = {};
  LIB.forEach(card=>{
    cardMap[card.name] = { up: card.up, down: card.down };
  });
  return cardMap;
}

function collectCurrentGeneralConfig(){
  return {
    starterAssetCount: Number(CONFIG.starterAssetCount || DEFAULT_GENERAL_CONFIG.starterAssetCount || 5),
    rewardAssetChoiceCount: Number(CONFIG.rewardAssetChoiceCount || DEFAULT_GENERAL_CONFIG.rewardAssetChoiceCount || 3)
  };
}

function collectCurrentAssetConfig(){
  return cloneJson(FX_ASSETS);
}

function collectCurrentConfigBundle(){
  return {
    levels: collectCurrentLevelConfig(),
    cards: collectCurrentCardConfig(),
    general: collectCurrentGeneralConfig(),
    assets: collectCurrentAssetConfig()
  };
}

function applyLevelConfig(savedLevels){
  LEVELS.forEach((lvl, i)=>{
    Object.assign(lvl, cloneJson(DEFAULT_LEVELS[i]), savedLevels && savedLevels[i] ? savedLevels[i] : {});
    normalizeLevelStory(lvl);
  });
}

function applyCardConfig(savedCards){
  LIB.forEach((card, i)=>{
    const base = cloneJson(DEFAULT_LIB[i]);
    const custom = savedCards && savedCards[base.name] ? savedCards[base.name] : null;
    card.name = base.name;
    card.rarity = base.rarity;
    card.category = base.category;
    card.color = base.color;
    card.eff = base.eff;
    card.up = normalizeInt(custom ? custom.up : base.up, base.up);
    card.down = normalizeInt(custom ? custom.down : base.down, base.down);
    if(base.keywords){
      card.keywords = cloneJson(base.keywords);
    } else {
      delete card.keywords;
    }
  });
}

function applyGeneralConfig(savedGeneral){
  CONFIG.starterAssetCount = DEFAULT_GENERAL_CONFIG.starterAssetCount;
  CONFIG.rewardAssetChoiceCount = DEFAULT_GENERAL_CONFIG.rewardAssetChoiceCount;
  if(savedGeneral && typeof savedGeneral === 'object'){
    CONFIG.starterAssetCount = clamp(Number(savedGeneral.starterAssetCount || CONFIG.starterAssetCount), 1, 10);
    CONFIG.rewardAssetChoiceCount = clamp(Number(savedGeneral.rewardAssetChoiceCount || CONFIG.rewardAssetChoiceCount), 1, 6);
  }
}

function applyAssetConfig(savedAssets){
  Object.keys(DEFAULT_AUDIO_VISUAL_CONFIG.audio).forEach((key)=>{
    FX_ASSETS.audio[key] = Object.assign({}, cloneJson(DEFAULT_AUDIO_VISUAL_CONFIG.audio[key]), savedAssets?.audio?.[key] || {});
    FX_ASSETS.audio[key].path = String(FX_ASSETS.audio[key].path || "").trim();
  });
  Object.keys(DEFAULT_AUDIO_VISUAL_CONFIG.music || {}).forEach((key)=>{
    FX_ASSETS.music[key] = Object.assign({}, cloneJson(DEFAULT_AUDIO_VISUAL_CONFIG.music[key]), savedAssets?.music?.[key] || {});
    FX_ASSETS.music[key].path = String(FX_ASSETS.music[key].path || "").trim();
  });
  Object.keys(DEFAULT_AUDIO_VISUAL_CONFIG.visuals).forEach((key)=>{
    FX_ASSETS.visuals[key] = Object.assign({}, cloneJson(DEFAULT_AUDIO_VISUAL_CONFIG.visuals[key]), savedAssets?.visuals?.[key] || {});
    FX_ASSETS.visuals[key].path = String(FX_ASSETS.visuals[key].path || "").trim();
    FX_ASSETS.visuals[key].fill = String(FX_ASSETS.visuals[key].fill || DEFAULT_AUDIO_VISUAL_CONFIG.visuals[key].fill || "");
    FX_ASSETS.visuals[key].accent = String(FX_ASSETS.visuals[key].accent || DEFAULT_AUDIO_VISUAL_CONFIG.visuals[key].accent || "");
  });
}

function applyConfigBundle(bundle){
  applyLevelConfig(bundle && bundle.levels ? bundle.levels : null);
  applyCardConfig(bundle && bundle.cards ? bundle.cards : null);
  applyGeneralConfig(bundle && bundle.general ? bundle.general : null);
  applyAssetConfig(bundle && bundle.assets ? bundle.assets : null);
}

function persistActiveConfig(){
  writeJsonStorage(CFG_KEY, collectCurrentLevelConfig());
  writeJsonStorage(CARD_CFG_KEY, collectCurrentCardConfig());
  writeJsonStorage(GENERAL_CFG_KEY, collectCurrentGeneralConfig());
  writeJsonStorage(ASSET_CFG_KEY, collectCurrentAssetConfig());
}

function loadActiveConfigFromStorage(){
  const levels = readJsonStorage(CFG_KEY, null);
  const cards = readJsonStorage(CARD_CFG_KEY, null);
  const general = readJsonStorage(GENERAL_CFG_KEY, null);
  const assets = readJsonStorage(ASSET_CFG_KEY, null);
  applyLevelConfig(levels);
  applyCardConfig(cards);
  applyGeneralConfig(general);
  applyAssetConfig(assets);
}

loadActiveConfigFromStorage();

// 鈹€鈹€ Tab 鍒囨崲 鈹€鈹€
function cfgSwitchTab(name){
  document.querySelectorAll('.cfgTab').forEach((t,i)=>{
    const tabs = ['rounds','cards','assets'];
    t.classList.toggle('active', tabs[i]===name);
  });
  document.querySelectorAll('.cfgTabPanel').forEach(p=>{
    p.classList.toggle('active', p.id === 'cfgTab_'+name);
  });
  if(name === 'rounds'){
    cfgRenderCurvePreview();
  }
}

function readLevelFormSnapshot(){
  return LEVELS.map((lvl, i)=>({
    round: lvl.round,
    opens: normalizeInt(document.getElementById('cfgLvlOpens_'+i)?.value, lvl.opens, 1, 20),
    target: normalizeInt(document.getElementById('cfgLvlTarget_'+i)?.value, lvl.target, 1, 99999),
    stratPick: normalizeInt(document.getElementById('cfgLvlStratPick_'+i)?.value, lvl.stratPick, 0, 5),
    stratShow: normalizeInt(document.getElementById('cfgLvlStratShow_'+i)?.value, lvl.stratShow, 0, 8),
    storySuffix: document.getElementById('cfgLvlStorySuffix_'+i)?.value || lvl.storySuffix,
    storyLine1: document.getElementById('cfgLvlStoryLine1_'+i)?.value || lvl.storyLine1,
    storyLine2: document.getElementById('cfgLvlStoryLine2_'+i)?.value || lvl.storyLine2
  }));
}

function cfgRenderCurvePreview(){
function cfgRenderCurvePreview(){
  const wrap = document.getElementById("cfgCurvePreview");
  if(!wrap) return;
  const levels = document.getElementById("cfgLvlOpens_0") ? readLevelFormSnapshot() : LEVELS;
  wrap.innerHTML = levels.map(function(lvl){
    const storyTitle = escapeHtml(getLevelStoryTitle(lvl));
    const storyText = escapeHtml([lvl.storyLine1, lvl.storyLine2].filter(Boolean).join(" / ")).slice(0, 88) || "本轮暂无剧情文案。";
    return "<div class=\"curveMiniCard\">" +
      "<div class=\"curveMiniHead\"><span>第 " + lvl.round + " 轮</span><span>" + storyTitle + "</span></div>" +
      "<div class=\"curveMetric\"><div class=\"curveMetricTop\"><span>开盘次数</span><span class=\"curveOpenVal\">" + lvl.opens + "</span></div></div>" +
      "<div class=\"curveMetric\"><div class=\"curveMetricTop\"><span>交付目标</span><span class=\"curveTargetVal\">" + lvl.target + "</span></div></div>" +
      "<div class=\"curveStoryText\"><b>" + storyTitle + "</b><br/>" + storyText + "</div>" +
      "</div>";
  }).join("");
}
}

// 鈹€鈹€ 娓叉煋鍏冲崱閰嶇疆闈㈡澘 鈹€鈹€
function cfgRenderLevels(){
  const tbody = document.getElementById('cfgLevelsTbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  LEVELS.forEach((lvl, i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = "<td><span class=\"lvlBadge\">第 " + lvl.round + " 轮</span></td>" +
      "<td><input type=\"number\" min=\"1\" max=\"20\" class=\"cardNumInput cfgTableInput\" id=\"cfgLvlOpens_" + i + "\" value=\"" + lvl.opens + "\" oninput=\"cfgRenderCurvePreview()\"/></td>" +
      "<td><input type=\"number\" min=\"1\" class=\"cardNumInput cfgTableInput\" id=\"cfgLvlTarget_" + i + "\" value=\"" + lvl.target + "\" oninput=\"cfgRenderCurvePreview()\"/></td>" +
      "<td><input type=\"number\" min=\"0\" max=\"5\" class=\"cardNumInput cfgTableInput\" id=\"cfgLvlStratPick_" + i + "\" value=\"" + lvl.stratPick + "\"/></td>" +
      "<td><input type=\"number\" min=\"0\" max=\"8\" class=\"cardNumInput cfgTableInput\" id=\"cfgLvlStratShow_" + i + "\" value=\"" + lvl.stratShow + "\"/></td>" +
      "<td><input type=\"text\" class=\"cfgInput cfgTableInput\" id=\"cfgLvlStorySuffix_" + i + "\" value=\"" + escapeHtml(lvl.storySuffix || "") + "\" oninput=\"cfgRenderCurvePreview()\"/></td>" +
      "<td><textarea class=\"cfgTextarea cfgTableTextarea\" id=\"cfgLvlStoryLine1_" + i + "\" rows=\"3\" oninput=\"cfgRenderCurvePreview()\">" + escapeHtml(lvl.storyLine1 || "") + "</textarea></td>" +
      "<td><textarea class=\"cfgTextarea cfgTableTextarea\" id=\"cfgLvlStoryLine2_" + i + "\" rows=\"3\" oninput=\"cfgRenderCurvePreview()\">" + escapeHtml(lvl.storyLine2 || "") + "</textarea></td>";
    tbody.appendChild(tr);
  });
  cfgRenderCurvePreview();
}

function cfgSetCardFilter(mode){
  cfgCardFilterMode = CONFIG_CARD_CATEGORY_ORDER.includes(mode) ? mode : CONFIG_CARD_CATEGORY_ORDER[0];
  const row = document.getElementById('cfgCardCategoryRow');
  if(row){
  if(row){
    row.innerHTML = CONFIG_CARD_CATEGORY_ORDER.map(function(category){
      return "<button class=\"cfgChip cfgChipStock " + (category === cfgCardFilterMode ? "active" : "") + "\" onclick=\"cfgSetCardFilter('" + category + "')\">" + escapeHtml(category) + "</button>";
    }).join("");
  }
  }
  cfgRenderCards();
}

function cfgHandleCardSearch(value){
  cfgCardSearch = String(value || '').trim().toLowerCase();
  cfgRenderCards();
}

function cfgGetVisibleCards(){
  return LIB.map((card, index)=>({ card, index })).filter(({ card })=>{
    if(!isStockConfigCard(card)) return false;
    if(cfgCardFilterMode && card.category !== cfgCardFilterMode) return false;
    if(cfgCardSearch){
      const hay = (card.name + " " + card.category + " " + (card.eff || "")).toLowerCase();
      if(!hay.includes(cfgCardSearch)) return false;
    }
    return true;
  });
}

// ── 渲染卡池配置表格 ──
function cfgRenderCards(){
  const tbody = document.getElementById('cfgCardTbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  const visible = cfgGetVisibleCards();
  const visibleByCategory = new Map();
  visible.forEach((item)=>{
    if(!visibleByCategory.has(item.card.category)) visibleByCategory.set(item.card.category, []);
    visibleByCategory.get(item.card.category).push(item);
  });
  CONFIG_CARD_CATEGORY_ORDER.filter(category=>visibleByCategory.has(category)).forEach((category)=>{
    const groupRow = document.createElement('tr');
    groupRow.className = 'cardGroupRow';
    groupRow.innerHTML = `<td colspan="6">${escapeHtml(category)} · ${visibleByCategory.get(category).length} 张</td>`;
    tbody.appendChild(groupRow);

    visibleByCategory.get(category).forEach(({ card:c, index:i })=>{
      const tr = document.createElement('tr');
      const stars = "★".repeat(c.rarity);
      const rarityClass2 = ['','rarityDot1','rarityDot2','rarityDot3'][c.rarity]||'';
      tr.innerHTML = `
        <td style="font-weight:600;">${escapeHtml(c.name)}</td>
        <td class="${rarityClass2}">${stars}</td>
        <td><span class="catPill2">${escapeHtml(c.category)}</span></td>
        <td><input type="number" class="cardNumInput" id="cfgCUp_${i}" value="${c.up}" style="color:#ff6b6b;"/></td>
        <td><input type="number" class="cardNumInput" id="cfgCDown_${i}" value="${c.down}" style="color:#51cf66;"/></td>
        <td style="font-size:12px;opacity:0.65;max-width:200px;">${escapeHtml(c.eff||'')}</td>
      `;
      tbody.appendChild(tr);
    });
  });
  const statsEl = document.getElementById('cfgCardStats');
  if(statsEl) statsEl.textContent = `${visible.length} / ${LIB.filter(isStockConfigCard).length}`;
}

function cfgRenderAudioVisualAssets(){
  const audioBody = document.getElementById('cfgAudioTbody');
  const musicBody = document.getElementById('cfgMusicTbody');
  const visualBody = document.getElementById('cfgVisualTbody');
  if(audioBody){
    audioBody.innerHTML = Object.entries(FX_ASSETS.audio).map(([key, item])=>`
      <tr>
        <td><b>${escapeHtml(item.label)}</b><div class="cfgTinyKey">${escapeHtml(key)}</div></td>
        <td><input type="text" class="cfgInput cfgWideInput" id="cfgAudioPath_${key}" value="${escapeHtml(item.path || '')}" placeholder="./audio/${key}.mp3"/></td>
        <td class="cfgMutedCell">${escapeHtml(item.note || '')}</td>
      </tr>
    `).join('');
  }
  if(musicBody){
    musicBody.innerHTML = Object.entries(FX_ASSETS.music || {}).map(([key, item])=>`
      <tr>
        <td><b>${escapeHtml(item.label)}</b><div class="cfgTinyKey">${escapeHtml(key)}</div></td>
        <td><input type="text" class="cfgInput cfgWideInput" id="cfgMusicPath_${key}" value="${escapeHtml(item.path || '')}" placeholder="./assets/audio/bgm/${key}.mp3"/></td>
        <td class="cfgMutedCell">${escapeHtml(item.note || '')}</td>
      </tr>
    `).join('');
  }
  if(visualBody){
    visualBody.innerHTML = Object.entries(FX_ASSETS.visuals).map(([key, item])=>`
      <tr>
        <td><b>${escapeHtml(item.label)}</b><div class="cfgTinyKey">${escapeHtml(key)}</div></td>
        <td><input type="text" class="cfgInput cfgWideInput" id="cfgVisualPath_${key}" value="${escapeHtml(item.path || '')}" placeholder="./art/${key}.png"/></td>
        <td><input type="text" class="cfgInput cfgColorInput" id="cfgVisualFill_${key}" value="${escapeHtml(item.fill || '')}" placeholder="#1d3f5d"/></td>
        <td><input type="text" class="cfgInput cfgColorInput" id="cfgVisualAccent_${key}" value="${escapeHtml(item.accent || '')}" placeholder="#63d6ff"/></td>
        <td class="cfgMutedCell">${escapeHtml(item.note || '')}</td>
      </tr>
    `).join('');
  }
}


function cfgSyncGeneralInputs(){
  const starterEl = document.getElementById('cfgStarterCount');
  const rewardEl = document.getElementById('cfgRewardCount');
  if(starterEl) starterEl.value = Number(CONFIG.starterAssetCount || GAME_BALANCE.starterAssetCount || 5);
  if(rewardEl) rewardEl.value = Number(CONFIG.rewardAssetChoiceCount || GAME_BALANCE.rewardAssetChoiceCount || 3);
}

function cfgCollectFormIntoState(){
  const starterEl = document.getElementById('cfgStarterCount');
  const rewardEl = document.getElementById('cfgRewardCount');
  if(starterEl) CONFIG.starterAssetCount = clamp(Number(starterEl.value || DEFAULT_GENERAL_CONFIG.starterAssetCount), 1, 10);
  if(rewardEl) CONFIG.rewardAssetChoiceCount = clamp(Number(rewardEl.value || DEFAULT_GENERAL_CONFIG.rewardAssetChoiceCount), 1, 6);

  readLevelFormSnapshot().forEach((saved, i)=>{
    Object.assign(LEVELS[i], saved);
    normalizeLevelStory(LEVELS[i]);
  });

  LIB.forEach((card, i)=>{
    const upEl = document.getElementById('cfgCUp_'+i);
    const downEl = document.getElementById('cfgCDown_'+i);
    if(upEl) card.up = normalizeInt(upEl.value, card.up);
    if(downEl) card.down = normalizeInt(downEl.value, card.down);
  });

  Object.keys(FX_ASSETS.audio).forEach((key)=>{
    const pathEl = document.getElementById('cfgAudioPath_'+key);
    FX_ASSETS.audio[key].path = pathEl ? String(pathEl.value || '').trim() : (FX_ASSETS.audio[key].path || '');
  });

  Object.keys(FX_ASSETS.music || {}).forEach((key)=>{
    const pathEl = document.getElementById('cfgMusicPath_'+key);
    FX_ASSETS.music[key].path = pathEl ? String(pathEl.value || '').trim() : (FX_ASSETS.music[key].path || '');
  });

  Object.keys(FX_ASSETS.visuals).forEach((key)=>{
    const pathEl = document.getElementById('cfgVisualPath_'+key);
    const fillEl = document.getElementById('cfgVisualFill_'+key);
    const accentEl = document.getElementById('cfgVisualAccent_'+key);
    FX_ASSETS.visuals[key].path = pathEl ? String(pathEl.value || '').trim() : (FX_ASSETS.visuals[key].path || '');
    FX_ASSETS.visuals[key].fill = fillEl ? String(fillEl.value || '').trim() : (FX_ASSETS.visuals[key].fill || '');
    FX_ASSETS.visuals[key].accent = accentEl ? String(accentEl.value || '').trim() : (FX_ASSETS.visuals[key].accent || '');
  });
}

function leaveConfigPage(){
  const cp = document.getElementById("configPage");
  if(cp) cp.style.display = "none";
  if(configReturnTarget === 'game' && selectedRoleId){
    menuPage.style.display = 'none';
    gamePage.style.display = 'block';
  } else {
    gamePage.style.display = 'none';
    menuPage.style.display = 'flex';
  }
}

function goConfig(initialTab='rounds', returnTarget='menu'){
  return;
}

function saveConfig(){
  cfgCollectFormIntoState();
  persistActiveConfig();
  cfgRenderCurvePreview();

  const btn = document.querySelector('.cfgFooter .menuBtn.primary');
  if(btn){
    const orig = btn.textContent;
    btn.textContent = '? 宸蹭繚瀛橈紒';
    setTimeout(()=>{ btn.textContent = orig; }, 1500);
  }
}

function cfgResetAll(){
  if(!confirm("确定重置当前配置为默认值吗？")) return;
  removeStorageKey(CFG_KEY);
  removeStorageKey(CARD_CFG_KEY);
  removeStorageKey(GENERAL_CFG_KEY);
  removeStorageKey(ASSET_CFG_KEY);
  applyConfigBundle(null);
  cfgSyncGeneralInputs();
  cfgCardSearch = '';
  cfgRenderLevels();
  cfgSetCardFilter(CONFIG_CARD_CATEGORY_ORDER[0]);
  cfgRenderAudioVisualAssets();
  const searchEl = document.getElementById('cfgCardSearch');
  if(searchEl) searchEl.value = '';
}

function maybeShowStoryThenEnter(){
  enterGameDirect();
}

async function enterGameDirect(){
  document.getElementById("storyOverlay").style.display = "none";
  gamePage.style.display = "block";
  renderAll();
  renderHp();
  awaitingStarter = true;
  btnOpen.disabled = true;
  if(_bgmToggle) startBGM();
  await showRoundStartStory();
  showStarterPack();
}

function storyPrev(){
  if(storyStep <= 0) return;
  storyStep--;
  renderStorySlide();
}

function storyNext(){
  storyStep++;
  if(storyStep >= 2){
    enterGameDirect();
    return;
  }
  renderStorySlide();
}

function renderStorySlide(){
  const title = document.getElementById("storyTitle");
  const sub = document.getElementById("storySub");
  const slide = document.getElementById("storySlide");
  const bBack = document.getElementById("storyBtnBack");
  const bNext = document.getElementById("storyBtnNext");
  if(!slide) return;

  if(storyStep === 0){
    if(title) title.textContent = "欢迎加入幸运炒股公司";
    if(sub) sub.textContent = "剧情 / 入职";
    slide.innerHTML = `
      <div class="hFont" style="font-size:22px;margin-bottom:10px;">欢迎加入幸运炒股公司！</div>
      <div style="font-size:14px;line-height:1.65;color:rgba(255,255,255,0.82);">
        你的目标是 <b>活着</b> 并达成老板每轮的小目标。
      </div>
      <div style="margin-top:14px;color:rgba(255,255,255,0.62);line-height:1.6;">
        规则提示：开盘仅结算资产卡；每次开盘后获得 1 次增持机会，可选 1 张资产卡或跳过。
      </div>
    `;
    if(bBack) bBack.disabled = true;
    if(bNext) bNext.textContent = "下一页";
  }else{
    if(title) title.textContent = "第一轮明细";
    if(sub) sub.textContent = "剧情 / 任务";
    slide.innerHTML = `
      <div class="hFont" style="font-size:18px;margin-bottom:10px;">第一轮</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="hItem" style="margin:0;">
          <div class="hTop"><div>初始资金</div><div class="goodTxt">0</div></div>
          <div class="hSub">无额外负担，先直接冲本轮目标。</div>
        </div>
        <div class="hItem" style="margin:0;">
          <div class="hTop"><div>目标资金</div><div class="goodTxt">${getTarget()}</div></div>
          <div class="hSub">达到后即可交付本轮。</div>
        </div>
        <div class="hItem" style="margin:0;">
          <div class="hTop"><div>交付倒计时</div><div class="goodTxt">${getDeliveryOpens()}</div></div>
          <div class="hSub">每次开盘 -1，为 0 时结算胜负。</div>
        </div>
        <div class="hItem" style="margin:0;">
          <div class="hTop"><div>提示</div><div class="badTxt">谨慎</div></div>
          <div class="hSub">资金归零也能继续，但节奏会非常难受。</div>
        </div>
      </div>
    `;
    if(bBack) bBack.disabled = false;
    if(bNext) bNext.textContent = "开始";
  }
}

/* legacy */
function enterGame(){ enterGameDirect(); }

/* =========================
 *  Helpers
 * ========================= */
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function assetLib(){
  return LIB.filter(c => STOCK_CARD_CATEGORIES.has(String(c.category || "")));
}

function ensureRewardPeekLauncher(){
  if(rewardPeekLauncherEl) return rewardPeekLauncherEl;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "rewardPeekLauncher";
  btn.className = "menuBtn primary hFont rewardPeekLauncher";
  btn.textContent = "返回增持选择";
  btn.style.display = "none";
  btn.addEventListener("click", ()=>{
    if(typeof rewardPeekRestore === "function") rewardPeekRestore();
  });
  document.body.appendChild(btn);
  rewardPeekLauncherEl = btn;
  return btn;
}

function hideRewardPeekLauncher(){
  const btn = ensureRewardPeekLauncher();
  btn.style.display = "none";
  rewardPeekRestore = null;
}

function showRewardPeekLauncher(label, restore){
  const btn = ensureRewardPeekLauncher();
  btn.textContent = label || "返回增持选择";
  rewardPeekRestore = restore;
  btn.style.display = "";
}

const RARITY_DRAW_WEIGHTS = [
  { rarity: 1, weight: 75 },
  { rarity: 2, weight: 20 },
  { rarity: 3, weight: 5 }
];

function drawRarityByWeight(){
  const total = RARITY_DRAW_WEIGHTS.reduce((s, x)=>s + x.weight, 0);
  let roll = Math.random() * total;
  for(const item of RARITY_DRAW_WEIGHTS){
    roll -= item.weight;
    if(roll <= 0) return item.rarity;
  }
  return 1;
}

function drawAssetCandidatesByRarity(count){
  const pool = [...assetLib()];
  const out = [];
  while(out.length < count && pool.length){
    const rarity = drawRarityByWeight();
    let candidates = pool.filter(c=>Number(c.rarity) === rarity);
    if(candidates.length <= 0) candidates = pool;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    out.push({ ...pick, id: pick.id + "_r" + Date.now() + "_" + out.length });
    const idx = pool.findIndex(c=>c.id === pick.id);
    if(idx >= 0) pool.splice(idx, 1);
  }
  return out;
}

function drawStarterOneStarCards(count){
  const pool = shuffle(assetLib().filter(c=>Number(c.rarity) === 1));
  return pool.slice(0, Math.max(0, count));
}

function deliveryLeft(){
  return Math.max(0, getDeliveryOpens() - openCount);
}

function isStrategyCardCategory(category){
  return String(category || '').includes('绛栫暐');
}

function getVisualConfigForCard(card){
  return FX_ASSETS.visuals.assetCardFace;
}

function applyVisualSkin(el, config, mode='card'){
  if(!el || !config) return;
  const fill = config.fill || '#1d3f5d';
  const accent = config.accent || '#63d6ff';
  const path = String(config.path || '').trim();
  el.style.setProperty('--art-fill', fill);
  el.style.setProperty('--art-accent', accent);
  el.style.setProperty('--art-image', path ? `url("${path}")` : 'none');
  if(mode === 'marker'){
    el.style.setProperty('--mark-fill', fill);
    el.style.setProperty('--mark-accent', accent);
    el.style.setProperty('--mark-image', path ? `url("${path}")` : 'none');
  }
}

/* =========================
 *  Card UI builders
 * ========================= */
function buildHsCard(card){
  const effText = getCardEffectText(card);
  const wrap = document.createElement("div");
  wrap.className = "hsCard " + rarityClass(card.rarity) + " rewardPick";
  wrap.style.setProperty("--c", card.color);
  applyVisualSkin(wrap, getVisualConfigForCard(card));

  wrap.innerHTML = `
    <div class="hsFrame">
      <div class="hsTop">
        <div class="hsName hFont" title="${escapeHtml(card.name)}">${escapeHtml(card.name)}</div>
        <div class="hsStars ${rarityClass(card.rarity)}" aria-label="rarity">${starsStr(card.rarity)}</div>
      </div>

      <div class="hsArt">
        <div class="colorCore"></div>
        <div class="shine"></div>
      </div>

      <div class="hsBadges">
        <span class="pill ${catPillClass(card.category)}">${escapeHtml(card.category)}</span>
      </div>

      <div class="hsNums">
        <div class="hsUp">
          <span class="hsLabel">上涨</span>
          <span class="hsVal">${formatCardDelta(card.up)}</span>
        </div>
        <div class="hsDown">
          <span class="hsLabel">下跌</span>
          <span class="hsVal">${formatCardDelta(card.down)}</span>
        </div>
      </div>

      <div class="hsEff">${escapeHtml(effText)}</div>
    </div>
  `;
  return wrap;
}

function getCardEffectText(card){
  const directText = card?.displayEffectText ? String(card.displayEffectText) : "";
  if(directText && !looksLikeMojibake(directText)) return directText;
  const markers = getCardMarkers(card);
  if(markers.length){
    return markers.map(markerLabel).filter(Boolean).join(" | ");
  }
  const fallback = String(card?.eff || "无");
  return looksLikeMojibake(fallback) ? "无" : fallback;
}

function getCardDisplayName(card){
  return String(card?.name || "").replace(/[^\u4e00-\u9fa5A-Za-z0-9+\-]/g, "").trim() || "股票";
}

function looksLikeMojibake(text){
  var raw = String(text || "");
  if(!raw) return false;
  // U+FFFD replacement character indicates encoding issue
  if(raw.indexOf("\uFFFD") >= 0) return true;
  // GBK-to-UTF8 mojibake produces specific high-codepoint clusters
  // These are non-standard CJK extensions rarely found in normal Chinese text
  // Use consecutive rare CJK (U+8400-U+8FFF range) as the primary signal
  if(/[\u8400-\u8fff]{2,}/.test(raw)) return true;
  // Also catch single occurrences of very specific mojibake chars
  if(/[\u9108\u773c\u74a7\u6c3e\u9a0e\u5c51\u9102\u910a-\u913f]/.test(raw)) return true;
  return false;
}

function formatCardDelta(value){
  const n = Number(value || 0);
  return n >= 0 ? `+${n}` : String(n);
}

function markerLabel(kw){
  if(!kw || !kw.type) return '';
  if(kw.type === 'isolated') return '锁仓';
  if(kw.type === 'innate') return '做龙头';
  if(kw.type === 'crazy_up') return '连板预期';
  if(kw.type === 'boost_up') return `看涨${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}`;
  if(kw.type === 'insurance') return `防守${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'price_up') return `弹性${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'leverage') return `追涨${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'demon_stock') return '妖化';
  if(kw.type === 'dividend') return `分红${Math.max(0, Number(kw.count || 0))}`;
  if(kw.type === 'remove_after_up') return '涨后移除';
  if(kw.type === 'principal') return `清仓价值${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'first_row_up_bonus') return `带头：弹性${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'tail_row_up_bonus') return `压阵：弹性${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'first_row_boost') return `带头：看涨${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}`;
  if(kw.type === 'tail_row_boost') return `压阵：看涨${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}`;
  if(kw.type === 'prev_up_boost') return `跟风：临时看涨${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}`;
  if(kw.type === 'prev_up_bonus') return `跟风：临时弹性${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'adj_up_bonus') return `龙头：临时弹性${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'after_up_boost_next') return `带头：后续临时看涨${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}`;
  if(kw.type === 'after_up_price_next') return `带头：后续临时弹性${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'hold_boost') return `看涨${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}`;
  if(kw.type === 'on_buy_money') return `买入收益+${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'on_clear_bonus') return `清仓后+${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'first_row_down_bonus') return `带头：防守${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'tail_row_down_bonus') return `压阵：防守${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'prev_down_bonus') return `承接：临时防守${Math.max(1, Number(kw.value || 0))}`;
  if(kw.type === 'adj_down_bonus') return `承接：群体防守${Math.max(1, Number(kw.value || 0))}`;
  return '';
}

function markerEmoji(kw){
  if(!kw || !kw.type) return "✨";
  if(kw.type === 'isolated') return "🧊";
  if(kw.type === 'innate') return "✨";
  if(kw.type === 'crazy_up') return "🔥";
  if(kw.type === 'boost_up') return "📈";
  if(kw.type === 'price_up') return "💹";
  if(kw.type === "insurance") return "🛡️";
  if(kw.type === "leverage") return "⚡";
  if(kw.type === 'demon_stock') return "👹";
  if(kw.type === 'dividend') return "🎁";
  if(kw.type === 'remove_after_up') return "🎯";
  if(kw.type === 'principal') return "💰";
  if(kw.type === 'first_row_up_bonus' || kw.type === 'first_row_boost' || kw.type === 'first_row_down_bonus') return "🥇";
  if(kw.type === 'tail_row_up_bonus' || kw.type === 'tail_row_boost' || kw.type === 'tail_row_down_bonus') return "🏁";
  if(kw.type === 'prev_up_boost' || kw.type === 'prev_up_bonus') return "🔗";
  if(kw.type === 'adj_up_bonus') return "🤝";
  if(kw.type === 'after_up_boost_next' || kw.type === 'after_up_price_next') return "⏭️";
  if(kw.type === 'hold_boost') return "📈";
  if(kw.type === 'on_buy_money') return "💰";
  if(kw.type === 'on_clear_bonus') return "🧹";
  if(kw.type === "prev_down_bonus" || kw.type === "adj_down_bonus") return "🛡️";
  return "✨";
}

function markerTooltipEntries(kw){
  if(!kw || !kw.type) return [];
  const lb = markerLabel(kw);
  return lb ? [lb] : [];
}

function markerExplain(kw){
  if(!kw || !kw.type) return '';
  if(kw.type === 'isolated') return '锁仓：本轮不参与开盘，但会继续保留在当前槽位。';
  if(kw.type === 'innate') return '做龙头：更稳定参与开盘，适合养主力股。';
  if(kw.type === 'crazy_up') return '连板预期：下一次开盘必定上涨，触发后移除。';
  if(kw.type === 'demon_stock') return '妖化：上涨概率大幅提升，上涨时额外赚钱，随后自动清仓。';
  if(kw.type === 'boost_up') return `看涨：上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%`;
  if(kw.type === 'price_up') return `弹性：上涨时额外 +${Math.max(1, Number(kw.value || 0))} 金币`;
  if(kw.type === 'insurance') return `防守：下跌时额外 +${Math.max(1, Number(kw.value || 0))} 金币`;
  if(kw.type === 'leverage'){
    const n = Math.max(1, Number(kw.value || 0));
    return `杠杆：上涨时额外 +${n} 金币，下跌时额外 -${n} 金币`;
  }
  if(kw.type === 'dividend'){
    const n = Math.max(0, Number(kw.count || 0));
    return `分红：上涨时额外 +${n} 金币，随后会逐次衰减直到归零`;
  }
  if(kw.type === 'remove_after_up') return '涨后移除：本卡首次上涨结算完成后，会自动离场腾出仓位。';
  if(kw.type === 'principal') return `清仓价值：卖出时额外获得 ${Math.max(1, Number(kw.value || 0))} 金币`;
  if(kw.type === 'first_row_up_bonus') return `带头：早盘开盘时触发。爆发 +${Math.max(1, Number(kw.value || 0))}，上涨时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'tail_row_up_bonus') return `压阵：尾盘收盘时触发。爆发 +${Math.max(1, Number(kw.value || 0))}，上涨时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'first_row_boost') return `带头：早盘开盘时触发。看涨 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}，上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%。`;
  if(kw.type === 'tail_row_boost') return `压阵：尾盘收盘时触发。看涨 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}，上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%。`;
  if(kw.type === 'prev_up_boost') return `跟风：前一位股票上涨时触发。本股本次开盘临时获得看涨 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}，上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%。`;
  if(kw.type === 'prev_up_bonus') return `跟风：前一位股票上涨且本卡上涨时触发。本股本次开盘临时获得弹性 +${Math.max(1, Number(kw.value || 0))}，上涨时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'adj_up_bonus') return `龙头：同板块股票上涨时触发。本股本次开盘临时获得弹性 +${Math.max(1, Number(kw.value || 0))}，每张同板块股票上涨额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'after_up_boost_next') return `带头：本卡上涨后触发。后续股票本次开盘临时获得看涨 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1))}，上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%。`;
  if(kw.type === 'after_up_price_next') return `带头：本卡上涨后触发。后续股票本次开盘临时获得弹性 +${Math.max(1, Number(kw.value || 0))}，上涨时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'hold_boost') return `看涨：上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%。`;
  if(kw.type === 'on_buy_money') return `买入收益：获得该股票时触发，立刻获得 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'on_clear_bonus') return `清仓后：该股票被清仓时触发，立刻获得 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'first_row_down_bonus') return `带头承接：早盘开盘且下跌时触发。防守 +${Math.max(1, Number(kw.value || 0))}，下跌时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'tail_row_down_bonus') return `压阵承接：尾盘收盘且下跌时触发。防守 +${Math.max(1, Number(kw.value || 0))}，下跌时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'prev_down_bonus') return `承接：前一位股票下跌且本卡下跌时触发。本股本次开盘临时获得防守 +${Math.max(1, Number(kw.value || 0))}，下跌时额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  if(kw.type === 'adj_down_bonus') return `群体承接：同板块股票下跌时触发。本股本次开盘临时获得防守 +${Math.max(1, Number(kw.value || 0))}，每张同板块股票下跌额外 +${Math.max(1, Number(kw.value || 0))} 金币。`;
  return '';
}

function getCardMarkers(card){
  return Array.isArray(card?.keywords)
    ? card.keywords.filter(kw=>[
      'isolated','innate','crazy_up','boost_up','insurance','price_up','leverage','demon_stock','dividend','principal',
      'remove_after_up',
      'prev_up_boost','prev_up_bonus','adj_up_bonus',
      'after_up_boost_next','after_up_price_next','hold_boost','on_buy_money','on_clear_bonus',
      'prev_down_bonus','adj_down_bonus'
    ].includes(kw.type))
    : [];
}

function getCardSellValue(card){
  let sum = 0;
  if(card?.keywords){
    card.keywords.forEach((kw)=>{
      if(kw.type === 'principal') sum += Number(kw.value || 0);
      if(kw.type === 'on_clear_bonus') sum += Number(kw.value || 0);
    });
  }
  return Math.max(0, Math.floor(sum));
}

function getTotalReinforceCount(){
  return getAllBoardCards().reduce((sum, a)=>sum + getCardMarkers(a).length, 0);
}

function applyOnBuyEffects(card){
  if(!card || !Array.isArray(card.keywords)) return;
  let gain = 0;
  card.keywords.forEach((kw)=>{
    if(kw.type === 'on_buy_money') gain += Math.max(0, Number(kw.value || 0));
  });
  if(gain <= 0) return;
  money += gain;
  renderProgress(gain);
  renderTop();
  showRuleTriggerFx({
    title: `买入收益 +${gain}`,
    sub: `${getCardDisplayName(card)} 获得买入收益`,
    kind: 'normal'
  });
  addHistoryItem({
    natural: `🪙 买入 <b>${escapeHtml(getCardDisplayName(card))}</b>，额外获得 <b>${gain}</b> 金币`,
    title: '买入收益',
    delta: gain,
    good: true
  });
}

function liquidateAssetCard(cardId, reason='auto'){
  const card = getBoardCardById(cardId);
  if(!card) return false;
  const gain = getCardSellValue(card);
  removeBoardCardById(cardId);
  sfxCleanupSell();
  if(gain > 0) money += gain;
  if(gain > 0) renderProgress(gain);
  renderTop();
  addHistoryItem({
    natural: "🧹 清仓 <b>" + escapeHtml(getCardDisplayName(card)) + "</b>，返还 <b>" + gain + "</b> 金币",
    title: '清仓股票',
    delta: gain,
    good: true
  });
  renderLeft();
  renderBoardGrid();
  return true;
}

function mkLogoTile(card){
  const tile = document.createElement("div");
  tile.className = "logoTile";
  tile.dataset.cid = card.id;
  tile.style.setProperty("--c", card.color);
  applyVisualSkin(tile, getVisualConfigForCard(card));

  const logo = document.createElement("div");
  logo.className = "logo";
  logo.textContent = String(card?.name || "?").slice(0, 1);
  tile.appendChild(logo);

  const dot = document.createElement("div");
  dot.className = "rarDot " + (card.rarity===1 ? "rar1" : card.rarity===2 ? "rar2" : "rar3");
  tile.appendChild(dot);

  const markers = getCardMarkers(card);
  if(markers.length){
    const stack = document.createElement('div');
    stack.className = 'tagStack';
    markers.slice(0, 3).forEach((kw)=>{
      const lb = markerLabel(kw);
      if(!lb) return;
      const span = document.createElement('span');
      span.className = 'reinforceBadge';
      span.textContent = lb;
      stack.appendChild(span);
    });
    if(markers.length > 3){
      const more = document.createElement('span');
      more.className = 'reinforceBadge';
      more.textContent = "+" + (markers.length - 3);
      stack.appendChild(more);
    }
    tile.appendChild(stack);
  }

  tile.addEventListener("mousemove", (e)=> showTooltip(card, e.clientX, e.clientY));
  tile.addEventListener("mouseleave", hideTooltip);
  return tile;
}

function buildStockCardTile(card){
  const wrap = document.createElement("div");
  wrap.className = "stockCardTile";
  wrap.dataset.cid = card.id;
  if(cleanupMode) wrap.classList.add("cleanupMode");
  if(cleanupSelection.has(card.id)) wrap.classList.add("cleanupSelected");
  if(reinforceEmbedMode) wrap.classList.add("embedTargetable");
  if(reinforceEmbedMode && pendingReinforceTargetId === card.id) wrap.classList.add("embedSelected");
  if(card.lastOpenTrend === "up") wrap.classList.add("mark-up");
  if(card.lastOpenTrend === "down") wrap.classList.add("mark-down");

  wrap.style.setProperty("--c", card.color);
  applyVisualSkin(wrap, getVisualConfigForCard(card));

  const logo = document.createElement("div");
  logo.className = "logo";
  logo.textContent = String(card?.name || "?").slice(0, 1);
  wrap.appendChild(logo);

  const name = document.createElement("div");
  name.className = "stockThumbName hFont";
  name.textContent = card.name;
  wrap.appendChild(name);

  const tags = document.createElement("div");
  tags.className = "stockMarkerBar";
  const markers = getCardMarkers(card);
  markers.slice(0, 2).forEach((kw)=>{
    const lb = markerLabel(kw);
    if(!lb) return;
    const span = document.createElement("span");
    span.className = "reinforceBadge";
    span.textContent = lb;
    tags.appendChild(span);
  });
  if(markers.length > 2){
    const more = document.createElement("span");
    more.className = "reinforceBadge more";
    more.textContent = `+${markers.length - 2}`;
    tags.appendChild(more);
  }
  if(tags.childElementCount > 0) wrap.appendChild(tags);

  if(cleanupMode || reinforceEmbedMode){
    const pick = document.createElement("div");
    pick.className = "stockPickHint";
    if(reinforceEmbedMode){
      pick.textContent = pendingReinforceTargetId === card.id ? "已选强化目标" : "点击选择强化";
    } else {
      pick.textContent = cleanupSelection.has(card.id) ? "已勾选" : "点击勾选";
    }
    wrap.appendChild(pick);
  }

  wrap.addEventListener("mousemove", (e)=> showTooltip(card, e.clientX, e.clientY));
  wrap.addEventListener("mouseleave", hideTooltip);
  wrap.addEventListener("click", ()=>{
    if(reinforceEmbedMode){
      selectReinforceTarget(card.id);
      return;
    }
    if(pendingTradeAction){
      handleTradeCardSelection(card.id);
      return;
    }
    if(cleanupMode){
      toggleCleanupCard(card.id);
    }
  });
  return wrap;
}

function showTooltip(card, x, y){
  tooltip.style.display = "block";
  tooltip.innerHTML = "";
  const hs = buildHsCard(card);
  hs.classList.remove("rewardPick");
  tooltip.appendChild(hs);
  const markers = getCardMarkers(card);
  if(markers.length){
    const markerBox = document.createElement("div");
    markerBox.className = "tooltipMarkerList";
    markers.forEach((kw)=>{
      markerTooltipEntries(kw).forEach((txt)=>{
        const item = document.createElement("div");
        item.className = "tooltipMarkerItem";
        const exp = markerExplain(kw) || "无";
        item.innerHTML = `<div class="tooltipMarkerTitle">${escapeHtml(`${markerEmoji(kw)} ${txt}`)}</div><div class="tooltipMarkerDesc">${escapeHtml(exp)}</div>`;
        markerBox.appendChild(item);
      });
    });
    tooltip.appendChild(markerBox);
  }
  // 绱鍑€璧氫俊鎭?
  const net = cardNetEarnings[card.id];
  if(net !== undefined){
    const netDiv = document.createElement("div");
    netDiv.className = "tooltipNetEarn";
    const cls = net >= 0 ? "netPos" : "netNeg";
    const sign = net >= 0 ? "+" : "";
    netDiv.innerHTML = `本局累积净赚：<span class="netVal ${cls}">${sign}${net}</span>`;
    tooltip.appendChild(netDiv);
  }

  const pad = 14;
  const rect = tooltip.getBoundingClientRect();
  let left = x + pad;
  let top = y + pad;

  // After DOM inserted, recompute
  const rect2 = tooltip.getBoundingClientRect();
  if(left + rect2.width > window.innerWidth) left = x - rect2.width - pad;
  if(top + rect2.height > window.innerHeight) top = y - rect2.height - pad;

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
}
function hideTooltip(){ tooltip.style.display = "none"; tooltip.innerHTML=""; }

async function playDealToHallAnimation(picked, cells){
  if(!Array.isArray(picked) || !Array.isArray(cells) || !cells.length) return;
  const mixRect = mixPile ? mixPile.getBoundingClientRect() : null;
  const startFromMix = {
    left: mixRect ? mixRect.left + mixRect.width * 0.5 : window.innerWidth * 0.25,
    top: mixRect ? mixRect.top + mixRect.height * 0.5 : window.innerHeight * 0.5,
    width: 48,
    height: 70
  };
  for(let i = 0; i < 16; i++){
    const card = picked[i];
    if(!card) continue;
    const targetCell = cells[i];
    if(!targetCell) continue;

    const targetRect = targetCell.getBoundingClientRect();
    const srcTile = assetGridEl ? assetGridEl.querySelector(`.stockCardTile[data-cid="${card.id}"]`) : null;
    const srcRect = srcTile ? srcTile.getBoundingClientRect() : startFromMix;

    const ghost = document.createElement("div");
    ghost.className = "dealGhostCard";
    ghost.style.left = `${srcRect.left}px`;
    ghost.style.top = `${srcRect.top}px`;
    ghost.style.width = `${Math.max(44, srcRect.width)}px`;
    ghost.style.height = `${Math.max(64, srcRect.height)}px`;
    ghost.innerHTML = `<div class="dealGhostCore"><span class="dealGhostName">${escapeHtml(card.name)}</span></div>`;
    document.body.appendChild(ghost);

    targetCell.classList.add("dealTarget");
    const dx = (targetRect.left + targetRect.width * 0.5) - (srcRect.left + srcRect.width * 0.5);
    const dy = (targetRect.top + targetRect.height * 0.5) - (srcRect.top + srcRect.height * 0.5);
    const sx = Math.max(0.42, Math.min(1.0, targetRect.width / Math.max(40, srcRect.width)));
    const sy = Math.max(0.42, Math.min(1.0, targetRect.height / Math.max(56, srcRect.height)));
    const rot = Math.round((Math.random() - 0.5) * 16);

    const arc = 90 + Math.round(Math.random() * 80);
    ghost.animate([
      { transform: "translate(0, 0) scale(1,1) rotate(0deg)", opacity: 0.96 },
      { transform: `translate(${Math.round(dx * 0.45)}px, ${Math.round(dy * 0.45 - arc)}px) scale(${Math.max(0.82, sx + 0.16)}, ${Math.max(0.82, sy + 0.16)}) rotate(${Math.round(rot * 0.45)}deg)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${rot}deg)`, opacity: 0.22 }
    ],{
      duration: 560,
      easing: "cubic-bezier(.18,.72,.22,1)",
      fill: "forwards"
    });

    setTimeout(()=>{
      targetCell.classList.remove("dealTarget");
      ghost.remove();
    }, 580);

    await sleep(26);
  }
  await sleep(620);
}

function renderDealtHallPreview(picked, cells){
  for(let i = 0; i < 16; i++){
    const cell = cells[i];
    if(!cell) continue;
    const card = picked[i];
    cell.innerHTML = "";
    cell.classList.remove("revealed","good","bad","empty-slot");
    if(!card){
      cell.classList.add("empty-slot","dealt-preview");
      cell.innerHTML = `<div class="emptySlotMark">鈥?/div>`;
      continue;
    }
    const logoTile = mkLogoTile(card);
    logoTile.classList.add("dealtThumb");
    cell.appendChild(logoTile);
    cell.classList.add("dealt-preview");
  }
}

/* =========================
 *  Rendering
 * ========================= */
function renderTop(){
  const lvl = getLvl();
  roundNoEl.textContent = `${lvl.round} / ${LEVELS.length}`;
  moneyEl.textContent = money;
  money2El.textContent = money;
  openCountEl.textContent = openCount;
  const openCountDisp = document.getElementById('openCountDisp');
  if(openCountDisp) openCountDisp.textContent = openCount;
  const targetDisp = document.getElementById('targetDisp');
  if(targetDisp) targetDisp.textContent = lvl.target;
  const goalNum = document.getElementById('goalHintNum');
  if(goalNum) goalNum.textContent = lvl.target;

  // 鏇存柊 /N 鍒嗘瘝鏄剧ず
  const openSub = document.querySelector('#openProgressRow .dualLabelSub');
  if(openSub) openSub.textContent = '/' + lvl.opens;
  const moneySub = document.querySelector('#moneyProgressRow .dualLabelSub');
  if(moneySub) moneySub.textContent = '/' + lvl.target;

  const left = deliveryLeft();
  if(deliveryLeftEl) deliveryLeftEl.textContent = left;
  if(deliveryLeft2El) deliveryLeft2El.textContent = left;

  if(deliveryInnerEl){
    const pct = clamp(openCount / lvl.opens, 0, 1) * 100;
    deliveryInnerEl.style.width = `${pct}%`;
    updateOpenBarColor(openCount, lvl.opens);
  }

  requestAnimationFrame(syncStageOverlayOffset);
  if(deliveryBarEl){
    deliveryBarEl.classList.toggle("danger", left <= 2 && openCount < lvl.opens);
  }

  deliveryStateEl.textContent = (openCount >= lvl.opens) ? "已交付" : "未交付";
  deliveryStateEl.style.color = (openCount >= lvl.opens) ? "rgba(255,200,120,0.95)" : "rgba(255,255,255,0.55)";

  renderProgress(0);
}

function renderProgress(delta){
  const ratio = clamp(money / getTarget(), 0, 1);
  document.body.classList.remove("market-up","market-down");
  if(delta > 0) document.body.classList.add("market-up");
  else if(delta < 0) document.body.classList.add("market-down");
  progressInner.style.width = `${Math.round(ratio * 100)}%`;

  // 鏆栬壊娓愬彉锛氳祫閲戣秺鎺ヨ繎/瓒呰繃鐩爣锛岃秺鏆?
  updateMoneyBarColor(money, getTarget());

  progressOuter.classList.remove("pulse");
  void progressOuter.offsetWidth;
  progressOuter.classList.add("pulse");

  if(delta !== 0){
    const f = document.createElement("div");
    f.className = "barFloat";
    f.textContent = fmt(delta);
    f.style.color = delta > 0 ? "rgba(255,120,120,0.98)" : "rgba(44,255,138,0.95)";
    progressOuter.appendChild(f);
    setTimeout(()=>f.remove(), 1000);
  }
}

/* 鈹€鈹€ 鐖嗛噾甯佺壒鏁?鈹€鈹€ */
function spawnCoins(container, delta){
  // delta > 0: 鐖嗗涓‖甯侊紙鏁伴噺=delta锛屾渶澶?0涓級
  // delta < 0: 鐖嗙儫灏橈紙鏁伴噺鎸変簭鎹熼噺锛屾渶澶?涓級
  const abs = Math.abs(delta);
  if(delta > 0){
    // 鍗曚釜澶х‖甯侊紙鍘熺増椋庢牸锛夊眳涓悜涓婇鍑?
    const bigCoin = document.createElement("div");
    bigCoin.className = "coinParticle coinBig";
    bigCoin.textContent = "🪙";
    bigCoin.style.left = "50%";
    bigCoin.style.top  = "50%";
    bigCoin.style.setProperty("--cx", "0px");
    bigCoin.style.setProperty("--cy", "-70px");
    bigCoin.style.setProperty("--cr", "20deg");
    container.appendChild(bigCoin);
    setTimeout(()=>bigCoin.remove(), 1100);
    const n = Math.min(abs, 20);
    for(let i = 0; i < n; i++){
      const coin = document.createElement("div");
      coin.className = "coinMulti";
      // 闅忔満鏂瑰悜鏁ｅ皠
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist  = 40 + Math.random() * 70;
      const cmx   = Math.round(Math.cos(angle) * dist);
      const cmy   = Math.round(Math.sin(angle) * dist - 20);
      const cmr   = Math.round((Math.random() - 0.5) * 120) + "deg";
      const dur   = (0.65 + Math.random() * 0.55).toFixed(2) + "s";
      coin.textContent = "🪙";
      coin.style.left = (30 + Math.random()*40) + "%";
      coin.style.top  = (30 + Math.random()*40) + "%";
      coin.style.setProperty("--cmx", cmx + "px");
      coin.style.setProperty("--cmy", cmy + "px");
      coin.style.setProperty("--cmr", cmr);
      coin.style.setProperty("--cm-dur", dur);
      container.appendChild(coin);
      setTimeout(()=>coin.remove(), 1300);
    }
  } else if(delta < 0){
    const n = Math.min(abs, 8);
    const smokes = ["💸","💸","🌫️","💥"];
    for(let i = 0; i < n; i++){
      const sm = document.createElement("div");
      sm.className = "lossSmoke";
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist  = 25 + Math.random() * 45;
      sm.textContent = smokes[Math.floor(Math.random()*smokes.length)];
      sm.style.left = (25 + Math.random()*50) + "%";
      sm.style.top  = (25 + Math.random()*50) + "%";
      sm.style.setProperty("--lsx", Math.round(Math.cos(angle)*dist) + "px");
      sm.style.setProperty("--lsy", Math.round(Math.sin(angle)*dist - 30) + "px");
      sm.style.animationDelay = (i * 0.07).toFixed(2) + "s";
      container.appendChild(sm);
      setTimeout(()=>sm.remove(), 900);
    }
  }
}

/* 鈹€鈹€ 杩涘害鏉℃殩鑹茬郴缁?鈹€鈹€ */
function updateMoneyBarColor(money, target){
  const el = document.getElementById("progressInner");
  if(!el) return;
  const ratio = money / target;
  if(ratio < 0){
    // 璐熸暟锛氭繁绾㈣绀?
    el.style.background = "linear-gradient(90deg, #dc2626, #ef4444)";
    el.style.boxShadow = "0 0 20px rgba(239,68,68,0.80)";
  } else {
    // 濮嬬粓榛勮壊璋冿紝瓒婃弧瓒婁寒瓒婇ケ鍜?
    const bright = Math.min(1, ratio);
    const lowA = 0.35 + bright * 0.20;  // 璧风偣閫忔槑搴?
    const hiA  = 0.65 + bright * 0.25;
    el.style.background = `linear-gradient(90deg, rgba(245,158,11,${lowA}), #fbbf24, rgba(253,230,138,${hiA}))`;
    const glow = 8 + bright * 18;
    el.style.boxShadow = `0 0 ${glow}px rgba(251,191,36,${0.40 + bright * 0.35})`;
  }
}

function updateOpenBarColor(openCount, total){
  const el = document.getElementById("deliveryInner");
  if(!el) return;
  const ratio = openCount / total;
  // 钃濃啋闈掆啋缁库啋姗欌啋绾?(鍏ㄧ▼浠庤摑鍑哄彂)
  if(ratio < 0.33){
    el.style.background = "linear-gradient(90deg, #1e90ff, #3dd8ff)";
    el.style.boxShadow = "0 0 10px rgba(61,216,255,0.50)";
  } else if(ratio < 0.56){
    el.style.background = "linear-gradient(90deg, #3dd8ff, #22d3ee, #34d399)";
    el.style.boxShadow = "0 0 12px rgba(52,211,153,0.50)";
  } else if(ratio < 0.78){
    el.style.background = "linear-gradient(90deg, #34d399, #a3e635, #fbbf24)";
    el.style.boxShadow = "0 0 16px rgba(251,191,36,0.60)";
  } else if(ratio < 0.89){
    el.style.background = "linear-gradient(90deg, #fbbf24, #f97316)";
    el.style.boxShadow = "0 0 20px rgba(249,115,22,0.70)";
  } else {
    el.style.background = "linear-gradient(90deg, #f97316, #ef4444, #dc2626)";
    el.style.boxShadow = "0 0 24px rgba(239,68,68,0.80)";
  }
}

function renderLeft(){
  syncBoardState();
  assetCountEl.textContent = assets.length;

  if(assets.length === 0){
    assetEmptyEl.style.display = "block";
    assetGridEl.style.display = "none";
    assetGridEl.innerHTML = "";
  }else{
    assetEmptyEl.style.display = "none";
    assetGridEl.style.display = "grid";
    assetGridEl.innerHTML = "";
    assets.forEach(c => assetGridEl.appendChild(buildStockCardTile(c)));
  }
  syncCleanupUi();
  syncReinforceEmbedPanel();
}

function placePendingCardToRow(rowIndex){
  if(!placementQueue.length) return false;
  if(!canPlaceIntoRow(rowIndex)){
    showPoolFullFeedback(rowIndex);
    return false;
  }
  const pending = placementQueue.shift();
  if(!pending) return false;
  if(placeCardIntoRow(pending, rowIndex)){
    starterPlacementPending = placementQueue.length > 0 && starterPlacementPending;
    awaitingStarter = placementQueue.length > 0 && starterPlacementPending;
    applyOnBuyEffects(pending);
    addHistoryItem({
      natural:`${escapeHtml(pending.name)} 已放入 ${BOARD_ROWS[rowIndex]?.label || "资金池"}`,
      title:"股票落位",
      delta:0,
      good:true
    });
    updateOpenAvailability();
    renderBoardGrid();
    return true;
  }
  placementQueue.unshift(pending);
  showPoolFullFeedback(rowIndex);
  return false;
}

function buildBoardSlot(rowIndex, colIndex){
  const rowCfg = BOARD_ROWS[rowIndex];
  const card = boardRows[rowIndex][colIndex] || null;
  const slot = document.createElement("div");
  const rowHasSpace = canPlaceIntoRow(rowIndex);
  slot.className = "boardSlot";
  slot.dataset.row = String(rowIndex);
  slot.dataset.col = String(colIndex);
  if(!card) slot.classList.add("board-empty");
  if(placementQueue.length && !card && rowHasSpace) slot.classList.add("board-placeable");
  if(!card && !rowHasSpace) slot.classList.add("board-blocked");
  if(card && cleanupMode) slot.classList.add("cleanupMode");
  if(reinforceEmbedMode && card) slot.classList.add("embedTargetable");
  if(reinforceEmbedMode && card && pendingReinforceTargetId === card.id) slot.classList.add("embedSelected");

  if(card){
    const tile = mkLogoTile(card);
    tile.addEventListener("mousemove", (e)=> showTooltip(card, e.clientX, e.clientY));
    tile.addEventListener("mouseleave", hideTooltip);
    tile.addEventListener("click", (e)=>{
      e.stopPropagation();
      if(reinforceEmbedMode){
        selectReinforceTarget(card.id);
        return;
      }
      if(cleanupMode){
        liquidateAssetCard(card.id, "manual");
        updateOpenAvailability();
        renderBoardGrid();
      }
    });
    slot.appendChild(tile);

    const name = document.createElement("div");
    name.className = "boardCardName hFont";
    name.textContent = card.name;
    slot.appendChild(name);

    const meta = document.createElement("div");
    meta.className = "boardCardMeta";
    const markers = getCardMarkers(card);
    markers.slice(0, 2).forEach((kw)=>{
      const span = document.createElement("span");
      span.className = "boardStatBadge";
      span.textContent = markerLabel(kw);
      meta.appendChild(span);
    });
    if(cardNetEarnings[card.id] !== undefined){
      const net = document.createElement("span");
      const val = Number(cardNetEarnings[card.id] || 0);
      net.className = `boardStatBadge boardNetBadge ${val >= 0 ? "up" : "down"}`;
      net.textContent = `本局 ${val >= 0 ? "+" : ""}${val}`;
      meta.appendChild(net);
    }
    if(meta.childElementCount) slot.appendChild(meta);
  } else {
    const empty = document.createElement("div");
    empty.className = "boardEmptyHint";
    empty.innerHTML = `<div class="boardEmptyMain">空位</div><div class="boardDropHint">${placementQueue.length ? `点击这一行放入 ${escapeHtml(getPendingPlacementCard()?.name || "股票")}` : `本行最多 ${BOARD_COLS} 张`}</div>`;
    slot.appendChild(empty);
  }

  return slot;
}

function buildBoardRow(rowIndex){
  const rowCfg = BOARD_ROWS[rowIndex];
  const rowHasSpace = canPlaceIntoRow(rowIndex);
  const rowEl = document.createElement("section");
  rowEl.className = "boardRow";
  rowEl.dataset.row = String(rowIndex);
  if(placementQueue.length && rowHasSpace) rowEl.classList.add("boardRow-dropReady");

  const head = document.createElement("div");
  head.className = "boardRowHead";
  const badge = document.createElement("div");
  badge.className = "boardRowBadge";
  badge.textContent = `${rowCfg.label} 路 ${rowCfg.effect}`;
  const count = document.createElement("div");
  count.className = "boardRowCount";
  count.textContent = `${boardRows[rowIndex].length} / ${BOARD_COLS}`;
  head.appendChild(badge);
  head.appendChild(count);
  rowEl.appendChild(head);

  const track = document.createElement("div");
  track.className = "boardRowTrack";
  for(let colIndex = 0; colIndex < BOARD_COLS; colIndex++){
    track.appendChild(buildBoardSlot(rowIndex, colIndex));
  }
  rowEl.appendChild(track);

  if(placementQueue.length && rowHasSpace){
    const dropHint = document.createElement("div");
    dropHint.className = "boardRowDropHint";
    dropHint.textContent = `点击这一行即可放入 ${getPendingPlacementCard()?.name || "待落位股票"}`;
    rowEl.appendChild(dropHint);
    rowEl.addEventListener("click", ()=>{
      placePendingCardToRow(rowIndex);
    });
  }

  return rowEl;
}

function renderBoardGrid(){
  if(!revealGridEl) return;
  revealGridEl.innerHTML = "";
  for(let rowIndex = 0; rowIndex < BOARD_ROWS.length; rowIndex++){
    revealGridEl.appendChild(buildBoardRow(rowIndex));
  }
  updateOpenAvailability();
}

/* 3.8fix: 鏈夊緟钀戒綅鍗＄墖鏃惰嚜鍔ㄦ粴鍒板彲钀戒綅琛?*/
function _scrollToFirstPlaceable(){
  if(!placementQueue.length||!revealGridEl)return;
  requestAnimationFrame(()=>{
    const t=revealGridEl.querySelector('.boardRow-dropReady');
    if(t)t.scrollIntoView({behavior:'smooth',block:'center'});
  });
}
function clearRevealGrid(){
  renderBoardGrid();
}

function clearCardMarks(){
  currentOpenMarks.clear();
  // 鍚屾椂娓呴櫎闃舵涓€鐨?pick-selected / pick-not-selected
  assetGridEl.querySelectorAll(".stockCardTile").forEach(t => {
    t.classList.remove("pick-selected","pick-not-selected");
  });
  // 閲嶆柊娓叉煋宸︿晶锛堝幓鎺夊嬀鏍囪锛?
  renderLeft();
}

function markCard(cardId, dir, delta = 0){
  const payload = { dir, delta: Number(delta || 0) };
  currentOpenMarks.set(cardId, payload);
}

let lastRevealSnapshot = [];
let lastRevealHintState = null;
function captureRevealCell(index, card, up, delta){
  lastRevealSnapshot[index] = { card, up, delta: Number(delta || 0) };
}

function renderRevealSnapshot(){
  if(!revealGridEl) return;
  renderBoardGrid();
  const cells = Array.from(revealGridEl.querySelectorAll(".boardSlot"));
  if(!cells.length || !lastRevealSnapshot.length) return;
  for(let i = 0; i < Math.min(BOARD_ROWS.length * BOARD_COLS, cells.length); i++){
    const snap = lastRevealSnapshot[i];
    const cell = cells[i];
    if(!snap){
      continue;
    }
    if(!snap.card){
      continue;
    }
    cell.classList.add("revealed");
    cell.classList.remove("up","down","good","bad","empty-slot");
    cell.classList.add(snap.up ? "up" : "down");
    const keep = document.createElement("div");
    keep.className = "hallKeepDelta " + (snap.delta >= 0 ? "up" : "down");
    keep.textContent = fmt(snap.delta);
    cell.appendChild(keep);
  }
  if(lastRevealHintState){
    renderFutureInfluenceHints(
      cells,
      lastRevealHintState.picked,
      lastRevealHintState.outcomes,
      Number(lastRevealHintState.revealedIndex ?? -1)
    );
  }
}

function addHistoryItem({title, delta, detail, good, natural}){
  const it = document.createElement("div");
  it.className = "hItem" + (good ? "" : " hItemBad");

  // 鑷劧璇█鏍煎紡
  let narr = natural || "";
  if(!narr){
    if(delta > 0)       narr = `📈 ${title}，资金 <span class="goodTxt">+${delta}</span>`;
    else if(delta < 0)  narr = `📉 ${title}，资金 <span class="badTxt">${delta}</span>`;
    else if(!good)      narr = `⚠️ ${title}`;
    else                narr = `📌 ${title}`;
    if(detail) narr += `<span class="hNarrDetail"> · ${detail}</span>`;
  }

  it.innerHTML = `<div class="hNarr">${narr}</div>`;
  historyListEl.prepend(it);
  while(historyListEl.children.length > 4){
    historyListEl.removeChild(historyListEl.lastElementChild);
  }
}

function renderAll(){
  renderTop();
  renderLeft();
  renderBoardGrid();
  renderHp();

  if(historyListEl.children.length === 0){
    addHistoryItem({
      title:"游戏就绪",
      delta:0,
      natural:`第 ${getLvl().round} 轮开始，完成 ${getLvl().opens} 次开盘，累计资金达到 ${getLvl().target} 即可交付`,
      good:true
    });
  }
}


/* =========================
 *  Starter / End
 * ========================= */
function showStarterPack(){
  awaitingStarter = true;
  runEnded = false;

  // 绂佺敤寮€鐩樼洿鍒扮帺瀹剁‘璁?
  btnOpen.disabled = true;

  if(!starterOverlay || !starterGrid || !btnStarterOk){
    awaitingStarter = false;
    btnOpen.disabled = false;
    return;
  }

  // 生成开盘资产卡（固定 1 星）
  const starterName = "小型水电站";
  const starterCount = 3;
  const opts = Array.from({ length: starterCount }, (_, index)=>{
    const baseCard = createCardByName(starterName);
    return cloneCardInstance(baseCard || {
      id: `starter_fallback_${index}`,
      name: starterName,
      category: "电力股",
      up: 2,
      down: 0,
      eff: "固有1",
      keywords: [{ type: "boost_up", value: 0.10 }]
    }, "start");
  });

  starterGrid.innerHTML = "";
  starterGrid.style.gridTemplateColumns = `repeat(${starterCount}, minmax(0, 1fr))`;
  opts.forEach((c)=>{
    const cardEl = buildHsCard(c);
    cardEl.classList.remove("rewardPick");
    cardEl.classList.add("starterShowcaseCard");
    cardEl.addEventListener("mousemove", (e)=> showTooltip(c, e.clientX, e.clientY));
    cardEl.addEventListener("mouseleave", hideTooltip);
    starterGrid.appendChild(cardEl);
  });

  starterOverlay.style.display = "flex";
  updateStageFlowState();
  btnStarterOk.onclick = ()=>{
    placementQueue = opts.slice();
    starterPlacementPending = placementQueue.length > 0;
    addHistoryItem({
      title:"寮€灞€鍙戞斁",
      natural:`🎉 报到完成，获得 <b>${opts.length}</b> 张起始股票，请依次落位到 3 行持仓池`,
      good:true
    });
    starterOverlay.style.display = "none";
    updateStageFlowState();
    hideTooltip();
    renderBoardGrid();
    renderTop();
    awaitingStarter = placementQueue.length > 0;
    updateOpenAvailability();
  };
}

/* 3.8fix: observe board grid changes, auto-scroll to first placeable cell */
(function(){
  if(!revealGridEl) return;
  let _scrollTimer = null;
  const obs = new MutationObserver(()=>{
    clearTimeout(_scrollTimer);
    _scrollTimer = setTimeout(_scrollToFirstPlaceable, 80);
  });
  obs.observe(revealGridEl, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
})();

function endRun(win){
  runEnded = true;
  btnOpen.disabled = true;
  if(win) sfxWin(); else sfxLose();

  const lvl = getLvl();
  const roundsCompleted = currentLevel + (win ? 1 : 0);
  const finalShownMoney = win && lastRoundDeliverySummary ? lastRoundDeliverySummary.carryGold : money;
  const title = win ? "传奇交付成功！" : (currentLevel >= LEVELS.length-1 ? "最终关卡失败" : `第 ${lvl.round} 轮交付失败`);
  const sub = win
    ? `完成全部 ${LEVELS.length} 轮，交付后结转资金 ${finalShownMoney}，达成传说中的 1000 目标。`
    : `累计资金 ${money} 未达到目标 ${lvl.target}，本局结束。`;

  if(endTitleEl) endTitleEl.textContent = title;
  if(endSubEl) endSubEl.textContent = sub;

  const detail = `
    <div class="hFont" style="font-size:18px;margin-bottom:8px;">${title}</div>
    <div style="opacity:0.92;">
      完成轮次：<b>${roundsCompleted} / ${LEVELS.length}</b> ·
      当前资金：<b>${money}</b> ·
      本轮目标：<b>${lvl.target}</b>
    </div>
    ${win && lastRoundDeliverySummary ? `<div style="margin-top:10px;color:#ffc857;">本轮已提交 <b>${lastRoundDeliverySummary.submittedGold}</b> 金币，结转 <b>${lastRoundDeliverySummary.carryGold}</b> 金币。</div>` : ""}
    <div style="margin-top:10px;opacity:0.72;">
      当前持仓：${assets.length} 张 · 强化标记：${getTotalReinforceCount()} 枚
    </div>
    ${win ? '<div style="margin-top:14px;font-size:20px;color:#ffc857;font-weight:900;">恭喜你成为幸运炒股公司的传奇操盘手！</div>' : ""}
  `;
  if(endBodyEl) endBodyEl.innerHTML = detail;
  if(endOverlay) endOverlay.style.display = "flex";
}

function restartSameRole(){
  if(endOverlay) endOverlay.style.display = "none";
  if(!selectedRoleId){
    backToMenu();
    return;
  }
  currentLevel = 0;
  startGameFromLobby();
}

/* =========================
 *  Open / Reveal logic
 * ========================= */
// 3脳4 鐩橀潰锛氳0=鏅€氭睜锛堥琛岋級锛岃1=淇濋櫓姹狅紝琛?=绾㈠埄姹狅紙鏀跺熬琛岋級
function isFirstRow(index){ return Math.floor(index / BOARD_COLS) === 0; }
function isTailRow(index){ return Math.floor(index / BOARD_COLS) === BOARD_ROWS.length - 1; }
function getNeighborIndices(index){
  const row = Math.floor(index / BOARD_COLS);
  const col = index % BOARD_COLS;
  const out = [];
  for(let dr=-1; dr<=1; dr++){
    for(let dc=-1; dc<=1; dc++){
      if(dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if(nr < 0 || nr >= BOARD_ROWS.length || nc < 0 || nc >= BOARD_COLS) continue;
      out.push(nr * BOARD_COLS + nc);
    }
  }
  return out;
}

function countSameCategoryOutcomes(picked, outcomes, card, targetOutcome, excludeIndex=-1){
  if(!Array.isArray(picked) || !Array.isArray(outcomes) || !card) return 0;
  let sum = 0;
  for(let i = 0; i < picked.length; i++){
    if(i === excludeIndex) continue;
    const other = picked[i];
    if(!other || other.category !== card.category) continue;
    if(outcomes[i] === targetOutcome) sum++;
  }
  return sum;
}

function clearCellInfluenceHints(cell){
  if(!cell) return;
  cell.querySelectorAll('.futureInfluenceStack').forEach((node)=>node.remove());
}

function appendCellInfluenceHint(cell, kind, text){
  if(!cell || !text) return;
  let stack = cell.querySelector('.futureInfluenceStack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'futureInfluenceStack';
    cell.appendChild(stack);
  }
  const badge = document.createElement('div');
  badge.className = `futureInfluenceBadge ${kind}`.trim();
  badge.textContent = text;
  stack.appendChild(badge);
}

function renderFutureInfluenceHints(cells, picked, outcomes, revealedIndex){
  return;
}

function sfxRuleTrigger(kind='normal'){
  try{
    const ac = getACtx();
    const now = ac.currentTime;
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    const g = ac.createGain();
    o1.type = kind === 'first' ? 'triangle' : 'sine';
    o2.type = 'triangle';
    o1.frequency.setValueAtTime(kind === 'first' ? 840 : 620, now);
    o1.frequency.exponentialRampToValueAtTime(kind === 'first' ? 1320 : 980, now + 0.16);
    o2.frequency.setValueAtTime(kind === 'first' ? 1260 : 930, now);
    o2.frequency.exponentialRampToValueAtTime(kind === 'first' ? 1680 : 1200, now + 0.16);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(kind === 'first' ? 0.18 : 0.12, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    o1.connect(g);
    o2.connect(g);
    g.connect(ac.destination);
    o1.start(now);
    o2.start(now);
    o1.stop(now + 0.28);
    o2.stop(now + 0.28);
  }catch(e){}
}

function showRuleTriggerFx({ title, sub = '', kind = 'normal' }){
  const layer = document.getElementById('ruleTriggerLayer');
  if(!layer || !title) return;
  const toast = document.createElement('div');
  toast.className = `ruleTriggerToast ${kind === 'first' ? 'first' : ''}`.trim();
  toast.innerHTML = `
    <div class="ruleTriggerTitle">${escapeHtml(title)}</div>
    ${sub ? `<div class="ruleTriggerSub">${escapeHtml(sub)}</div>` : ''}
  `;
  layer.appendChild(toast);
  setTimeout(()=>{ if(toast.parentNode) toast.parentNode.removeChild(toast); }, 1750);
  sfxRuleTrigger(kind);
}

function collectTriggeredRuleEvents(card, up, ctx){
  if(!card || !Array.isArray(card.keywords)) return [];
  const idx = Number(ctx?.index ?? -1);
  const prevUp = !!ctx?.prevUp;
  const prevDown = !!ctx?.prevDown;
  const outcomes = Array.isArray(ctx?.outcomes) ? ctx.outcomes : [];
  const picked = Array.isArray(ctx?.picked) ? ctx.picked : [];
  const events = [];

  card.keywords.forEach((kw)=>{
    if(kw.type === 'first_row_up_bonus' && up && isFirstRow(idx)){
      events.push({ title:`带头爆发 +${Math.max(1, Number(kw.value || 0))}`, sub:`${getCardDisplayName(card)} 命中开盘加成`, kind:'first' });
    }
    if(kw.type === 'first_row_boost' && isFirstRow(idx)){
      events.push({ title:`带头：上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%`, sub:`${getCardDisplayName(card)} 获得开盘助涨`, kind:'first' });
    }
    if(kw.type === 'first_row_down_bonus' && !up && isFirstRow(idx)){
      events.push({ title:`带头承接 +${Math.max(1, Number(kw.value || 0))}`, sub:`${getCardDisplayName(card)} 命中开盘兜底`, kind:'first' });
    }
    if(kw.type === 'tail_row_up_bonus' && up && isTailRow(idx)){
      events.push({ title:`压阵：+${Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 命中收尾加成`, kind:'normal' });
    }
    if(kw.type === 'tail_row_boost' && isTailRow(idx)){
      events.push({ title:`压阵：上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%`, sub:`${card.name} 获得收尾助涨`, kind:'normal' });
    }
    if(kw.type === 'tail_row_down_bonus' && !up && isTailRow(idx)){
      events.push({ title:`压阵：防守 +${Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 命中收尾兜底`, kind:'normal' });
    }
    if(kw.type === 'prev_up_boost' && prevUp){
      events.push({ title:`连涨：上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%`, sub:`${card.name} 接到上一张上涨助力`, kind:'normal' });
    }
    if(kw.type === 'prev_up_bonus' && up && prevUp){
      events.push({ title:`连涨：+${Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 连涨提价生效`, kind:'normal' });
    }
    if(kw.type === 'prev_down_bonus' && !up && prevDown){
      events.push({ title:`连跌：防守 +${Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 连跌兜底生效`, kind:'normal' });
    }
    if(kw.type === 'adj_up_bonus' && up){
      const count = countSameCategoryOutcomes(picked, outcomes, card, true, idx);
      if(count > 0) events.push({ title:`龙头共振：+${count * Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 吃到 ${count} 张同板块上涨`, kind:'normal' });
    }
    if(kw.type === 'adj_down_bonus' && !up){
      const count = countSameCategoryOutcomes(picked, outcomes, card, false, idx);
      if(count > 0) events.push({ title:`板块承接：防守 +${count * Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 吃到 ${count} 张同板块下跌`, kind:'normal' });
    }
    if(kw.type === 'after_up_boost_next' && up){
      events.push({ title:`后续上涨：上涨概率 +${Math.max(1, Math.round(Number(kw.value || 0) / 0.1)) * 10}%`, sub:`${card.name} 给后续股票追加助涨`, kind:'normal' });
    }
    if(kw.type === 'after_up_price_next' && up){
      events.push({ title:`后续上涨：+${Math.max(1, Number(kw.value || 0))}`, sub:`${card.name} 给后续股票追加提价`, kind:'normal' });
    }
  });

  return events;
}

function rollUpChance(card, ctx=null){
  let p = 0.5;
  const idx = Number(ctx?.index ?? -1);
  const prevUp = !!ctx?.prevUp;
  const carryBoost = Number(ctx?.carryBoost || 0);
  // 鍐呯疆鐗逛緥
  if(card.name === "旧瓷器") p -= 0.40;
  // 璇嶆潯鍔犳垚
  if(card.keywords){
    for(const kw of card.keywords){
      if(kw.type === 'crazy_up' && kw.ready){ p = 1.0; break; }
      if(kw.type === 'boost_up') p += kw.value;
      if(kw.type === 'demon_stock') p += 0.50;
      if(kw.type === 'lottery') p = kw.chance; // 骞歌繍褰╃エ鐢ㄨ嚜韬概率+
      if(kw.type === 'hold_boost') p += Number(kw.value || 0);
      if(kw.type === 'first_row_boost' && isFirstRow(idx)) p += Number(kw.value || 0);
      if(kw.type === 'tail_row_boost' && isTailRow(idx)) p += Number(kw.value || 0);
      if(kw.type === 'prev_up_boost' && prevUp) p += Number(kw.value || 0);
    }
  }
  p += carryBoost;
  return clamp(p, 0.02, 0.98);
}
function rollOutcome(card, ctx=null){ return Math.random() < rollUpChance(card, ctx); }
function payoutOf(card, up, ctx=null){
  let val = up ? card.up : card.down;
  const idx = Number(ctx?.index ?? -1);
  const outcomes = Array.isArray(ctx?.outcomes) ? ctx.outcomes : [];
  const picked = Array.isArray(ctx?.picked) ? ctx.picked : [];
  const prevUp = !!ctx?.prevUp;
  const prevDown = !!ctx?.prevDown;
  const carryPrice = Number(ctx?.carryPrice || 0);
  const carryDown = Number(ctx?.carryDown || 0);
  if(card.keywords){
    for(const kw of card.keywords){
      if(up){
        if(kw.type === 'price_up') val += kw.value;
        if(kw.type === 'leverage') val += kw.value;
        if(kw.type === 'dividend' && kw.count > 0){ val += kw.count; kw.count = Math.max(0, kw.count-1); }
        if(kw.type === 'demon_stock') val += kw.value;
        if(kw.type === 'first_row_up_bonus' && isFirstRow(idx)) val += Number(kw.value || 0);
        if(kw.type === 'tail_row_up_bonus' && isTailRow(idx)) val += Number(kw.value || 0);
        if(kw.type === 'prev_up_bonus' && prevUp) val += Number(kw.value || 0);
        if(kw.type === 'adj_up_bonus'){
          const n = countSameCategoryOutcomes(picked, outcomes, card, true, idx);
          val += n * Number(kw.value || 0);
        }
      } else {
        if(kw.type === 'insurance') val += kw.value;
        if(kw.type === 'leverage') val -= kw.value;
        if(kw.type === 'first_row_down_bonus' && isFirstRow(idx)) val += Number(kw.value || 0);
        if(kw.type === 'tail_row_down_bonus' && isTailRow(idx)) val += Number(kw.value || 0);
        if(kw.type === 'prev_down_bonus' && prevDown) val += Number(kw.value || 0);
        if(kw.type === 'adj_down_bonus'){
          const n = countSameCategoryOutcomes(picked, outcomes, card, false, idx);
          val += n * Number(kw.value || 0);
        }
      }
    }
  }
  if(up) val += carryPrice;
  else val += carryDown;
  if(up && card.rowType === 'dividend') val += 1;
  if(!up && card.rowType === 'insurance') val += 1;
  return val;
}

function buildOpenSelection(){
  const picked = [];
  for(let rowIndex = 0; rowIndex < BOARD_ROWS.length; rowIndex++){
    for(let colIndex = 0; colIndex < BOARD_COLS; colIndex++){
      picked.push(boardRows[rowIndex][colIndex] || null);
    }
  }
  return picked;
}

function settleOneCardKeywords(card, up){
  if(!Array.isArray(card.keywords)) return;
  if(up){
    card.keywords = card.keywords.filter((kw)=>kw.type !== 'crazy_up');
    if(hasKw(card, 'remove_after_up')){
      const removed = removeBoardCardById(card.id);
      if(removed){
        addHistoryItem({
          natural:`<b>${escapeHtml(card.name)}</b> 上涨兑现后自动离场`,
          title:'涨后移除',
          delta:0,
          good:true
        });
      }
    }
    if(hasKw(card, 'demon_stock')){
      const sold = liquidateAssetCard(card.id, 'demon');
      if(sold){
        addHistoryItem({ natural:"🐉 妖股触发：<b>" + escapeHtml(card.name) + "</b> 上涨后已自动清仓", title:'妖股清仓', delta:0, good:true });
      }
    }
  }
}

async function startOpen(){
  if(running) return;
  sfxButton();
  if(runEnded) return;
  if(awaitingStarter || placementQueue.length > 0) return;
  if(openCount >= getDeliveryOpens()) return;

  running = true;
  btnOpen.disabled = true;
  hideTooltip();
  openCount++;
  renderTop();

  // 璁板綍鏈寮€鐩樺墠璧勯噾锛堢敤浜庡鍔遍潰鏉挎樉绀哄噣鏀剁泭锛?
  showReward._prevMoney = money;

  clearRevealGrid();
  lastRevealSnapshot = new Array(BOARD_ROWS.length * BOARD_COLS).fill(null);
  lastRevealHintState = null;

  const picked = buildOpenSelection();
  picked.forEach((card)=>{
    if(card) delete card.lastOpenTrend;
  });
  const cells = Array.from(revealGridEl.querySelectorAll(".boardSlot"));

  // 棰勮绠楁湰杞?16 鏍肩殑娑ㄨ穼缁撴灉涓庡悗缁紑鐩樹紶瀵硷紙浣嶇疆鍏崇郴/杩炴定/鍚庣画寮€鐩橈級
  const totalSlots = BOARD_ROWS.length * BOARD_COLS;
  const outcomes = new Array(totalSlots).fill(null);
  const carryBoostArr = new Array(totalSlots).fill(0);
  const carryPriceArr = new Array(totalSlots).fill(0);
  const carryDownArr = new Array(totalSlots).fill(0);
  let carryBoost = 0;
  let carryPrice = 0;
  let carryDown = 0;
  for(let i=0;i<totalSlots;i++){
    const card = picked[i];
    if(!card) continue;
    if(hasKw(card, 'isolated')) continue;
    // 杩炴定/杩炶穼鍙湪鍚岃鍐呬紶鎾細琛岄鏍硷紙col===0锛変笉鍙椾笂涓€琛屽奖鍝?
    const col = i % BOARD_COLS;
    const prevUp = col > 0 && outcomes[i-1] === true;
    carryBoostArr[i] = carryBoost;
    carryPriceArr[i] = carryPrice;
    carryDownArr[i] = carryDown;
    const up = rollOutcome(card, { index:i, prevUp, carryBoost });
    outcomes[i] = up;
    if(!Array.isArray(card.keywords)) continue;
    if(up){
      card.keywords.forEach((kw)=>{
        if(kw.type === 'after_up_boost_next') carryBoost += Number(kw.value || 0);
        if(kw.type === 'after_up_price_next') carryPrice += Number(kw.value || 0);
      });
    } else {
      card.keywords.forEach((kw)=>{
        if(kw.type === 'after_down_insurance_next') carryDown += Number(kw.value || 0);
      });
    }
  }

  // 鈹€鈹€ 闃舵浜岋細閫愭牸鎻檽缁撶畻 鈹€鈹€
  for(let i=0;i<totalSlots;i++){
    const card = picked[i];

    if(!card){
      const cell = cells[i];
      if(cell) cell.classList.add("revealed","empty-slot");
      lastRevealSnapshot[i] = { card:null, up:false, delta:0 };
      lastRevealHintState = { picked, outcomes:[...outcomes], revealedIndex:i };
      renderFutureInfluenceHints(cells, picked, outcomes, i);
      continue;
    }

    if(hasKw(card, 'isolated')){
      const cell = cells[i];
      if(cell) cell.classList.add("revealed");
      lastRevealSnapshot[i] = { card, up:false, delta:0 };
      lastRevealHintState = { picked, outcomes:[...outcomes], revealedIndex:i };
      continue;
    }

    await sleep(210);

    const up = outcomes[i] === true;
    const colIdx = i % BOARD_COLS;
    const deltaRaw = payoutOf(card, up, {
      index: i,
      picked,
      outcomes,
      prevUp: colIdx > 0 && outcomes[i-1] === true,
      prevDown: colIdx > 0 && outcomes[i-1] === false,
      carryPrice: carryPriceArr[i],
      carryDown: carryDownArr[i]
    });

    money += deltaRaw;
    const realDelta = deltaRaw;

    // 鏇存柊绱鍑€璧?
    if(cardNetEarnings[card.id] === undefined) cardNetEarnings[card.id] = 0;
    cardNetEarnings[card.id] += realDelta;

    moneyEl.textContent = money;
    money2El.textContent = money;
    money2El.style.color = money < 0 ? "#ff4060" : money >= getTarget() ? "#ffd060" : "";
    money2El.style.textShadow = money < 0 ? "0 0 12px rgba(255,64,96,0.70)" : money >= getTarget() ? "0 0 14px rgba(255,200,60,0.65)" : "";
    renderProgress(realDelta);

    // 璁板綍骞跺悓姝ュ乏渚ф爣璁?
    markCard(card.id, up ? "up" : "down", realDelta);

    const cell = cells[i];
    if(cell){
      cell.classList.add("revealed");
      cell.classList.remove("up","down","good","bad");
      cell.classList.add(up ? "up" : "down");
      cell.classList.remove("mark-up","mark-down");
      cell.classList.add(up ? "mark-up" : "mark-down");
      cell.classList.add("reveal-pop");
      setTimeout(()=>cell.classList.remove("reveal-pop"), 260);
    }
    captureRevealCell(i, card, up, realDelta);

    const triggerEvents = collectTriggeredRuleEvents(card, up, {
      index: i,
      picked,
      prevUp: (i % BOARD_COLS) > 0 && outcomes[i-1] === true,
      prevDown: (i % BOARD_COLS) > 0 && outcomes[i-1] === false,
      outcomes
    });
    triggerEvents.forEach((event, eventIndex)=>{
      setTimeout(()=>showRuleTriggerFx(event), eventIndex * 140);
    });
    lastRevealHintState = { picked, outcomes:[...outcomes], revealedIndex:i };
    renderFutureInfluenceHints(cells, picked, outcomes, i);

    // 鐖嗛噾甯佺壒鏁?+ 闊虫晥锛堟寜delta鏁伴噺锛夆€?鍏堟挱瀹岄煶鏁堝啀鎻檽涓嬩竴涓?
    if(realDelta > 0){
      spawnCoins(cell, realDelta);
      const _cn = Math.min(realDelta, 20);
      sfxCoinMulti(_cn);
      // 鏇村揩缁撶畻鑺傚
      await sleep(_cn * 35 + 120);
    } else if(realDelta < 0){
      spawnCoins(cell, realDelta); // 浜忔崯鐑熷皹
      sfxBad();
      await sleep(220);
    } else {
      sfxReveal();
      await sleep(120);
    }

    {
      const dir = up ? "📈 涨" : "📉 跌";
      const sign = realDelta >= 0 ? "+" : "";
      const upCol = up ? "#ff6070" : "#2dff9a";
      const moneyCol = "#fbbf24";
      addHistoryItem({
        natural: `<span style="color:${upCol};">${dir}</span> <b>${escapeHtml(card.name)}</b> <span style="color:${moneyCol};font-weight:900;">${sign}${realDelta}</span>`,
        title: card.name, delta: realDelta, good: realDelta >= 0
      });
    }

    settleOneCardKeywords(card, up);
  }
  lastRevealHintState = { picked, outcomes:[...outcomes], revealedIndex:totalSlots - 1 };
  await sleep(700);

  if(openCount >= getDeliveryOpens()){
    deliveryStateEl.textContent = "已交付";
    deliveryStateEl.style.color = "#b6ffb6";

    const lvl = getLvl();
    const win = (money >= lvl.target);
    addHistoryItem({
      natural: win
        ? `第 ${lvl.round} 轮交付成功，累计资金 ${money} >= ${lvl.target}`
        : `第 ${lvl.round} 轮交付失败，累计资金 ${money} < ${lvl.target}`,
      title: win ? "交付成功" : "交付失败", delta:0, good:win
    });

    running = false;

    if(!win){
      endRun(false);
      return;
    }

    // 鏄惁鏄渶缁堝叧鍗★紙绗?2杞級
    if(currentLevel >= LEVELS.length - 1){
      settleRoundDelivery();
      endRun(true); // 鑳滃埄锛?
      return;
    }

    // 杩涘叆杞缁撴潫娴佺▼锛氬厛缁撶畻鐢熸锛屽啀閫夊己鍖栨爣璁帮紝鍐嶉€夊鎸?
    settleRoundDelivery();
    showRoundEndOverlay(win);
    return;
  }

  // 鍙湁鏈疆鏈粨鏉熸椂锛屾墠杩涜股票澧炴寔濂栧姳
  await showReward();

  round++;
  renderTop();
  renderLeft();

  running = false;
  updateOpenAvailability();
}

function showReward(){
  return new Promise((resolve)=>{
    syncStageOverlayOffset();
    rewardGrid.innerHTML = "";
    hideRewardPeekLauncher();

    // 更新增持面板顶部信息：本次净收益 + 剩余开盘次数
    const netThisOpen = money - (showReward._prevMoney !== undefined ? showReward._prevMoney : money);
    const leftOpens = Math.max(0, getDeliveryOpens() - openCount);
    const headerTitleEl = document.querySelector("#rewardOverlay .rewardHeaderTitle");
    if(headerTitleEl) headerTitleEl.textContent = "增持机会";
    // 行 1：开盘进度
    const openValEl = document.getElementById("rewardOpenVal");
    if(openValEl) openValEl.textContent = `${openCount} / ${getDeliveryOpens()}（剩余 ${leftOpens} 次）`;

    // 行 2：本次净收益
    const netValEl = document.getElementById("rewardNetVal");
    if(netValEl){
      const netSign = netThisOpen >= 0 ? "+" : "";
      netValEl.textContent = `${netSign}${netThisOpen}`;
      netValEl.style.color = "#fbbf24";
      netValEl.style.textShadow = "0 0 8px rgba(251,191,36,0.60)";
    }

    showReward._prevMoney = money;

    function openRewardOverlay(){
      rewardOverlay.classList.remove("overlay-hide","overlay-show");
      rewardOverlay.style.display = "flex";
      rewardOverlay.style.opacity = "1";
      rewardOverlay.classList.add("overlay-enter");
      document.body.classList.add("reward-open");
      updateStageFlowState();
      setDecisionMode(true);
      setTimeout(()=>{ rewardOverlay.classList.remove("overlay-enter"); }, 400);
      hideRewardPeekLauncher();
    }

    function peekBoardState(){
      rewardOverlay.style.display = "none";
      rewardOverlay.style.opacity = "";
      rewardOverlay.style.transition = "";
      document.body.classList.remove("reward-open");
      updateStageFlowState();
      setDecisionMode(false);
      hideTooltip();
      renderRevealSnapshot();
      showRewardPeekLauncher("返回增持选择", openRewardOverlay);
    }

    openRewardOverlay();

    // 关闭 overlay 的通用方法
    function closeReward(cb){
      rewardOverlay.style.opacity = "0";
      rewardOverlay.style.transition = "opacity 0.18s ease";
      setTimeout(()=>{
        rewardOverlay.style.display = "none";
        rewardOverlay.style.opacity = "";
        rewardOverlay.style.transition = "";
        document.body.classList.remove("reward-open");
        updateStageFlowState();
        setDecisionMode(false);
        hideTooltip();
        renderRevealSnapshot();
        if(btnRewardSkip) btnRewardSkip.onclick = null;
        cb();
      }, 180);
    }

    // 跳过：放弃本次增持，直接继续
    if(btnRewardSkip){
      btnRewardSkip.onclick = ()=>{
        sfxButton();
        addHistoryItem({ natural:"跳过本次增持机会", title:"跳过增持", delta:0, good:true });
        closeReward(resolve);
      };
      btnRewardSkip.textContent = "放弃本次增持";
    }

    let peekBtn = document.getElementById("btnRewardPeek");
    if(!peekBtn && rewardOverlay){
      const footer = rewardOverlay.querySelector(".rewardFooter");
      if(footer){
        peekBtn = document.createElement("button");
        peekBtn.type = "button";
        peekBtn.id = "btnRewardPeek";
        peekBtn.className = "ghostBtn hFont";
        peekBtn.style.height = "36px";
        peekBtn.style.padding = "0 24px";
        peekBtn.textContent = "暂时查看盘面";
        footer.prepend(peekBtn);
      }
    }
    if(peekBtn){
      peekBtn.onclick = ()=>{
        sfxButton();
        peekBoardState();
      };
    }

    const rewardCount = Number(CONFIG.rewardAssetChoiceCount || GAME_BALANCE.rewardAssetChoiceCount || 3);
    const opts = drawAssetCandidatesByRarity(rewardCount).map(c => ({...c, id: c.id + "_r" + Date.now()}));

    opts.forEach((c)=>{
      const cardEl = buildHsCard(c);
      cardEl.classList.add("rewardPick");
      bindChoiceCardHover(cardEl);
      cardEl.addEventListener("mousemove", (e)=> showTooltip(c, e.clientX, e.clientY));
      cardEl.addEventListener("mouseleave", hideTooltip);

      const pickCard = ()=>{
        if(boardIsFull()){
          addHistoryItem({
            natural:"盘面已满，请先开启清仓模式腾位后再选择增持",
            title:"盘面已满",
            delta:0,
            good:false
          });
          return;
        }
        sfxButton();
        // 额外音效：选中时播放一个上扬音
        try{
          const ac=getACtx();
          const o=ac.createOscillator(); const g=ac.createGain();
          o.type="triangle"; o.frequency.setValueAtTime(440,ac.currentTime);
          o.frequency.exponentialRampToValueAtTime(880,ac.currentTime+0.12);
          g.gain.setValueAtTime(0.25,ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.25);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime+0.25);
        }catch(e){}

        queuePlacementCard(cloneCardInstance(c, "reward"), "增持奖励");
        addHistoryItem({
          natural:`选中增持 <b>${escapeHtml(c.name)}</b>，请将它放入某一行最右侧空槽`,
          title:`增持资产卡 · ${escapeHtml(c.name)}`,
          delta:0,
          detail:`本次强化加入。${escapeHtml(c.category)} ${escapeHtml(c.eff || "无")}`,
          good:true
        });
        closeReward(resolve);
      };

      cardEl.addEventListener("click", pickCard);

      rewardGrid.appendChild(cardEl);
    });
  });
}

/* =========================
 *  Reset
 * ========================= */
function hardReset(){
  currentLevel = 0;
  round = 1;
  money = 0;
  openCount = 0;
  running = false;
  lastRoundDeliverySummary = null;
  _roundStoryShownForLevel = -1;
  awaitingStarter = true;
  runEnded = false;

  resetBoardState();
    // 娓呴櫎绱鍑€璧氳褰?
  Object.keys(cardNetEarnings).forEach(k => delete cardNetEarnings[k]);

  // clear role selection
  selectedRoleId = null;
  selectedUpgradeId = null;
  cleanupMode = false;
  cleanupSelection.clear();
  reinforceEmbedMode = false;
  reinforcePeekMode = false;
  pendingReinforceTargetId = null;
  pendingReinforceMarker = null;
  document.body.classList.remove('reinforce-targeting-mode');
  document.body.classList.remove('reinforce-peek-mode');
  roleStarterCards = [];

  rewardOverlay.style.display = "none";
  const reinforceOverlay = document.getElementById('reinforceRewardOverlay');
  if(reinforceOverlay) reinforceOverlay.style.display = 'none';
  setDecisionMode(false);
  document.body.classList.remove("reward-open");
  updateStageFlowState();
  hideTooltip();
  toggleSettingsDrawer(false);
  syncCleanupUi();
  syncReinforceEmbedPanel();

  historyListEl.innerHTML = "";
  btnOpen.disabled = false;

  // back to menu
  document.getElementById("rolePage").style.display = "none";
  const up4 = document.getElementById("upgradePage");
  if(up4) up4.style.display = "none";
  document.getElementById("roleLobbyPage").style.display = "none";
  document.getElementById("configPage").style.display = "none";
  document.getElementById("storyOverlay").style.display = "none";
  gamePage.style.display = "none";
  menuPage.style.display = "flex";

  const uiRoleName = document.getElementById("uiRoleName");
  if(uiRoleName) uiRoleName.textContent = "未选择";
}

/* =========================
 *  Fix reveal cell class mapping (up=red)
 * ========================= */
(function patchRevealCssClasses(){
  // We used .cell.revealed.good/bad but semantics swapped: bad=red(up), good=green(down).
  // Keep CSS as: .bad = red, .good = green by class names already set above.
})();


/* ================================================================
 *  ? 闊抽绯荤粺 鈥?Web Audio API 绋嬪簭鍖栫敓鎴?
 * ================================================================ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _userGestured = false;
document.addEventListener('pointerdown', function _g(){_userGestured=true;if(_actx&&_actx.state==='suspended')_actx.resume().catch(()=>{});document.removeEventListener('pointerdown',_g);},{once:true});
let _actx = null;
function getACtx(){
  if(!_userGestured) return null; if(!_actx){try{_actx=new AudioCtx();}catch(e){return null;}} if(_actx&&_actx.state==='suspended')_actx.resume().catch(()=>{}); void 0;
  return _actx;
}

function playConfiguredAudio(key, volume=0.82){
  const src = String(FX_ASSETS.audio?.[key]?.path || '').trim();
  if(!src) return false;
  try{
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(()=>{});
    return true;
  }catch(e){
    return false;
  }
}

/* 鈹€鈹€ 鍩虹闊虫晥 鈹€鈹€ */
function sfxCoin(){
  // 鍗曟纭竵闊筹紙淇濈暀鍏煎锛?
  sfxCoinMulti(1);
}
function sfxCoinMulti(n){
  if(playConfiguredAudio('coin')) return;
  // n=纭竵鏁伴噺锛屽垎灞傛挱鏀撅細灞傛暟瓒婂闊虫晥瓒婂瘑闆?
  try{
    const ctx = getACtx();
    const count = Math.min(n, 20);
    // 姣忎釜纭竵闂撮殧鎾斁涓€涓煭淇冪殑鍙挌
    for(let i = 0; i < count; i++){
      const delay = i * 0.06; // 姣忔灇纭竵闂撮殧60ms
      const t = ctx.currentTime + delay;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      // 姣忔灇纭竵闊抽珮鐣ユ湁闅忔満鍙樺寲锛屽舰鎴愪赴瀵屾劅
      const baseFreq = 900 + Math.random() * 300;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.07);
      // 瓒婂纭竵鍗曚釜闊抽噺瓒婂皬锛堥伩鍏嶇垎闊筹級锛屾暣浣撴劅鐭ュ搷搴︿笉鍙?
      const vol = Math.max(0.08, 0.28 / Math.sqrt(count));
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t); osc.stop(t + 0.22);
    }
  }catch(e){}
}

function sfxHpLoss(){
  if(playConfiguredAudio('lose', 0.75)) return;
  // 浣庢矇鐨?蹇冪"闊虫晥锛氶檷棰?+ 婊氶檷
  try{
    const ac = getACtx();
    // 浣庢矇鎵撳嚮
    const o1 = ac.createOscillator();
    const g1 = ac.createGain();
    o1.type = "sawtooth";
    o1.frequency.setValueAtTime(220, ac.currentTime);
    o1.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.35);
    g1.gain.setValueAtTime(0.40, ac.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
    o1.connect(g1); g1.connect(ac.destination);
    o1.start(); o1.stop(ac.currentTime + 0.45);

    // 鐭績蹇冭烦鎰?
    const o2 = ac.createOscillator();
    const g2 = ac.createGain();
    o2.type = "sine";
    o2.frequency.setValueAtTime(440, ac.currentTime + 0.05);
    o2.frequency.exponentialRampToValueAtTime(220, ac.currentTime + 0.20);
    g2.gain.setValueAtTime(0.001, ac.currentTime + 0.05);
    g2.gain.linearRampToValueAtTime(0.28, ac.currentTime + 0.10);
    g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.30);
    o2.connect(g2); g2.connect(ac.destination);
    o2.start(ac.currentTime + 0.05); o2.stop(ac.currentTime + 0.35);
  } catch(e){}
}

function sfxBad(){
  if(playConfiguredAudio('bad', 0.76)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.3);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t); osc.stop(t + 0.35);
  }catch(e){}
}

function sfxButton(){
  if(playConfiguredAudio('button', 0.75)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t); osc.stop(t + 0.12);
  }catch(e){}
}

let _choiceHoverSoundAt = 0;
function sfxChoiceHover(){
  const now = Date.now();
  if(now - _choiceHoverSoundAt < 120) return;
  _choiceHoverSoundAt = now;
  if(playConfiguredAudio('button', 0.28)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(940, t + 0.06);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t); osc.stop(t + 0.12);
  }catch(e){}
}

function bindChoiceCardHover(cardEl){
  if(!cardEl) return;
  cardEl.addEventListener('mouseenter', ()=>{
    cardEl.classList.add('rewardPick-hover');
    sfxChoiceHover();
  });
  cardEl.addEventListener('mouseleave', ()=>{
    cardEl.classList.remove('rewardPick-hover');
  });
}

function sfxReveal(){
  if(playConfiguredAudio('reveal', 0.74)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.05);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t); osc.stop(t + 0.18);
  }catch(e){}
}

function sfxWin(){
  if(playConfiguredAudio('win', 0.84)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    const notes = [523,659,784,1047];
    notes.forEach((freq, i)=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const st = t + i * 0.1;
      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.25, st + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);
      osc.start(st); osc.stop(st + 0.45);
    });
  }catch(e){}
}

function sfxLose(){
  if(playConfiguredAudio('lose', 0.82)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    const notes = [392,349,311,262];
    notes.forEach((freq,i)=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const st = t + i * 0.12;
      gain.gain.setValueAtTime(0.20, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.4);
      osc.start(st); osc.stop(st + 0.4);
    });
  }catch(e){}
}

function sfxDeliverSubmit(){
  if(playConfiguredAudio('deliverSubmit', 0.86)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;
    [392, 523, 659].forEach((freq, i)=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.18, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.28);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.28);
    });
  }catch(e){}
}

function sfxCleanupSell(times = 1){
  if(playConfiguredAudio('coin', 0.68)) return;
  try{
    const ctx = getACtx();
    const n = Math.max(1, Math.min(8, Number(times || 1)));
    const t0 = ctx.currentTime;
    for(let i = 0; i < n; i++){
      const t = t0 + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(920, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.17);
    }
  }catch(e){}
}

function sfxForge(){
  if(playConfiguredAudio('coin', 0.72)) return;
  try{
    const ctx = getACtx();
    const t = ctx.currentTime;

    // 鍏堢粰涓€涓煭淇冣€滃彯鈥濓紝鍐嶅仛鏄庢樉涓婃壃锛岃惀閫犳儕鍠滃己鍖栨劅
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = "triangle";
    ping.frequency.setValueAtTime(980, t);
    ping.frequency.exponentialRampToValueAtTime(1220, t + 0.05);
    ping.connect(pingGain); pingGain.connect(ctx.destination);
    pingGain.gain.setValueAtTime(0.001, t);
    pingGain.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    ping.start(t); ping.stop(t + 0.18);

    const rise = ctx.createOscillator();
    const riseGain = ctx.createGain();
    const riseFilter = ctx.createBiquadFilter();
    riseFilter.type = "highpass";
    riseFilter.frequency.setValueAtTime(520, t + 0.04);
    rise.type = "sine";
    rise.frequency.setValueAtTime(760, t + 0.05);
    rise.frequency.exponentialRampToValueAtTime(1760, t + 0.30);
    rise.connect(riseFilter); riseFilter.connect(riseGain); riseGain.connect(ctx.destination);
    riseGain.gain.setValueAtTime(0.001, t + 0.04);
    riseGain.gain.exponentialRampToValueAtTime(0.16, t + 0.09);
    riseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
    rise.start(t + 0.04); rise.stop(t + 0.36);

    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = "square";
    sparkle.frequency.setValueAtTime(1800, t + 0.16);
    sparkle.frequency.exponentialRampToValueAtTime(2280, t + 0.28);
    sparkle.connect(sparkleGain); sparkleGain.connect(ctx.destination);
    sparkleGain.gain.setValueAtTime(0.001, t + 0.15);
    sparkleGain.gain.exponentialRampToValueAtTime(0.09, t + 0.20);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.31);
    sparkle.start(t + 0.15); sparkle.stop(t + 0.33);
  }catch(e){}
}

/* 鈹€鈹€ 璧屽満鑳屾櫙闊充箰锛堣交閲忓惊鐜級 鈹€鈹€ */
let _bgmNode = null;
let _bgmGain = null;
let _bgmOn = false;
let _bgmTimer = null;
let _bgmVoices = [];

function stopSynthBGM(){
  if(_bgmTimer){
    clearInterval(_bgmTimer);
    _bgmTimer = null;
  }
  _bgmVoices.forEach((node)=>{
    try{ node.stop?.(); }catch(e){}
    try{ node.disconnect?.(); }catch(e){}
  });
  _bgmVoices = [];
  if(_bgmGain){
    try{ _bgmGain.disconnect(); }catch(e){}
  }
  _bgmGain = null;
}

function playSynthTone(ctx, gainNode, freq, startAt, duration, type="sine", volume=0.05){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  osc.connect(gain);
  gain.connect(gainNode);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
  _bgmVoices.push(osc, gain);
}

function startSynthBGM(mode="menu"){
  stopSynthBGM();
  try{
    const ctx = getACtx();
    ctx.resume?.();
    _bgmGain = ctx.createGain();
    _bgmGain.gain.value = mode === "menu" ? 0.16 : 0.12;
    _bgmGain.connect(ctx.destination);
    const menuChords = [
      [220.00, 277.18, 329.63],
      [196.00, 246.94, 293.66],
      [174.61, 220.00, 261.63],
      [196.00, 246.94, 329.63]
    ];
    const gameChords = [
      [164.81, 207.65, 246.94],
      [174.61, 220.00, 261.63],
      [146.83, 196.00, 246.94],
      [155.56, 196.00, 233.08]
    ];
    const chords = mode === "menu" ? menuChords : gameChords;
    let step = 0;
    const tick = ()=>{
      if(!_bgmOn || !_bgmGain) return;
      const t = ctx.currentTime + 0.02;
      const chord = chords[step % chords.length];
      playSynthTone(ctx, _bgmGain, chord[0] / 2, t, 0.88, "triangle", 0.028);
      playSynthTone(ctx, _bgmGain, chord[0], t, 0.48, "sine", 0.04);
      playSynthTone(ctx, _bgmGain, chord[1], t + 0.08, 0.42, "sine", 0.032);
      playSynthTone(ctx, _bgmGain, chord[2], t + 0.16, 0.40, "sine", 0.028);
      step++;
    };
    tick();
    _bgmTimer = setInterval(tick, mode === "menu" ? 900 : 820);
  }catch(e){}
}



// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
//  姣忚疆寮€濮嬪墽鎯呯郴缁?
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
let _roundStoryShownForLevel = -1;
let _roundStoryResolve = null;

function showRoundStartStory(){
  if(_roundStoryShownForLevel === currentLevel) {
    return Promise.resolve();
  }
  _roundStoryShownForLevel = currentLevel;
  return new Promise(resolve=>{
    syncStageOverlayOffset();
    _roundStoryResolve = resolve;
    const lvl = getLvl();
    const titleEl = document.getElementById('roundStoryTitle');
    const subEl = document.getElementById('roundStorySub');
    const badgeEl = document.getElementById('roundStoryBadge');
    const slideEl = document.getElementById('roundStorySlide');
    const btnEl = document.getElementById('btnRoundStoryOk');
    const storyLines = getLevelStoryLines(lvl).filter(Boolean);
    if(titleEl) titleEl.textContent = getLevelStoryTitle(lvl);
    if(subEl) subEl.textContent = `第 ${lvl.round} / ${LEVELS.length} 轮`;
    if(badgeEl) badgeEl.textContent = `本轮开盘 ${lvl.opens} 次`;
    if(slideEl) slideEl.innerHTML = `
      <div class="roundInfoGrid" style="margin-bottom:16px;">
        <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">${lvl.opens}</div></div>
        <div class="rInfoBox"><div class="rInfoLabel">交付目标</div><div class="rInfoVal riGold">${lvl.target}</div></div>
      </div>
      <div class="roundStoryText">${storyLines.length ? storyLines.map(line=>`<div>${escapeHtml(line)}</div>`).join("") : '<span style="opacity:0.7;">本轮暂无额外剧情。</span>'}</div>
    `;
    if(btnEl) btnEl.textContent = '继续';
    const overlay = document.getElementById('roundStoryOverlay');
    if(overlay) overlay.style.display = 'flex';
    updateStageFlowState();
  });
}

function closeRoundStory(){
  const overlay = document.getElementById('roundStoryOverlay');
  if(overlay) overlay.style.display = 'none';
  updateStageFlowState();
  if(_roundStoryResolve){ _roundStoryResolve(); _roundStoryResolve = null; }
}

function setDecisionMode(active){
  document.body.classList.toggle('decision-open', !!active);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
//  姣忚疆缁撴潫缁撶畻 & 寮哄寲鏍囪閫夋嫨
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
let _roundEndResolve = null;

function settleRoundDelivery(){
  const lvl = getLvl();
  const submittedGold = Math.max(0, lvl.target);
  const beforeSubmit = money;
  money = Math.max(0, money - submittedGold);
  lastRoundDeliverySummary = {
    round: lvl.round,
    target: lvl.target,
    beforeSubmit,
    submittedGold,
    completedDeliveries: submittedGold > 0 ? 1 : 0,
    carryGold: money
  };
  sfxDeliverSubmit();
  renderTop();
  addHistoryItem({
    natural: `第 ${lvl.round} 轮完成 ${lastRoundDeliverySummary.completedDeliveries} 次交付，提交 <b>${submittedGold}</b> 金币，结转 <b>${money}</b> 金币`,
    title: '交付提交',
    delta: -submittedGold,
    good: true
  });
  return lastRoundDeliverySummary;
}

function showRoundEndOverlay(win){
  syncStageOverlayOffset();
  const lvl = getLvl();
  const titleEl = document.getElementById('roundEndTitle');
  const subEl = document.getElementById('roundEndSub');
  const badgeEl = document.getElementById('roundEndBadge');
  const bodyEl = document.getElementById('roundEndBody');
  const btnEl = document.getElementById('btnRoundEndOk');
  const doneArea = document.getElementById('roundEndContinueArea');

  if(titleEl) titleEl.textContent = `第 ${lvl.round} 轮 · 交付结算`;
  if(subEl) subEl.textContent = win ? '交付成功' : '交付失败';
  if(badgeEl) badgeEl.textContent = `第 ${lvl.round} / ${LEVELS.length} 轮`;

  const deliverySummary = lastRoundDeliverySummary;
  const deliveryInfo = deliverySummary
    ? `<div style="margin-top:10px;color:#ffc857;">本轮完成 <b>${deliverySummary.completedDeliveries}</b> 次交付，已提交 <b>${deliverySummary.submittedGold}</b> 金币，当前结转 <b>${deliverySummary.carryGold}</b> 金币。</div>`
    : "";

  if(bodyEl) bodyEl.innerHTML = `
    <div class="hFont" style="font-size:18px;margin-bottom:10px;"></div>
    ${deliveryInfo}
  `;

  if(btnEl){
    btnEl.textContent = '继续';
    btnEl.style.display = '';
  }

  const overlay = document.getElementById('roundEndOverlay');
  if(overlay) overlay.style.display = 'flex';
  updateStageFlowState();
}

function onRoundEndOk(){
  sfxDeliverSubmit();
  const overlay = document.getElementById('roundEndOverlay');
  if(overlay) overlay.style.display = 'none';
  updateStageFlowState();
  const lvl = getLvl();
  const fallbackPick = currentLevel < LEVELS.length - 1 ? 1 : 0;
  const reinforcePick = Math.max(fallbackPick, Number(lvl?.stratPick || 0));
  const reinforceShow = Math.max(reinforcePick, Number(lvl?.stratShow || 0), 3);
  const rewardPlan = { reinforcePick, reinforceShow };
  advanceToNextLevel(rewardPlan).catch(console.error);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
//  寮哄寲鏍囪閫夋嫨寮圭獥
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
let _reinforcePickRemaining = 0;
let _reinforceResolve = null;
let _reinforcePoolAvail = [];

function buildReinforceStone(marker){
  const stone = document.createElement("button");
  stone.type = "button";
  stone.className = "reinforceStone";
  stone.innerHTML = `
    <div class="stoneName hFont">${escapeHtml(marker.emoji || "馃")} ${escapeHtml(marker.name)}</div>
    <div class="stoneEff">${escapeHtml(marker.eff)}</div>
  `;
  return stone;
}

function applyReinforceMarker(card, marker){
  if(!card || !marker?.marker) return false;
  const cfg = marker.marker;
  const type = cfg.type;
  if(type === 'isolated'){
    if(hasKw(card, 'isolated')) return false;
    addKw(card, { type:'isolated' });
  } else if(type === 'innate'){
    if(hasKw(card, 'innate')) return false;
    addKw(card, { type:'innate' });
  } else if(type === 'crazy_up'){
    if(hasKw(card, 'crazy_up')) return false;
    const ex = getKw(card, 'crazy_up');
    if(ex) ex.ready = true;
    else addKw(card, { type:'crazy_up', ready:true });
  } else if(type === 'boost_up'){
    const add = 0.10 * Math.max(1, Number(cfg.value || 1));
    const ex = getKw(card, 'boost_up');
    if(ex) ex.value += add;
    else addKw(card, { type:'boost_up', value:add });
  } else if(type === 'insurance'){
    const add = Math.max(1, Number(cfg.value || 1));
    const ex = getKw(card, 'insurance');
    if(ex) ex.value += add;
    else addKw(card, { type:'insurance', value:add });
  } else if(type === 'price_up'){
    const add = Math.max(1, Number(cfg.value || 1));
    const ex = getKw(card, 'price_up');
    if(ex) ex.value += add;
    else addKw(card, { type:'price_up', value:add });
  } else if(type === 'leverage'){
    const add = Math.max(1, Number(cfg.value || 1));
    const ex = getKw(card, 'leverage');
    if(ex) ex.value += add;
    else addKw(card, { type:'leverage', value:add });
  } else if(type === 'demon_stock'){
    if(hasKw(card, 'demon_stock')) return false;
    const ex = getKw(card, 'demon_stock');
    if(ex) ex.value += 10;
    else addKw(card, { type:'demon_stock', value:10 });
  } else if(type === 'dividend'){
    const add = Math.max(1, Number(cfg.value || 1));
    const ex = getKw(card, 'dividend');
    if(ex) ex.count += add;
    else addKw(card, { type:'dividend', count:add });
  } else if(type === 'principal'){
    const add = Math.max(1, Number(cfg.value || 1));
    const ex = getKw(card, 'principal');
    if(ex) ex.value += add;
    else addKw(card, { type:'principal', value:add });
  }
  return true;
}

function showReinforceReward(pickCount, showCount){
  return new Promise(resolve=>{
    syncStageOverlayOffset();
    _reinforceResolve = resolve;
    _reinforcePickRemaining = pickCount;
    _reinforcePoolAvail = shuffle(REINFORCE_MARKERS).slice(0, Math.min(showCount, REINFORCE_MARKERS.length));

    renderReinforceRewardGrid();

    const titleEl = document.getElementById('reinforceRewardTitle');
    const subEl = document.getElementById('reinforceRewardSub');
    const pickLeftEl = document.getElementById('reinforcePickLeft');
    if(titleEl) titleEl.textContent = '4.0 强化阶段';
    if(subEl) subEl.textContent = "先选强化标记，再点击整张股票卡，最后确认强化。";
    if(pickLeftEl) pickLeftEl.textContent = _reinforcePickRemaining;
    reinforceEmbedMode = false;
    reinforcePeekMode = false;
    pendingReinforceMarker = null;
    pendingReinforceTargetId = null;
    document.body.classList.remove('reinforce-targeting-mode');
    document.body.classList.remove('reinforce-peek-mode');
    syncReinforceEmbedPanel();

    const skipBtn = document.getElementById('btnReinforceSkip');
    if(skipBtn){
      skipBtn.style.display = '';
      skipBtn.textContent = '跳过强化奖励';
    }

    const overlay = document.getElementById('reinforceRewardOverlay');
    if(overlay){
      overlay.style.display = 'flex';
      overlay.classList.remove('reinforce-peek');
    }
    updateStageFlowState();
    setDecisionMode(true);
  });
}

function renderReinforceRewardGrid(){
  const grid = document.getElementById('reinforceRewardGrid');
  if(!grid) return;
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(auto-fit, minmax(220px, 1fr))`;

  _reinforcePoolAvail.forEach((marker)=>{
    const cardEl = buildReinforceStone(marker);
    cardEl.addEventListener('click', ()=>{
      if(_reinforcePickRemaining <= 0) return;
      if(getAllBoardCards().length <= 0){
        addHistoryItem({ natural:'⚠️ 当前没有可强化的股票。', title:'强化失败', delta:0, good:false });
        return;
      }
      sfxButton();
      beginReinforceEmbed(marker);
    });
    grid.appendChild(cardEl);
  });
}

function skipReinforceReward(){
  sfxButton();
  reinforceEmbedMode = false;
  reinforcePeekMode = false;
  pendingReinforceMarker = null;
  pendingReinforceTargetId = null;
  document.body.classList.remove('reinforce-targeting-mode');
  document.body.classList.remove('reinforce-peek-mode');
  syncReinforceEmbedPanel();
  const overlay = document.getElementById('reinforceRewardOverlay');
  if(overlay){
    overlay.style.display = 'none';
    overlay.classList.remove('reinforce-peek');
  }
  updateStageFlowState();
  setDecisionMode(false);
  renderRevealSnapshot();
  if(_reinforceResolve){ _reinforceResolve(); _reinforceResolve = null; }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
//  鎺ㄨ繘鍒颁笅涓€鍏冲崱
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
async function advanceToNextLevel(rewardPlan = null){
  currentLevel++;
  if(currentLevel >= LEVELS.length){
    endRun(true);
    return;
  }

  const lvl = getLvl();
  openCount = 0;
  round = lvl.round;
  lastRoundDeliverySummary = null;
  awaitingStarter = false; // 闈炵1杞紝涓嶉渶瑕佺瓑寰?starter
  runEnded = false;
  // 娉ㄦ剰锛歮oney 涓嶉噸缃紙绱Н鍒讹級
  // 姣忚疆寮€濮嬫椂澶勭悊绾㈠埄鎭㈠
  getAllBoardCards().forEach(a=>{
    if(a.keywords){
      a.keywords.forEach(kw=>{
        if(kw.type === 'dividend_regen'){
          const dKw = a.keywords.find(k=>k.type==='dividend');
          if(dKw && dKw.count < kw.max) dKw.count++;
        }
      });
    }
  });

  renderTop();
  renderLeft();
  running = false;
  renderBoardGrid();
  updateOpenAvailability();

  addHistoryItem({
    natural:`第 ${lvl.round} 轮开始，目标 ${lvl.target}，开盘 ${lvl.opens} 次`,
    title:`第 ${lvl.round} 轮`, delta:0, good:true
  });

  // 鏄剧ず鏈疆鍓ф儏
  if(_bgmToggle) startBGM();
  await showRoundStartStory();
  if(rewardPlan?.reinforcePick > 0){
    await showReinforceReward(rewardPlan.reinforcePick, rewardPlan.reinforceShow);
  }
  if(rewardPlan){
    await showReward();
  }
  // 纭繚 btnOpen 鍙偣鍑?
  updateOpenAvailability();
}


let _bgmAudio = null;

function getGameMusicTracks(level = getLvl()){
  return [];
}

function playCurrentRoundBgm(){
  if(!_bgmOn) return;
  const tracks = getGameMusicTracks();
  stopBGM();
  _bgmOn = true;
  if(!tracks.length){
    startSynthBGM(gamePage.style.display === "block" ? "game" : "menu");
    return;
  }
  const src = tracks[Math.floor(Math.random() * tracks.length)];
  try{
    _bgmAudio = new Audio(src);
    _bgmAudio.loop = false;
    _bgmAudio.volume = 0.45;
    _bgmAudio.play().catch(()=>{
      stopBGM();
      _bgmOn = true;
      startSynthBGM(gamePage.style.display === "block" ? "game" : "menu");
    });
  }catch(e){
    startSynthBGM(gamePage.style.display === "block" ? "game" : "menu");
  }
}

function startBGM(){
  _bgmOn = true;
  playCurrentRoundBgm();
}

function stopBGM(){
  stopSynthBGM();
  if(_bgmAudio){
    try{
      _bgmAudio.pause();
      _bgmAudio.currentTime = 0;
    }catch(e){}
  }
  _bgmAudio = null;
  _bgmOn = false;
}

/* BGM toggle button */
let _bgmToggle = false;
function toggleBGM(){
  _bgmToggle = !_bgmToggle;
  const btn = document.getElementById("bgmBtn");
  if(_bgmToggle){
    startBGM();
    if(btn) btn.textContent = "🎰 背景音乐";
  } else {
    stopBGM();
    if(btn) btn.textContent = "🔇 背景音乐";
  }
}

function buildPoolCard(card){
  const slot = document.createElement("div");
  slot.className = "boardPoolCard";
  slot.dataset.row = String(card.rowIndex ?? 0);
  slot.dataset.col = String(card.colIndex ?? 0);
  if(cleanupMode) slot.classList.add("cleanupMode");
  if(reinforceEmbedMode) slot.classList.add("embedTargetable");
  if(reinforceEmbedMode && pendingReinforceTargetId === card.id) slot.classList.add("embedSelected");

  const tile = mkLogoTile(card);
  tile.addEventListener("mousemove", (e)=> showTooltip(card, e.clientX, e.clientY));
  tile.addEventListener("mouseleave", hideTooltip);
  tile.addEventListener("click", (e)=>{
    e.stopPropagation();
    if(reinforceEmbedMode){
      selectReinforceTarget(card.id);
      return;
    }
    if(cleanupMode){
      liquidateAssetCard(card.id, "manual");
      updateOpenAvailability();
      renderBoardGrid();
    }
  });
  slot.appendChild(tile);

  const name = document.createElement("div");
  name.className = "boardCardName hFont";
  name.textContent = card.name;
  slot.appendChild(name);

  const meta = document.createElement("div");
  meta.className = "boardCardMeta";
  const markers = getCardMarkers(card);
  markers.slice(0, 2).forEach((kw)=>{
    const span = document.createElement("span");
    span.className = "boardStatBadge";
    span.textContent = markerLabel(kw);
    meta.appendChild(span);
  });
  if(cardNetEarnings[card.id] !== undefined){
    const net = document.createElement("span");
    const val = Number(cardNetEarnings[card.id] || 0);
    net.className = `boardStatBadge boardNetBadge ${val >= 0 ? "up" : "down"}`;
    net.textContent = `本局 ${val >= 0 ? "+" : ""}${val}`;
    meta.appendChild(net);
  }
  if(meta.childElementCount) slot.appendChild(meta);
  return slot;
}

function renderOpenBoardGrid(picked){
  renderBoardGrid();
}

function applyStaticUiCopy(){
  const menuSub = document.querySelector("#menuPage .menuSub");
  if(menuSub) menuSub.textContent = "3 行资金池，选好角色就直接开局。";

  const roleHeader = document.querySelector("#rolePage .roleHeader");
  if(roleHeader){
    roleHeader.innerHTML = `
      <div>
        <div class="hFont roleSelectTitle">选择操盘风格</div>
        <div class="roleSelectSub">点击角色卡后直接开局</div>
      </div>
    `;
  }

  const roleNextBtn = document.getElementById("btnRoleNext");
  if(roleNextBtn){
    roleNextBtn.style.display = "none";
    roleNextBtn.disabled = true;
  }

  const starterTitle = document.querySelector("#starterOverlay .rewardHeader .h");
  const starterSub = document.querySelector("#starterOverlay .rewardHeader .s");
  const starterBadge = document.querySelector("#starterOverlay .rewardHeader > .s:last-child");
  if(starterTitle) starterTitle.textContent = "开局资产入池";
  if(starterSub) starterSub.textContent = "固定发放 3 张“小型水电站”，开局自动落在普通池。";
  if(starterBadge) starterBadge.textContent = "初始配置";

  const starterBtn = document.getElementById("btnStarterOk");
  if(starterBtn) starterBtn.textContent = "直接开盘";

  const poolLegend = document.querySelector(".boardPoolLegend");
  if(poolLegend) poolLegend.style.display = "none";
}

function showStarterPack(){
  awaitingStarter = true;
  runEnded = false;
  placementQueue = [];
  starterPlacementPending = false;
  btnOpen.disabled = true;

  if(!starterOverlay || !starterGrid || !btnStarterOk){
    awaitingStarter = false;
    btnOpen.disabled = false;
    return;
  }

  const starterName = "小型水电站";
  const starters = Array.from({ length: 3 }, (_, index)=>{
    const baseCard = createCardByName(starterName);
    return cloneCardInstance(baseCard || {
      id: `starter_fallback_${index}`,
      name: starterName,
      category: "电力股",
      up: 2,
      down: 0,
      eff: "固有1",
      keywords: [{ type: "boost_up", value: 0.10 }]
    }, "start");
  });

  const starterTitle = document.querySelector("#starterOverlay .rewardHeader .h");
  const starterSub = document.querySelector("#starterOverlay .rewardHeader .s");
  const starterBadge = document.querySelector("#starterOverlay .rewardHeader > .s:last-child");
  if(starterTitle) starterTitle.textContent = "4.0 开局发放";
  if(starterSub) starterSub.textContent = "先确认起手股票，再把它们放进资金池。";
  if(starterBadge) starterBadge.textContent = "固定 3 张";

  starterGrid.innerHTML = "";
  starterGrid.style.gridTemplateColumns = `repeat(${starters.length}, minmax(0, 1fr))`;
  starters.forEach((card)=>{
    const cardEl = buildHsCard(card);
    cardEl.classList.remove("rewardPick");
    cardEl.classList.add("starterShowcaseCard");
    cardEl.addEventListener("mousemove", (e)=> showTooltip(card, e.clientX, e.clientY));
    cardEl.addEventListener("mouseleave", hideTooltip);
    starterGrid.appendChild(cardEl);
  });

  btnStarterOk.textContent = "确认起手股";
  starterOverlay.style.display = "flex";
  updateStageFlowState();

  btnStarterOk.onclick = ()=>{
    placementQueue = starters.slice();
    starterPlacementPending = placementQueue.length > 0;
    awaitingStarter = placementQueue.length > 0;
    addHistoryItem({
      title:"开局发放",
      natural:`确认起手股票，获得 <b>${starters.length}</b> 张 <b>${escapeHtml(starterName)}</b>，请依次放入资金池`,
      delta:0,
      good:true
    });
    starterOverlay.style.display = "none";
    updateStageFlowState();
    hideTooltip();
    renderBoardGrid();
    renderTop();
    renderLeft();
    updateOpenAvailability();
  };
}

function makeStarterOpeningCard(def, index){
  const baseCard = createCardByName(def.name);
  const fallback = {
    id: `starter_opening_${index}`,
    name: def.name,
    rarity: Number(def.rarity || 1),
    category: def.category || "新手股",
    up: Number(def.up || 0),
    down: Number(def.down || 0),
    eff: def.eff || "无",
    color: "#63d6ff",
    keywords: []
  };
  const seeded = cloneCardInstance(baseCard || fallback, "starter");
  seeded.name = def.name;
  seeded.category = def.category || seeded.category;
  seeded.rarity = Number(def.rarity || seeded.rarity || 1);
  seeded.up = Number(def.up ?? seeded.up ?? 0);
  seeded.down = Number(def.down ?? seeded.down ?? 0);
  seeded.eff = def.eff || seeded.eff || "无";
  seeded.displayEffectText = def.displayEffectText || seeded.displayEffectText || seeded.eff || "无";
  seeded.keywords = Array.isArray(def.keywords) ? def.keywords.map((kw)=>({ ...kw })) : [];
  seeded.color = (V40_POOL_LIBRARY?.[def.poolType] || {}).color || seeded.color || "#63d6ff";
  return seeded;
}

function seedFirstRoundStarterBoard(){
  resetBoardState();
  STARTER_OPENING_CARDS.forEach((def, index)=>{
    const rowIndex = BOARD_ROWS.findIndex((row)=>row.type === def.poolType);
    if(rowIndex < 0) return;
    placeCardIntoRow(makeStarterOpeningCard(def, index), rowIndex);
  });
  placementQueue = [];
  starterPlacementPending = false;
  awaitingStarter = false;
  if(starterOverlay) starterOverlay.style.display = "none";
  updateStageFlowState();
  addHistoryItem({
    title:"新手起手盘",
    natural:"本局固定入池：<b>新手礼盒</b>、<b>新手赠股</b>、<b>新手保险</b>。",
    delta:0,
    good:true
  });
  renderTop();
  renderLeft();
  renderBoardGrid();
  updateOpenAvailability();
}

function clearRevealGrid(){
  renderBoardGrid();
}

function renderRevealSnapshot(){
  renderBoardGrid();
}

function updateOpenAvailability(){
  const hasAnyBoardCard = getAllBoardCards().length > 0;
  const blocked = runEnded || running || openCount >= getDeliveryOpens() || awaitingStarter || !hasAnyBoardCard;
  if(btnOpen) btnOpen.disabled = blocked;

  if(placementHintEl){
    if(cleanupMode){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "清仓模式已开启，点击池内股票即可卖出腾位。";
    }else{
      placementHintEl.style.display = "none";
      placementHintEl.innerHTML = "";
    }
  }

  if(hallCleanupBtn){
    hallCleanupBtn.classList.toggle("active", cleanupMode);
    hallCleanupBtn.textContent = cleanupMode ? "退出清仓" : "清仓模式";
  }
}

function getOpenVisualCells(){
  const cells = [];
  for(let rowIndex = 0; rowIndex < BOARD_ROWS.length; rowIndex++){
    for(let colIndex = 0; colIndex < BOARD_COLS; colIndex++){
      cells.push(revealGridEl?.querySelector(`.boardPoolCard[data-row="${rowIndex}"][data-col="${colIndex}"]`) || null);
    }
  }
  return cells;
}

function renderBoardGrid(){
  if(!revealGridEl) return;
  revealGridEl.innerHTML = "";
  revealGridEl.classList.remove("revealGrid-openPhase");

  for(let rowIndex = 0; rowIndex < BOARD_ROWS.length; rowIndex++){
    const rowCfg = BOARD_ROWS[rowIndex];
    const rowEl = document.createElement("section");
    rowEl.className = `boardRow boardPoolRow boardPoolRow-${rowCfg.type}`;

    const head = document.createElement("div");
    head.className = "boardRowHead";

    const left = document.createElement("div");
    left.className = "boardPoolMeta";
    const badge = document.createElement("div");
    badge.className = "boardRowBadge";
    badge.textContent = rowCfg.label;
    const effect = document.createElement("div");
    effect.className = "boardPoolEffect";
    effect.textContent = rowCfg.effect;
    left.appendChild(badge);
    left.appendChild(effect);
    const count = document.createElement("div");
    count.className = "boardRowCount boardRowCount-left";
    count.textContent = `${boardRows[rowIndex].length} / ${BOARD_COLS}`;
    left.appendChild(count);

    const right = document.createElement("div");
    right.className = "boardPoolAction";

    if(placementQueue.length && canPlaceIntoRow(rowIndex)){
      const placeBtn = document.createElement("button");
      placeBtn.type = "button";
      placeBtn.className = "poolPlaceBtn hFont";
      placeBtn.textContent = `放入 ${getPendingPlacementCard()?.name || "新股票"}`;
      placeBtn.addEventListener("click", (e)=>{
        e.stopPropagation();
        placePendingCardToRow(rowIndex);
      });
      right.appendChild(placeBtn);
    }

    head.appendChild(left);
    head.appendChild(right);
    rowEl.appendChild(head);

    const track = document.createElement("div");
    track.className = "boardRowTrack boardPoolTrack";
    boardRows[rowIndex].forEach((card)=>track.appendChild(buildPoolCard(card)));

    if(boardRows[rowIndex].length === 0){
      const state = document.createElement("div");
      state.className = "boardPoolState";
      state.textContent = placementQueue.length && canPlaceIntoRow(rowIndex) ? "等待新股票入池" : "当前池内暂无股票";
      track.appendChild(state);
    }

    rowEl.appendChild(track);
    revealGridEl.appendChild(rowEl);
  }

  updateOpenAvailability();
}

const _startOpenOriginal = startOpen;
startOpen = async function(){
  if(running) return;
  sfxButton();
  if(runEnded) return;
  if(awaitingStarter) return;
  if(openCount >= getDeliveryOpens()) return;

  running = true;
  btnOpen.disabled = true;
  hideTooltip();
  openCount++;
  renderTop();
  showReward._prevMoney = money;

  clearRevealGrid();
  lastRevealSnapshot = new Array(BOARD_ROWS.length * BOARD_COLS).fill(null);
  lastRevealHintState = null;

  const picked = buildOpenSelection();
  const cells = getOpenVisualCells();
  const totalSlots = BOARD_ROWS.length * BOARD_COLS;
  const outcomes = new Array(totalSlots).fill(null);
  const carryBoostArr = new Array(totalSlots).fill(0);
  const carryPriceArr = new Array(totalSlots).fill(0);
  const carryDownArr = new Array(totalSlots).fill(0);
  let carryBoost = 0;
  let carryPrice = 0;
  let carryDown = 0;

  for(let i=0;i<totalSlots;i++){
    const card = picked[i];
    if(!card) continue;
    if(hasKw(card, "isolated")) continue;
    const col = i % BOARD_COLS;
    const prevUp = col > 0 && outcomes[i-1] === true;
    carryBoostArr[i] = carryBoost;
    carryPriceArr[i] = carryPrice;
    carryDownArr[i] = carryDown;
    const up = rollOutcome(card, { index:i, prevUp, carryBoost });
    outcomes[i] = up;
    if(!Array.isArray(card.keywords)) continue;
    if(up){
      card.keywords.forEach((kw)=>{
        if(kw.type === "after_up_boost_next") carryBoost += Number(kw.value || 0);
        if(kw.type === "after_up_price_next") carryPrice += Number(kw.value || 0);
      });
    }else{
      card.keywords.forEach((kw)=>{
        if(kw.type === "after_down_insurance_next") carryDown += Number(kw.value || 0);
      });
    }
  }

  for(let i=0;i<totalSlots;i++){
    const card = picked[i];
    if(!card){
      lastRevealSnapshot[i] = { card:null, up:false, delta:0 };
      continue;
    }
    if(hasKw(card, "isolated")){
      lastRevealSnapshot[i] = { card, up:false, delta:0 };
      continue;
    }

    await sleep(180);
    const up = outcomes[i] === true;
    const colIdx = i % BOARD_COLS;
    const deltaRaw = payoutOf(card, up, {
      index: i,
      picked,
      outcomes,
      prevUp: colIdx > 0 && outcomes[i-1] === true,
      prevDown: colIdx > 0 && outcomes[i-1] === false,
      carryPrice: carryPriceArr[i],
      carryDown: carryDownArr[i]
    });

    money += deltaRaw;
    if(cardNetEarnings[card.id] === undefined) cardNetEarnings[card.id] = 0;
    cardNetEarnings[card.id] += deltaRaw;
    card.lastOpenTrend = up ? "up" : "down";

    moneyEl.textContent = money;
    money2El.textContent = money;
    money2El.style.color = money < 0 ? "#ff4060" : money >= getTarget() ? "#ffd060" : "";
    money2El.style.textShadow = money < 0 ? "0 0 12px rgba(255,64,96,0.70)" : money >= getTarget() ? "0 0 14px rgba(255,200,60,0.65)" : "";
    renderProgress(deltaRaw);
    markCard(card.id, up ? "up" : "down", deltaRaw);

    const cell = cells[i];
    if(cell){
      cell.classList.remove("mark-up","mark-down");
      cell.classList.add("revealed", up ? "bad" : "good", up ? "mark-up" : "mark-down", "reveal-pop");
      setTimeout(()=>cell.classList.remove("reveal-pop"), 260);
    }
    captureRevealCell(i, card, up, deltaRaw);

    const triggerEvents = collectTriggeredRuleEvents(card, up, {
      index: i,
      picked,
      prevUp: (i % BOARD_COLS) > 0 && outcomes[i-1] === true,
      prevDown: (i % BOARD_COLS) > 0 && outcomes[i-1] === false,
      outcomes
    });
    triggerEvents.forEach((event, eventIndex)=>setTimeout(()=>showRuleTriggerFx(event), eventIndex * 140));

    if(deltaRaw > 0){
      spawnCoins(cell, deltaRaw);
      sfxCoinMulti(Math.min(deltaRaw, 20));
      await sleep(Math.min(deltaRaw, 20) * 35 + 120);
    }else if(deltaRaw < 0){
      spawnCoins(cell, deltaRaw);
      sfxBad();
      await sleep(220);
    }else{
      sfxReveal();
      await sleep(120);
    }

    addHistoryItem({
      natural: `<span style="color:${up ? "#ff6070" : "#2dff9a"};">${up ? "📈 涨" : "📉 跌"}</span> <b>${escapeHtml(card.name)}</b> <span style="color:#fbbf24;font-weight:900;">${deltaRaw >= 0 ? "+" : ""}${deltaRaw}</span>`, 
      title: card.name,
      delta: deltaRaw,
      good: deltaRaw >= 0
    });
    settleOneCardKeywords(card, up);
  }

  await sleep(500);
  renderBoardGrid();

  if(openCount >= getDeliveryOpens()){
    deliveryStateEl.textContent = "已交付";
    deliveryStateEl.style.color = "#b6ffb6";
    const lvl = getLvl();
    const win = (money >= lvl.target);
    addHistoryItem({
      natural: win
        ? `第 ${lvl.round} 轮交付成功，累计资金 ${money} >= ${lvl.target}`
        : `第 ${lvl.round} 轮交付失败，累计资金 ${money} < ${lvl.target}`,
      title: win ? "交付成功" : "交付失败",
      delta:0,
      good:win
    });
    running = false;
    if(!win){
      endRun(false);
      return;
    }
    if(currentLevel >= LEVELS.length - 1){
      settleRoundDelivery();
      endRun(true);
      return;
    }
    settleRoundDelivery();
    showRoundEndOverlay(win);
    return;
  }

  await showReward();
  round++;
  renderTop();
  renderLeft();
  running = false;
  renderBoardGrid();
  updateOpenAvailability();
};

LEVELS.forEach((lvl, index)=>{
  if(index === 0){
    const currentSuffix = String(lvl.storySuffix || "").trim();
    lvl.storySuffix = (!currentSuffix || currentSuffix === "入职报到") ? "首轮试盘" : currentSuffix;
    if(String(lvl.storyLine3 || "").includes("5 张")) lvl.storyLine3 = "";
  }
  normalizeLevelStory(lvl);
});

window.addEventListener("load", ()=>{
  applyStaticUiCopy();
  if(!_bgmToggle){
    _bgmToggle = true;
    startBGM();
    const btn = document.getElementById("bgmBtn");
    if(btn) btn.textContent = "🎰 背景音乐";
  }
});

function ensureAudioUnlocked(){
  if(!_bgmToggle) return;
  try{
    const ctx = getACtx();
    ctx.resume?.();
  }catch(e){}
  startBGM();
  const btn = document.getElementById("bgmBtn");
  if(btn) btn.textContent = "🎰 背景音乐";
}

window.addEventListener("pointerdown", ensureAudioUnlocked, { once:true });

function spawnCoins(container, delta){
  if(!container) return;
  const abs = Math.abs(delta);
  if(delta > 0){
    const bigCoin = document.createElement("div");
    bigCoin.className = "coinParticle coinBig";
    bigCoin.textContent = "🪙";
    bigCoin.style.left = "50%";
    bigCoin.style.top = "50%";
    bigCoin.style.setProperty("--cx", "0px");
    bigCoin.style.setProperty("--cy", "-70px");
    bigCoin.style.setProperty("--cr", "20deg");
    container.appendChild(bigCoin);
    setTimeout(()=>bigCoin.remove(), 1100);
    const n = Math.min(abs, 20);
    for(let i = 0; i < n; i++){
      const coin = document.createElement("div");
      coin.className = "coinMulti";
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist = 40 + Math.random() * 70;
      const cmx = Math.round(Math.cos(angle) * dist);
      const cmy = Math.round(Math.sin(angle) * dist - 20);
      const cmr = Math.round((Math.random() - 0.5) * 120) + "deg";
      coin.textContent = "🪙";
      coin.style.left = (30 + Math.random() * 40) + "%";
      coin.style.top = (30 + Math.random() * 40) + "%";
      coin.style.setProperty("--cmx", cmx + "px");
      coin.style.setProperty("--cmy", cmy + "px");
      coin.style.setProperty("--cmr", cmr);
      coin.style.animationDuration = (0.65 + Math.random() * 0.55).toFixed(2) + "s";
      container.appendChild(coin);
      setTimeout(()=>coin.remove(), 1300);
    }
  }else if(delta < 0){
    const n = Math.min(abs, 8);
    for(let i = 0; i < n; i++){
      const dust = document.createElement("div");
      dust.className = "coinDust";
      dust.style.left = (30 + Math.random() * 40) + "%";
      dust.style.top = (35 + Math.random() * 30) + "%";
      container.appendChild(dust);
      setTimeout(()=>dust.remove(), 900);
    }
  }
}

function showRoundStartStory(){
  if(_roundStoryShownForLevel === currentLevel) return Promise.resolve();
  _roundStoryShownForLevel = currentLevel;
  return new Promise(resolve=>{
    syncStageOverlayOffset();
    _roundStoryResolve = resolve;
    const lvl = getLvl();
    const titleEl = document.getElementById("roundStoryTitle");
    const subEl = document.getElementById("roundStorySub");
    const badgeEl = document.getElementById("roundStoryBadge");
    const slideEl = document.getElementById("roundStorySlide");
    const btnEl = document.getElementById("btnRoundStoryOk");
    const storyLines = getLevelStoryLines(lvl)
      .filter(Boolean)
      .filter((line)=>!String(line).includes("5 张"));

    if(titleEl) titleEl.textContent = getLevelStoryTitle(lvl);
    if(subEl) subEl.textContent = `第 ${lvl.round} / ${LEVELS.length} 轮`;
    if(badgeEl) badgeEl.textContent = `本轮开盘 ${lvl.opens} 次`;
    if(slideEl) slideEl.innerHTML = `
      <div class="roundInfoGrid" style="margin-bottom:16px;">
        <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">${lvl.opens}</div></div>
        <div class="rInfoBox"><div class="rInfoLabel">交付目标</div><div class="rInfoVal riGold">${lvl.target}</div></div>
      </div>
      <div class="roundStoryText">${storyLines.length ? storyLines.map(line=>`<div>${escapeHtml(line)}</div>`).join("") : '<span style="opacity:0.7;">本轮暂无额外剧情。</span>'}</div>
    `;
    if(btnEl) btnEl.textContent = "继续";
    const overlay = document.getElementById("roundStoryOverlay");
    if(overlay) overlay.style.display = "flex";
    updateStageFlowState();
  });
}

function renderBoardGrid(){
  if(!revealGridEl) return;
  revealGridEl.innerHTML = "";
  revealGridEl.classList.remove("revealGrid-openPhase");

  for(let rowIndex = 0; rowIndex < BOARD_ROWS.length; rowIndex++){
    const rowCfg = BOARD_ROWS[rowIndex];
    const rowHasSpace = canPlaceIntoRow(rowIndex);
    const rowEl = document.createElement("section");
    rowEl.className = `boardRow boardPoolRow boardPoolRow-${rowCfg.type}`;
    if(placementQueue.length && rowHasSpace) rowEl.classList.add("boardRow-dropReady");

    const head = document.createElement("div");
    head.className = "boardRowHead";

    const left = document.createElement("div");
    left.className = "boardPoolMeta";
    const badge = document.createElement("div");
    badge.className = "boardRowBadge";
    badge.textContent = rowCfg.label;
    const effect = document.createElement("div");
    effect.className = "boardPoolEffect";
    effect.textContent = rowCfg.effect;
    const count = document.createElement("div");
    count.className = "boardRowCount boardRowCount-left";
    count.textContent = `${boardRows[rowIndex].length} / ${BOARD_COLS}`;
    left.appendChild(badge);
    left.appendChild(effect);
    left.appendChild(count);

    if(placementQueue.length && rowHasSpace){
      const action = document.createElement("div");
      action.className = "boardPoolAction";
      const placeBtn = document.createElement("button");
      placeBtn.type = "button";
      placeBtn.className = "poolPlaceBtn hFont";
      placeBtn.textContent = `放入 ${getPendingPlacementCard()?.name || "待入池股票"}`;
      placeBtn.addEventListener("click", (e)=>{
        e.stopPropagation();
        placePendingCardToRow(rowIndex);
      });
      action.appendChild(placeBtn);
      left.appendChild(action);
      rowEl.addEventListener("click", ()=>placePendingCardToRow(rowIndex));
    }

    head.appendChild(left);
    rowEl.appendChild(head);

    const track = document.createElement("div");
    track.className = "boardRowTrack boardPoolTrack";
    boardRows[rowIndex].forEach((card)=>{
      track.appendChild(buildPoolCard(card));
    });
    if(boardRows[rowIndex].length === 0){
      const state = document.createElement("div");
      state.className = "boardPoolState";
      state.textContent = placementQueue.length && rowHasSpace ? "等待新股票入池" : "当前池内暂无股票";
      track.appendChild(state);
    }
    rowEl.appendChild(track);
    revealGridEl.appendChild(rowEl);
  }
  updateOpenAvailability();
}

function clearRevealGrid(){
  renderBoardGrid();
}

function renderRevealSnapshot(){
  renderBoardGrid();
}

function updateOpenAvailability(){
  const hasAnyBoardCard = getAllBoardCards().length > 0;
  const blocked = runEnded || running || openCount >= getDeliveryOpens() || awaitingStarter || !hasAnyBoardCard;
  if(btnOpen) btnOpen.disabled = blocked;

  if(placementHintEl){
    if(cleanupMode){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "?????????????????????";
    }else{
      placementHintEl.style.display = "none";
      placementHintEl.innerHTML = "";
    }
  }

  if(hallCleanupBtn){
    hallCleanupBtn.classList.toggle("active", cleanupMode);
    hallCleanupBtn.textContent = cleanupMode ? "????" : "????";
  }
}

/* 鈹€鈹€ 闊虫晥閽╁瓙娉ㄥ叆 鈹€鈹€ */


/* 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
 *  鏂版墜鏁欑▼寮曞绯荤粺
 * 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲 */

const TUTORIAL_STORAGE_KEY = 'luckyStock_tutorial_done';
const TUTORIAL_ENABLED_KEY = 'luckyStock_tutorial_enabled';
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialHighlight = document.getElementById('tutorialHighlight');
const tutorialBubble = document.getElementById('tutorialBubble');
const tutorialTitleEl = document.getElementById('tutorialTitle');
const tutorialBodyEl = document.getElementById('tutorialBody');
const tutorialBtnNext = document.getElementById('tutorialBtnNext');
const tutorialBtnSkip = document.getElementById('tutorialBtnSkip');
const tutorialDontShowAgain = document.getElementById('tutorialDontShowAgain');
const tutorialStepDots = document.getElementById('tutorialStepDots');
const tutorialToggleBtn = document.getElementById('tutorialToggleBtn');

/* ===== 鏁欑▼寮€鍏筹紙棣栭〉鎸夐挳锛?===== */
function isTutorialEnabled() {
  try {
    const v = localStorage.getItem(TUTORIAL_ENABLED_KEY);
    if (v === null) return true; // 首次进入默认开启
    return v === '1';
  } catch(e) { return true; } // 出错时默认开启
}

function setTutorialEnabled(on) {
  try { localStorage.setItem(TUTORIAL_ENABLED_KEY, on ? '1' : '0'); } catch(e) {}
}

function syncTutorialToggleBtn() {
  if (!tutorialToggleBtn) return;
  if (isTutorialEnabled()) {
    tutorialToggleBtn.textContent = '📖 新手教程：开';
    tutorialToggleBtn.style.opacity = '1';
  } else {
    tutorialToggleBtn.textContent = '📖 新手教程：关';
    tutorialToggleBtn.style.opacity = '0.5';
  }
}

function toggleTutorialSetting() {
  const next = !isTutorialEnabled();
  setTutorialEnabled(next);
  syncTutorialToggleBtn();
}

let _tutorialSteps = [];
let _tutorialStepIdx = 0;
let _tutorialActive = false;

/* 寮曞姝ラ瀹氫箟 */
function getTutorialSteps() {
  return [
    {
      id: 'role',
      title: '1. 先选角色',
      body: '点击一张角色卡直接开局。<br><br><b>炒股小白</b> 更稳，<b>稳健中产</b> 开局多 3 金币。',
      target: () => document.querySelector('#rolePage .roleCard'),
      position: 'bottom',
      pageCheck: () => document.getElementById('rolePage')?.style.display !== 'none'
    },
    {
      id: 'starter',
      title: '2. 先收开局股',
      body: '确认开局发放后，你会拿到本局起手股票。<br><br>它们会进入待落位区，稍后要放进资金池里。',
      target: () => document.getElementById('starterOverlay'),
      position: 'bottom',
      pageCheck: () => document.getElementById('starterOverlay')?.style.display !== 'none'
    },
    {
      id: 'trade',
      title: '3. 再选交易卡',
      body: '每轮开始先处理 <b>1 张交易卡</b>。<br><br>第 1 轮免费，交易卡只改盘面方向，不会替你自动补股。',
      target: () => document.getElementById('tradeCardOverlay'),
      position: 'top',
      pageCheck: () => document.getElementById('tradeCardOverlay')?.style.display !== 'none'
    },
    {
      id: 'board-pool',
      title: '4. 把股票放进池里',
      body: '<b>普通池</b> 无额外效果。<br><b>助涨池</b> 上涨概率额外 +10%。<br><b>保险池</b> 下跌时额外 +1。<br><br>首轮股票已自动入池，交易卡和开盘都直接围绕这 3 个池来做。',
      target: () => document.querySelector('.boardPoolRow-normal'),
      position: 'right',
      pageCheck: () => document.getElementById('gamePage')?.style.display !== 'none'
    },
    {
      id: 'open-btn',
      title: '5. 然后开盘',
      body: '待落位清空后，点击 <b>开盘</b>。<br><br>股票会按当前所在资金池结算涨跌和收益。',
      target: () => document.getElementById('btnOpen'),
      position: 'top',
      pageCheck: () => document.getElementById('gamePage')?.style.display !== 'none' && !document.getElementById('btnOpen')?.disabled
    },
    {
      id: 'reinforce',
      title: '6. 交付后做强化',
      body: '交付成功后会进入 <b>强化阶段</b>。<br><br>先选强化标记，再点盘面里的目标股票，最后确认强化。',
      target: () => document.getElementById('reinforceRewardOverlay'),
      position: 'top',
      pageCheck: () => document.getElementById('reinforceRewardOverlay')?.style.display !== 'none'
    }
  ];
}

function isTutorialDone() {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === '1' || !isTutorialEnabled();
  } catch(e) { return !isTutorialEnabled(); }
}

function markTutorialDone() {
  try { localStorage.setItem(TUTORIAL_STORAGE_KEY, '1'); } catch(e) {}
}

function showTutorial() {
  if (isTutorialDone()) return;
  _tutorialSteps = getTutorialSteps();
  _tutorialStepIdx = findFirstValidStep();
  if (_tutorialStepIdx >= _tutorialSteps.length) return;

  _tutorialActive = true;
  tutorialOverlay.style.display = 'flex';

  tutorialDontShowAgain.checked = false;
  tutorialBtnNext.onclick = tutorialNext;
  tutorialBtnSkip.onclick = skipTutorial;

  renderTutorialStep();
}

function findFirstValidStep() {
  for (let i = 0; i < _tutorialSteps.length; i++) {
    try { if (_tutorialSteps[i].pageCheck()) return i; } catch(e) {}
  }
  return 0;
}

function renderTutorialStep() {
  const step = _tutorialSteps[_tutorialStepIdx];
  if (!step) { endTutorial(); return; }

  tutorialTitleEl.textContent = step.title;
  tutorialBodyEl.innerHTML = step.body;

  /* 楂樹寒瀹氫綅 */
  let targetEl = null;
  try { targetEl = step.target(); } catch(e) {}

  if (targetEl && isElementFullyVisible(targetEl)) {
    /* 婊氬姩鍒拌鍥句腑蹇?*/
    try { targetEl.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); } catch(e) {}

    /* 寤惰繜涓€灏忔鏃堕棿绛夋粴鍔ㄥ畬鎴愬悗鍐嶅彇浣嶇疆 */
    requestAnimationFrame(() => {
      if (!_tutorialActive || _tutorialStepIdx !== _tutorialSteps.indexOf(step)) return;
      const rect = targetEl.getBoundingClientRect();

      /* 濡傛灉鐩爣婊氬嚭灞忓箷鎴栧お灏忥紝fallback */
      if (rect.width < 4 || rect.height < 4 || rect.bottom < -50 || rect.top > window.innerHeight + 50) {
        tutorialHighlight.style.display = 'none';
        positionBubbleCenter();
        renderStepDots();
        return;
      }

      tutorialHighlight.style.display = 'block';
      tutorialHighlight.style.left = (rect.left - 8) + 'px';
      tutorialHighlight.style.top = (rect.top - 8) + 'px';
      tutorialHighlight.style.width = (rect.width + 16) + 'px';
      tutorialHighlight.style.height = (rect.height + 16) + 'px';

      /* 瀹氫綅姘旀场 */
      positionBubble(rect, step.position);
      renderStepDots();
    });
  } else {
    /* 鐩爣涓嶅彲瑙?鈫?灞忓箷涓ぎ鏄剧ず姘旀场锛屽唴瀹逛腑鍖呭惈鎻愮ず淇℃伅 */
    tutorialHighlight.style.display = 'none';
    positionBubbleCenter();
  }

  /* 姝ラ鐐?& 鎸夐挳锛堢珛鍗虫覆鏌擄紝涓嶄緷璧?RAF锛?*/
  renderStepDots();
  tutorialBtnNext.textContent = (_tutorialStepIdx >= _tutorialSteps.length - 1) ? '开始体验' : '下一步';
}

/* 鏀硅繘鐨勫彲瑙佹€ф娴嬶細妫€鏌ュ厓绱犳湰韬?+ 绁栧厛閾剧殑鍙鎬?*/
function isElementFullyVisible(el) {
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);

  /* 鑷韩灏哄鍜?display */
  if (rect.width < 2 || rect.height < 2) return false;
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

  /* 鍚戜笂妫€鏌ョ鍏堥摼鏄惁琚殣钘?*/
  let parent = el.parentElement;
  let depth = 0;
  while (parent && depth < 10) {
    const ps = window.getComputedStyle(parent);
    if (ps.display === 'none' || ps.visibility === 'hidden') return false;
    parent = parent.parentElement;
    depth++;
  }

  return true;
}

function positionBubble(targetRect, pos) {
  const bubbleW = 360;
  const bubbleH = 200;
  const gap = 16;
  let x, y;

  switch(pos) {
    case 'bottom':
      x = targetRect.left + targetRect.width / 2 - bubbleW / 2;
      y = targetRect.bottom + gap;
      break;
    case 'top':
      x = targetRect.left + targetRect.width / 2 - bubbleW / 2;
      y = targetRect.top - bubbleH - gap;
      break;
    case 'left':
      x = targetRect.left - bubbleW - gap;
      y = targetRect.top + targetRect.height / 2 - bubbleH / 2;
      break;
    case 'right':
      x = targetRect.right + gap;
      y = targetRect.top + targetRect.height / 2 - bubbleH / 2;
      break;
    default:
      x = targetRect.left + targetRect.width / 2 - bubbleW / 2;
      y = targetRect.bottom + gap;
  }

  /* 杈圭晫淇 */
  x = Math.max(10, Math.min(x, window.innerWidth - bubbleW - 10));
  y = Math.max(10, Math.min(y, window.innerHeight - bubbleH - 10));

  tutorialBubble.style.left = x + 'px';
  tutorialBubble.style.top = y + 'px';
}

function positionBubbleCenter() {
  const bubbleW = 360;
  const bubbleH = 180;
  tutorialBubble.style.left = (window.innerWidth - bubbleW) / 2 + 'px';
  tutorialBubble.style.top = (window.innerHeight - bubbleH) / 2 + 'px';
}

function renderStepDots() {
  tutorialStepDots.innerHTML = '';
  for (let i = 0; i < _tutorialSteps.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === _tutorialStepIdx ? ' active' : '');
    tutorialStepDots.appendChild(dot);
  }
}

function tutorialNext() {
  if (tutorialDontShowAgain.checked) markTutorialDone();
  _tutorialStepIdx++;
  if (_tutorialStepIdx >= _tutorialSteps.length) {
    endTutorial();
    return;
  }
  renderTutorialStep();
}

function skipTutorial() {
  markTutorialDone();
  endTutorial();
}

function endTutorial() {
  _tutorialActive = false;
  tutorialOverlay.style.display = 'none';
  tutorialHighlight.style.display = 'none';
}

/* 鍦ㄥ悎閫傛椂鏈鸿Е鍙戞暀绋?*/
let _tutorialStarted = false;
function maybeStartTutorial() {
  if (_tutorialStarted || isTutorialDone()) return;
  _tutorialStarted = true;
  setTimeout(showTutorial, 600);
}

/* 鎸傝浇瑙﹀彂鐐?*/
const _origEnterGameDirect = enterGameDirect;
enterGameDirect = async function() {
  await _origEnterGameDirect.apply(this, arguments);
  maybeStartTutorial();
};

/* 瑙掕壊椤典篃灏濊瘯鍚姩 */
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    const rolePage = document.getElementById('rolePage');
    if (rolePage && rolePage.style.display !== 'none' && !_tutorialStarted && !isTutorialDone()) {
      _tutorialStarted = true;
      setTimeout(showTutorial, 400);
    }
  }, 800);
});

/* 鍚屾棣栭〉鏁欑▼寮€鍏虫寜閽姸鎬?*/
syncTutorialToggleBtn();






/* =========================
 *  V4.0 formal runtime
 * ========================= */
const V40_POOL_LIBRARY = {
  normal: { type:"normal", label:"普通池", color:"#93c5fd" },
  boost: { type:"boost", label:"助涨池", color:"#fcd34d" },
  insurance: { type:"insurance", label:"保险池", color:"#86efac" },
  dividend: { type:"dividend", label:"红利池", color:"#fca5a5" },
  leverage: { type:"leverage", label:"杠杆池", color:"#fb7185" },
  incubate: { type:"incubate", label:"孵化池", color:"#c4b5fd" }
};

const V40_DYNAMIC_POOL_ORDER = ["dividend", "leverage", "incubate"];
const V40_TRADE_CARDS = [
  { id:"cash_out", name:"套现", baseCost:0, minRound:1, target:"card", desc:"立即清仓 1 张股票，并额外获得 20 金币。" },
  { id:"adjust", name:"调整", baseCost:10, minRound:1, target:"two_cards", desc:"选择 2 张股票，交换它们的位置。" },
  { id:"upgrade_pool", name:"升级池", baseCost:10, minRound:1, target:"row", desc:"选择 1 个资金池，强化该池效果。" },
  { id:"add_pool", name:"加池子", baseCost:0, minRound:1, target:"direct", desc:"新增 1 个进阶资金池；该池本轮只能放入 1 张股票。" }
];

let v40TradeOverlay = null;
let v40TradeGrid = null;
let v40TradeSkipBtn = null;
let v40TradeHint = null;
let v40TradePhaseOpen = false;
let pendingTradeAction = null;

function v40PoolEffectText(rowCfg){
  const level = Math.max(1, Number(rowCfg?.level || 1));
  if(rowCfg?.type === "normal") return "无额外效果";
  if(rowCfg?.type === "insurance") return `本行股票下跌时额外 +${level}`;
  if(rowCfg?.type === "dividend") return `本行股票上涨时额外 +${level}`;
  if(rowCfg?.type === "boost") return `本行股票上涨概率 +${level * 10}%`;
  if(rowCfg?.type === "leverage") return `本行股票上涨时额外 +${level * 5}，下跌时额外 -${level * 5}`;
  if(rowCfg?.type === "incubate") return `本行股票上涨后永久 +${level} 上涨值`;
  return "无额外效果";
}

function makeV40Pool(type, level = 1){
  const base = V40_POOL_LIBRARY[type] || V40_POOL_LIBRARY.normal;
  return {
    type: base.type,
    label: base.label,
    level,
    effect: v40PoolEffectText({ type: base.type, level }),
    color: base.color
  };
}

function resetV40PoolRows(){
  BOARD_ROWS.length = 0;
  BOARD_ROWS.push(makeV40Pool("normal", 1));
  BOARD_ROWS.push(makeV40Pool("boost", 1));
  BOARD_ROWS.push(makeV40Pool("insurance", 1));
  boardRows = BOARD_ROWS.map(()=>[]);
}

function getTradeCardCost(card){
  if(!card) return 0;
  if(card.id !== "add_pool") return Number(card.baseCost || 0);
  const roundNo = Number(getLvl()?.round || 1);
  if(roundNo <= 4) return 30;
  if(roundNo <= 8) return 50;
  return 70;
}

function isFirstRoundTradeFree(){
  return Number(getLvl()?.round || 1) === 1;
}

function ensureV40TradeOverlay(){
  if(v40TradeOverlay) return;
  const overlay = document.createElement("div");
  overlay.id = "tradeCardOverlay";
  overlay.className = "rewardOverlay";
  overlay.style.display = "none";
  overlay.innerHTML = `
    <div class="rewardPanel" style="max-width:980px;">
            <div class="rewardHeader">
        <div>
          <div class="h hFont">4.0 交易卡阶段</div>
          <div class="s" id="tradeCardHint">选择 1 张交易卡，或直接跳过。</div>
        </div>
        <div class="s" id="tradeCardRoundInfo">本轮开始</div>
      </div>
      <div id="tradeCardGrid" class="rewardGrid" style="padding:16px;"></div>
      <div class="rewardFooter" style="justify-content:space-between;">
        <div class="cfgSubtle" style="opacity:0.85;">交易卡只负责改盘面方向，补股和落位要你自己做。</div>
        <button id="tradeCardSkipBtn" class="ghostBtn hFont" style="height:36px;padding:0 24px;opacity:0.8;">放弃本轮交易卡</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  v40TradeOverlay = overlay;
  v40TradeGrid = overlay.querySelector("#tradeCardGrid");
  v40TradeSkipBtn = overlay.querySelector("#tradeCardSkipBtn");
  v40TradeHint = overlay.querySelector("#tradeCardHint");
}

function buildTradeCardButton(card){
  const cost = isFirstRoundTradeFree() ? 0 : getTradeCardCost(card);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "reinforceStone";
  btn.style.textAlign = "left";
  btn.style.padding = "16px";
  btn.style.minHeight = "180px";
  btn.innerHTML = `
    <div class="stoneName hFont" style="display:flex;justify-content:space-between;gap:12px;">
      <span>${escapeHtml(card.name)}</span>
      <span style="color:${cost > 0 ? "#fbbf24" : "#86efac"};">${cost > 0 ? `-${cost}` : "免费"}</span>
    </div>
    <div class="stoneEff" style="margin-top:10px;line-height:1.7;">${escapeHtml(card.desc)}</div>
  `;
  return btn;
}

function drawTradeCardCandidates(){
  const roundNo = Number(getLvl()?.round || 1);
  const hasBoardCards = getAllBoardCards().length > 0;
  const pool = shuffle(V40_TRADE_CARDS.filter((card)=>{
    if(roundNo < Number(card.minRound || 1)) return false;
    if(roundNo === 1 && card.id === "add_pool") return false;
    if(!hasBoardCards && roundNo !== 1 && (card.id === "cash_out" || card.id === "adjust")) return false;
    if(card.id === "add_pool"){
      const unlocked = V40_DYNAMIC_POOL_ORDER.some((type)=>!BOARD_ROWS.some((row)=>row.type === type));
      if(!unlocked) return false;
    }
    return true;
  }));
  return pool.slice(0, Math.min(3, pool.length));
}

function closeTradeOverlay(){
  if(!v40TradeOverlay) return;
  v40TradeOverlay.style.display = "none";
  v40TradePhaseOpen = false;
  updateStageFlowState();
  setDecisionMode(false);
  updateOpenAvailability();
}

function findBoardCardPosition(cardId){
  for(let rowIndex = 0; rowIndex < boardRows.length; rowIndex++){
    for(let colIndex = 0; colIndex < boardRows[rowIndex].length; colIndex++){
      if(boardRows[rowIndex][colIndex]?.id === cardId){
        return { rowIndex, colIndex };
      }
    }
  }
  return null;
}

function swapBoardCards(cardIdA, cardIdB){
  const a = findBoardCardPosition(cardIdA);
  const b = findBoardCardPosition(cardIdB);
  if(!a || !b) return false;
  const tmp = boardRows[a.rowIndex][a.colIndex];
  boardRows[a.rowIndex][a.colIndex] = boardRows[b.rowIndex][b.colIndex];
  boardRows[b.rowIndex][b.colIndex] = tmp;
  syncBoardState();
  return true;
}

function applyTradeCardCost(card){
  const cost = isFirstRoundTradeFree() ? 0 : getTradeCardCost(card);
  if(cost <= 0) return true;
  if(money < cost) return false;
  money -= cost;
  renderProgress(-cost);
  renderTop();
  addHistoryItem({
    natural:`使用交易卡 <b>${escapeHtml(card.name)}</b>，支付 <b>${cost}</b> 金币`,
    title:"交易卡费用",
    delta:-cost,
    good:true
  });
  return true;
}

function finishPendingTradeAction(summary){
  const resolver = pendingTradeAction?.resolve;
  pendingTradeAction = null;
  renderLeft();
  renderBoardGrid();
  updateOpenAvailability();
  if(summary){
    addHistoryItem(summary);
  }
  if(typeof resolver === "function") resolver();
}

function handleTradeCardSelection(cardId){
  if(!pendingTradeAction) return false;
  if(pendingTradeAction.kind === "cash_out"){
    const ok = liquidateAssetCard(cardId, "trade");
    if(!ok) return false;
    money += 20;
    renderProgress(20);
    renderTop();
    finishPendingTradeAction({
      natural:`交易卡 <b>套现</b> 生效，额外获得 <b>20</b> 金币`,
      title:"交易卡生效",
      delta:20,
      good:true
    });
    return true;
  }
  if(pendingTradeAction.kind === "adjust"){
    if(!pendingTradeAction.firstCardId){
      pendingTradeAction.firstCardId = cardId;
      addHistoryItem({
        natural:"已选中第 1 张股票，请再点选第 2 张股票完成交换",
        title:"调整中",
        delta:0,
        good:true
      });
      updateOpenAvailability();
      renderBoardGrid();
      return true;
    }
    if(pendingTradeAction.firstCardId === cardId) return true;
    const ok = swapBoardCards(pendingTradeAction.firstCardId, cardId);
    if(!ok) return false;
    finishPendingTradeAction({
      natural:"交易卡 <b>调整</b> 生效，已交换两张股票的位置",
      title:"交易卡生效",
      delta:0,
      good:true
    });
    return true;
  }
  return false;
}

function applyPoolUpgrade(rowIndex){
  const row = BOARD_ROWS[rowIndex];
  if(!row) return false;
  if(row.type === "normal"){
    addHistoryItem({
      natural:"<b>普通池</b> 不能升级，请改选助涨池、保险池或后续新增池。",
      title:"升级池失败",
      delta:0,
      good:false
    });
    if(placementHintEl){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "📌 普通池不能升级。请点击 <b>助涨池</b>、<b>保险池</b> 或后续新增资金池的标题。";
    }
    return false;
  }
  row.level = Math.max(1, Number(row.level || 1) + 1);
  row.effect = v40PoolEffectText(row);
  finishPendingTradeAction({
    natural:`交易卡 <b>升级池</b> 生效，<b>${escapeHtml(row.label)}</b> 已提升到 Lv.${row.level}，${escapeHtml(row.effect)}`,
    title:"交易卡生效",
    delta:0,
    good:true
  });
  return true;
}

function applyAddPoolCard(){
  const nextType = V40_DYNAMIC_POOL_ORDER.find((type)=>!BOARD_ROWS.some((row)=>row.type === type));
  if(!nextType) return false;
  const pool = makeV40Pool(nextType, 1);
  pool.tradeNew = true;
  BOARD_ROWS.push(pool);
  boardRows.push([]);
  renderAll();
  addHistoryItem({
    natural:`交易卡 <b>加池子</b> 生效，新增 <b>${escapeHtml(pool.label)}</b>，该池本轮仅建议先放 1 张股票`,
    title:"交易卡生效",
    delta:0,
    good:true
  });
  return true;
}

function beginTradeCardAction(card, resolve){
  if(!applyTradeCardCost(card)) {
    addHistoryItem({
      natural:`金币不足，无法使用 <b>${escapeHtml(card.name)}</b>`,
      title:"交易卡失败",
      delta:0,
      good:false
    });
    return;
  }

  closeTradeOverlay();

  if(card.id === "add_pool"){
    applyAddPoolCard();
    resolve();
    return;
  }

  if(card.id === "cash_out"){
    pendingTradeAction = { kind:"cash_out", card, resolve };
    addHistoryItem({
      natural:"请选择 1 张股票执行套现",
      title:"等待目标",
      delta:0,
      good:true
    });
    updateOpenAvailability();
    renderBoardGrid();
    return;
  }

  if(card.id === "adjust"){
    pendingTradeAction = { kind:"adjust", card, resolve, firstCardId:null };
    addHistoryItem({
      natural:"请选择 2 张股票，交换它们的位置",
      title:"等待目标",
      delta:0,
      good:true
    });
    updateOpenAvailability();
    renderBoardGrid();
    return;
  }

  if(card.id === "upgrade_pool"){
    pendingTradeAction = { kind:"upgrade_pool", card, resolve };
    addHistoryItem({
      natural:"请选择 1 个资金池进行升级",
      title:"等待目标",
      delta:0,
      good:true
    });
    updateOpenAvailability();
    renderBoardGrid();
    return;
  }
}

function showTradeCardPhase(){
  ensureV40TradeOverlay();
  const candidates = drawTradeCardCandidates();
  if(!candidates.length) return Promise.resolve();
  return new Promise((resolve)=>{
    v40TradeGrid.innerHTML = "";
    const info = v40TradeOverlay.querySelector("#tradeCardRoundInfo");
    if(info) info.textContent = `第 ${getLvl().round} 轮 · 轮开始`;
    if(v40TradeHint){
      v40TradeHint.textContent = isFirstRoundTradeFree()
        ? "第 1 轮可免费选 1 张交易卡，选完再继续落位和开盘。"
        : "本轮先选 1 张交易卡，费用会立即结算。";
    }

    candidates.forEach((card)=>{
      const btn = buildTradeCardButton(card);
      btn.addEventListener("click", ()=>{
        sfxButton();
        beginTradeCardAction(card, resolve);
      });
      v40TradeGrid.appendChild(btn);
    });

    if(v40TradeSkipBtn){
      v40TradeSkipBtn.onclick = ()=>{
        sfxButton();
        addHistoryItem({
          natural:"放弃本轮交易卡",
          title:"交易卡阶段",
          delta:0,
          good:true
        });
        closeTradeOverlay();
        resolve();
      };
    }

    v40TradeOverlay.style.display = "flex";
    v40TradePhaseOpen = true;
    updateStageFlowState();
    setDecisionMode(true);
    updateOpenAvailability();
  });
}

const _v40BaseRollUpChance = rollUpChance;
rollUpChance = function(card, ctx=null){
  let p = _v40BaseRollUpChance(card, ctx);
  const rowLevel = Math.max(1, Number(BOARD_ROWS[card?.rowIndex ?? -1]?.level || 1));
  if(card?.rowType === "boost"){
    p += 0.10 * rowLevel;
  }
  return clamp(p, 0.02, 0.98);
};

const _v40BasePayoutOf = payoutOf;
payoutOf = function(card, up, ctx=null){
  let val = _v40BasePayoutOf(card, up, ctx);
  const rowLevel = Math.max(1, Number(BOARD_ROWS[card?.rowIndex ?? -1]?.level || 1));
  if(up && card?.rowType === "dividend") val += Math.max(0, rowLevel - 1);
  if(!up && card?.rowType === "insurance") val += Math.max(0, rowLevel - 1);
  if(card?.rowType === "leverage") val += up ? rowLevel * 5 : -rowLevel * 5;
  return val;
};

const _v40BaseSettleOneCardKeywords = settleOneCardKeywords;
settleOneCardKeywords = function(card, up){
  _v40BaseSettleOneCardKeywords(card, up);
  if(!card || !Array.isArray(card.keywords)) return;
  const rowLevel = Math.max(1, Number(BOARD_ROWS[card?.rowIndex ?? -1]?.level || 1));
  if(up){
    card.keywords.forEach((kw)=>{
      if(kw.type === "grow_up"){
        card.up += Math.max(1, Number(kw.value || 1));
      }
      if(kw.type === "grow_principal_up"){
        const ex = getKw(card, "principal");
        if(ex) ex.value += Math.max(1, Number(kw.value || 1));
        else addKw(card, { type:"principal", value:Math.max(1, Number(kw.value || 1)) });
      }
    });
    if(card.rowType === "incubate"){
      card.up += rowLevel;
    }
  }
};

const _v40BaseStartOpen = startOpen;
startOpen = async function(){
  getAllBoardCards().forEach((card)=>{
    if(!Array.isArray(card?.keywords)) return;
    card.keywords.forEach((kw)=>{
      if(kw.type === "grow_each_open"){
        card.up += Math.max(1, Number(kw.value || 1));
      }
    });
  });
  return _v40BaseStartOpen.apply(this, arguments);
};

const _v40BaseBuildStockCardTile = buildStockCardTile;
buildStockCardTile = function(card){
  const wrap = _v40BaseBuildStockCardTile(card);
  wrap.addEventListener("click", ()=>{
    if(!pendingTradeAction) return;
    handleTradeCardSelection(card.id);
  });
  return wrap;
};

buildPoolCard = function(card){
  const slot = document.createElement("div");
  slot.className = "boardPoolCard";
  slot.dataset.row = String(card.rowIndex ?? 0);
  slot.dataset.col = String(card.colIndex ?? 0);
  if(cleanupMode) slot.classList.add("cleanupMode");
  if(reinforceEmbedMode) slot.classList.add("embedTargetable");
  if(reinforceEmbedMode && pendingReinforceTargetId === card.id) slot.classList.add("embedSelected");
  if(pendingTradeAction) slot.classList.add("embedTargetable");
  if(card.lastOpenTrend === "up") slot.classList.add("mark-up");
  if(card.lastOpenTrend === "down") slot.classList.add("mark-down");

  const handleCardInteraction = (e)=>{
    if(e) e.stopPropagation();
    if(reinforceEmbedMode){
      selectReinforceTarget(card.id);
      return;
    }
    if(pendingTradeAction){
      handleTradeCardSelection(card.id);
      return;
    }
    if(cleanupMode){
      liquidateAssetCard(card.id, "manual");
      updateOpenAvailability();
      renderBoardGrid();
    }
  };

  const tile = mkLogoTile(card);
  tile.addEventListener("mousemove", (e)=> showTooltip(card, e.clientX, e.clientY));
  tile.addEventListener("mouseleave", hideTooltip);
  slot.addEventListener("click", handleCardInteraction);
  slot.appendChild(tile);

  const name = document.createElement("div");
  name.className = "boardCardName hFont";
  name.textContent = card.name;
  slot.appendChild(name);

  const meta = document.createElement("div");
  meta.className = "boardCardMeta";
  const markers = getCardMarkers(card);
  markers.slice(0, 2).forEach((kw)=>{
    const span = document.createElement("span");
    span.className = "boardStatBadge";
    span.textContent = markerLabel(kw);
    meta.appendChild(span);
  });
  if(cardNetEarnings[card.id] !== undefined){
    const net = document.createElement("span");
    const val = Number(cardNetEarnings[card.id] || 0);
    net.className = `boardStatBadge boardNetBadge ${val >= 0 ? "up" : "down"}`;
    net.textContent = `本局 ${val >= 0 ? "+" : ""}${val}`;
    meta.appendChild(net);
  }
  if(meta.childElementCount) slot.appendChild(meta);
  return slot;
};

renderBoardGrid = function(){
  if(!revealGridEl) return;
  revealGridEl.innerHTML = "";
  revealGridEl.classList.remove("revealGrid-openPhase");

  for(let rowIndex = 0; rowIndex < BOARD_ROWS.length; rowIndex++){
    const rowCfg = BOARD_ROWS[rowIndex];
    const rowHasSpace = canPlaceIntoRow(rowIndex);
    const rowEl = document.createElement("section");
    rowEl.className = `boardRow boardPoolRow boardPoolRow-${rowCfg.type}`;
    if(pendingTradeAction?.kind === "upgrade_pool"){
      rowEl.classList.add("boardRow-upgradeMode");
      rowEl.classList.add(rowCfg.type === "normal" ? "boardRow-upgradeDisabled" : "boardRow-upgradeReady");
    }
    if(placementQueue.length && rowHasSpace) rowEl.classList.add("boardRow-dropReady");

    const head = document.createElement("div");
    head.className = "boardRowHead";
    if(pendingTradeAction?.kind === "upgrade_pool"){
      head.style.cursor = "pointer";
      head.title = rowCfg.type === "normal" ? "普通池不能升级" : `点击升级 ${rowCfg.label}`;
      head.addEventListener("click", (e)=>{
        e.stopPropagation();
        applyPoolUpgrade(rowIndex);
      });
    }

    const left = document.createElement("div");
    left.className = "boardPoolMeta";
    const titleRow = document.createElement("div");
    titleRow.className = "boardPoolTitleRow";
    const badge = document.createElement("div");
    badge.className = "boardRowBadge";
    badge.textContent = rowCfg.label + (rowCfg.level > 1 ? ` Lv.${rowCfg.level}` : "");
    titleRow.appendChild(badge);
    const effect = document.createElement("div");
    effect.className = "boardPoolEffect";
    effect.textContent = rowCfg.effect;
    const count = document.createElement("div");
    count.className = "boardRowCount boardRowCount-left";
    count.textContent = `${boardRows[rowIndex].length} / ${getRowCapacity(rowIndex)}`;
    left.appendChild(titleRow);
    left.appendChild(effect);
    left.appendChild(count);

    if(rowCfg.tradeNew){
      const limitNote = document.createElement("div");
      limitNote.className = "boardPoolEffect";
      limitNote.textContent = "本轮新池限放 1 张股票";
      left.appendChild(limitNote);
    }

    if(placementQueue.length){
      const action = document.createElement("div");
      action.className = "boardPoolAction";
      const placeBtn = document.createElement("button");
      placeBtn.type = "button";
      placeBtn.className = "poolPlaceBtn hFont";
      placeBtn.textContent = rowHasSpace ? `放入` : "已满";
      placeBtn.title = rowHasSpace ? `放入 ${getPendingPlacementCard()?.name || "待入池股票"}` : getPoolFullReason(rowIndex);
      placeBtn.addEventListener("click", (e)=>{
        e.stopPropagation();
        placePendingCardToRow(rowIndex);
      });
      action.appendChild(placeBtn);
      titleRow.appendChild(action);
      rowEl.addEventListener("click", ()=>placePendingCardToRow(rowIndex));
    }

    head.appendChild(left);
    rowEl.appendChild(head);

    const track = document.createElement("div");
    track.className = "boardRowTrack boardPoolTrack";
    boardRows[rowIndex].forEach((card)=>{
      track.appendChild(buildPoolCard(card));
    });
    if(boardRows[rowIndex].length === 0){
      const state = document.createElement("div");
      state.className = "boardPoolState";
      state.textContent = placementQueue.length ? (rowHasSpace ? "等待新股票入池" : getPoolFullReason(rowIndex)) : "当前池内暂无股票";
      track.appendChild(state);
    }
    rowEl.appendChild(track);
    revealGridEl.appendChild(rowEl);
  }
  updateOpenAvailability();
};

updateOpenAvailability = function(){
  const hasPendingPlacement = placementQueue.length > 0;
  const hasAnyBoardCard = getAllBoardCards().length > 0;
  const blocked = runEnded || running || openCount >= getDeliveryOpens() || awaitingStarter || hasPendingPlacement || !hasAnyBoardCard || v40TradePhaseOpen || !!pendingTradeAction;
  if(btnOpen) btnOpen.disabled = blocked;

  if(placementHintEl){
    if(v40TradePhaseOpen){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = placementQueue.length ? "📌 先选本轮交易卡，再把开局股票放进资金池。" : "📌 交易卡阶段进行中：先完成本轮交易卡选择。";
    }else if(pendingTradeAction?.kind === "cash_out"){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "📌 套现中：点击 1 张股票，立即清仓并额外获得 20 金币。";
    }else if(pendingTradeAction?.kind === "adjust"){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = pendingTradeAction.firstCardId ? "📌 调整中：再点第 2 张股票，交换两张牌的位置。" : "📌 调整中：先点第 1 张股票。";
    }else if(pendingTradeAction?.kind === "upgrade_pool"){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "📌 升级池中：点击要升级的资金池标题。<b>普通池不能升级</b>，其余资金池可以继续强化。";
    }else if(hasPendingPlacement){
      const card = getPendingPlacementCard();
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = `📌 待落位 <b>${escapeHtml(card?.name || "—")}</b> · ${escapeHtml(getCardEffectText(card) || "无")}，点击对应资金池标题旁的小按钮即可放入；如果看到“本股票池已满”，请换池或先清仓腾位。`;
    }else if(cleanupMode){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "📌 清仓模式已开启：点击盘面中的股票即可卖出腾位。";
    }else if(awaitingStarter){
      placementHintEl.style.display = "";
      placementHintEl.innerHTML = "📌 开局股票还没落位完，先把它们放进资金池，再开始首轮开盘。";
    }else{
      placementHintEl.style.display = "none";
      placementHintEl.innerHTML = "";
    }
  }

  if(hallCleanupBtn){
    hallCleanupBtn.classList.toggle("active", cleanupMode);
    hallCleanupBtn.textContent = cleanupMode ? "退出清仓" : "清仓模式";
  }
};

const _v40BaseShowStarterPack = showStarterPack;
showStarterPack = function(){
  if(Number(getLvl()?.round || 1) === 1){
    seedFirstRoundStarterBoard();
    return;
  }
  _v40BaseShowStarterPack.apply(this, arguments);
};

onRoundEndOk = async function(){
  sfxDeliverSubmit();
  const overlay = document.getElementById('roundEndOverlay');
  if(overlay) overlay.style.display = 'none';
  updateStageFlowState();
  const lvl = getLvl();
  const reinforcePick = Number(lvl?.stratPick || (currentLevel < LEVELS.length - 1 ? 1 : 0));
  const reinforceShow = Math.max(Number(lvl?.stratShow || 3), reinforcePick, 3);
  if(reinforcePick > 0){
    await showReinforceReward(reinforcePick, reinforceShow);
  }
  await advanceToNextLevel();
};

advanceToNextLevel = async function(){
  currentLevel++;
  if(currentLevel >= LEVELS.length){
    endRun(true);
    return;
  }

  const lvl = getLvl();
  openCount = 0;
  round = lvl.round;
  lastRoundDeliverySummary = null;
  awaitingStarter = false;
  runEnded = false;
  clearTemporaryPoolLimits();

  renderTop();
  renderLeft();
  running = false;
  renderBoardGrid();
  updateOpenAvailability();

  addHistoryItem({
    natural:`第 ${lvl.round} 轮开始，目标 ${lvl.target}，开盘 ${lvl.opens} 次`,
    title:`第 ${lvl.round} 轮`,
    delta:0,
    good:true
  });

  if(_bgmToggle) startBGM();
  await showRoundStartStory();
  await showTradeCardPhase();
  updateOpenAvailability();
};

const _v40WrappedEnterGameDirect = enterGameDirect;
enterGameDirect = async function(){
  document.getElementById("storyOverlay").style.display = "none";
  gamePage.style.display = "block";
  renderAll();
  renderHp();
  awaitingStarter = false;
  btnOpen.disabled = true;
  if(_bgmToggle) startBGM();
  await showRoundStartStory();
  seedFirstRoundStarterBoard();
  await showTradeCardPhase();
  if(typeof maybeStartTutorial === "function") maybeStartTutorial();
};

const _v40WrappedStartGame = startGameFromLobby;
startGameFromLobby = function(){
  resetV40PoolRows();
  return _v40WrappedStartGame.apply(this, arguments);
};

const _v40WrappedHardReset = hardReset;
hardReset = function(){
  resetV40PoolRows();
  return _v40WrappedHardReset.apply(this, arguments);
};

resetV40PoolRows();




