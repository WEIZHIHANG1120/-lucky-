/* =========================
 *  Core settings
 * ========================= */
// ═══════════════════════════════════════
//  幸运房东 12轮关卡配置 (可配置)
// ═══════════════════════════════════════
const GAME_BALANCE = {
  starterAssetCount: 3,
  rewardAssetChoiceCount: 3,
  cfgStorageKeys: {
    level: 'lsc_level_config_v2',
    card: 'lsc_card_config_v2',
    general: 'lsc_general_config_v1',
    asset: 'lsc_asset_config_v1'
  },
  tickerItems: [
    "沪A·量子科技龙头  +4","深B·超级保障集团  +1","创业·全自动交易引擎  +2","港股·黄金藏馆  +1",
    "农业·丰收结算季  +2","消费·顶级茅台  +3","电力·国家电网集团  +1","人才·资本操盘总监  +2",
    "科技·妖股孵化器  +5","指数·开盘撮合中…"
  ],
  roles: [
    { id:'rookie', name:'炒股小白', stars:1, baseHp:5, effectText:'无', startAssets:[] },
    { id:'middle', name:'稳健中产', stars:1, baseHp:4, effectText:'游戏开始时，额外获得 3 张交易终端。', startAssets:[{name:'交易终端', count:3}] }
  ],
  upgrades: []
};

const AUDIO_VISUAL_ASSETS = {
  audio: {
    button: { label: "按钮点击", path: "", note: "按钮、确认、选择时播放。" },
    reveal: { label: "开盘揭晓", path: "", note: "单张资产揭晓但无收益时播放。" },
    coin: { label: "收益结算", path: "", note: "资产结算为正收益时播放。" },
    bad: { label: "亏损结算", path: "", note: "资产结算为负收益时播放。" },
    deliverSubmit: { label: "交付提交", path: "", note: "每轮胜利后提交目标金币时播放。" },
    win: { label: "最终胜利", path: "", note: "全关通关时播放。" },
    lose: { label: "失败结算", path: "", note: "交付失败或死亡时播放。" }
  },
  music: {
    gameBgm01: { label: "游戏音乐 01", path: "", note: "当前默认使用内置背景音乐；如后续补充音频文件，可再接入。" },
    gameBgm02: { label: "游戏音乐 02", path: "", note: "当前默认使用内置背景音乐；如后续补充音频文件，可再接入。" },
    gameBgm03: { label: "游戏音乐 03", path: "", note: "当前默认使用内置背景音乐；如后续补充音频文件，可再接入。" }
  },
  visuals: {
    assetCardFace: {
      label: "资产卡卡面",
      path: "",
      fill: "#1d3f5d",
      accent: "#63d6ff",
      note: "资产卡大卡面与左侧资产缩略图。"
    },
    reinforceCardFace: {
      label: "强化标记卡面",
      path: "",
      fill: "#4d3215",
      accent: "#ffc857",
      note: "强化标记卡面与左侧缩略图。"
    },
    reinforceMarker: {
      label: "强化标记",
      path: "",
      fill: "#0d2640",
      accent: "#63d6ff",
      note: "资产在本次开盘被抽中后的勾选强化标记。"
    }
  }
};

const LEVELS = [
  // round, opens, target(累计资金), storyTitle, story, stratPickCount, stratShowCount
  { round:1,  opens:3, target:30,  cap:60,  storyTitle:"第一轮 · 入职报到",    stratPick:1, stratShow:2,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">🎉 欢迎加入幸运炒股公司！</div>
<div>老板拍着你的肩膀说：<b>"小伙子，头 3 次开盘，赚到 30 就算过关。"</b></div>
<div style="margin-top:12px;opacity:0.72;">你手里握着 5 张 ★ 卡，深吸一口气……</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">3</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">30</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">60</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">1 选 2</div></div>
</div>` },
  { round:2,  opens:3, target:65,  cap:100, storyTitle:"第二轮 · 月度考核",   stratPick:1, stratShow:2,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">📊 月度考核</div>
<div>老板看了看月报，皱眉道：<b>"再赚 35，凑够 65，你才能留下来。"</b></div>
<div style="margin-top:12px;opacity:0.72;">你选了一枚强化标记，感觉胜算在握。</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">3</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">65</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">100</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">1 选 2</div></div>
</div>` },
  { round:3,  opens:4, target:110, cap:150, storyTitle:"第三轮 · 市场波动",   stratPick:1, stratShow:3,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">📉 市场开始震荡</div>
<div>新闻头条：<b>"利率上调，市场承压"</b>。风险在增加，但机会也在。</div>
<div style="margin-top:12px;opacity:0.72;">目标 110，资金上限提升到 150。</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">4</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">110</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">150</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">1 选 3</div></div>
</div>` },
  { round:4,  opens:4, target:170, cap:220, storyTitle:"第四轮 · 季度冲刺",   stratPick:1, stratShow:3,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">🏃 季度末冲刺</div>
<div>老板站在白板前画了条线：<b>"本季度累计要到 170，差一分都不行！"</b></div>
<div style="margin-top:12px;opacity:0.72;">你的卡组越来越强大，但压力也越来越大……</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">4</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">170</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">220</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">1 选 3</div></div>
</div>` },
  { round:5,  opens:5, target:250, cap:310, storyTitle:"第五轮 · 行情爆发",   stratPick:2, stratShow:3,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">🚀 大行情来了！</div>
<div>消息面全面利好！老板激动地喊：<b>"这波行情不冲，等什么？目标 250！"</b></div>
<div style="margin-top:12px;opacity:0.72;">从这轮起，你每轮可以选 <b>2 张</b>强化标记。</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">5</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">250</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">310</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">2 选 3</div></div>
</div>` },
  { round:6,  opens:5, target:345, cap:420, storyTitle:"第六轮 · 监管风暴",   stratPick:2, stratShow:3,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">⚖️ 监管突击检查！</div>
<div>证监会来了！<b>"所有账户冻结 1 轮？不，这次你能扛过去！"</b></div>
<div style="margin-top:12px;opacity:0.72;">方向不变，目标 345，保住利润！</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">5</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">345</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">420</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">2 选 3</div></div>
</div>` },
  { round:7,  opens:6, target:455, cap:540, storyTitle:"第七轮 · 年中答卷",   stratPick:2, stratShow:4,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">📋 年中汇报时间到</div>
<div>董事会全员出席，老板递过来报表：<b>"累计要到 455，否则裁员名单里有你。"</b></div>
<div style="margin-top:12px;opacity:0.72;">从这轮起，强化标记可选池扩大到 4 枚。</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">6</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">455</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">540</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">2 选 4</div></div>
</div>` },
  { round:8,  opens:6, target:575, cap:670, storyTitle:"第八轮 · 寒冬凛冽",   stratPick:2, stratShow:4,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">🌨️ 熊市来临</div>
<div>大盘连续跌停，同事们一片哀嚎。<b>"就你一个人还在盈利？那就继续！目标 575。"</b></div>
<div style="margin-top:12px;opacity:0.72;">逆势而上，才是真本事。</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">6</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">575</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">670</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">2 选 4</div></div>
</div>` },
  { round:9,  opens:7, target:660, cap:770, storyTitle:"第九轮 · 置之死地",   stratPick:3, stratShow:4,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">💀 绝地反击</div>
<div>形势危急，老板摔了茶杯：<b>"最后几轮，累计到 660，不然公司直接倒闭！"</b></div>
<div style="margin-top:12px;opacity:0.72;">从这轮起，每轮可选 <b>3 枚</b>强化标记！爆发时刻到了。</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">7</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">660</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">770</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">3 选 4</div></div>
</div>` },
  { round:10, opens:7, target:700, cap:820, storyTitle:"第十轮 · 决战前夕",   stratPick:3, stratShow:4,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">⚔️ 决战前夕</div>
<div>距离传说中的 1000 只差三步。<b>"700！先到这里，再说最后冲刺。"</b></div>
<div style="margin-top:12px;opacity:0.72;">你的卡组已今非昔比，胜利在望……</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">7</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">700</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">820</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">3 选 4</div></div>
</div>` },
  { round:11, opens:8, target:740, cap:870, storyTitle:"第十一轮 · 最终考验", stratPick:3, stratShow:5,
    story:`<div class="hFont" style="font-size:20px;margin-bottom:10px;">🔥 最终考验</div>
<div>老板眼含热泪：<b>"再过一关——740——你就是公司的传奇！"</b></div>
<div style="margin-top:12px;opacity:0.72;">强化标记可选池扩大到 5 枚，倾尽全力吧！</div>
<div class="roundInfoGrid">
  <div class="rInfoBox"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">8</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">交付目标（累计）</div><div class="rInfoVal riGold">740</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">870</div></div>
  <div class="rInfoBox"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal riTeal">3 选 5</div></div>
</div>` },
  { round:12, opens:8, target:1000, cap:900, storyTitle:"第十二轮 · 幸运交付", stratPick:0, stratShow:0,
    story:`<div class="hFont" style="font-size:24px;margin-bottom:12px;color:#ffc857;">🍀 幸运交付 · 最终一战！</div>
<div style="font-size:15px;">传说中的数字 <b style="color:#ffc857;font-size:28px;">1000</b> 就在眼前。</div>
<div style="margin-top:12px;opacity:0.85;">这是最后 8 次开盘，达到 1000，你将成为<b>幸运炒股公司的传奇！</b></div>
<div style="margin-top:10px;opacity:0.65;">（本轮结束即游戏终局，无强化标记奖励）</div>
<div class="roundInfoGrid">
  <div class="rInfoBox rInfoBoxFinal"><div class="rInfoLabel">本轮开盘次数</div><div class="rInfoVal riBlue">8</div></div>
  <div class="rInfoBox rInfoBoxFinal"><div class="rInfoLabel">最终交付目标</div><div class="rInfoVal riGold">1000 🍀</div></div>
  <div class="rInfoBox rInfoBoxFinal"><div class="rInfoLabel">资金上限</div><div class="rInfoVal riWhite">900</div></div>
  <div class="rInfoBox rInfoBoxFinal"><div class="rInfoLabel">强化标记奖励</div><div class="rInfoVal" style="color:#aaa;">无</div></div>
</div>` },
];

// 3.7master 难度曲线（对标目标：第12轮累计 1000）
const LEVEL_CURVE_V36 = [
  { opens:5, target:25,   cap:80,   stratPick:1, stratShow:3, storyLine1:"开局稳住节奏，先完成第一次交付。", storyLine2:"本轮目标不高，优先构建稳定收益结构。", storyLine3:" " },
  { opens:5, target:50,   cap:120,  stratPick:1, stratShow:3, storyLine1:"第二轮开始加压，保持资金连续增长。", storyLine2:"优先补强低风险股票，避免大波动。", storyLine3:" " },
  { opens:6, target:100,  cap:180,  stratPick:1, stratShow:3, storyLine1:"开盘次数上升，注意单次收益效率。", storyLine2:"开始围绕流派核心积累强化标记。", storyLine3:" " },
  { opens:6, target:150,  cap:240,  stratPick:1, stratShow:3, storyLine1:"中前期分水岭，要求稳定兑现收益。", storyLine2:"别只追爆发，先保住交付成功率。", storyLine3:" " },
  { opens:7, target:200,  cap:320,  stratPick:2, stratShow:4, storyLine1:"进入提速阶段，强化标记选择变重要。", storyLine2:"建议开始做类别联动组合。", storyLine3:" " },
  { opens:7, target:300,  cap:430,  stratPick:2, stratShow:4, storyLine1:"目标跳升，单卡强度要跟上节奏。", storyLine2:"兼顾收益与抗跌，避免被波动反噬。", storyLine3:" " },
  { opens:8, target:400,  cap:560,  stratPick:2, stratShow:4, storyLine1:"后续关卡将持续高压，尽快成型主力。", storyLine2:"可适度转向高上限策略。", storyLine3:" " },
  { opens:8, target:500,  cap:700,  stratPick:2, stratShow:5, storyLine1:"中后期核心轮次，要求更高产出密度。", storyLine2:"清仓与再配置会变得关键。", storyLine3:" " },
  { opens:9, target:600,  cap:820,  stratPick:3, stratShow:5, storyLine1:"开始冲刺，单次开盘收益必须上台阶。", storyLine2:"优先强化高贡献股票卡。", storyLine3:" " },
  { opens:9, target:700,  cap:930,  stratPick:3, stratShow:5, storyLine1:"再上一个强度档，留意风险控制。", storyLine2:"别让资金曲线在关键轮断档。", storyLine3:" " },
  { opens:10,target:850,  cap:1120, stratPick:3, stratShow:6, storyLine1:"最终前夜，爆发与稳定都要兼顾。", storyLine2:"把清仓价值和后续收益都算进去。", storyLine3:" " },
  { opens:10,target:1000, cap:1280, stratPick:0, stratShow:0, storyLine1:"最终轮：累计资金达到 1000 即完成终局交付。", storyLine2:"无强化标记奖励，专注把当前资产打满。", storyLine3:" " }
];
LEVEL_CURVE_V36.forEach((cfg, i)=>{
  if(LEVELS[i]) Object.assign(LEVELS[i], cfg);
});

// ── 当前关卡索引（0-based） ──
let currentLevel = 0;

// ── 动态获取当前关卡参数 ──
function getLvl(){ return LEVELS[Math.min(currentLevel, LEVELS.length-1)]; }
function getCap(){ return Number.MAX_SAFE_INTEGER; }
function getTarget(){ return getLvl().target; }
function getDeliveryOpens(){ return getLvl().opens; }

// 兼容旧引用（用于计算 deliveryLeft 等）
// DELIVERY_OPENS / TARGET / CAP 以 getter 方式提供
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmt = (v) => (v >= 0 ? ("+" + v) : String(v));
const ROUND_CN = ["零","一","二","三","四","五","六","七","八","九","十","十一","十二"];

function stripHtmlTags(value){
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getRoundLabel(round){
  return `第${ROUND_CN[round] || round}轮`;
}

function extractLegacyStoryLines(story){
  const beforeGrid = String(story || '').split('<div class="roundInfoGrid">')[0];
  const divs = Array.from(beforeGrid.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/g))
    .map(m => stripHtmlTags(m[1]))
    .filter(Boolean);
  return divs.slice(0, 3);
}

function normalizeLevelStory(level){
  const titleRaw = String(level.storyTitle || '').trim();
  const suffix = titleRaw.includes('·') ? titleRaw.split('·').slice(1).join('·').trim() : titleRaw;
  const legacyLines = extractLegacyStoryLines(level.story || '');
  level.storySuffix = String(level.storySuffix || suffix || '').trim();
  level.storyLine1 = String(level.storyLine1 || legacyLines[0] || '').trim();
  level.storyLine2 = String(level.storyLine2 || legacyLines[1] || '').trim();
  level.storyLine3 = String(level.storyLine3 || legacyLines[2] || '').trim();
  return level;
}

function getLevelStoryTitle(level){
  return `${getRoundLabel(level.round)} · ${String(level.storySuffix || '未命名关卡').trim()}`;
}

function getLevelStoryLines(level){
  return [level.storyLine1, level.storyLine2, level.storyLine3].map(v => String(v || '').trim());
}

LEVELS.forEach(normalizeLevelStory);

/* =========================
 *  Visual helpers
 * ========================= */
const COLORS = [
  "#4DD0E1","#7E57C2","#FF7043","#26A69A","#EC407A","#FFA726",
  "#42A5F5","#66BB6A","#AB47BC","#FFCA28","#8D6E63","#29B6F6",
  "#EF5350","#9CCC65","#26C6DA","#D4E157","#5C6BC0","#FF8A65"
];
function pickColor(seed){
  let h = 2166136261 >>> 0;
  for(let i=0;i<seed.length;i++){
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return COLORS[h % COLORS.length];
}
function starsStr(r){ return "★".repeat(r); }
function rarityClass(r){ return r===1 ? "r1" : r===2 ? "r2" : "r3"; }
function catPillClass(cat){
  if(cat==="基金") return "cat-fund";
  if(cat==="股票" || String(cat).endsWith("股")) return "cat-stock";
  if(cat==="人类") return "cat-human";
  return "cat-tool";
}
function escapeHtml(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

/* =========================
 *  State
 * ========================= */
let round = 1;
let money = 0;
let openCount = 0;
let running = false;
let awaitingStarter = true;
let runEnded = false;
// 本次开盘：资产卡 id → 'up' | 'down' （用于左侧勾选标记）
const currentOpenMarks = new Map();
const cardNetEarnings = {}; // cardId -> 本局累计净赚

const assets = [];     // 股票资产

/* =========================
 *  Card library
 * ========================= */
function mk({name, rarity, category, up, down, eff}){
  const color = pickColor(name + "|" + category + "|" + rarity);
  return {
    id: Math.random().toString(16).slice(2) + Date.now().toString(16),
    name, rarity, category,
    color,
    up: clamp(up, -999, 999),
    down: clamp(down, -999, 999),
    eff: eff || "无"
  };
}

// ══════════════════════════════════════════════════════════
//  词条帮助函数
// ══════════════════════════════════════════════════════════
function addKw(card, kw){
  if(!card.keywords) card.keywords = [];
  card.keywords.push(kw);
  return card;
}
function hasKw(card, type){ return card.keywords && card.keywords.some(k=>k.type===type); }
function getKw(card, type){ return card.keywords && card.keywords.find(k=>k.type===type); }

// ══════════════════════════════════════════════════════════
//  资产卡库（LIB）
//  category: 工具股 / 人才股 / 美酒股 / 农业股
//            保险股 / 电力股 / 科技股 / 古董股
// ══════════════════════════════════════════════════════════
function mkK(cfg){ // 带词条的卡片工厂
  const c = mk({name:cfg.name, rarity:cfg.rarity||1, category:cfg.category, up:cfg.up||0, down:cfg.down||0, eff:cfg.eff||"无"});
  if(cfg.kws) cfg.kws.forEach(kw=>addKw(c,kw));
  return c;
}

const LIB = [];

// 3.7master 全股票卡池重构（8 类 * 每类 10 张）
const LIB_STOCK_V36 = [
  // 工具股
  mkK({name:"交易终端", rarity:1, category:"工具股", up:2, down:0, eff:"弹性1：上涨时额外+1", kws:[{type:'price_up', value:1}]}),
  mkK({name:"复盘白板", rarity:1, category:"工具股", up:1, down:0, eff:"看涨1：上涨概率+10%", kws:[{type:'boost_up', value:0.10}]}),
  mkK({name:"风控模型", rarity:1, category:"工具股", up:1, down:1, eff:"防守1：下跌时额外+1", kws:[{type:'insurance', value:1}]}),
  mkK({name:"自动下单系统", rarity:1, category:"工具股", up:2, down:-1, eff:"清仓价值1：卖出时额外+1", kws:[{type:'principal', value:1}]}),
  mkK({name:"数据中台", rarity:2, category:"工具股", up:3, down:0, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:1}]}),
  mkK({name:"交易策略库", rarity:2, category:"工具股", up:3, down:0, eff:"看涨2：上涨概率+20%", kws:[{type:'boost_up', value:0.20}]}),
  mkK({name:"热点扫描器", rarity:2, category:"工具股", up:3, down:-1, eff:"跟风：前一位上涨时，本股在本次开盘临时获得看涨2", kws:[{type:'prev_up_boost', value:0.20}]}),
  mkK({name:"资产配置器", rarity:2, category:"工具股", up:3, down:0, eff:"带头：上涨后使后续股票在本次开盘临时获得弹性1", kws:[{type:'after_up_price_next', value:1}]}),
  mkK({name:"量化止盈程序", rarity:3, category:"工具股", up:4, down:0, eff:"止盈：清仓时额外获得3金币", kws:[{type:'on_clear_bonus', value:3}]}),
  mkK({name:"全自动交易引擎", rarity:3, category:"工具股", up:4, down:0, eff:"看涨2 | 带头：上涨后使后续股票在本次开盘临时获得弹性1", kws:[{type:'boost_up', value:0.20},{type:'after_up_price_next', value:1}]}),

  // 人才股
  mkK({name:"实习交易员", rarity:1, category:"人才股", up:1, down:-1, eff:"看涨1：上涨概率+10%", kws:[{type:'boost_up', value:0.10}]}),
  mkK({name:"复盘分析师", rarity:1, category:"人才股", up:2, down:0, eff:"弹性1：上涨时额外+1", kws:[{type:'price_up', value:1}]}),
  mkK({name:"风控经理", rarity:1, category:"人才股", up:1, down:0, eff:"防守1：下跌时额外+1", kws:[{type:'insurance', value:1}]}),
  mkK({name:"谈判经理", rarity:1, category:"人才股", up:2, down:-1, eff:"入股收益：获得时额外+2", kws:[{type:'on_buy_money', value:2}]}),
  mkK({name:"首席策略官", rarity:2, category:"人才股", up:3, down:0, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:2}]}),
  mkK({name:"协同管理层", rarity:2, category:"人才股", up:3, down:0, eff:"看涨2：上涨概率+20%", kws:[{type:'boost_up', value:0.20}]}),
  mkK({name:"板块研究员", rarity:2, category:"人才股", up:3, down:-1, eff:"跟风：前一位上涨时，本股在本次开盘临时获得看涨2", kws:[{type:'prev_up_boost', value:0.20}]}),
  mkK({name:"机构操盘手", rarity:2, category:"人才股", up:3, down:0, eff:"带头：上涨后使后续股票在本次开盘临时获得看涨1", kws:[{type:'after_up_boost_next', value:0.10}]}),
  mkK({name:"合伙人分红计划", rarity:3, category:"人才股", up:3, down:0, eff:"入股收益+2 | 分红2", kws:[{type:'on_buy_money', value:2},{type:'dividend', count:2}]}),
  mkK({name:"资本操盘总监", rarity:3, category:"人才股", up:4, down:0, eff:"看涨3 | 带头：上涨后使后续股票在本次开盘临时获得弹性1", kws:[{type:'boost_up', value:0.30},{type:'after_up_price_next', value:1}]}),

  // 美酒股
  mkK({name:"青梅酒庄", rarity:1, category:"美酒股", up:2, down:-1, eff:"分红2", kws:[{type:'dividend', count:2}]}),
  mkK({name:"夜场酒吧", rarity:1, category:"美酒股", up:3, down:-2, eff:"杠杆5", kws:[{type:'leverage', value:5}]}),
  mkK({name:"精酿品牌", rarity:1, category:"美酒股", up:2, down:0, eff:"分红3", kws:[{type:'dividend', count:3}]}),
  mkK({name:"陈年酒窖", rarity:1, category:"美酒股", up:3, down:-1, eff:"分红2 | 弹性1", kws:[{type:'dividend', count:2},{type:'price_up', value:1}]}),
  mkK({name:"酒业龙头", rarity:2, category:"美酒股", up:3, down:-1, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:1}]}),
  mkK({name:"庆典品牌联盟", rarity:2, category:"美酒股", up:3, down:-1, eff:"看涨1 | 分红2", kws:[{type:'boost_up', value:0.10},{type:'dividend', count:2}]}),
  mkK({name:"宴席消费潮", rarity:2, category:"美酒股", up:3, down:-2, eff:"跟风：前一位上涨时，本股在本次开盘临时获得弹性2", kws:[{type:'prev_up_bonus', value:2}]}),
  mkK({name:"节日行情酒", rarity:2, category:"美酒股", up:3, down:-1, eff:"带头：上涨后使后续股票在本次开盘临时获得弹性1", kws:[{type:'after_up_price_next', value:1}]}),
  mkK({name:"庆典酒王", rarity:3, category:"美酒股", up:6, down:-2, eff:"分红5 | 止盈：清仓时额外+3", kws:[{type:'dividend', count:5},{type:'on_clear_bonus', value:3}]}),
  mkK({name:"顶级茅台", rarity:3, category:"美酒股", up:6, down:-1, eff:"分红4 | 弹性2 | 龙头", kws:[{type:'dividend', count:4},{type:'price_up', value:2},{type:'adj_up_bonus', value:1}]}),

  // 农业股
  mkK({name:"小树苗", rarity:1, category:"农业股", up:1, down:-3, eff:"提价1", kws:[{type:'price_up', value:1}]}),
  mkK({name:"农家乐", rarity:1, category:"农业股", up:2, down:-1, eff:"分红2", kws:[{type:'dividend', count:2}]}),
  mkK({name:"花园种植园", rarity:1, category:"农业股", up:3, down:-1, eff:"看涨1 | 提价1", kws:[{type:'boost_up', value:0.10},{type:'price_up', value:1}]}),
  mkK({name:"农机合作社", rarity:1, category:"农业股", up:2, down:0, eff:"防守1 | 分红1", kws:[{type:'insurance', value:1},{type:'dividend', count:1}]}),
  mkK({name:"区域农业龙头", rarity:2, category:"农业股", up:4, down:-1, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:2}]}),
  mkK({name:"供应链农业集团", rarity:2, category:"农业股", up:4, down:0, eff:"看涨1 | 分红2", kws:[{type:'boost_up', value:0.10},{type:'dividend', count:2}]}),
  mkK({name:"补涨农产品", rarity:2, category:"农业股", up:3, down:-1, eff:"承接：前一位下跌时，本股在本次开盘临时获得防守2", kws:[{type:'prev_down_bonus', value:2}]}),
  mkK({name:"粮食安全主题股", rarity:2, category:"农业股", up:4, down:0, eff:"防守1 | 看涨1", kws:[{type:'insurance', value:1},{type:'boost_up', value:0.10}]}),
  mkK({name:"丰收结算季", rarity:3, category:"农业股", up:5, down:0, eff:"分红3 | 兑现：清仓时额外+3", kws:[{type:'dividend', count:3},{type:'on_clear_bonus', value:3}]}),
  mkK({name:"农业龙头集团", rarity:3, category:"农业股", up:5, down:0, eff:"分红3 | 看涨2 | 龙头", kws:[{type:'dividend', count:3},{type:'boost_up', value:0.20},{type:'adj_up_bonus', value:1}]}),

  // 保险股
  mkK({name:"意外险", rarity:1, category:"保险股", up:1, down:0, eff:"防守2", kws:[{type:'insurance', value:2}]}),
  mkK({name:"医疗险", rarity:1, category:"保险股", up:2, down:0, eff:"防守1 | 分红1", kws:[{type:'insurance', value:1},{type:'dividend', count:1}]}),
  mkK({name:"车险组合", rarity:1, category:"保险股", up:2, down:0, eff:"防守3", kws:[{type:'insurance', value:3}]}),
  mkK({name:"财产险", rarity:1, category:"保险股", up:2, down:0, eff:"防守1 | 清仓价值1", kws:[{type:'insurance', value:1},{type:'principal', value:1}]}),
  mkK({name:"再保险龙头", rarity:2, category:"保险股", up:3, down:0, eff:"龙头承接：同板块下跌时，本股在本次开盘临时获得群体防守", kws:[{type:'adj_down_bonus', value:1}]}),
  mkK({name:"联保平台", rarity:2, category:"保险股", up:3, down:0, eff:"看涨1 | 防守2", kws:[{type:'boost_up', value:0.10},{type:'insurance', value:2}]}),
  mkK({name:"避险资金池", rarity:2, category:"保险股", up:3, down:-1, eff:"承接：前一位下跌时，本股在本次开盘临时获得防守2", kws:[{type:'prev_down_bonus', value:2}]}),
  mkK({name:"风险对冲盘", rarity:2, category:"保险股", up:3, down:0, eff:"防守2 | 止盈：清仓时额外+2", kws:[{type:'insurance', value:2},{type:'on_clear_bonus', value:2}]}),
  mkK({name:"赔付结算中心", rarity:3, category:"保险股", up:3, down:0, eff:"清仓价值2 | 止盈：清仓时额外+3", kws:[{type:'principal', value:2},{type:'on_clear_bonus', value:3}]}),
  mkK({name:"超级保障集团", rarity:3, category:"保险股", up:4, down:1, eff:"防守4 | 看涨1 | 龙头承接", kws:[{type:'insurance', value:4},{type:'boost_up', value:0.10},{type:'adj_down_bonus', value:1}]}),

  // 电力股
  mkK({name:"小型水电站", rarity:1, category:"电力股", up:2, down:0, eff:"看涨1", kws:[{type:'boost_up', value:0.10}]}),
  mkK({name:"火力电厂", rarity:1, category:"电力股", up:3, down:-1, eff:"看涨1 | 弹性1", kws:[{type:'boost_up', value:0.10},{type:'price_up', value:1}]}),
  mkK({name:"电网调度中心", rarity:1, category:"电力股", up:2, down:0, eff:"稳定参与：固有", kws:[{type:'innate'}]}),
  mkK({name:"储能设施", rarity:1, category:"电力股", up:2, down:0, eff:"分红2", kws:[{type:'dividend', count:2}]}),
  mkK({name:"区域电网龙头", rarity:2, category:"电力股", up:4, down:0, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:1}]}),
  mkK({name:"联网输电枢纽", rarity:2, category:"电力股", up:4, down:0, eff:"看涨1：稳定供能", kws:[{type:'boost_up', value:0.10}]}),
  mkK({name:"工业供电网", rarity:2, category:"电力股", up:4, down:-1, eff:"带头：上涨后使后续股票在本次开盘临时获得弹性1", kws:[{type:'after_up_price_next', value:1}]}),
  mkK({name:"算力供电中心", rarity:2, category:"电力股", up:4, down:0, eff:"带头：上涨后使后续股票在本次开盘临时获得看涨1", kws:[{type:'after_up_boost_next', value:0.10}]}),
  mkK({name:"电力现货市场", rarity:3, category:"电力股", up:4, down:0, eff:"分红2 | 弹性1", kws:[{type:'dividend', count:2},{type:'price_up', value:1}]}),
  mkK({name:"国家电网集团", rarity:3, category:"电力股", up:5, down:0, eff:"固有 | 看涨2 | 带头", kws:[{type:'innate'},{type:'boost_up', value:0.20},{type:'after_up_boost_next', value:0.10}]}),

  // 科技股
  mkK({name:"云计算概念", rarity:1, category:"科技股", up:4, down:-3, eff:"看涨1", kws:[{type:'boost_up', value:0.10}]}),
  mkK({name:"AI应用厂商", rarity:1, category:"科技股", up:5, down:-3, eff:"弹性1", kws:[{type:'price_up', value:1}]}),
  mkK({name:"芯片设计公司", rarity:1, category:"科技股", up:6, down:-4, eff:"杠杆5：高弹性高波动", kws:[{type:'leverage', value:5}]}),
  mkK({name:"算力租赁平台", rarity:1, category:"科技股", up:5, down:-4, eff:"跟风：前一位上涨时，本股在本次开盘临时获得看涨2", kws:[{type:'prev_up_boost', value:0.20}]}),
  mkK({name:"热点龙头股", rarity:2, category:"科技股", up:6, down:-4, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:2}]}),
  mkK({name:"联动题材股", rarity:2, category:"科技股", up:6, down:-4, eff:"带头：上涨后使后续股票在本次开盘临时获得看涨1", kws:[{type:'after_up_boost_next', value:0.10}]}),
  mkK({name:"机器人产业链", rarity:2, category:"科技股", up:6, down:-4, eff:"带头：上涨后使后续股票在本次开盘临时获得弹性1", kws:[{type:'after_up_price_next', value:1}]}),
  mkK({name:"金融科技平台", rarity:2, category:"科技股", up:6, down:-4, eff:"看涨1 | 弹性1", kws:[{type:'boost_up', value:0.10},{type:'price_up', value:1}]}),
  mkK({name:"妖股孵化器", rarity:2, category:"科技股", up:7, down:-5, eff:"妖股", kws:[{type:'demon_stock', value:10}]}),
  mkK({name:"量子科技龙头", rarity:3, category:"科技股", up:10, down:-8, eff:"连板预期 | 妖股 | 龙头", kws:[{type:'crazy_up', ready:true},{type:'demon_stock', value:10},{type:'adj_up_bonus', value:2}]}),

  // 古董股
  mkK({name:"铜币收藏", rarity:1, category:"古董股", up:2, down:0, eff:"清仓价值1", kws:[{type:'principal', value:1}]}),
  mkK({name:"邮票册", rarity:1, category:"古董股", up:3, down:0, eff:"清仓价值1 | 防守1", kws:[{type:'principal', value:1},{type:'insurance', value:1}]}),
  mkK({name:"老怀表", rarity:1, category:"古董股", up:3, down:-1, eff:"分红2", kws:[{type:'dividend', count:2}]}),
  mkK({name:"旧瓷器", rarity:1, category:"古董股", up:4, down:-1, eff:"清仓价值1 | 弹性1", kws:[{type:'principal', value:1},{type:'price_up', value:1}]}),
  mkK({name:"拍卖行龙头", rarity:2, category:"古董股", up:5, down:0, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:1}]}),
  mkK({name:"收藏协会", rarity:2, category:"古董股", up:4, down:0, eff:"看涨1：保值升温", kws:[{type:'boost_up', value:0.10}]}),
  mkK({name:"避险藏品", rarity:2, category:"古董股", up:4, down:0, eff:"承接：前一位下跌时，本股在本次开盘临时获得防守2", kws:[{type:'prev_down_bonus', value:2}]}),
  mkK({name:"传世资产包", rarity:2, category:"古董股", up:4, down:0, eff:"分红2 | 防守1", kws:[{type:'dividend', count:2},{type:'insurance', value:1}]}),
  mkK({name:"国宝拍卖会", rarity:3, category:"古董股", up:5, down:0, eff:"清仓价值2 | 止盈：清仓时额外+4", kws:[{type:'principal', value:2},{type:'on_clear_bonus', value:4}]}),
  mkK({name:"黄金藏馆", rarity:3, category:"古董股", up:5, down:0, eff:"清仓价值3 | 防守1 | 止盈+5", kws:[{type:'principal', value:3},{type:'insurance', value:1},{type:'on_clear_bonus', value:5}]})
];

LIB.length = 0;
LIB.push(...LIB_STOCK_V36);

// 降复杂度：1 星卡默认不携带复杂条件词条；同时拉开类别涨跌体感
const COMPLEX_CONDITION_TYPES = new Set([
  'first_row_up_bonus','tail_row_up_bonus','first_row_boost','tail_row_boost',
  'prev_up_boost','prev_up_bonus','adj_up_bonus',
  'after_up_boost_next','after_up_price_next',
  'first_row_down_bonus','tail_row_down_bonus','prev_down_bonus','adj_down_bonus',
  'on_buy_money','on_clear_bonus'
]);

function tuneStockCardProfile(card){
  const r = Math.max(1, Number(card.rarity || 1));
  if(card.category === "科技股"){
    card.up = Math.max(card.up, 4 + r * 2);
    card.down = Math.min(card.down, -(3 + r * 2));
  }else if(card.category === "保险股"){
    card.up = Math.max(card.up, 1 + r);
    card.down = Math.max(card.down, 0);
  }else if(card.category === "电力股"){
    card.up = Math.max(card.up, 2 + r);
    card.down = Math.max(card.down, -1);
  }else if(card.category === "农业股"){
    card.up = Math.max(card.up, 1 + r * 2);
    card.down = Math.min(card.down, -(1 + r));
  }else if(card.category === "古董股"){
    card.up = Math.max(card.up, 3 + r * 2);
    card.down = Math.min(card.down, -Math.max(0, r - 2));
  }else if(card.category === "美酒股"){
    card.up = Math.max(card.up, 2 + r);
    card.down = Math.min(card.down, -(1 + Math.max(0, r - 1)));
  }else{
    card.up = Math.max(card.up, 1 + r);
    card.down = Math.min(card.down, 0);
  }
}

LIB.forEach((card)=>{
  if(!Array.isArray(card.keywords)) card.keywords = [];
  if(Number(card.rarity || 1) === 1){
    card.keywords = card.keywords.filter((kw)=>!COMPLEX_CONDITION_TYPES.has(kw.type));
  }
  tuneStockCardProfile(card);
});


function createCardByName(name){
  const base = LIB.find(c=>c.name===name);
  if(!base) return null;
  // clone into a fresh card instance
  return {
    ...base,
    id: Math.random().toString(16).slice(2) + Date.now().toString(16)
  };
}

function applyV40FormalConfig(){
  GAME_BALANCE.starterAssetCount = 3;
  GAME_BALANCE.rewardAssetChoiceCount = 3;
  GAME_BALANCE.tickerItems = [
    "沪A·量子科技龙头 +8",
    "深B·超级保障集团 +4",
    "创业·国家电网集团 +4",
    "古董·黄金藏馆 +5",
    "农业·机械农场 +4",
    "人才·资本操盘总监 +4"
  ];

  const v40Curve = [
    { opens:5, target:25, storySuffix:"首轮试盘", storyLine1:"先用稳定底仓熟悉资金池和开盘节奏。", storyLine2:"第一轮交易卡免费，优先理解系统。", storyLine3:"达成本轮交付后获得第一次强化。" },
    { opens:5, target:50, storySuffix:"月度考核", storyLine1:"从这一轮开始，交易卡按费用结算。", storyLine2:"开始学习为了交付做取舍。", storyLine3:"不要只看爆发，也要考虑保底。" },
    { opens:6, target:100, storySuffix:"市场波动", storyLine1:"开盘次数增加，补股质量开始拉开差距。", storyLine2:"尝试围绕一个板块做简单组合。", storyLine3:"保险池和红利池会开始体现差异。" },
    { opens:6, target:150, storySuffix:"季度冲刺", storyLine1:"中前期正式进入压力测试。", storyLine2:"有些局需要稳交付，有些局可以赌爆发。", storyLine3:"开始考虑升级池子的价值。" },
    { opens:7, target:200, storySuffix:"板块成型", storyLine1:"主力股票开始显现。", storyLine2:"强化卡的方向会决定这一局怎么走。", storyLine3:"能保住主C，比盲目加新股更重要。" },
    { opens:7, target:300, storySuffix:"监管风暴", storyLine1:"目标明显上升，单靠散装收益不够了。", storyLine2:"要么做更强组合，要么学会套现。", storyLine3:"从这轮开始，加池子开始有战略价值。" },
    { opens:8, target:400, storySuffix:"年中汇报", storyLine1:"进入中后期，交付难度持续上升。", storyLine2:"同板块联动和站位开始变得关键。", storyLine3:"你需要学会把弱股换成能带节奏的股。" },
    { opens:8, target:500, storySuffix:"熊市试炼", storyLine1:"下跌环境下，保底能力会非常重要。", storyLine2:"一味追涨可能会把整轮节奏打崩。", storyLine3:"保险、古董、农业开始有更大价值。" },
    { opens:9, target:600, storySuffix:"绝地反击", storyLine1:"这是高压冲刺段。", storyLine2:"如果主C还没成型，现在就要定方向。", storyLine3:"高风险池和强化爆发开始值得一赌。" },
    { opens:9, target:700, storySuffix:"决战前夜", storyLine1:"距离终局越来越近。", storyLine2:"每次调整都要想清楚是为了爆发还是为了保命。", storyLine3:"交易卡的节奏价值高于表面收益。" },
    { opens:10, target:850, storySuffix:"最终考验", storyLine1:"后期的盘面质量决定成败。", storyLine2:"弱牌要敢卖，强牌要敢养。", storyLine3:"最后两轮不再只是补数值，而是做选择。" },
    { opens:10, target:1000, storySuffix:"幸运交付", storyLine1:"最后一轮，全力冲向 1000。", storyLine2:"这是终局轮，专注把现有盘面打满。", storyLine3:"完成交付，就是本局胜利。" }
  ];

  LEVELS.forEach((lvl, i)=>{
    const cfg = v40Curve[i];
    if(!cfg) return;
    lvl.opens = cfg.opens;
    lvl.target = cfg.target;
    lvl.cap = Number.MAX_SAFE_INTEGER;
    lvl.storySuffix = cfg.storySuffix;
    lvl.storyLine1 = cfg.storyLine1;
    lvl.storyLine2 = cfg.storyLine2;
    lvl.storyLine3 = cfg.storyLine3;
    lvl.storyTitle = `第${cfg.round || (i + 1)}轮 · ${cfg.storySuffix}`;
    lvl.stratPick = i === LEVELS.length - 1 ? 0 : 1;
    lvl.stratShow = i === LEVELS.length - 1 ? 0 : 3;
  });

  const V40_STOCK_POOL = [
    mkK({name:"小型水电站", rarity:1, category:"电力股", up:2, down:0, eff:"看涨1", kws:[{type:'boost_up', value:0.10}]}),
    mkK({name:"储能设施", rarity:1, category:"电力股", up:2, down:0, eff:"带头：上涨后使后续股票获得弹性1", kws:[{type:'after_up_price_next', value:1}]}),
    mkK({name:"区域电网", rarity:2, category:"电力股", up:3, down:0, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:1}]}),
    mkK({name:"输电枢纽", rarity:2, category:"电力股", up:3, down:-1, eff:"带头：上涨后使后续股票获得看涨1", kws:[{type:'after_up_boost_next', value:0.10}]}),
    mkK({name:"国家电网集团", rarity:3, category:"电力股", up:4, down:0, eff:"看涨2 | 带头：上涨后使后续股票获得看涨1", kws:[{type:'boost_up', value:0.20},{type:'after_up_boost_next', value:0.10}]}),
    mkK({name:"算力供电中心", rarity:3, category:"电力股", up:4, down:0, eff:"看涨1 | 带头：上涨后使后续股票获得弹性1", kws:[{type:'boost_up', value:0.10},{type:'after_up_price_next', value:1}]}),

    mkK({name:"云计算概念", rarity:1, category:"科技股", up:4, down:-3, eff:"看涨1", kws:[{type:'boost_up', value:0.10}]}),
    mkK({name:"AI应用厂商", rarity:1, category:"科技股", up:5, down:-3, eff:"弹性1", kws:[{type:'price_up', value:1}]}),
    mkK({name:"算力租赁平台", rarity:2, category:"科技股", up:5, down:-4, eff:"跟风：前一位上涨时，本股临时获得看涨2", kws:[{type:'prev_up_boost', value:0.20}]}),
    mkK({name:"机器人产业链", rarity:2, category:"科技股", up:5, down:-4, eff:"带头：上涨后使后续股票获得弹性1", kws:[{type:'after_up_price_next', value:1}]}),
    mkK({name:"妖股孵化器", rarity:3, category:"科技股", up:6, down:-5, eff:"妖化：上涨时额外爆发，随后自动清仓", kws:[{type:'demon_stock', value:10}]}),
    mkK({name:"量子科技龙头", rarity:3, category:"科技股", up:8, down:-7, eff:"连板预期 | 妖化 | 龙头", kws:[{type:'crazy_up', ready:true},{type:'demon_stock', value:10},{type:'adj_up_bonus', value:2}]}),

    mkK({name:"意外险", rarity:1, category:"保险股", up:1, down:0, eff:"防守2", kws:[{type:'insurance', value:2}]}),
    mkK({name:"医疗险", rarity:1, category:"保险股", up:2, down:0, eff:"防守1", kws:[{type:'insurance', value:1}]}),
    mkK({name:"联保平台", rarity:2, category:"保险股", up:2, down:0, eff:"承接：同板块下跌越多，本股越稳", kws:[{type:'adj_down_bonus', value:1}]}),
    mkK({name:"风险对冲盘", rarity:2, category:"保险股", up:3, down:0, eff:"承接：前一位下跌时，本股额外 +2", kws:[{type:'prev_down_bonus', value:2}]}),
    mkK({name:"赔付结算中心", rarity:3, category:"保险股", up:3, down:0, eff:"清仓价值2 | 止盈+4", kws:[{type:'principal', value:2},{type:'on_clear_bonus', value:4}]}),
    mkK({name:"超级保障集团", rarity:3, category:"保险股", up:4, down:1, eff:"防守4 | 看涨1 | 承接", kws:[{type:'insurance', value:4},{type:'boost_up', value:0.10},{type:'adj_down_bonus', value:1}]}),

    mkK({name:"向日葵", rarity:1, category:"农业股", up:1, down:-2, eff:"成长：每次上涨后永久 +1 上涨值", kws:[{type:'grow_up', value:1}]}),
    mkK({name:"农家乐", rarity:1, category:"农业股", up:2, down:-1, eff:"分红1", kws:[{type:'dividend', count:1}]}),
    mkK({name:"竹林", rarity:2, category:"农业股", up:3, down:-1, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:1}]}),
    mkK({name:"堆肥场", rarity:2, category:"农业股", up:2, down:0, eff:"带头：上涨后使后续股票获得看涨1", kws:[{type:'after_up_boost_next', value:0.10}]}),
    mkK({name:"机械农场", rarity:3, category:"农业股", up:4, down:-2, eff:"成长：每次开盘前永久 +1 上涨值", kws:[{type:'grow_each_open', value:1}]}),
    mkK({name:"丰收结算季", rarity:3, category:"农业股", up:4, down:0, eff:"分红3 | 清仓时额外 +3", kws:[{type:'dividend', count:3},{type:'on_clear_bonus', value:3}]}),

    mkK({name:"铜币收藏", rarity:1, category:"古董股", up:2, down:0, eff:"清仓价值1", kws:[{type:'principal', value:1}]}),
    mkK({name:"旧瓷器", rarity:1, category:"古董股", up:3, down:-1, eff:"升值：上涨后清仓价值 +1", kws:[{type:'grow_principal_up', value:1}]}),
    mkK({name:"邮票册", rarity:2, category:"古董股", up:3, down:0, eff:"清仓价值1 | 止盈+2", kws:[{type:'principal', value:1},{type:'on_clear_bonus', value:2}]}),
    mkK({name:"拍卖行", rarity:2, category:"古董股", up:4, down:-1, eff:"清仓价值1 | 弹性1", kws:[{type:'principal', value:1},{type:'price_up', value:1}]}),
    mkK({name:"国宝拍卖会", rarity:3, category:"古董股", up:4, down:0, eff:"清仓价值2 | 止盈+4", kws:[{type:'principal', value:2},{type:'on_clear_bonus', value:4}]}),
    mkK({name:"黄金藏馆", rarity:3, category:"古董股", up:5, down:0, eff:"清仓价值3 | 防守1 | 止盈+5", kws:[{type:'principal', value:3},{type:'insurance', value:1},{type:'on_clear_bonus', value:5}]}),

    mkK({name:"实习交易员", rarity:1, category:"人才股", up:1, down:-1, eff:"入股收益 +2", kws:[{type:'on_buy_money', value:2}]}),
    mkK({name:"复盘分析师", rarity:1, category:"人才股", up:2, down:0, eff:"看涨1", kws:[{type:'boost_up', value:0.10}]}),
    mkK({name:"板块研究员", rarity:2, category:"人才股", up:3, down:0, eff:"龙头：同板块上涨越多，本股越赚", kws:[{type:'adj_up_bonus', value:2}]}),
    mkK({name:"机构操盘手", rarity:2, category:"人才股", up:3, down:0, eff:"带头：上涨后使后续股票获得看涨1", kws:[{type:'after_up_boost_next', value:0.10}]}),
    mkK({name:"首席策略官", rarity:3, category:"人才股", up:4, down:0, eff:"看涨2 | 龙头", kws:[{type:'boost_up', value:0.20},{type:'adj_up_bonus', value:1}]}),
    mkK({name:"资本操盘总监", rarity:3, category:"人才股", up:4, down:0, eff:"看涨2 | 带头：上涨后使后续股票获得弹性1", kws:[{type:'boost_up', value:0.20},{type:'after_up_price_next', value:1}]})
  ];

  LIB.length = 0;
  LIB.push(...V40_STOCK_POOL);
}

applyV40FormalConfig();


