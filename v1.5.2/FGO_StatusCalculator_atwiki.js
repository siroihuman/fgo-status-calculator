(function () {
  "use strict";

  const VERSION = "1.5.2";
  // atwiki rejects external JavaScript containing literal include-plugin commands.
  // Build the token at runtime so generated servant text remains unchanged.
  const PUKIWIKI_HASH = String.fromCharCode(35);
  const INCLUDE_CACHE_TOKEN = `${PUKIWIKI_HASH}include_cache`;

  const RARITY = {
    1: { base: 1, label: "C", initHp: 1500, maxHp: 7500, initAtk: 1000, maxAtk: 5500, normal: [20, 30, 40, 50, 60], grail: [70, 80, 90, 100, 120] },
    2: { base: 2, label: "UC", initHp: 1600, maxHp: 8500, initAtk: 1100, maxAtk: 6200, normal: [25, 35, 45, 55, 65], grail: [70, 80, 90, 100, 120] },
    3: { base: 3, label: "R", initHp: 1800, maxHp: 10000, initAtk: 1300, maxAtk: 7000, normal: [30, 40, 50, 60, 70], grail: [80, 90, 100, 120] },
    4: { base: 4, label: "SR", initHp: 2000, maxHp: 12500, initAtk: 1500, maxAtk: 9000, normal: [40, 50, 60, 70, 80], grail: [90, 100, 120] },
    5: { base: 5, label: "SSR", initHp: 2200, maxHp: 15000, initAtk: 1700, maxAtk: 11000, normal: [50, 60, 70, 80, 90], grail: [100, 120] }
  };

  const RARITY_META = {
    0: { icon: "銅", cost: 4 },
    1: { icon: "銅", cost: 3 },
    2: { icon: "銅", cost: 4 },
    3: { icon: "銀", cost: 9 },
    4: { icon: "金", cost: 12 },
    5: { icon: "金", cost: 16 }
  };

  const GRAIL_RATE = {
    1: { 70: 1.169, 80: 1.338, 90: 1.508, 100: 1.677, 110: 1.847, 120: 2.016 },
    2: { 70: 1.078, 80: 1.234, 90: 1.390, 100: 1.546, 110: 1.703, 120: 1.859 },
    3: { 70: 1.000, 80: 1.144, 90: 1.289, 100: 1.434, 110: 1.579, 120: 1.724 },
    4: { 70: 1.000, 80: 1.000, 90: 1.126, 100: 1.253, 110: 1.378, 120: 1.506 },
    5: { 70: 1.000, 80: 1.000, 90: 1.000, 100: 1.112, 110: 1.224, 120: 1.337 }
  };

  const CLASS = {
    "剣": { name: "セイバー", hp: 1.01, atk: 1.01, sw: 100, dr: 35, na: 1.50, sr: 10, nd: 3 },
    "弓": { name: "アーチャー", hp: 0.98, atk: 1.02, sw: 150, dr: 45, na: 1.55, sr: 8, nd: 3 },
    "槍": { name: "ランサー", hp: 1.02, atk: 0.98, sw: 90, dr: 40, na: 1.45, sr: 12, nd: 4 },
    "騎": { name: "ライダー", hp: 0.96, atk: 0.97, sw: 200, dr: 50, na: 1.55, sr: 9, nd: 3 },
    "術": { name: "キャスター", hp: 0.98, atk: 0.94, sw: 50, dr: 60, na: 1.60, sr: 11, nd: 3 },
    "殺": { name: "アサシン", hp: 0.95, atk: 0.96, sw: 100, dr: 55, na: 1.45, sr: 25, nd: 4 },
    "狂": { name: "バーサーカー", hp: 0.90, atk: 1.03, sw: 10, dr: 65, na: 1.40, sr: 5, nd: 5 },
    "盾": { name: "シールダー", hp: 1.01, atk: 0.99, sw: 100, dr: 35, na: 1.50, sr: 10, nd: 3 },
    "裁": { name: "ルーラー", hp: 1.00, atk: 0.95, sw: 100, dr: 35, na: 1.50, sr: 10, nd: 3 },
    "讐": { name: "アヴェンジャー", hp: 0.88, atk: 1.05, sw: 30, dr: 10, na: 1.45, sr: 6, nd: 5 },
    "月": { name: "ムーンキャンサー", hp: 1.05, atk: 0.94, sw: 50, dr: 1, na: 1.60, sr: 15, nd: 3 },
    "分": { name: "アルターエゴ", hp: 0.95, atk: 1.02, sw: 100, dr: 50, na: 1.55, sr: 10, nd: 4 },
    "降": { name: "フォーリナー", hp: 1.00, atk: 1.00, sw: 150, dr: 10, na: 1.50, sr: 15, nd: 3 },
    "詐": { name: "プリテンダー", hp: 0.95, atk: 1.02, sw: 100, dr: 30, na: 1.55, sr: 20, nd: 3 },
    "獣": { name: "ビースト", hp: 0.97, atk: 1.03, sw: 150, dr: 1, na: 1.50, sr: 10, nd: 3 }
  };

  const TENDENCY = {
    "HP偏重": { hp: 1.10, atk: 0.90 },
    "HP寄り": { hp: 1.05, atk: 0.95 },
    "平均": { hp: 1.00, atk: 1.00 },
    "ATK寄り": { hp: 0.95, atk: 1.05 },
    "ATK偏重": { hp: 0.90, atk: 1.10 }
  };

  const GROWTH = {
    "凸型": { 5: [0.65, 0.79, 0.90, 0.97], 4: [0.59, 0.75, 0.88, 0.97], 3: [0.50, 0.69, 0.85, 0.96], 2: [0.44, 0.64, 0.83, 0.95], 1: [0.35, 0.60, 0.81, 0.94] },
    "凸型弱": { 5: [0.63, 0.74, 0.85, 0.93], 4: [0.57, 0.70, 0.83, 0.93], 3: [0.50, 0.66, 0.80, 0.92], 2: [0.45, 0.62, 0.77, 0.91], 1: [0.39, 0.58, 0.73, 0.90] },
    "平均": { 5: [0.61, 0.71, 0.80, 0.90], 4: [0.57, 0.68, 0.78, 0.89], 3: [0.52, 0.64, 0.76, 0.88], 2: [0.48, 0.61, 0.74, 0.87], 1: [0.44, 0.58, 0.72, 0.86] },
    "凹型弱": { 5: [0.60, 0.67, 0.76, 0.87], 4: [0.57, 0.64, 0.74, 0.86], 3: [0.55, 0.62, 0.72, 0.85], 2: [0.52, 0.59, 0.70, 0.84], 1: [0.50, 0.57, 0.68, 0.83] },
    "凹型": { 5: [0.58, 0.63, 0.72, 0.85], 4: [0.58, 0.61, 0.70, 0.83], 3: [0.57, 0.60, 0.67, 0.82], 2: [0.55, 0.59, 0.65, 0.80], 1: [0.52, 0.59, 0.64, 0.79] }
  };

  const ARTS_MOD = { 1: 1.50, 2: 1.125, 3: 1.00 };
  const NP_TYPE = {
    busterAll: { label: "Buster全体", factor: null, targets: null, wiki: "BGCOLOR(#F88):全体Ｂ", cardWiki: "BGCOLOR(#F88):Buster" },
    busterSingle: { label: "Buster単体", factor: null, targets: null, wiki: "BGCOLOR(#F88):単体Ｂ", cardWiki: "BGCOLOR(#F88):Buster" },
    busterSupport: { label: "Buster補助", factor: null, targets: null, wiki: "BGCOLOR(#F88):補助Ｂ", cardWiki: "BGCOLOR(#F88):Buster" },
    artsAll: { label: "Arts全体", factor: 3, targets: 3, wiki: "BGCOLOR(#9AF):全体Ａ", cardWiki: "BGCOLOR(#9AF):Arts" },
    artsSingle: { label: "Arts単体", factor: 3, targets: 1, wiki: "BGCOLOR(#9AF):単体Ａ", cardWiki: "BGCOLOR(#9AF):Arts" },
    artsSupport: { label: "Arts補助", factor: null, targets: null, wiki: "BGCOLOR(#9AF):補助Ａ", cardWiki: "BGCOLOR(#9AF):Arts" },
    quickAll: { label: "Quick全体", factor: 1, targets: 3, wiki: "BGCOLOR(#AF9):全体Ｑ", cardWiki: "BGCOLOR(#AF9):Quick" },
    quickSingle: { label: "Quick単体", factor: 1, targets: 1, wiki: "BGCOLOR(#AF9):単体Ｑ", cardWiki: "BGCOLOR(#AF9):Quick" },
    quickSupport: { label: "Quick補助", factor: null, targets: null, wiki: "BGCOLOR(#AF9):補助Ｑ", cardWiki: "BGCOLOR(#AF9):Quick" }
  };

  const AFFINITIES = ["天", "地", "人", "星", "獣"];
  const POLICIES = ["秩序", "中立", "混沌"];
  const PERSONALITIES = ["善", "中庸", "悪", "狂", "星", "獣", "夏", "花嫁"];
  const GENDERS = ["男性", "女性", "-"];

  const TRAIT_GROUPS = [
    { label: "基本", traits: ["ギリシャ神話系男性"] },
    { label: "クラススキル", traits: ["対魔力", "単独行動", "騎乗", "道具作成", "陣地作成", "気配遮断", "狂化", "神性", "復讐者", "忘却補正", "自己回復（魔力）", "領域外の生命"] },
    { label: "通常特性1", traits: ["ヒト科", "ヒト科以外", "ケモノ科", "魔獣型", "妖精", "悪魔", "魔性", "機械", "蛇", "竜", "鬼", "猛獣"] },
    { label: "通常特性2", traits: ["超巨大", "巨人", "王", "愛する者", "叛逆する者", "人類の脅威", "クトゥルフ", "対人", "炎"] },
    { label: "特殊特性1", traits: ["低レア", "アルトリア顔", "アーサー", "イリヤ", "信長", "源氏", "初代ローマ皇帝", "ローマ", "イギリスゆかりの者", "アルゴー号ゆかりの者", "円卓の騎士", "新選組", "梁山泊", "ワルキューレ"] },
    { label: "特殊特性2", traits: ["複数で一騎", "子供のサーヴァント", "童話", "四季・協奏曲", "霊衣を持つ者", "夏モード", "バニー系", "今を生きる人類", "ｴﾇﾏ特攻無効"] }
  ];
  const EDITABLE_TRAITS = TRAIT_GROUPS.flatMap((group) => group.traits);
  const EDITABLE_TRAIT_SET = new Set(EDITABLE_TRAITS);
  const BASE_TRAITS = ["サーヴァント", "人型"];
  const DEFAULT_TRAITS = [];
  const DERIVED_TRAITS = new Set([
    ...BASE_TRAITS,
    "男性", "女性", "性別不明", "秩序", "中立", "混沌", "善", "中庸", "悪", "狂", "星", "獣", "夏", "花嫁",
    "天の力", "地の力", "人の力", "星の力", "獣の力",
    ...Object.values(CLASS).map((classData) => classData.name)
  ]);
  const KNOWN_TRAITS = new Set([...EDITABLE_TRAITS, ...DERIVED_TRAITS]);
  const TRAIT_STAGE_OPTIONS = [
    ["all", "全再臨・霊衣共通（表記なし）"],
    ["none", "再臨なし（霊衣限定）"],
    ["1", "第一再臨"], ["2", "第二再臨"], ["3", "第三再臨"],
    ["12", "第一・第二再臨"], ["13", "第一・第三再臨"], ["23", "第二・第三再臨"]
  ];
  const TRAIT_STAGE_LABELS = {
    all: "全再臨", none: "", 1: "第一再臨", 2: "第二再臨", 3: "第三再臨",
    12: "第一・第二再臨", 13: "第一・第三再臨", 23: "第二・第三再臨"
  };
  const TRAIT_STAGE_SET = new Set(TRAIT_STAGE_OPTIONS.map(([value]) => value));

  const SERVANT_TEMPLATE = String.raw`
*No.
#divclass(fgowiki-clearfix){{{
#divclass(srv_menu){
#contents(fromhere=true)}
#divclass(gallery){{
}}
}}}

//─┤ステータス├──────────────────────────

*ステータス
**基本情報
|BGCOLOR(#98fb98):CENTER:46|BGCOLOR(#87ceeb):CENTER:46|BGCOLOR(#ffb6c1):CENTER:46|BGCOLOR(#e6e6fa):CENTER:58|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#e6e6fa):CENTER:20|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#e6e6fa):CENTER:20|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|BGCOLOR(#f5fffa):CENTER:50|c
|>|>|>|>|>|>|>|>|>|>|>|>|>|>|>|>|BGCOLOR(#17184b):COLOR(white):No.|
|>|>|BGCOLOR(#e6e6fa):真名|>|>|>|>|>|>|>|>|>|>|>|>|>|[[>/データ]]|
|>|>|BGCOLOR(#e6e6fa):Class|>|>|&ref(剣金.png,icon/class,width=30)|>|BGCOLOR(#e6e6fa):Rare|5|BGCOLOR(#e6e6fa):Cost|16|>|BGCOLOR(#e6e6fa):傾向|>||BGCOLOR(#e6e6fa):タイプ||
|>|>|BGCOLOR(#e6e6fa):コマンドカード|能力値|BGCOLOR(#e6e6fa):Lv. 1|BGCOLOR(#e6e6fa):Lv.50|霊基再臨|BGCOLOR(#e6e6fa):Lv.60|BGCOLOR(#e6e6fa):Lv.70|BGCOLOR(#e6e6fa):Lv.80|BGCOLOR(#e6e6fa):Lv.90|聖杯転臨|BGCOLOR(#e6e6fa):Lv.100|BGCOLOR(#e6e6fa):Lv.120|BGCOLOR(#e6e6fa):|BGCOLOR(#e6e6fa):|BGCOLOR(#e6e6fa):|
|Quick|Arts|Buster|HP|||~|||||~||||||
||||ATK|||~|||||~||||||
//#region(close,真名)
//
//#endregion()
//#region(のクラス相性)
//|>|BGCOLOR(#CCFFCC):CENTER:のクラス相性|
//|BGCOLOR(#CCFFCC):CENTER:有利|&ref(槍銀.png,icon/class,height=48,width=48)|
//|~|〔〕 / |
//|BGCOLOR(#CCFFCC):CENTER:不利|&ref(弓銀.png,icon/class,height=48,width=48)|
//|~|〔〕 / |
//|BGCOLOR(#CCFFCC):CENTER:等倍|&ref(全銀.png,icon/class,height=48,width=48)|
//|~|〔〕 / |
//#endregion



//─┤隠しステータス├────────────────────────

***隠しステータス　&nobold{サーヴァント属性＆特性・バトル補正値}
#openclose(margin:0;,padding:0;,border:none;,show=▼表示/非表示,){{{
|BGCOLOR(#e6e6fa):CENTER:95|BGCOLOR(#f5fffa):CENTER:70|BGCOLOR(#f5fffa):CENTER:70|BGCOLOR(#f5fffa):CENTER:70|BGCOLOR(#f5fffa):CENTER:70|BGCOLOR(#f5fffa):CENTER:70|BGCOLOR(#e6e6fa):CENTER:95|BGCOLOR(#f5fffa):CENTER:70|c
|>|>|>|>|>|>|>|BGCOLOR(#17184b):COLOR(white):隠しステータス|
|BGCOLOR(#e6e6fa):相性||BGCOLOR(#e6e6fa):属性|BGCOLOR(#e6e6fa):方針|BGCOLOR(#e6e6fa):性格|BGCOLOR(#e6e6fa):性別|宝具|BGCOLOR(#F88):単体Ｂ|
|BGCOLOR(#e6e6fa):成長||~||||スター発生率|00.0|
|ヒット数|BGCOLOR(#98fb98):Q|BGCOLOR(#87ceeb):A|BGCOLOR(#ffb6c1):B|BGCOLOR(#c0c0c0):EX|BGCOLOR(#f9e38d):宝具|スター集中度|0|
|~||||||DR&footnote(即死攻撃を受けた時の補正値。数値が低いほど死に難い。)|0.0|
|N/A&footnote(攻撃時のNP上昇基礎値)|>|>|>|>|0.00|N/D&footnote(攻撃を受けた際のNP上昇基礎値)|.00|
|特性|>|>|>|>|>|>|LEFT:サーヴァント / 人型 /  /  /  /  /  / |
}}}

// N/A補正値
//Arts全体補正幅(減少傾向)：＋0.15 ～ －0.35
//Arts単体補正幅(増加傾向)：＋0.20 ～ －0.28
//Quick全体補正幅(減少傾向)：＋0.20 ～ －0.74
//Quick単体補正幅(据置傾向)：＋0.10 ～ －0.04

// 複数宝具用（※不要時は削除可）
//|BGCOLOR(#f9e38d):/|


//─┤宝具├─────────────────────────────

**宝具
////真名隠し状態の宝具が作中にある場合はコメントアウトを外す
////#divclass(truenameNoble){{{
//|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:65|BGCOLOR(#e6e6fa):CENTER:429|>|>|>|>|BGCOLOR(#e6e6fa):CENTER:40|c
//|>|>|>|~&br()？？？|>|>|>|>| |
//|Card|ランク|種別|効果|1|2|3|4|5|
//|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:65|BGCOLOR(#f5fffa):LEFT:429|>|>|>|>|BGCOLOR(#f5fffa):RIGHT:40|c
//|BGCOLOR(#F88):Buster|？|？？？|[Lv]&font(85%,#fff,#e44,b){　Buster(x1.5)　}||||||
//|~|~|~|＆<OC:効果UP>||||||
//#region(close,真名判明後)
//***真名判明後&nobold(){}

|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:65|BGCOLOR(#e6e6fa):CENTER:429|>|>|>|>|BGCOLOR(#e6e6fa):CENTER:40|c
|>|>|>|~&br()|>|>|>|>| |
|Card|ランク|種別|効果|1|2|3|4|5|
|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:65|BGCOLOR(#f5fffa):LEFT:429|>|>|>|>|BGCOLOR(#f5fffa):RIGHT:40|c
|BGCOLOR(#F88):Buster||対宝具|||||||
|~|~|~|||||||
|~|~|~|||||||
|~|~|~|||||||
|~|~|~|||||||
|~|~|~||>|>|>|>||
|~|~|~||>|>|>|>||
|~|~|~||>|>|>|>||
|~|~|~||>|>|>|>||
//#endregion
//強化後
//#br
////真名隠し状態の宝具が作中にある場合はコメントアウトを外す
////#divclass(truenameNoble){{{
//|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:65|BGCOLOR(#e6e6fa):CENTER:429|>|>|>|>|BGCOLOR(#e6e6fa):CENTER:40|c
//|>|>|>|~&br()？？？|>|>|>|>| |
//|Card|ランク|種別|効果|1|2|3|4|5|
//|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:65|BGCOLOR(#f5fffa):LEFT:429|>|>|>|>|BGCOLOR(#f5fffa):RIGHT:40|c
//|BGCOLOR(#F88):Buster|？|？？？|[Lv]&font(85%,#fff,#e44,b){　Buster(x1.5)　}||||||
//|~|~|~|＆<OC:効果UP>||||||
//#region(close,真名判明後)
//***真名判明後&nobold(){}

//|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:65|BGCOLOR(#e6e6fa):CENTER:429|>|>|>|>|BGCOLOR(#e6e6fa):CENTER:40|c
//|>|>|>|~&br()|>|>|>|>| |
//|Card|ランク|種別|効果|1|2|3|4|5|
//|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:65|BGCOLOR(#f5fffa):LEFT:429|>|>|>|>|BGCOLOR(#f5fffa):RIGHT:40|c
//|BGCOLOR(#F88):Buster||対宝具|||||||
//|~|~|~|||||||

////B宝具倍率（単・全）
//敵単体に超強力な攻撃[Lv] &font(85%,#fff,#e44,b){　Buster(x1.5)　}|600|800|900|950|1000|
//敵単体に超強力な攻撃[Lv] &font(85%,#fff,#e44,b){　Buster(x1.5)　}|800|1000|1100|1150|1200|
//敵全体に強力な攻撃[Lv] &font(85%,#fff,#e44,b){　Buster(x1.5)　}|300|400|450|475|500|
//敵全体に強力な攻撃[Lv] &font(85%,#fff,#e44,b){　Buster(x1.5)　}|400|500|550|575|600|

////A宝具倍率（単・全）
//敵単体に超強力な攻撃[Lv] &font(85%,#fff,#44e,b){　Arts(x1.0)　}|900|1200|1350|1425|1500|
//敵単体に超強力な攻撃[Lv] &font(85%,#fff,#44e,b){　Arts(x1.0)　}|1200|1500|1650|1725|1800|
//敵全体に強力な攻撃[Lv] &font(85%,#fff,#44e,b){　Arts(x1.0)　}|450|600|675|712.5|750|
//敵全体に強力な攻撃[Lv] &font(85%,#fff,#44e,b){　Arts(x1.0)　}|600|750|825|862.5|900|

////Q宝具倍率（単・全）
//敵単体に超強力な攻撃[Lv] &font(85%,#fff,#4e4,b){　Quick(x0.8)　}|1200|1600|1800|1900|2000|
//敵単体に超強力な攻撃[Lv] &font(85%,#fff,#4e4,b){　Quick(x0.8)　}|1600|2000|2200|2300|2400|
//敵全体に強力な攻撃[Lv] &font(85%,#fff,#4e4,b){　Quick(x0.8)　}|600|800|900|950|1000|
//敵全体に強力な攻撃[Lv] &font(85%,#fff,#4e4,b){　Quick(x0.8)　}|800|1000|1100|1150|1200|

////真名隠し状態の宝具が作中にある場合はコメントアウトを外す
//#endregion
//#endregion
//}}}

//─┤保有スキル├──────────────────────────

**保有スキル
***Skill1：
|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c
|BGCOLOR(#e6e6fa):CENTER:&ref(0.png,icon/skill,height=48)|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|
|~||[Lv]     |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
//***Skill1[強化後]：
//|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c
//|BGCOLOR(#e6e6fa):CENTER:&ref(0.png,icon/skill,height=48)|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|
//|~||[Lv]     |||||||||||
//|~|~|＆[Lv]   |||||||||||
//|~|~|＆   |>|>|>|>|>|>|>|>|>||

***Skill2：
|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c
|BGCOLOR(#e6e6fa):CENTER:&ref(0.png,icon/skill,height=48)|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|
|~||[Lv]     |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
//***Skill2[強化後]：
//|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c
//|BGCOLOR(#e6e6fa):CENTER:&ref(0.png,icon/skill,height=48)|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|
//|~||[Lv]     |||||||||||
//|~|~|＆[Lv]   |||||||||||
//|~|~|＆   |>|>|>|>|>|>|>|>|>||

***Skill3：
|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c
|BGCOLOR(#e6e6fa):CENTER:&ref(0.png,icon/skill,height=48)|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|
|~||[Lv]     |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆[Lv]   |||||||||||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
|~|~|＆   |>|>|>|>|>|>|>|>|>||
//***Skill3[強化後]：
//|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c
//|BGCOLOR(#e6e6fa):CENTER:&ref(0.png,icon/skill,height=48)|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|
//|~||[Lv]     |||||||||||
//|~|~|＆[Lv]   |||||||||||
//|~|~|＆   |>|>|>|>|>|>|>|>|>||


//─┤クラススキル├─────────────────────────

**クラススキル
|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#f5fffa):LEFT:359|BGCOLOR(#f5fffa):CENTER:45|c
|&ref(0.png,icon/skill,height=48)|>|BGCOLOR(#e6e6fa):CENTER:&font(b,110%){【スキル名】}&ref(.png,icon/class,title=セイバー,height=25,width=25)|
|~|||

|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#f5fffa):LEFT:359|BGCOLOR(#f5fffa):CENTER:45|c
|&ref(0.png,icon/skill,height=48)|>|BGCOLOR(#e6e6fa):CENTER:&font(b,110%){【スキル名】}&ref(.png,icon/class,title=セイバー,height=25,width=25)|
|~|||

//|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#f5fffa):LEFT:359|BGCOLOR(#f5fffa):CENTER:45|c
//|&ref(0.png,icon/skill,height=48)|>|BGCOLOR(#e6e6fa):CENTER:&font(b,110%){【スキル名】}&ref(.png,icon/class,title=セイバー,height=25,width=25)|
//|~|||

//|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#f5fffa):LEFT:359|BGCOLOR(#f5fffa):CENTER:45|c
//|&ref(0.png,icon/skill,height=48)|>|BGCOLOR(#e6e6fa):CENTER:&font(b,110%){【スキル名】}&ref(.png,icon/class,title=セイバー,height=25,width=25)|
//|~|||



//─┤絆礼装├─────────────────────────

*絆礼装
#region()
|BGCOLOR(#e6e6fa):CENTER:48|BGCOLOR(#f5fffa):CENTER:320|BGCOLOR(#f5fffa):LEFT:48|BGCOLOR(#fff8dc):CENTER:120|c
|>|>|>|BGCOLOR(#17184b):COLOR(white):　|
|Rare|4|BGCOLOR(#e6e6fa):CENTER:LV|80|
|Cost|9|BGCOLOR(#e6e6fa):CENTER:HP|100|
|タイプ|絆礼装|BGCOLOR(#e6e6fa):CENTER:ATK|100|
|>|>|>|BGCOLOR(#e6e6fa):|
|&ref(0.png,icon/skill,width=48)|>|&font(,b,#00cc58){}装備時のみ、&br()自身がフィールドにいる間、| |
|~|>|||
|~|>|||
|~|>|||
#endregion()




//─┤プロフィール├─────────────────────────

*プロフィール
**パラメーター
|BGCOLOR(#000):COLOR(#fff):CENTER:60|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#000):COLOR(#fff):CENTER:25|BGCOLOR(#000):0|BGCOLOR(#000):COLOR(#fff):CENTER:60|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#683f36):CENTER:20|BGCOLOR(#000):COLOR(#fff):CENTER:25|c
|筋力| |耐久|
|敏捷|~|魔力|
|幸運|~|宝具|

//─┤ボイス├────────────────────────────

*ボイス
#divclass(ledit){
[&link_edit(page=【ページ名】/ボイス,text=編集)]
}
${INCLUDE_CACHE_TOKEN}(【ページ名】/ボイス)

//─┤モーション├────────────────────────────

*モーション
#divclass(ledit){
[&link_edit(page=【ページ名】/モーション,text=編集)]
}
${INCLUDE_CACHE_TOKEN}(【ページ名】/モーション)
`.trim();

  const RANK = {
    "EX": { normal: 1.04, dr: 0.50 }, "A++": { normal: 1.03, dr: 0.55 },
    "A+": { normal: 1.025, dr: 0.575 }, "A": { normal: 1.02, dr: 0.60 },
    "A-": { normal: 1.015, dr: 0.625 }, "B++": { normal: 1.01, dr: 0.65 },
    "B+": { normal: 1.005, dr: 0.675 }, "B": { normal: 1.00, dr: 0.70 },
    "B-": { normal: 0.9975, dr: 0.725 }, "C++": { normal: 0.995, dr: 0.75 },
    "C+": { normal: 0.9925, dr: 0.775 }, "C": { normal: 0.99, dr: 0.80 },
    "C-": { normal: 0.9875, dr: 0.825 }, "D++": { normal: 0.985, dr: 0.85 },
    "D+": { normal: 0.9825, dr: 0.875 }, "D": { normal: 0.98, dr: 0.90 },
    "D-": { normal: 0.9775, dr: 0.925 }, "E++": { normal: 0.975, dr: 0.95 },
    "E+": { normal: 0.9725, dr: 0.975 }, "E": { normal: 0.97, dr: 1.00 },
    "E-": { normal: 0.9675, dr: 1.025 }, "-": { normal: 0.96, dr: 1.05 }
  };

  function roundDown(value, digits) {
    const power = Math.pow(10, digits);
    return Math.floor((Number(value) + 1e-12) * power) / power;
  }

  function numberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function optionalNumber(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeSelectedTraits(value) {
    let traits = value;
    if (typeof traits === "string") {
      try { traits = JSON.parse(traits); } catch (error) { traits = []; }
    }
    if (!Array.isArray(traits)) return DEFAULT_TRAITS.slice();
    const selected = new Set(traits.filter((trait) => EDITABLE_TRAIT_SET.has(trait)));
    return EDITABLE_TRAITS.filter((trait) => selected.has(trait));
  }

  function normalizeTraitRestrictions(value, selectedTraits) {
    let source = value;
    if (typeof source === "string") {
      try { source = JSON.parse(source); } catch (error) { source = {}; }
    }
    if (!source || typeof source !== "object" || Array.isArray(source)) source = {};
    const selected = new Set(normalizeSelectedTraits(
      typeof selectedTraits === "undefined" ? Object.keys(source) : selectedTraits
    ));
    const normalized = {};
    EDITABLE_TRAITS.forEach((trait) => {
      if (!selected.has(trait)) return;
      const item = source[trait] && typeof source[trait] === "object" ? source[trait] : {};
      let range = TRAIT_STAGE_SET.has(String(item.range)) ? String(item.range) : "all";
      const costume = stringValue(item.costume).trim();
      if (range === "none" && !costume) range = "all";
      if (range !== "all" || costume) normalized[trait] = { range, costume };
    });
    return normalized;
  }

  function traitRestrictionValue(value) {
    const item = value && typeof value === "object" ? value : {};
    const range = TRAIT_STAGE_SET.has(String(item.range)) ? String(item.range) : "all";
    return { range, costume: stringValue(item.costume).trim() };
  }

  function formatRestrictedTrait(trait, restriction) {
    const item = traitRestrictionValue(restriction);
    if (item.range === "all" && !item.costume) return trait;
    const labels = [];
    if (item.range !== "none") labels.push(TRAIT_STAGE_LABELS[item.range]);
    if (item.costume) labels.push(item.costume);
    return labels.length ? `${trait}（${labels.join("・")}）` : trait;
  }

  const EFFECT_MODES = new Set(["none", "fixed", "level10", "np5", "oc5"]);
  const EFFECT_TYPES = new Set(["normal", "nobleAttack", "specialAttack"]);
  const NOBLE_ATTACK_TARGETS = new Set(["auto", "single", "all"]);
  const NOBLE_ATTACK_STRENGTHS = new Set(["base", "upgraded"]);
  const NOBLE_CARD_META = {
    buster: { name: "Buster", color: "#e44", factor: "x1.5" },
    arts: { name: "Arts", color: "#44e", factor: "x1.0" },
    quick: { name: "Quick", color: "#4e4", factor: "x0.8" }
  };
  const NOBLE_ATTACK_MULTIPLIERS = {
    buster: {
      single: { base: [600, 800, 900, 950, 1000], upgraded: [800, 1000, 1100, 1150, 1200] },
      all: { base: [300, 400, 450, 475, 500], upgraded: [400, 500, 550, 575, 600] }
    },
    arts: {
      single: { base: [900, 1200, 1350, 1425, 1500], upgraded: [1200, 1500, 1650, 1725, 1800] },
      all: { base: [450, 600, 675, 712.5, 750], upgraded: [600, 750, 825, 862.5, 900] }
    },
    quick: {
      single: { base: [1200, 1600, 1800, 1900, 2000], upgraded: [1600, 2000, 2200, 2300, 2400] },
      all: { base: [600, 800, 900, 950, 1000], upgraded: [800, 1000, 1100, 1150, 1200] }
    }
  };
  const VARIANT_MODES = new Set(["name", "nameIcon", "nameEffect", "all"]);

  function stringValue(value) {
    return value === null || typeof value === "undefined" ? "" : String(value);
  }

  function emptyEffect() {
    return {
      prefix: "", text: "", valueMode: "none", values: [], raw: false, rawCode: "",
      effectType: "normal", attackTarget: "auto", attackStrength: "base", specialTarget: ""
    };
  }

  function normalizeEffect(effect) {
    const source = effect && typeof effect === "object" ? effect : {};
    const effectType = EFFECT_TYPES.has(source.effectType) ? source.effectType : "normal";
    let valueMode = EFFECT_MODES.has(source.valueMode) ? source.valueMode : "none";
    if (effectType === "specialAttack" && valueMode === "level10") valueMode = "np5";
    if (effectType === "specialAttack" && !["fixed", "np5", "oc5"].includes(valueMode)) valueMode = "fixed";
    if (effectType === "nobleAttack") valueMode = "none";
    const valueCount = valueMode === "level10" ? 10 : ["np5", "oc5"].includes(valueMode) ? 5 : valueMode === "fixed" ? 1 : 0;
    const values = Array.isArray(source.values) ? source.values.map(stringValue).slice(0, valueCount) : [];
    return {
      prefix: ["", "＆", "＋", "　＆"].includes(source.prefix) ? source.prefix : "",
      text: stringValue(source.text),
      valueMode,
      values,
      raw: Boolean(source.raw),
      rawCode: stringValue(source.rawCode),
      effectType,
      attackTarget: NOBLE_ATTACK_TARGETS.has(source.attackTarget) ? source.attackTarget : "auto",
      attackStrength: NOBLE_ATTACK_STRENGTHS.has(source.attackStrength) ? source.attackStrength : "base",
      specialTarget: stringValue(source.specialTarget)
    };
  }

  function normalizeEffects(effects) {
    return Array.isArray(effects) ? effects.map(normalizeEffect) : [];
  }

  function emptySkillVersion() {
    return { name: "", icon: "", ct: "", effects: [] };
  }

  function normalizeSkillVersion(version) {
    const source = version && typeof version === "object" ? version : {};
    return {
      name: stringValue(source.name),
      icon: stringValue(source.icon),
      ct: stringValue(source.ct),
      effects: normalizeEffects(source.effects)
    };
  }

  function emptySkillVariant(stage) {
    return Object.assign({
      enabled: false,
      stage: String(stage),
      changeMode: "name",
      upgraded: Object.assign({ enabled: false }, emptySkillVersion())
    }, emptySkillVersion());
  }

  function normalizeSkillVariant(variant, stage) {
    const source = variant && typeof variant === "object" ? variant : {};
    return Object.assign(normalizeSkillVersion(source), {
      enabled: Boolean(source.enabled),
      stage: String(stage),
      changeMode: VARIANT_MODES.has(source.changeMode) ? source.changeMode : "name",
      upgraded: Object.assign(normalizeSkillVersion(source.upgraded), {
        enabled: Boolean(source.upgraded && source.upgraded.enabled)
      })
    });
  }

  function emptyOwnedSkill(index) {
    return {
      slot: index + 1,
      base: emptySkillVersion(),
      variants: [emptySkillVariant(2), emptySkillVariant(3)],
      upgraded: Object.assign({ enabled: false }, emptySkillVersion())
    };
  }

  function normalizeOwnedSkill(skill, index) {
    const source = skill && typeof skill === "object" ? skill : {};
    const sourceVariants = Array.isArray(source.variants) ? source.variants : [];
    return {
      slot: index + 1,
      base: normalizeSkillVersion(source.base),
      variants: [
        normalizeSkillVariant(sourceVariants.find((item) => String(item && item.stage) === "2"), 2),
        normalizeSkillVariant(sourceVariants.find((item) => String(item && item.stage) === "3"), 3)
      ],
      upgraded: Object.assign(normalizeSkillVersion(source.upgraded), { enabled: Boolean(source.upgraded && source.upgraded.enabled) })
    };
  }

  function emptyNobleVersion() {
    return { reading: "", name: "", rank: "", category: "", effects: [] };
  }

  function normalizeNobleVersion(version) {
    const source = version && typeof version === "object" ? version : {};
    return {
      reading: stringValue(source.reading),
      name: stringValue(source.name),
      rank: stringValue(source.rank),
      category: stringValue(source.category),
      effects: normalizeEffects(source.effects)
    };
  }

  function emptyNobleVariant(stage) {
    return Object.assign({
      enabled: false,
      stage: String(stage),
      changeMode: "name",
      npType: "",
      npHits: "",
      upgraded: Object.assign({ enabled: false }, emptyNobleVersion())
    }, emptyNobleVersion());
  }

  function normalizeNobleVariant(variant, stage) {
    const source = variant && typeof variant === "object" ? variant : {};
    return Object.assign(normalizeNobleVersion(source), {
      enabled: Boolean(source.enabled),
      stage: String(stage),
      changeMode: ["name", "nameEffect"].includes(source.changeMode) ? source.changeMode : "name",
      npType: NP_TYPE[source.npType] ? source.npType : "",
      npHits: stringValue(source.npHits),
      upgraded: Object.assign(normalizeNobleVersion(source.upgraded), {
        enabled: Boolean(source.upgraded && source.upgraded.enabled)
      })
    });
  }

  function createDefaultContentSettings() {
    return {
      classSkills: Array.from({ length: 4 }, () => ({ name: "", icon: "", effects: [] })),
      skills: Array.from({ length: 3 }, (_, index) => emptyOwnedSkill(index)),
      noble: {
        base: Object.assign(emptyNobleVersion(), { npType: "artsAll", npHits: "" }),
        variants: [emptyNobleVariant(2), emptyNobleVariant(3)],
        upgraded: Object.assign({ enabled: false }, emptyNobleVersion())
      },
      bond: { name: "", icon: "", effects: [] }
    };
  }

  function normalizeContentSettings(settings) {
    const defaults = createDefaultContentSettings();
    const source = settings && typeof settings === "object" ? settings : {};
    const classSkills = Array.isArray(source.classSkills) ? source.classSkills : defaults.classSkills;
    const skills = Array.isArray(source.skills) ? source.skills : defaults.skills;
    const noble = source.noble && typeof source.noble === "object" ? source.noble : defaults.noble;
    const nobleVariants = Array.isArray(noble.variants) ? noble.variants : [];
    return {
      classSkills: classSkills.map((skill) => {
        const item = skill && typeof skill === "object" ? skill : {};
        return { name: stringValue(item.name), icon: stringValue(item.icon), effects: normalizeEffects(item.effects) };
      }),
      skills: Array.from({ length: 3 }, (_, index) => normalizeOwnedSkill(skills[index], index)),
      noble: {
        base: Object.assign(normalizeNobleVersion(noble.base), {
          npType: NP_TYPE[noble.base && noble.base.npType] ? noble.base.npType : "artsAll",
          npHits: stringValue(noble.base && noble.base.npHits)
        }),
        variants: [
          normalizeNobleVariant(nobleVariants.find((item) => String(item && item.stage) === "2"), 2),
          normalizeNobleVariant(nobleVariants.find((item) => String(item && item.stage) === "3"), 3)
        ],
        upgraded: Object.assign(normalizeNobleVersion(noble.upgraded), { enabled: Boolean(noble.upgraded && noble.upgraded.enabled) })
      },
      bond: {
        name: stringValue(source.bond && source.bond.name),
        icon: stringValue(source.bond && source.bond.icon),
        effects: normalizeEffects(source.bond && source.bond.effects)
      }
    };
  }

  function format(value, digits) {
    return Number(value).toFixed(digits);
  }

  function calculate(raw) {
    const requestedRarity = numberOr(raw.rarity, 1);
    const baseRarity = requestedRarity === 0 ? 2 : requestedRarity;
    const rarity = RARITY[baseRarity];
    const rarityMeta = RARITY_META[requestedRarity] || RARITY_META[1];
    const classKey = CLASS[raw.classKey] ? raw.classKey : "剣";
    const classData = CLASS[classKey];
    const tendency = TENDENCY[raw.tendency] || TENDENCY["平均"];
    const growthName = GROWTH[raw.growth] ? raw.growth : "平均";
    const growthRates = GROWTH[growthName][baseRarity];
    const str = (RANK[raw.strengthRank] || RANK["E"]).normal;
    const end = (RANK[raw.enduranceRank] || RANK["E"]).normal;
    const agi = (RANK[raw.agilityRank] || RANK["E"]).normal;
    const mag = (RANK[raw.magicRank] || RANK["E"]).normal;
    const magDr = (RANK[raw.magicRank] || RANK["E"]).dr;
    const luck = (RANK[raw.luckRank] || RANK["E"]).normal;
    const artsCards = optionalNumber(raw.artsCards);
    const artsHits = optionalNumber(raw.artsHits);
    const type = raw.type === "magic" ? "magic" : "physical";
    const affinity = AFFINITIES.includes(raw.affinity) ? raw.affinity : AFFINITIES[0];
    const policy = POLICIES.includes(raw.policy) ? raw.policy : POLICIES[0];
    const personality = PERSONALITIES.includes(raw.personality) ? raw.personality : PERSONALITIES[0];
    const gender = GENDERS.includes(raw.gender) ? raw.gender : GENDERS[0];
    const selectedTraits = normalizeSelectedTraits(raw.selectedTraits);
    const traitRestrictions = normalizeTraitRestrictions(raw.traitRestrictions, selectedTraits);
    const contentSettings = normalizeContentSettings(raw.contentSettings);
    const npTypeKey = NP_TYPE[raw.npType] ? raw.npType : contentSettings.noble.base.npType;
    const rawNpHits = raw.npHits === null || typeof raw.npHits === "undefined" ? contentSettings.noble.base.npHits : raw.npHits;
    const npHits = optionalNumber(rawNpHits);
    const servantNo = String(raw.servantNo || "").trim();
    const trueName = String(raw.trueName || "").trim();

    const initialHp = roundDown(rarity.initHp * classData.hp * tendency.hp * end, 0);
    const maxHp = roundDown(rarity.maxHp * classData.hp * tendency.hp * end, 0);
    const agiMagic = (agi + mag) / 2;
    const physicalCorrection = str * agiMagic * (1 - (str - 1) * (agiMagic - 1));
    const atkCorrection = type === "physical" ? physicalCorrection : mag;
    const initialAtk = roundDown(rarity.initAtk * classData.atk * tendency.atk * atkCorrection, 0);
    const maxAtk = roundDown(rarity.maxAtk * classData.atk * tendency.atk * atkCorrection, 0);

    const ascHp = growthRates.map((rate) => roundDown(maxHp * rate, 0));
    const ascAtk = growthRates.map((rate) => roundDown(maxAtk * rate, 0));
    const grailHp = rarity.grail.map((level) => roundDown(initialHp + (maxHp - initialHp) * GRAIL_RATE[baseRarity][level], 0));
    const grailAtk = rarity.grail.map((level) => roundDown(initialAtk + (maxAtk - initialAtk) * GRAIL_RATE[baseRarity][level], 0));

    const sw = roundDown(classData.sw * luck, 0);
    const sr = roundDown(classData.sr * agi, 1);
    const dr = roundDown(classData.dr * magDr, 1);
    const properNa = artsHits !== null && artsHits > 0 && ARTS_MOD[artsCards]
      ? roundDown(classData.na * ARTS_MOD[artsCards] * mag / artsHits, 2)
      : null;
    const npType = NP_TYPE[npTypeKey];
    const rechargeLimit = npType.factor && npHits !== null && npHits > 0
      ? roundDown(15 / (npType.factor * npHits * npType.targets), 2)
      : null;
    const manualNormalEnabled = Boolean(raw.manualNormalEnabled);
    const finalNormalNa = manualNormalEnabled && Number.isFinite(Number(raw.manualNormalNa))
      ? roundDown(Number(raw.manualNormalNa), 2)
      : properNa;
    const separateNp = Boolean(raw.separateNp) && npType.factor !== null;
    const finalNpNa = separateNp
      ? roundDown(numberOr(raw.manualNpNa, rechargeLimit !== null ? rechargeLimit : finalNormalNa), 2)
      : finalNormalNa;

    const qCards = optionalNumber(raw.quickCards);
    const bCards = optionalNumber(raw.busterCards);
    const quickHits = optionalNumber(raw.quickHits);
    const busterHits = optionalNumber(raw.busterHits);
    const extraHits = optionalNumber(raw.extraHits);
    const warnings = [];
    if (!servantNo) warnings.push("No.が未入力です。新規生成時はテンプレートのNo.欄が空のままになります。");
    if (!trueName) warnings.push("真名が未入力です。新規生成時は真名・ボイス・モーションのページ名が未入力のままになります。");
    if ([qCards, artsCards, bCards].some((value) => value === null)) {
      warnings.push("コマンドカード枚数を入力してください。");
    } else if (qCards + artsCards + bCards !== 5) {
      warnings.push("コマンドカード枚数の合計が5枚ではありません。");
    }
    if (artsCards !== null && !(artsCards in ARTS_MOD)) warnings.push("Arts枚数は1～3枚で指定してください。");
    if ([quickHits, artsHits, busterHits, extraHits, npHits].some((value) => value === null)) {
      warnings.push("Q/A/B/Ex/宝具のHit数を入力してください。");
    } else {
      if (artsHits <= 0) warnings.push("Arts Hit数が0のため、通常攻撃N/Aを計算できません。");
      if (npType.factor && npHits <= 0) warnings.push("攻撃宝具が選択されていますが、宝具Hit数が0です。");
    }

    const input = Object.assign({}, raw, {
      rarity: requestedRarity,
      baseRarity,
      classKey,
      tendency: raw.tendency || "平均",
      growth: growthName,
      type,
      affinity,
      policy,
      personality,
      gender,
      servantNo,
      trueName,
      selectedTraits,
      traitRestrictions,
      contentSettings,
      quickCards: qCards,
      artsCards,
      busterCards: bCards,
      quickHits,
      artsHits,
      busterHits,
      extraHits,
      npHits,
      npType: npTypeKey,
      treasureRank: raw.treasureRank || "-"
    });

    return {
      version: VERSION,
      input,
      rarity,
      classData,
      classIcon: `&ref(${classKey}${rarityMeta.icon}.png,icon/class,width=30)`,
      classSkillIcon: `&ref(${classKey}${rarityMeta.icon}.png,icon/class,title=${classData.name},height=25,width=25)`,
      cost: rarityMeta.cost,
      initialHp,
      maxHp,
      initialAtk,
      maxAtk,
      ascHp,
      ascAtk,
      grailHp,
      grailAtk,
      sw,
      sr,
      dr,
      nd: classData.nd,
      properNa,
      rechargeLimit,
      finalNormalNa,
      separateNp,
      finalNpNa,
      npType,
      warnings
    };
  }

  function buildColumnStyle() {
    const cells = [
      "BGCOLOR(#98fb98):CENTER:46", "BGCOLOR(#87ceeb):CENTER:46",
      "BGCOLOR(#ffb6c1):CENTER:46", "BGCOLOR(#e6e6fa):CENTER:58",
      "BGCOLOR(#f5fffa):CENTER:50", "BGCOLOR(#f5fffa):CENTER:50",
      "BGCOLOR(#e6e6fa):CENTER:20",
      "BGCOLOR(#f5fffa):CENTER:50", "BGCOLOR(#f5fffa):CENTER:50",
      "BGCOLOR(#f5fffa):CENTER:50", "BGCOLOR(#f5fffa):CENTER:50",
      "BGCOLOR(#e6e6fa):CENTER:20",
      "BGCOLOR(#f5fffa):CENTER:50", "BGCOLOR(#f5fffa):CENTER:50",
      "BGCOLOR(#f5fffa):CENTER:50", "BGCOLOR(#f5fffa):CENTER:50",
      "BGCOLOR(#f5fffa):CENTER:50"
    ];
    return `|${cells.join("|")}|c`;
  }

  function buildHeaderLine(result) {
    const normal = result.rarity.normal;
    const cells = [
      ">", ">", "BGCOLOR(#e6e6fa):コマンドカード", "能力値",
      "BGCOLOR(#e6e6fa):Lv. 1", `BGCOLOR(#e6e6fa):Lv.${normal[0]}`, "霊基再臨"
    ];
    normal.slice(1).forEach((level) => cells.push(`BGCOLOR(#e6e6fa):Lv.${level}`));
    cells.push("聖杯転臨");
    result.rarity.grail.forEach((level) => cells.push(`BGCOLOR(#e6e6fa):Lv.${level}`));
    while (cells.length < 17) cells.push("BGCOLOR(#e6e6fa):");
    return `|${cells.join("|")}|`;
  }

  function buildStatusRow(result, kind) {
    const isHp = kind === "HP";
    const values = isHp
      ? [result.initialHp, result.ascHp[0], "~", result.ascHp[1], result.ascHp[2], result.ascHp[3], result.maxHp, "~"].concat(result.grailHp)
      : [result.initialAtk, result.ascAtk[0], "~", result.ascAtk[1], result.ascAtk[2], result.ascAtk[3], result.maxAtk, "~"].concat(result.grailAtk);
    const prefix = isHp
      ? ["Quick", "Arts", "Buster", "HP"]
      : [result.input.quickCards, result.input.artsCards, result.input.busterCards, "ATK"];
    const cells = prefix.concat(values);
    while (cells.length < 17) cells.push("");
    return `|${cells.join("|")}|`;
  }

  function buildNaCell(result) {
    const proper = result.properNa === null ? "計算不可" : format(result.properNa, 2);
    const normal = result.finalNormalNa === null ? "計算不可" : format(result.finalNormalNa, 2);
    if (result.properNa !== null && result.finalNormalNa !== result.properNa) {
      return `${normal}&footnote(適正値：${proper})`;
    }
    return normal;
  }

  function buildNaLine(result) {
    const normal = buildNaCell(result);
    if (result.separateNp) {
      const np = result.finalNpNa === null ? "計算不可" : format(result.finalNpNa, 2);
      return `|N/A&footnote(攻撃時のNP上昇基礎値)|>|>|>|${normal}|${np}|N/D&footnote(攻撃を受けた際のNP上昇基礎値)|${format(result.nd, 2)}|`;
    }
    return `|N/A&footnote(攻撃時のNP上昇基礎値)|>|>|>|>|${normal}|N/D&footnote(攻撃を受けた際のNP上昇基礎値)|${format(result.nd, 2)}|`;
  }

  function rankBarCount(rank) {
    if (rank === "EX" || /^A/.test(rank)) return 5;
    if (/^B/.test(rank)) return 4;
    if (/^C/.test(rank)) return 3;
    if (/^D/.test(rank)) return 2;
    if (/^E/.test(rank)) return 1;
    return 0;
  }

  function rankBars(rank) {
    const count = rankBarCount(rank);
    return Array.from({ length: 5 }, (_, index) => index < count ? "BGCOLOR(#ea5506):" : "");
  }

  function buildParameterRow(leftLabel, leftRank, separator, rightLabel, rightRank) {
    return `|${[leftLabel].concat(rankBars(leftRank), [leftRank, separator, rightLabel], rankBars(rightRank), [rightRank]).join("|")}|`;
  }

  function replaceLine(text, pattern, replacement, label, report) {
    if (!pattern.test(text)) {
      report.missing.push(label);
      return text;
    }
    report.replaced.push(label);
    return text.replace(pattern, replacement);
  }

  function replaceLastCell(line, value) {
    const cells = line.split("|");
    cells[cells.length - 2] = String(value);
    return cells.join("|");
  }

  function replaceNpCardRows(text, result, report) {
    const pattern = /^(\/\/)?\|BGCOLOR\(#(?:F88|9AF|AF9)\):(?:Buster|Arts|Quick)(?=\|)/gmi;
    let count = 0;
    const replaced = text.replace(pattern, (match, commentPrefix) => {
      count += 1;
      return `${commentPrefix || ""}|${result.npType.cardWiki}`;
    });
    if (count === 0) report.missing.push("宝具欄のカード種別");
    else report.replaced.push(`宝具欄のカード種別（${count}箇所）`);
    return replaced;
  }

  function replaceClassSkillIcons(text, result, report) {
    const heading = /^\*\*クラススキル[^\n]*$/m.exec(text);
    if (!heading) {
      report.missing.push("クラススキルのクラスアイコン");
      return text;
    }
    const sectionStart = heading.index + heading[0].length;
    const remainder = text.slice(sectionStart);
    const nextHeading = /^\*\*[^*\n]/m.exec(remainder);
    const sectionEnd = nextHeading ? sectionStart + nextHeading.index : text.length;
    const section = text.slice(sectionStart, sectionEnd);
    const pattern = /&ref\([^,\n]*\.png,icon\/class,title=[^,\n)]*,height=25,width=25\)/g;
    let count = 0;
    const replacedSection = section.replace(pattern, () => {
      count += 1;
      return result.classSkillIcon;
    });
    if (count === 0) report.missing.push("クラススキルのクラスアイコン");
    else report.replaced.push(`クラススキルのクラスアイコン（${count}箇所）`);
    return text.slice(0, sectionStart) + replacedSection + text.slice(sectionEnd);
  }

  function parseTraitsFromSource(source) {
    const match = /^\|特性\|[^\n]*\|$/m.exec(String(source || "").replace(/\r\n?/g, "\n"));
    if (!match) return null;
    const cells = match[0].split("|");
    const traitCell = String(cells[cells.length - 2] || "").replace(/^LEFT:/, "");
    return traitCell.split("/").map((trait) => trait.trim()).filter(Boolean);
  }

  function splitEditableTraitLabel(value) {
    const text = String(value || "").trim();
    const aliases = { "新選組のサーヴァント": "新選組" };
    const candidates = EDITABLE_TRAITS.map((trait) => [trait, trait])
      .concat(Object.entries(aliases))
      .sort((left, right) => right[0].length - left[0].length);
    for (const [label, trait] of candidates) {
      if (text === label) return { trait, suffix: "" };
      if (text.startsWith(`${label}（`) && text.endsWith("）")) {
        return { trait, suffix: text.slice(label.length + 1, -1).trim() };
      }
    }
    return null;
  }

  function parseTraitRestrictionSuffix(value) {
    const suffix = String(value || "").trim();
    if (!suffix) return { range: "all", costume: "" };
    const labels = [
      ["第一・第二再臨", "12"], ["第一・第三再臨", "13"], ["第二・第三再臨", "23"],
      ["第一再臨", "1"], ["第二再臨", "2"], ["第三再臨", "3"], ["全再臨", "all"]
    ];
    for (const [label, range] of labels) {
      if (suffix === label) return { range, costume: "" };
      if (suffix.startsWith(`${label}・`)) return { range, costume: suffix.slice(label.length + 1).trim() };
    }
    return { range: "none", costume: suffix };
  }

  function parseSelectedTraitsFromSource(source) {
    const traits = parseTraitsFromSource(source);
    if (traits === null) return null;
    const selected = traits
      .map(splitEditableTraitLabel)
      .filter(Boolean)
      .map((item) => item.trait);
    return normalizeSelectedTraits(selected);
  }

  function parseTraitRestrictionsFromSource(source) {
    const traits = parseTraitsFromSource(source);
    if (traits === null) return null;
    const restrictions = {};
    traits.forEach((value) => {
      const item = splitEditableTraitLabel(value);
      if (!item || !item.suffix) return;
      restrictions[item.trait] = parseTraitRestrictionSuffix(item.suffix);
    });
    return normalizeTraitRestrictions(restrictions, Object.keys(restrictions));
  }

  function buildTraitLine(line, result) {
    const cells = line.split("|");
    const traitCellIndex = cells.length - 2;
    const current = String(cells[traitCellIndex] || "").replace(/^LEFT:/, "");
    const parts = current.split("/").map((trait) => trait.trim());
    const emptyCount = parts.filter((trait) => !trait).length;
    const unknownTraits = parts.filter((trait) => trait && !KNOWN_TRAITS.has(trait) && !splitEditableTraitLabel(trait));
    const traits = BASE_TRAITS.concat(normalizeSelectedTraits(result.input.selectedTraits));
    const derived = [result.input.gender === "-" ? "性別不明" : result.input.gender, result.input.policy];
    derived.push(result.input.personality);
    derived.push(`${result.input.affinity}の力`);
    const omittedClasses = new Set(["アーチャー", "ランサー", "アサシン", "シールダー", "アヴェンジャー", "フォーリナー", "プリテンダー"]);
    if (!omittedClasses.has(result.classData.name)) derived.push(result.classData.name);
    let anchor = traits.indexOf("人型");
    if (anchor < 0) anchor = traits.indexOf("サーヴァント");
    const derivedUnique = derived.filter((trait, index) => !traits.includes(trait) && derived.indexOf(trait) === index);
    traits.splice(anchor < 0 ? 0 : anchor + 1, 0, ...derivedUnique);
    const merged = traits.concat(unknownTraits.filter((trait) => !traits.includes(trait)));
    const restrictions = result.input.traitRestrictions || {};
    const formatted = merged.map((trait) => EDITABLE_TRAIT_SET.has(trait) ? formatRestrictedTrait(trait, restrictions[trait]) : trait);
    cells[traitCellIndex] = `LEFT:${formatted.concat(Array(emptyCount).fill("")).join(" / ")}`;
    return cells.join("|");
  }

  function replaceIdentityFields(text, result, report) {
    const servantNo = result.input.servantNo.replace(/^No\.\s*/i, "");
    if (servantNo) {
      text = replaceLine(text, /^\*No\.[^\n]*$/m, `*No.${servantNo}`, "ページ上部のNo.", report);
      text = replaceLine(text,
        /(^\|(?:>\|)+BGCOLOR\(#17184b\):COLOR\(white\):)No\.[^|\n]*(\|$)/m,
        `$1No.${servantNo}$2`, "基本情報のNo.", report);
    }
    if (!result.input.trueName) return text;
    text = replaceLine(text,
      /^\|>\|>\|BGCOLOR\(#e6e6fa\):真名\|[^\n]*\|$/m,
      (line) => line.replace(/\[\[[^\]\n]*>[^\]\n]*\/データ\]\]/, `[[${result.input.trueName}>${result.input.trueName}/データ]]`),
      "基本情報の真名", report);
    let pagePathCount = 0;
    text = text.replace(/(page=)[^,\n)]*\/(ボイス|モーション)(?=,text=編集\))/g, (match, prefix, suffix) => {
      pagePathCount += 1;
      return `${prefix}${result.input.trueName}/${suffix}`;
    });
    const includeCachePattern = new RegExp(
      `(${INCLUDE_CACHE_TOKEN.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\()[^\\n)]*\\/(ボイス|モーション)(?=\\))`,
      "g"
    );
    text = text.replace(includeCachePattern, (match, prefix, suffix) => {
      pagePathCount += 1;
      return `${prefix}${result.input.trueName}/${suffix}`;
    });
    if (pagePathCount === 0) report.missing.push("ボイス・モーションのページ名");
    else report.replaced.push(`ボイス・モーションのページ名（${pagePathCount}箇所）`);
    return text;
  }

  const SKILL_COLUMN_STYLE = "|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:25|BGCOLOR(#f5fffa):LEFT:281|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|BGCOLOR(#f5fffa):RIGHT:40|c";
  const SKILL_HEADER_TAIL = "|BGCOLOR(#e6e6fa):CENTER:CT|BGCOLOR(#e6e6fa):CENTER:効果|BGCOLOR(#e6e6fa):CENTER:Lv.1|BGCOLOR(#e6e6fa):CENTER:Lv.2|BGCOLOR(#e6e6fa):CENTER:Lv.3|BGCOLOR(#e6e6fa):CENTER:Lv.4|BGCOLOR(#e6e6fa):CENTER:Lv.5|BGCOLOR(#e6e6fa):CENTER:Lv.6|BGCOLOR(#e6e6fa):CENTER:Lv.7|BGCOLOR(#e6e6fa):CENTER:Lv.8|BGCOLOR(#e6e6fa):CENTER:Lv.9|BGCOLOR(#e6e6fa):CENTER:Lv.10|";
  const NOBLE_COLUMN_STYLE = "|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#e6e6fa):CENTER:65|BGCOLOR(#e6e6fa):CENTER:429|>|>|>|>|BGCOLOR(#e6e6fa):CENTER:40|c";
  const NOBLE_VALUE_STYLE = "|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:45|BGCOLOR(#f5fffa):CENTER:65|BGCOLOR(#f5fffa):LEFT:429|>|>|>|>|BGCOLOR(#f5fffa):RIGHT:40|c";
  const CLASS_SKILL_COLUMN_STYLE = "|BGCOLOR(#e6e6fa):CENTER:45|BGCOLOR(#f5fffa):LEFT:359|BGCOLOR(#f5fffa):CENTER:45|c";

  function cleanInline(value) {
    return stringValue(value).replace(/\r?\n/g, " ").trim();
  }

  function normalizeIconFile(value) {
    const icon = cleanInline(value) || "0.png";
    return /\.[a-z0-9]+$/i.test(icon) ? icon : `${icon}.png`;
  }

  function ascensionLabel(stage) {
    return String(stage) === "2" ? "第二再臨以降" : "第三再臨以降";
  }

  function effectHasData(effect) {
    const item = normalizeEffect(effect);
    return Boolean(item.effectType !== "normal" || cleanInline(item.text) || cleanInline(item.rawCode)
      || item.values.some((value) => cleanInline(value)));
  }

  function skillVersionHasData(version) {
    return Boolean(version && (cleanInline(version.name) || cleanInline(version.icon) || cleanInline(version.ct) || normalizeEffects(version.effects).some(effectHasData)));
  }

  function nobleVersionHasData(version) {
    return Boolean(version && (cleanInline(version.reading) || cleanInline(version.name) || cleanInline(version.rank) || cleanInline(version.category) || normalizeEffects(version.effects).some(effectHasData)));
  }

  function effectValueCells(effect, count) {
    const values = Array.isArray(effect.values) ? effect.values.map(cleanInline) : [];
    if (effect.valueMode === "fixed") return Array(Math.max(0, count - 1)).fill(">").concat(values[0] || "");
    if ((effect.valueMode === "level10" && count === 10) || (["np5", "oc5"].includes(effect.valueMode) && count === 5)) {
      return Array.from({ length: count }, (_, index) => values[index] || "");
    }
    return Array(Math.max(0, count - 1)).fill(">").concat("");
  }

  function formatEffectSuffix(formatType, count, turn) {
    const normalizedCount = cleanInline(count);
    const normalizedTurn = cleanInline(turn);
    if (formatType === "turn" && normalizedTurn) return `(${normalizedTurn}T)`;
    if (formatType === "count" && normalizedCount) return `(${normalizedCount}回)`;
    if (formatType === "both" && normalizedCount && normalizedTurn) return `(${normalizedCount}回・${normalizedTurn}T)`;
    return "";
  }

  function insertEffectNotation(value, notation) {
    const source = stringValue(value);
    const levelPattern = /\[Lv(?::確率)?\]/g;
    const durationPattern = /\([^()\n]*(?:回(?:・[^()\n]*T)?|T)\)/g;
    const ocPattern = /<OC:(?:効果UP|回数UP|特攻威力UP)>/g;
    const lastMatch = (pattern) => {
      const matches = source.match(pattern);
      return matches && matches.length ? matches[matches.length - 1] : "";
    };
    let level = lastMatch(levelPattern);
    let duration = lastMatch(durationPattern);
    let oc = lastMatch(ocPattern);
    if (/^\[Lv(?::確率)?\]$/.test(notation)) level = notation;
    else if (/^\([^()\n]*(?:回(?:・[^()\n]*T)?|T)\)$/.test(notation)) duration = notation;
    else if (/^<OC:(?:効果UP|回数UP|特攻威力UP)>$/.test(notation)) oc = notation;
    const text = source.replace(levelPattern, "").replace(durationPattern, "").replace(ocPattern, "").trimEnd();
    return `${text}${level}${duration}${oc}`;
  }

  function toggleEffectNotation(value, notation) {
    const source = stringValue(value);
    const token = stringValue(notation);
    if (!/^(?:\[Lv(?::確率)?\]|<OC:(?:効果UP|回数UP)>)$/.test(token)) return source;
    if (source.includes(token)) return insertEffectNotation(source.split(token).join(""), "");
    return insertEffectNotation(source, token);
  }

  function rawEffectLines(effect) {
    return stringValue(effect.rawCode).replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).filter(Boolean);
  }

  function buildSkillEffectRows(version) {
    const effects = normalizeEffects(version.effects).filter(effectHasData);
    if (!effects.length) return [`|~|${cleanInline(version.ct)}|[Lv]     |||||||||||`];
    const rows = [];
    effects.forEach((effect, index) => {
      if (effect.raw) {
        rows.push(...rawEffectLines(effect));
        return;
      }
      const ct = index === 0 ? cleanInline(version.ct) : "~";
      const text = `${effect.prefix}${cleanInline(effect.text)}`;
      rows.push(`|~|${ct}|${text}|${effectValueCells(effect, 10).join("|")}|`);
    });
    return rows.length ? rows : [`|~|${cleanInline(version.ct)}|[Lv]     |||||||||||`];
  }

  function buildSkillTable(slot, version, headingLabel) {
    const icon = normalizeIconFile(version.icon);
    return [
      `***Skill${slot}${headingLabel || ""}：${cleanInline(version.name)}`,
      SKILL_COLUMN_STYLE,
      `|BGCOLOR(#e6e6fa):CENTER:&ref(${icon},icon/skill,height=48)${SKILL_HEADER_TAIL}`,
      ...buildSkillEffectRows(version)
    ].join("\n");
  }

  function resolvedSkillVariant(base, variant) {
    const mode = variant.changeMode;
    return {
      name: cleanInline(variant.name) || base.name,
      icon: ["nameIcon", "all"].includes(mode) ? (cleanInline(variant.icon) || base.icon) : base.icon,
      ct: ["nameEffect", "all"].includes(mode) ? (cleanInline(variant.ct) || base.ct) : base.ct,
      effects: ["nameEffect", "all"].includes(mode) ? variant.effects : base.effects
    };
  }

  function buildOwnedSkill(skill) {
    const slot = skill.slot;
    const base = normalizeSkillVersion(skill.base);
    const parts = [buildSkillTable(slot, base, "")];
    skill.variants.filter((variant) => variant.enabled).forEach((variant) => {
      const label = ascensionLabel(variant.stage);
      const resolved = resolvedSkillVariant(base, variant);
      parts.push(`#region(close,${label})`);
      if (variant.changeMode === "name") parts.push(`***Skill${slot}：${cleanInline(resolved.name)}`);
      else parts.push(buildSkillTable(slot, resolved, ""));
      if (variant.upgraded.enabled) {
        const upgraded = normalizeSkillVersion(variant.upgraded);
        parts.push(buildSkillTable(slot, {
          name: cleanInline(upgraded.name) || resolved.name,
          icon: cleanInline(upgraded.icon) || resolved.icon,
          ct: cleanInline(upgraded.ct) || resolved.ct,
          effects: upgraded.effects
        }, "[強化後]"));
      }
      parts.push("#endregion()");
    });
    if (skill.upgraded.enabled) {
      const upgraded = normalizeSkillVersion(skill.upgraded);
      parts.push(buildSkillTable(slot, {
        name: cleanInline(upgraded.name) || base.name,
        icon: cleanInline(upgraded.icon) || base.icon,
        ct: cleanInline(upgraded.ct) || base.ct,
        effects: upgraded.effects
      }, "[強化後]"));
    }
    return parts.join("\n");
  }

  function buildOwnedSkillsSection(settings) {
    return ["**保有スキル", ...settings.skills.map(buildOwnedSkill)].join("\n\n");
  }

  function nobleType(result, npTypeKey) {
    return NP_TYPE[npTypeKey] || result.npType;
  }

  function nobleCardFamily(npTypeKey) {
    const key = String(npTypeKey || "").toLowerCase();
    if (key.startsWith("buster")) return "buster";
    if (key.startsWith("quick")) return "quick";
    return "arts";
  }

  function nobleAttackTarget(effect, npTypeKey) {
    if (["single", "all"].includes(effect.attackTarget)) return effect.attackTarget;
    const key = String(npTypeKey || "").toLowerCase();
    return key.includes("single") ? "single" : "all";
  }

  function nobleCardEffectLabel(npTypeKey) {
    const meta = NOBLE_CARD_META[nobleCardFamily(npTypeKey)];
    return `&font(85%,#fff,${meta.color},b){　${meta.name}(${meta.factor})　}`;
  }

  function standardNobleAttack(effect, npTypeKey) {
    const family = nobleCardFamily(npTypeKey);
    const target = nobleAttackTarget(effect, npTypeKey);
    const strength = effect.attackStrength === "upgraded" ? "upgraded" : "base";
    const targetText = target === "single" ? "敵単体に超強力な攻撃[Lv]" : "敵全体に強力な攻撃[Lv]";
    return {
      text: `${targetText} ${nobleCardEffectLabel(npTypeKey)}`,
      cells: NOBLE_ATTACK_MULTIPLIERS[family][target][strength].map(String)
    };
  }

  function specialNobleAttack(effect, npTypeKey) {
    const target = cleanInline(effect.specialTarget).replace(/^〔/, "").replace(/〕(?:特攻)?$/, "");
    const notation = effect.valueMode === "oc5" ? "<OC:特攻威力UP>" : effect.valueMode === "np5" ? "[Lv]" : "";
    return {
      text: `＆〔${target}〕特攻${notation} ${nobleCardEffectLabel(npTypeKey)}`,
      cells: effectValueCells(effect, 5)
    };
  }

  function buildNobleEffectRows(version, result, npTypeKey) {
    const selectedType = nobleType(result, npTypeKey);
    const effects = normalizeEffects(version.effects).filter(effectHasData);
    if (!effects.length) return [`|${selectedType.cardWiki}|${cleanInline(version.rank)}|${cleanInline(version.category)}|||||||`];
    const rows = [];
    effects.forEach((effect, index) => {
      if (effect.raw) {
        rows.push(...rawEffectLines(effect));
        return;
      }
      const lead = index === 0
        ? [selectedType.cardWiki, cleanInline(version.rank), cleanInline(version.category)]
        : ["~", "~", "~"];
      if (effect.effectType === "nobleAttack") {
        const attack = standardNobleAttack(effect, npTypeKey);
        rows.push(`|${lead.concat(attack.text, attack.cells).join("|")}|`);
      } else if (effect.effectType === "specialAttack") {
        const attack = specialNobleAttack(effect, npTypeKey);
        rows.push(`|${lead.concat(attack.text, attack.cells).join("|")}|`);
      } else {
        const text = `${effect.prefix}${cleanInline(effect.text)}`;
        rows.push(`|${lead.concat(text, effectValueCells(effect, 5)).join("|")}|`);
      }
    });
    return rows.length ? rows : [`|${selectedType.cardWiki}|${cleanInline(version.rank)}|${cleanInline(version.category)}|||||||`];
  }

  function buildNobleTable(version, result, npTypeKey) {
    const reading = cleanInline(version.reading);
    const name = cleanInline(version.name);
    return [
      NOBLE_COLUMN_STYLE,
      `|>|>|>|~${reading}&br()${name}|>|>|>|>| |`,
      "|Card|ランク|種別|効果|1|2|3|4|5|",
      NOBLE_VALUE_STYLE,
      ...buildNobleEffectRows(version, result, npTypeKey)
    ].join("\n");
  }

  function resolvedNobleVariant(base, variant) {
    const changesEffects = variant.changeMode === "nameEffect";
    return {
      reading: cleanInline(variant.reading) || base.reading,
      name: cleanInline(variant.name) || base.name,
      rank: changesEffects ? (cleanInline(variant.rank) || base.rank) : base.rank,
      category: changesEffects ? (cleanInline(variant.category) || base.category) : base.category,
      effects: changesEffects ? variant.effects : base.effects,
      npType: NP_TYPE[variant.npType] ? variant.npType : ""
    };
  }

  function buildNobleSection(settings, result) {
    const base = normalizeNobleVersion(settings.noble.base);
    const parts = ["**宝具", buildNobleTable(base, result, result.input.npType)];
    settings.noble.variants.filter((variant) => variant.enabled).forEach((variant) => {
      const label = ascensionLabel(variant.stage);
      const resolved = resolvedNobleVariant(base, variant);
      const variantNpType = resolved.npType || result.input.npType;
      parts.push(`#region(close,${label})`, `***${label}`);
      if (variant.changeMode === "name" && !resolved.npType) {
        parts.push(`${NOBLE_COLUMN_STYLE}\n|>|>|>|~${cleanInline(resolved.reading)}&br()${cleanInline(resolved.name)}|>|>|>|>| |`);
      } else parts.push(buildNobleTable(resolved, result, variantNpType));
      if (variant.upgraded.enabled) {
        const upgraded = normalizeNobleVersion(variant.upgraded);
        parts.push("//強化後", "#br", buildNobleTable({
          reading: cleanInline(upgraded.reading) || resolved.reading,
          name: cleanInline(upgraded.name) || resolved.name,
          rank: cleanInline(upgraded.rank) || resolved.rank,
          category: cleanInline(upgraded.category) || resolved.category,
          effects: upgraded.effects
        }, result, variantNpType));
      }
      parts.push("#endregion()");
    });
    if (settings.noble.upgraded.enabled) {
      const upgraded = normalizeNobleVersion(settings.noble.upgraded);
      parts.push("//強化後", "#br", buildNobleTable({
        reading: cleanInline(upgraded.reading) || base.reading,
        name: cleanInline(upgraded.name) || base.name,
        rank: cleanInline(upgraded.rank) || base.rank,
        category: cleanInline(upgraded.category) || base.category,
        effects: upgraded.effects
      }, result, result.input.npType));
    }
    return parts.join("\n\n");
  }

  function buildClassSkillRows(skill) {
    const effects = normalizeEffects(skill.effects).filter(effectHasData);
    if (!effects.length) return ["|~|||"];
    const rows = [];
    effects.forEach((effect) => {
      if (effect.raw) rows.push(...rawEffectLines(effect));
      else rows.push(`|~|${effect.prefix}${cleanInline(effect.text)}|${cleanInline(effect.values[0])}|`);
    });
    return rows.length ? rows : ["|~|||"];
  }

  function buildClassSkillSection(settings, result) {
    const skills = settings.classSkills.filter((skill) => skillVersionHasData(skill));
    const blocks = skills.map((skill) => [
      CLASS_SKILL_COLUMN_STYLE,
      `|&ref(${normalizeIconFile(skill.icon)},icon/skill,height=48)|>|BGCOLOR(#e6e6fa):CENTER:&font(b,110%){【${cleanInline(skill.name)}】}${result.classSkillIcon}|`,
      ...buildClassSkillRows(skill)
    ].join("\n"));
    return ["**クラススキル", ...blocks].join("\n\n");
  }

  function buildBondRows(bond, result) {
    const effects = normalizeEffects(bond.effects).filter(effectHasData);
    const preamble = `&font(,b,#00cc58){${cleanInline(result.input.trueName)}}装備時のみ、&br()自身がフィールドにいる間、`;
    if (!effects.length) {
      return [`|&ref(${normalizeIconFile(bond.icon)},icon/skill,width=48)|>|${preamble}| |`, "|~|>|||", "|~|>|||", "|~|>|||"];
    }
    const rows = [];
    effects.forEach((effect, index) => {
      if (effect.raw) {
        rows.push(...rawEffectLines(effect));
        return;
      }
      const icon = index === 0 ? `&ref(${normalizeIconFile(bond.icon)},icon/skill,width=48)` : "~";
      const text = `${index === 0 ? preamble : ""}${effect.prefix}${cleanInline(effect.text)}`;
      rows.push(`|${icon}|>|${text}|${cleanInline(effect.values[0])}|`);
    });
    return rows;
  }

  function buildBondSection(settings, result) {
    const bond = settings.bond;
    return [
      "*絆礼装",
      "#region()",
      "|BGCOLOR(#e6e6fa):CENTER:48|BGCOLOR(#f5fffa):CENTER:320|BGCOLOR(#f5fffa):LEFT:48|BGCOLOR(#fff8dc):CENTER:120|c",
      `|>|>|>|BGCOLOR(#17184b):COLOR(white):${cleanInline(bond.name)}|`,
      "|Rare|4|BGCOLOR(#e6e6fa):CENTER:LV|80|",
      "|Cost|9|BGCOLOR(#e6e6fa):CENTER:HP|100|",
      "|タイプ|絆礼装|BGCOLOR(#e6e6fa):CENTER:ATK|100|",
      "|>|>|>|BGCOLOR(#e6e6fa):|",
      ...buildBondRows(bond, result),
      "#endregion()"
    ].join("\n");
  }

  function replaceBoundedSection(text, startPattern, endPattern, replacement, label, report) {
    const start = startPattern.exec(text);
    if (!start) {
      report.missing.push(label);
      return text;
    }
    const remainderStart = start.index + start[0].length;
    const end = endPattern.exec(text.slice(remainderStart));
    if (!end) {
      report.missing.push(label);
      return text;
    }
    report.replaced.push(label);
    const endIndex = remainderStart + end.index;
    return `${text.slice(0, start.index)}${replacement.trimEnd()}\n\n${text.slice(endIndex)}`;
  }

  function applyContentSettings(text, result, report) {
    const settings = result.input.contentSettings;
    const hasClassSkills = settings.classSkills.some(skillVersionHasData);
    const hasOwnedSkills = settings.skills.some((skill) => skillVersionHasData(skill.base) || skill.upgraded.enabled || skill.variants.some((variant) => variant.enabled));
    const hasNoble = nobleVersionHasData(settings.noble.base) || settings.noble.upgraded.enabled || settings.noble.variants.some((variant) => variant.enabled);
    const hasBond = cleanInline(settings.bond.name) || cleanInline(settings.bond.icon) || settings.bond.effects.some(effectHasData);
    if (hasNoble) text = replaceBoundedSection(text, /^\*\*宝具\s*$/m, /^\/\/─┤保有スキル├.*$/m, buildNobleSection(settings, result), "宝具の名称・効果", report);
    if (hasOwnedSkills) text = replaceBoundedSection(text, /^\*\*保有スキル\s*$/m, /^\/\/─┤クラススキル├.*$/m, buildOwnedSkillsSection(settings), "保有スキルの名称・アイコン・効果", report);
    if (hasClassSkills) text = replaceBoundedSection(text, /^\*\*クラススキル\s*$/m, /^\/\/─┤絆礼装├.*$/m, buildClassSkillSection(settings, result), "クラススキルの名称・アイコン・効果", report);
    if (hasBond) text = replaceBoundedSection(text, /^\*絆礼装\s*$/m, /^\/\/─┤プロフィール├.*$/m, buildBondSection(settings, result), "絆礼装の名称・アイコン・効果", report);
    return text;
  }

  function nobleVariantTypes(result) {
    const seen = new Set([result.input.npType]);
    const types = [];
    result.input.contentSettings.noble.variants.forEach((variant) => {
      if (!variant.enabled || !NP_TYPE[variant.npType] || seen.has(variant.npType)) return;
      seen.add(variant.npType);
      types.push({ key: variant.npType, data: NP_TYPE[variant.npType] });
    });
    return types;
  }

  function nobleVariantHitSettings(result) {
    const normalKey = result.input.npType;
    const normalHits = result.input.npHits;
    const seen = new Set([`${normalKey}:${normalHits === null ? "" : normalHits}`]);
    const settings = [];
    result.input.contentSettings.noble.variants.forEach((variant) => {
      if (!variant.enabled) return;
      const hasType = Boolean(NP_TYPE[variant.npType]);
      const hasHits = cleanInline(variant.npHits) !== "";
      if (!hasType && !hasHits) return;
      const typeKey = hasType ? variant.npType : normalKey;
      const variantHits = hasHits ? optionalNumber(variant.npHits) : normalHits;
      const identity = `${typeKey}:${variantHits === null ? "" : variantHits}`;
      if (seen.has(identity)) return;
      seen.add(identity);
      settings.push({ typeKey, hits: variantHits });
    });
    return settings;
  }

  function npBackgroundPrefix(npTypeKey) {
    const type = NP_TYPE[npTypeKey] || NP_TYPE.artsAll;
    const match = /^BGCOLOR\([^)]*\):/.exec(type.wiki);
    return match ? match[0] : "";
  }

  function coloredNpHits(npTypeKey, hits) {
    return `${npBackgroundPrefix(npTypeKey)}${hits === null ? "" : hits}`;
  }

  function replaceHiddenNobleTypeRows(text, result, report) {
    const pattern = /^\|BGCOLOR\(#e6e6fa\):相性\|[^\n]*\|宝具\|[^|\n]*\|$/mi;
    const match = pattern.exec(text);
    if (!match) {
      report.missing.push("相性・隠しステータスの宝具種別");
      return text;
    }
    const afterBase = match.index + match[0].length;
    const oldVariantRows = /^(?:\n\|~\|~\|~\|~\|~\|~\|~\|BGCOLOR\(#(?:F88|9AF|AF9)\):[^|\n]*\|)*/.exec(text.slice(afterBase))[0];
    const cells = match[0].split("|");
    cells[2] = result.input.affinity;
    cells[cells.length - 2] = result.npType.wiki;
    const rows = [cells.join("|")].concat(nobleVariantTypes(result).map(({ data }) => `|~|~|~|~|~|~|~|${data.wiki}|`));
    report.replaced.push("相性・隠しステータスの宝具種別");
    return `${text.slice(0, match.index)}${rows.join("\n")}${text.slice(afterBase + oldVariantRows.length)}`;
  }

  function replaceHiddenHitRows(text, result, report) {
    const pattern = /^\|~\|[^|\n]*\|[^|\n]*\|[^|\n]*\|[^|\n]*\|[^|\n]*\|DR&footnote\([^\n]*\)\|[^|\n]*\|$/m;
    const match = pattern.exec(text);
    if (!match) {
      report.missing.push("Hit数・DR");
      return text;
    }
    const afterBase = match.index + match[0].length;
    const oldVariantRows = /^(?:\n\|~\|~\|~\|~\|~\|BGCOLOR\(#(?:F88|9AF|AF9)\):[^|\n]*\|~\|~\|)*/.exec(text.slice(afterBase))[0];
    const cells = match[0].split("|");
    cells[2] = result.input.quickHits === null ? "" : String(result.input.quickHits);
    cells[3] = result.input.artsHits === null ? "" : String(result.input.artsHits);
    cells[4] = result.input.busterHits === null ? "" : String(result.input.busterHits);
    cells[5] = result.input.extraHits === null ? "" : String(result.input.extraHits);
    cells[6] = coloredNpHits(result.input.npType, result.input.npHits);
    cells[cells.length - 2] = format(result.dr, 1);
    const rows = [cells.join("|")].concat(nobleVariantHitSettings(result).map((setting) => `|~|~|~|~|~|${coloredNpHits(setting.typeKey, setting.hits)}|~|~|`));
    report.replaced.push("Hit数・DR");
    return `${text.slice(0, match.index)}${rows.join("\n")}${text.slice(afterBase + oldVariantRows.length)}`;
  }

  function replaceSource(source, result) {
    let text = String(source || "").replace(/\r\n?/g, "\n");
    const report = { replaced: [], missing: [] };
    const generatedTemplate = !text.trim();
    if (generatedTemplate) text = SERVANT_TEMPLATE;

    text = replaceIdentityFields(text, result, report);

    text = replaceLine(text,
      /^\|BGCOLOR\(#98fb98\):CENTER:46\|BGCOLOR\(#87ceeb\):CENTER:46\|BGCOLOR\(#ffb6c1\):CENTER:46\|BGCOLOR\(#e6e6fa\):CENTER:58\|.*\|c\s*$/m,
      buildColumnStyle(result), "基本情報の列設定", report);
    text = replaceLine(text,
      /^\|>\|>\|BGCOLOR\(#e6e6fa\):コマンドカード\|能力値\|.*\|$/m,
      buildHeaderLine(result), "レベル見出し", report);
    text = replaceLine(text, /^\|Quick\|Arts\|Buster\|HP\|.*\|$/m,
      buildStatusRow(result, "HP"), "HP行", report);
    text = replaceLine(text, /^\|[^|\n]*\|[^|\n]*\|[^|\n]*\|ATK\|.*\|$/m,
      buildStatusRow(result, "ATK"), "ATK行", report);

    const metaPatterns = [
      [/((?:^|\n)\|>\|>\|BGCOLOR\(#e6e6fa\):Class\|>\|>\|)[^|\n]*/m, `$1${result.classIcon}`, "クラスアイコン"],
      [/(\|>\|BGCOLOR\(#e6e6fa\):Rare\|)[^|\n]*/m, `$1${result.input.rarity}`, "レアリティ"],
      [/(\|BGCOLOR\(#e6e6fa\):Cost\|)[^|\n]*/m, `$1${result.cost}`, "Cost"],
      [/(\|>\|BGCOLOR\(#e6e6fa\):傾向\|>\|)[^|\n]*/m, `$1${result.input.tendency}`, "ステータス傾向"],
      [/(\|BGCOLOR\(#e6e6fa\):タイプ\|)[^|\n]*/m, `$1${result.input.type === "physical" ? "物理" : "魔術"}`, "タイプ"]
    ];
    metaPatterns.forEach(([pattern, replacement, label]) => {
      text = replaceLine(text, pattern, replacement, label, report);
    });
    text = replaceClassSkillIcons(text, result, report);

    text = replaceHiddenNobleTypeRows(text, result, report);
    text = replaceNpCardRows(text, result, report);

    text = replaceLine(text,
      /^\|BGCOLOR\(#e6e6fa\):成長\|.*\|スター発生率\|[^|\n]*\|$/m,
      (line) => {
        const cells = line.split("|");
        cells[2] = result.input.growth;
        cells[4] = result.input.policy;
        cells[5] = result.input.personality;
        cells[6] = result.input.gender;
        cells[cells.length - 2] = format(result.sr, 1);
        return cells.join("|");
      }, "成長・方針・性格・性別・スター発生率", report);
    text = replaceLine(text,
      /^\|ヒット数\|.*\|スター集中度\|[^|\n]*\|$/m,
      (line) => replaceLastCell(line, result.sw), "スター集中度", report);
    text = replaceHiddenHitRows(text, result, report);
    text = replaceLine(text,
      /^\|N\/A&footnote\([^\n]*\)\|.*\|N\/D&footnote\([^\n]*\)\|[^|\n]*\|$/m,
      buildNaLine(result), "N/A・N/D", report);
    text = replaceLine(text, /^\|特性\|[^\n]*\|$/m,
      (line) => buildTraitLine(line, result), "特性の性別・方針・性格・相性", report);

    text = replaceLine(text, /^\|\s*筋力\s*\|[^\n]*\|\s*耐久\s*\|[^\n]*$/m,
      buildParameterRow("筋力", result.input.strengthRank, " ", "耐久", result.input.enduranceRank), "筋力・耐久パラメーター", report);
    text = replaceLine(text, /^\|\s*敏捷\s*\|[^\n]*\|\s*魔力\s*\|[^\n]*$/m,
      buildParameterRow("敏捷", result.input.agilityRank, "~", "魔力", result.input.magicRank), "敏捷・魔力パラメーター", report);
    text = replaceLine(text, /^\|\s*幸運\s*\|[^\n]*\|\s*宝具\s*\|[^\n]*$/m,
      buildParameterRow("幸運", result.input.luckRank, "~", "宝具", result.input.treasureRank), "幸運・宝具パラメーター", report);

    text = applyContentSettings(text, result, report);

    return { text, replaced: report.replaced, missing: report.missing, generatedTemplate };
  }

  function buildComputedSnippet(result) {
    return [
      "// 計算対象行のみ（既存コードを貼り付けると完成コードを生成できます）",
      buildColumnStyle(result), buildHeaderLine(result), buildStatusRow(result, "HP"), buildStatusRow(result, "ATK"),
      buildNaLine(result),
      buildParameterRow("筋力", result.input.strengthRank, " ", "耐久", result.input.enduranceRank),
      buildParameterRow("敏捷", result.input.agilityRank, "~", "魔力", result.input.magicRank),
      buildParameterRow("幸運", result.input.luckRank, "~", "宝具", result.input.treasureRank)
    ].join("\n");
  }

  const core = {
    VERSION, SERVANT_TEMPLATE, calculate, replaceSource, parseTraitsFromSource, parseSelectedTraitsFromSource, parseTraitRestrictionsFromSource,
    normalizeTraitRestrictions, formatRestrictedTrait,
    createDefaultContentSettings, normalizeContentSettings, buildOwnedSkillsSection, buildNobleSection, formatEffectSuffix, insertEffectNotation, toggleEffectNotation, effectTokens, renderContentSettingsEditors,
    buildClassSkillSection, buildBondSection, buildColumnStyle, buildHeaderLine, buildStatusRow, buildNaLine, buildParameterRow
  };
  if (typeof globalThis !== "undefined") globalThis.FGOStatusCalculatorCore = core;
  if (typeof globalThis !== "undefined" && globalThis.__FGO_STATUS_CALC_TEST__) return;

  function optionList(values, selected) {
    return values.map(([value, label]) => `<option value="${value}"${String(value) === String(selected) ? " selected" : ""}>${label}</option>`).join("");
  }

  function field(label, control, help) {
    return `<label class="fsc-field"><span>${label}</span>${control}${help ? `<small>${help}</small>` : ""}</label>`;
  }

  function select(name, options, selected) {
    return `<select name="${name}" autocomplete="on">${optionList(options, selected)}</select>`;
  }

  function numberInput(name, value, min, step) {
    return `<input type="number" name="${name}" value="${value}" min="${min}" step="${step || 1}" autocomplete="on">`;
  }

  function textInput(name, placeholder) {
    return `<input type="text" name="${name}" placeholder="${placeholder || ""}" autocomplete="on">`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
  }

  function modelText(path, label, value, placeholder) {
    return `<label class="fsc-field"><span>${label}</span><input type="text" data-model-path="${path}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder || "")}" autocomplete="on"></label>`;
  }

  function modelNumber(path, label, value, placeholder) {
    return `<label class="fsc-field"><span>${label}</span><input type="number" min="0" step="1" data-model-path="${path}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder || "")}" autocomplete="on"></label>`;
  }

  function modelCheckbox(path, label, checked, rerender) {
    return `<label class="fsc-check"><input type="checkbox" data-model-path="${path}"${checked ? " checked" : ""}${rerender ? " data-rerender" : ""}>${label}</label>`;
  }

  function modelSelect(path, label, options, selected, rerender) {
    return `<label class="fsc-field"><span>${label}</span><select data-model-path="${path}"${rerender ? " data-rerender" : ""}>${optionList(options, selected)}</select></label>`;
  }

  function effectModeOptions(kind) {
    if (kind === "skill") return [["none", "数値なし"], ["fixed", "固定値"], ["level10", "Lv.1～10"]];
    if (kind === "specialAttack") return [["fixed", "固定値"], ["np5", "Lv.1～5"], ["oc5", "OC1～5"]];
    if (kind === "noble") return [["none", "数値なし"], ["fixed", "固定値"], ["np5", "宝具Lv.1～5"], ["oc5", "OC1～5"]];
    return [["none", "数値なし"], ["fixed", "固定値"]];
  }

  function effectValueCount(mode) {
    if (mode === "level10") return 10;
    if (mode === "np5" || mode === "oc5") return 5;
    if (mode === "fixed") return 1;
    return 0;
  }

  function effectPreviewLine(effect) {
    const item = normalizeEffect(effect);
    if (item.raw) return cleanInline(item.rawCode.replace(/\r?\n/g, " / "));
    if (item.effectType === "nobleAttack") {
      const target = item.attackTarget === "single" ? "単体" : item.attackTarget === "all" ? "全体" : "宝具種類に連動";
      return `宝具攻撃（${target}・${item.attackStrength === "upgraded" ? "強化後倍率" : "強化前倍率"}）`;
    }
    const specialNotation = item.valueMode === "oc5" ? "<OC:特攻威力UP>" : item.valueMode === "np5" ? "[Lv]" : "";
    const text = item.effectType === "specialAttack"
      ? `＆〔${cleanInline(item.specialTarget)}〕特攻${specialNotation}`
      : `${item.prefix}${cleanInline(item.text)}`;
    const values = item.values.map(cleanInline).filter(Boolean);
    if (!values.length) return text;
    const valueLabel = item.valueMode === "level10" ? "Lv."
      : item.valueMode === "np5" ? "宝具Lv."
      : item.valueMode === "oc5" ? "OC"
      : "数値";
    return `${text}${text ? "　" : ""}${valueLabel}：${values.join(" / ")}`;
  }

  function effectPreviewBody(effects) {
    const lines = normalizeEffects(effects).filter(effectHasData).map(effectPreviewLine).filter(Boolean);
    return `<b>入力した効果一覧</b>${lines.length
      ? `<ol>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ol>`
      : `<span>効果はまだ入力されていません。</span>`}`;
  }

  function effectPreview(effects, path) {
    return `<div class="fsc-effect-preview" data-effect-preview-path="${path}">${effectPreviewBody(effects)}</div>`;
  }

  function durationControl(kind, label) {
    return `<label class="fsc-duration-field"><span>${label}（自由入力）</span>
      <input type="number" min="1" step="1" value="1" data-duration-custom="${kind}" aria-label="${label}の自由入力"></label>`;
  }

  function effectDurationTools(path) {
    return `<div class="fsc-duration-tools">
      ${durationControl("turn", "ターン数")}${durationControl("count", "回数")}
      <div class="fsc-duration-buttons">
        <button type="button" class="fsc-mini" data-content-action="appendDuration" data-duration-format="turn" data-target-path="${path}.text">ターン表記を追加</button>
        <button type="button" class="fsc-mini" data-content-action="appendDuration" data-duration-format="count" data-target-path="${path}.text">回数表記を追加</button>
        <button type="button" class="fsc-mini" data-content-action="appendDuration" data-duration-format="both" data-target-path="${path}.text">回数・ターン表記を追加</button>
      </div>
    </div>`;
  }

  function editorAnchor(path) {
    return `fsc-editor-${String(path || "content").replace(/[^a-zA-Z0-9]+/g, "-")}`;
  }

  function effectTokens(kind) {
    if (kind === "class") return [];
    if (kind === "skill") return ["[Lv]", "[Lv:確率]"];
    return ["[Lv]", "[Lv:確率]", "<OC:効果UP>", "<OC:回数UP>"];
  }

  function tokenButtons(tokens, path, text) {
    if (!tokens.length) return "";
    return `<div class="fsc-token-row">${tokens.map((token) => {
      const active = stringValue(text).includes(token);
      return `<button type="button" class="fsc-mini fsc-notation-toggle${active ? " active" : ""}" data-content-action="toggleToken" data-target-path="${path}.text" data-token="${escapeHtml(token)}" aria-pressed="${active}">${escapeHtml(token)}：${active ? "ON" : "OFF"}</button>`;
    }).join("")}</div>`;
  }

  function effectEditor(effect, path, listPath, index, total, kind, scrollTarget) {
    const normalized = normalizeEffect(effect);
    const count = effectValueCount(normalized.valueMode);
    const valueFields = Array.from({ length: count }, (_, valueIndex) => {
      const label = count === 1 ? "数値" : `${normalized.valueMode === "level10" ? "Lv." : normalized.valueMode === "oc5" ? "OC" : "宝具Lv."}${valueIndex + 1}`;
      return modelText(`${path}.values.${valueIndex}`, label, normalized.values[valueIndex] || "", "");
    }).join("");
    const typeControl = kind === "noble"
      ? modelSelect(`${path}.effectType`, "効果の種類", [["normal", "通常効果"], ["nobleAttack", "宝具攻撃"], ["specialAttack", "特攻攻撃"]], normalized.effectType, true)
      : "";
    const tokens = effectTokens(kind);
    const levelTokens = tokens.filter((token) => token.startsWith("["));
    const ocTokens = tokens.filter((token) => token.startsWith("<"));
    const standard = `<div class="fsc-grid fsc-effect-grid">
      ${typeControl}
      ${modelSelect(`${path}.prefix`, "接続記号", [["", "なし"], ["＆", "＆"], ["＋", "＋"], ["　＆", "字下げ付き＆"]], normalized.prefix, false)}
      ${modelSelect(`${path}.valueMode`, "数値形式", effectModeOptions(kind), normalized.valueMode, true)}
    </div>
    <label class="fsc-field"><span>効果文</span><textarea rows="2" data-model-path="${path}.text" placeholder="対象・効果・持続ターンを入力">${escapeHtml(normalized.text)}</textarea></label>
    ${tokenButtons(levelTokens, path, normalized.text)}${effectDurationTools(path)}${tokenButtons(ocTokens, path, normalized.text)}${count ? `<div class="fsc-grid fsc-values">${valueFields}</div>` : ""}`;
    const attack = `<div class="fsc-grid fsc-effect-grid">${typeControl}
      ${modelSelect(`${path}.attackTarget`, "攻撃対象", [["auto", "宝具種類に連動"], ["single", "敵単体"], ["all", "敵全体"]], normalized.attackTarget, false)}
      ${modelSelect(`${path}.attackStrength`, "攻撃倍率", [["base", "強化前倍率"], ["upgraded", "強化後倍率"]], normalized.attackStrength, false)}
    </div><p class="fsc-help">効果文・カード表記・宝具Lv.1～5の倍率を、宝具種類と攻撃倍率から自動生成します。</p>`;
    const specialCount = effectValueCount(normalized.valueMode);
    const specialFields = Array.from({ length: specialCount }, (_, valueIndex) => {
      const label = specialCount === 1 ? "数値" : `${normalized.valueMode === "oc5" ? "OC" : "Lv."}${valueIndex + 1}`;
      return modelText(`${path}.values.${valueIndex}`, label, normalized.values[valueIndex] || "", "");
    }).join("");
    const specialAttack = `<div class="fsc-grid fsc-effect-grid">${typeControl}
      ${modelText(`${path}.specialTarget`, "特攻対象", normalized.specialTarget, "")}
      ${modelSelect(`${path}.valueMode`, "倍率形式", effectModeOptions("specialAttack"), normalized.valueMode, true)}
    </div>${specialCount ? `<div class="fsc-grid fsc-values">${specialFields}</div>` : ""}
    <p class="fsc-help">カード表記は宝具種類に連動し、接続記号「＆」と特攻表記を自動で追加します。</p>`;
    const raw = `<label class="fsc-field"><span>atwikiコード</span><textarea rows="3" data-model-path="${path}.rawCode" placeholder="この効果行のコードをそのまま入力">${escapeHtml(normalized.rawCode)}</textarea></label>`;
    const typeLabel = normalized.effectType === "nobleAttack" ? "宝具攻撃" : normalized.effectType === "specialAttack" ? "特攻攻撃" : `効果${index + 1}`;
    const scrollLabel = kind === "noble" ? "この宝具へ" : kind === "bond" ? "この絆礼装へ" : "このスキルへ";
    const editor = normalized.effectType === "nobleAttack" && kind === "noble" ? attack
      : normalized.effectType === "specialAttack" && kind === "noble" ? specialAttack
      : standard;
    return `<details class="fsc-effect-row fsc-effect-tone-${index % 3}" open>
      <summary class="fsc-effect-summary"><b>${typeLabel}</b><span>クリックで開閉</span></summary><div class="fsc-effect-body">
      <div class="fsc-entry-actions"><span>
        <button type="button" class="fsc-mini" data-content-action="scrollToEditor" data-scroll-target="${scrollTarget}">${scrollLabel}</button>
        <button type="button" class="fsc-mini" data-content-action="moveEffect" data-list-path="${listPath}" data-index="${index}" data-direction="-1"${index === 0 ? " disabled" : ""}>上へ</button>
        <button type="button" class="fsc-mini" data-content-action="moveEffect" data-list-path="${listPath}" data-index="${index}" data-direction="1"${index === total - 1 ? " disabled" : ""}>下へ</button>
        <button type="button" class="fsc-mini danger" data-content-action="removeEffect" data-list-path="${listPath}" data-index="${index}">削除</button>
      </span></div>
      ${modelCheckbox(`${path}.raw`, "特殊記述を使用", normalized.raw, true)}
      ${normalized.raw ? raw : editor}
    </div></details>`;
  }

  function effectListEditor(effects, path, kind, scrollTarget) {
    const normalized = normalizeEffects(effects);
    return `<div class="fsc-effects">${normalized.map((effect, index) => effectEditor(effect, `${path}.${index}`, path, index, normalized.length, kind, scrollTarget || editorAnchor(path))).join("")}</div>
      <button type="button" class="fsc-btn sub fsc-add" data-content-action="addEffect" data-list-path="${path}">効果を追加</button>`;
  }

  function skillVersionEditor(version, path, effectTitle, scrollTarget) {
    const item = normalizeSkillVersion(version);
    return `${effectPreview(item.effects, `${path}.effects`)}<div class="fsc-grid">
      ${modelText(`${path}.name`, "名称・ランク", item.name, "")}
      ${modelText(`${path}.icon`, "アイコンファイル名", item.icon, "")}
      ${modelText(`${path}.ct`, "CT", item.ct, "")}
    </div><h5>${effectTitle || "効果"}</h5>${effectListEditor(item.effects, `${path}.effects`, "skill", scrollTarget)}`;
  }

  function skillVariantEditor(variant, path) {
    const item = normalizeSkillVariant(variant, variant.stage);
    const label = ascensionLabel(item.stage);
    const anchor = editorAnchor(path);
    if (!item.enabled) return `<details class="fsc-variant-tab" id="${anchor}"><summary>${label}</summary><div class="fsc-variant-body">${modelCheckbox(`${path}.enabled`, `${label}の差分を使用`, false, true)}</div></details>`;
    const changesIcon = ["nameIcon", "all"].includes(item.changeMode);
    const changesEffects = ["nameEffect", "all"].includes(item.changeMode);
    const upgradedPath = `${path}.upgraded`;
    return `<details class="fsc-variant-tab" id="${anchor}" open><summary>${label}</summary><div class="fsc-variant-body">
      ${modelCheckbox(`${path}.enabled`, `${label}の差分を使用`, true, true)}
      ${changesEffects ? effectPreview(item.effects, `${path}.effects`) : ""}
      <div class="fsc-grid">
        ${modelSelect(`${path}.changeMode`, "変更内容", [["name", "名称のみ"], ["nameIcon", "名称・アイコン"], ["nameEffect", "名称・効果"], ["all", "名称・アイコン・効果"]], item.changeMode, true)}
        ${modelText(`${path}.name`, "差分の名称・ランク", item.name, "未入力時は通常名を使用")}
        ${changesIcon ? modelText(`${path}.icon`, "差分のアイコン", item.icon, "未入力時は通常アイコンを使用") : ""}
        ${changesEffects ? modelText(`${path}.ct`, "差分のCT", item.ct, "未入力時は通常CTを使用") : ""}
      </div>
      ${changesEffects ? `<h5>差分の効果</h5>${effectListEditor(item.effects, `${path}.effects`, "skill", anchor)}` : ""}
      <div class="fsc-variant">${modelCheckbox(`${upgradedPath}.enabled`, "この再臨差分の強化後を使用", item.upgraded.enabled, true)}
        ${item.upgraded.enabled ? `<h4>再臨差分・強化後</h4>${skillVersionEditor(item.upgraded, upgradedPath, "再臨差分・強化後の効果", anchor)}` : ""}
      </div>
    </div></details>`;
  }

  function ownedSkillEditor(skill, index) {
    const item = normalizeOwnedSkill(skill, index);
    const upgradedPath = `skills.${index}.upgraded`;
    const anchor = editorAnchor(`skills.${index}`);
    return `<details class="fsc-entry fsc-entry-tone-${index % 4}" id="${anchor}" open><summary>Skill${index + 1}</summary>
      <div class="fsc-entry-body"><h4>通常</h4>${skillVersionEditor(item.base, `skills.${index}.base`, "通常時の効果", anchor)}
      <h4>再臨差分</h4>${item.variants.map((variant, variantIndex) => skillVariantEditor(variant, `skills.${index}.variants.${variantIndex}`)).join("")}
      <div class="fsc-variant">${modelCheckbox(`${upgradedPath}.enabled`, "強化後を使用", item.upgraded.enabled, true)}
        ${item.upgraded.enabled ? `<h4>強化後</h4>${skillVersionEditor(item.upgraded, upgradedPath, "強化後の効果", anchor)}` : ""}
      </div></div></details>`;
  }

  function classSkillEditor(skill, index, total) {
    const item = skill && typeof skill === "object" ? skill : { name: "", icon: "", effects: [] };
    const anchor = editorAnchor(`classSkills.${index}`);
    return `<details class="fsc-entry fsc-entry-tone-${index % 4}" id="${anchor}" open><summary>クラススキル${index + 1}</summary><div class="fsc-entry-body">
      ${effectPreview(item.effects, `classSkills.${index}.effects`)}
      <div class="fsc-entry-actions">
        <button type="button" class="fsc-mini" data-content-action="moveClassSkill" data-index="${index}" data-direction="-1"${index === 0 ? " disabled" : ""}>上へ</button>
        <button type="button" class="fsc-mini" data-content-action="moveClassSkill" data-index="${index}" data-direction="1"${index === total - 1 ? " disabled" : ""}>下へ</button>
        <button type="button" class="fsc-mini danger" data-content-action="removeClassSkill" data-index="${index}">削除</button>
      </div>
      <div class="fsc-grid">${modelText(`classSkills.${index}.name`, "名称・ランク", item.name || "", "")}${modelText(`classSkills.${index}.icon`, "アイコンファイル名", item.icon || "", "")}</div>
      <h5>効果</h5>${effectListEditor(item.effects, `classSkills.${index}.effects`, "class", anchor)}
    </div></details>`;
  }

  function nobleVersionEditor(version, path, title, scrollTarget) {
    const item = normalizeNobleVersion(version);
    const source = version && typeof version === "object" ? version : {};
    const normalSettings = path === "noble.base" ? `${modelSelect(`${path}.npType`, "宝具の種類", Object.entries(NP_TYPE).map(([key, value]) => [key, value.label]), NP_TYPE[source.npType] ? source.npType : "artsAll", false)}
      ${modelNumber(`${path}.npHits`, "宝具Hit数", stringValue(source.npHits), "")}` : "";
    return `<h4>${title}</h4>${effectPreview(item.effects, `${path}.effects`)}<div class="fsc-grid">
      ${normalSettings}
      ${modelText(`${path}.reading`, "ルビ", item.reading, "")}
      ${modelText(`${path}.name`, "正式名称", item.name, "")}
      ${modelText(`${path}.rank`, "ランク", item.rank, "")}
      ${modelText(`${path}.category`, "種別", item.category, "")}
    </div><h5>効果</h5>${effectListEditor(item.effects, `${path}.effects`, "noble", scrollTarget)}`;
  }

  function nobleVariantEditor(variant, path) {
    const item = normalizeNobleVariant(variant, variant.stage);
    const label = ascensionLabel(item.stage);
    const anchor = editorAnchor(path);
    if (!item.enabled) return `<details class="fsc-variant-tab" id="${anchor}"><summary>${label}</summary><div class="fsc-variant-body">${modelCheckbox(`${path}.enabled`, `${label}の差分を使用`, false, true)}</div></details>`;
    const changesEffects = item.changeMode === "nameEffect";
    const upgradedPath = `${path}.upgraded`;
    return `<details class="fsc-variant-tab" id="${anchor}" open><summary>${label}</summary><div class="fsc-variant-body">${modelCheckbox(`${path}.enabled`, `${label}の差分を使用`, true, true)}
      ${changesEffects ? effectPreview(item.effects, `${path}.effects`) : ""}
      <div class="fsc-grid">
        ${modelSelect(`${path}.changeMode`, "変更内容", [["name", "名称のみ"], ["nameEffect", "名称・効果"]], item.changeMode, true)}
        ${modelSelect(`${path}.npType`, "差分の宝具種類", [["", "通常と同じ"], ...Object.entries(NP_TYPE).map(([key, value]) => [key, value.label])], item.npType, false)}
        ${modelNumber(`${path}.npHits`, "差分の宝具Hit数", item.npHits, "未入力時は通常と同じ")}
        ${modelText(`${path}.reading`, "差分のルビ", item.reading, "未入力時は通常ルビを使用")}
        ${modelText(`${path}.name`, "差分の正式名称", item.name, "未入力時は通常名を使用")}
        ${changesEffects ? modelText(`${path}.rank`, "差分のランク", item.rank, "未入力時は通常ランクを使用") : ""}
        ${changesEffects ? modelText(`${path}.category`, "差分の種別", item.category, "未入力時は通常種別を使用") : ""}
      </div>${changesEffects ? `<h5>差分の効果</h5>${effectListEditor(item.effects, `${path}.effects`, "noble", anchor)}` : ""}
      <div class="fsc-variant">${modelCheckbox(`${upgradedPath}.enabled`, "この再臨差分の強化後を使用", item.upgraded.enabled, true)}
        ${item.upgraded.enabled ? nobleVersionEditor(item.upgraded, upgradedPath, "再臨差分・強化後", anchor) : ""}
      </div>
    </div></details>`;
  }

  function renderContentSettingsEditors(settings) {
    const nobleAnchor = editorAnchor("noble");
    const bondAnchor = editorAnchor("bond");
    return {
      classSkills: settings.classSkills.map((skill, index) => classSkillEditor(skill, index, settings.classSkills.length)).join("") + `<button type="button" class="fsc-btn sub fsc-add" data-content-action="addClassSkill">クラススキルを追加</button>`,
      skills: settings.skills.map(ownedSkillEditor).join(""),
      noble: `<details class="fsc-entry fsc-entry-tone-3" id="${nobleAnchor}" open><summary>宝具</summary><div class="fsc-entry-body">${nobleVersionEditor(settings.noble.base, "noble.base", "通常", nobleAnchor)}
        <h4>再臨差分</h4>${settings.noble.variants.map((variant, index) => nobleVariantEditor(variant, `noble.variants.${index}`)).join("")}
        <div class="fsc-variant">${modelCheckbox("noble.upgraded.enabled", "強化後を使用", settings.noble.upgraded.enabled, true)}${settings.noble.upgraded.enabled ? nobleVersionEditor(settings.noble.upgraded, "noble.upgraded", "強化後", nobleAnchor) : ""}</div>
      </div></details>`,
      bond: `<details class="fsc-entry fsc-entry-tone-0" id="${bondAnchor}" open><summary>絆礼装</summary><div class="fsc-entry-body">${effectPreview(settings.bond.effects, "bond.effects")}<div class="fsc-grid">
        ${modelText("bond.name", "礼装名", settings.bond.name, "")}${modelText("bond.icon", "効果アイコンファイル名", settings.bond.icon, "")}
      </div><h5>効果</h5>${effectListEditor(settings.bond.effects, "bond.effects", "bond", bondAnchor)}</div></details>`
    };
  }

  function installStyle() {
    if (document.getElementById("fsc-style")) return;
    const style = document.createElement("style");
    style.id = "fsc-style";
    style.textContent = `
      #fgo-status-calculator{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic UI",Meiryo,sans-serif;color:#1f2937;max-width:1180px;margin:16px auto}
      #fgo-status-calculator *{box-sizing:border-box}
      .fsc-shell{background:#f4f8fc;border:1px solid #b8cee3;border-radius:12px;padding:16px}
      .fsc-title{margin:0 0 4px;font-size:22px}.fsc-lead{margin:0 0 16px;color:#526579}
      .fsc-section{background:#fff;border:1px solid #ccd9e5;border-radius:9px;padding:14px;margin:12px 0}
      .fsc-section h3{font-size:17px;margin:0 0 12px;border-left:5px solid #477fad;padding-left:9px}
      .fsc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:10px}.fsc-grid-secondary{margin-top:10px;padding-top:10px;border-top:1px solid #d9e3ec}
      .fsc-command-rows{display:flex;flex-direction:column;gap:10px}.fsc-command-row{display:grid;gap:10px}
      .fsc-command-cards{grid-template-columns:repeat(4,minmax(120px,1fr))}.fsc-command-hits{grid-template-columns:repeat(5,minmax(110px,1fr))}
      .fsc-field{display:flex;flex-direction:column;gap:4px;font-weight:600;font-size:13px}
      .fsc-field small{font-weight:400;color:#64748b}.fsc-field select,.fsc-field input,.fsc-field textarea,.fsc-textarea{width:100%;border:1px solid #aebfd0;border-radius:6px;background:#fff;padding:8px;font:inherit;color:#111827}
      .fsc-checks{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.fsc-check{display:flex;gap:7px;align-items:center;font-weight:600}
      .fsc-check input{width:17px;height:17px}.fsc-manual{margin-top:10px}
      .fsc-trait-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}.fsc-trait-group{border:1px solid #d4e0eb;border-radius:7px;padding:10px;background:#f8fbfe}.fsc-trait-group h4{margin:0 0 8px;font-size:14px}.fsc-trait-options{display:flex;flex-wrap:wrap;gap:6px 12px}.fsc-trait-option{display:flex;gap:5px;align-items:center;font-size:13px}.fsc-trait-option input{width:16px;height:16px}.fsc-trait-restrictions{margin-top:12px}.fsc-trait-restrictions>h4{margin:0 0 8px;font-size:14px}.fsc-trait-restriction-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px}.fsc-trait-restriction{border:1px solid #c9d9e6;border-radius:7px;background:#f8fbfe;padding:9px}.fsc-trait-restriction>b{display:block;margin-bottom:7px}.fsc-trait-restriction-fields{display:grid;grid-template-columns:minmax(145px,1fr) minmax(120px,1fr);gap:8px}.fsc-trait-restriction-preview{display:block;margin-top:6px;color:#526579;font-size:12px}.fsc-derived{margin:10px 0 0;padding:8px;border-radius:6px;background:#edf5fb;color:#3a5268;font-size:12px}
      .fsc-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.fsc-btn{border:1px solid #35698f;border-radius:7px;background:#477fad;color:#fff;padding:8px 13px;font-weight:700;cursor:pointer}
      .fsc-btn:hover{background:#35698f}.fsc-btn.sub{background:#fff;color:#35698f}.fsc-btn.sub:hover{background:#e8f1f8}
      .fsc-result-table{border-collapse:collapse;width:100%;min-width:620px}.fsc-scroll{overflow-x:auto}
      .fsc-result-table th,.fsc-result-table td{border:1px solid #c7d5e2;padding:6px;text-align:center;white-space:nowrap}.fsc-result-table th{background:#e7eff7}
      .fsc-copy-cell{border:0;background:transparent;color:#075985;font-weight:700;cursor:pointer;padding:3px 6px;border-radius:4px}.fsc-copy-cell:hover{background:#dff3ff}
      .fsc-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px}.fsc-card{background:#edf5fb;border:1px solid #c1d6e7;border-radius:7px;padding:9px}.fsc-card b{display:block;font-size:12px;color:#526579}.fsc-card strong{font-size:18px}
      .fsc-textarea{min-height:230px;resize:vertical;font-family:Consolas,"BIZ UDGothic",monospace;font-size:12px;line-height:1.45}
      .fsc-message{padding:9px;border-radius:6px;margin:8px 0;background:#edf7ed;color:#245c2a}.fsc-message.warn{background:#fff4d6;color:#7a4d00}
      .fsc-help{font-size:12px;color:#64748b;margin:6px 0}.fsc-split{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .fsc-entry{--fsc-entry-bg:#f8fbfe;--fsc-summary-bg:#eaf2f8;border:1px solid #cbd9e6;border-radius:8px;background:var(--fsc-entry-bg);margin:10px 0}.fsc-entry-tone-0{--fsc-entry-bg:#f7fbff;--fsc-summary-bg:#e7f2fb}.fsc-entry-tone-1{--fsc-entry-bg:#f7fcf9;--fsc-summary-bg:#e7f5ed}.fsc-entry-tone-2{--fsc-entry-bg:#fcf9ff;--fsc-summary-bg:#f0e9f8}.fsc-entry-tone-3{--fsc-entry-bg:#fffaf5;--fsc-summary-bg:#f9eee2}.fsc-entry>summary{cursor:pointer;font-weight:700;padding:10px 12px;background:var(--fsc-summary-bg);border-radius:8px}.fsc-entry[open]>summary{border-radius:8px 8px 0 0;border-bottom:1px solid #cbd9e6}.fsc-entry-body{padding:12px}.fsc-entry-body h4{margin:12px 0 8px}.fsc-entry-body h5{margin:10px 0 6px}.fsc-entry-actions,.fsc-entry-head,.fsc-token-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.fsc-entry-actions{justify-content:flex-end;margin-bottom:8px}.fsc-entry-head{justify-content:space-between}.fsc-variant{border-top:1px dashed #c8d6e2;margin-top:12px;padding-top:12px}.fsc-variant-tab{border:1px solid #c7d7e4;border-radius:7px;background:rgba(255,255,255,.55);margin:8px 0}.fsc-variant-tab>summary{cursor:pointer;font-weight:700;padding:9px 11px;background:#edf3f8;border-radius:7px}.fsc-variant-tab[open]>summary{border-radius:7px 7px 0 0;border-bottom:1px solid #c7d7e4}.fsc-variant-body{padding:10px}.fsc-effects{display:flex;flex-direction:column;gap:8px}.fsc-effect-row{border:1px solid #d8e2eb;border-radius:7px;overflow:hidden}.fsc-effect-summary{display:flex;justify-content:space-between;gap:10px;align-items:center;cursor:pointer;padding:8px 10px}.fsc-effect-summary span{color:#64748b;font-size:11px;font-weight:400}.fsc-effect-body{padding:9px;border-top:1px solid rgba(174,191,208,.55)}.fsc-effect-tone-0{background:#fff}.fsc-effect-tone-1{background:#f1f7fb}.fsc-effect-tone-2{background:#f7f3fa}.fsc-effect-grid{grid-template-columns:repeat(2,minmax(150px,1fr));margin:8px 0}.fsc-values{grid-template-columns:repeat(auto-fit,minmax(80px,1fr));margin-top:8px}.fsc-token-row{margin:6px 0}.fsc-mini{border:1px solid #7b98af;border-radius:5px;background:#fff;color:#30546d;padding:4px 8px;cursor:pointer;font-size:12px}.fsc-mini:hover{background:#eaf2f8}.fsc-notation-toggle.active{border-color:#35698f;background:#477fad;color:#fff}.fsc-notation-toggle.active:hover{background:#35698f}.fsc-mini.danger{border-color:#c77979;color:#8a3030}.fsc-mini:disabled{opacity:.45;cursor:default}.fsc-add{margin-top:8px}
      .fsc-effect-preview{display:flex;flex-direction:column;gap:5px;margin:4px 0 10px;padding:9px 11px;border:1px solid #bacddd;border-left:4px solid #5f89aa;border-radius:7px;background:rgba(255,255,255,.72);font-size:12px}.fsc-effect-preview>b{color:#34556e}.fsc-effect-preview>span{color:#6b7c8b}.fsc-effect-preview ol{margin:0;padding-left:22px}.fsc-effect-preview li+li{margin-top:3px}.fsc-duration-tools{display:grid;grid-template-columns:minmax(105px,140px) minmax(105px,140px) 1fr;gap:8px;align-items:end;margin:7px 0;padding:8px;border:1px dashed #b8cad8;border-radius:6px;background:rgba(255,255,255,.65)}.fsc-duration-field{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:600}.fsc-duration-field select,.fsc-duration-field input{width:100%;border:1px solid #aebfd0;border-radius:5px;background:#fff;padding:6px;font:inherit}.fsc-duration-buttons{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.fsc-duration-field [hidden]{display:none}
      @media(max-width:700px){.fsc-shell{padding:10px}.fsc-split{grid-template-columns:1fr}.fsc-section{padding:10px}.fsc-command-cards,.fsc-command-hits{grid-template-columns:repeat(2,minmax(120px,1fr))}.fsc-duration-tools{grid-template-columns:1fr 1fr}.fsc-duration-buttons{grid-column:1/-1}.fsc-trait-restriction-fields{grid-template-columns:1fr} }
    `;
    document.head.appendChild(style);
  }

  function renderApp(root) {
    const rankOptions = Object.keys(RANK).map((rank) => [rank, rank]);
    const classOptions = Object.entries(CLASS).map(([key, value]) => [key, `${key}：${value.name}`]);
    root.innerHTML = `<form class="fsc-shell" autocomplete="on">
      <h2 class="fsc-title">FGO ステータス自動計算機</h2>
      <p class="fsc-lead">入力内容からステータスを計算し、既存のPukiWikiコードへ反映します。元のコードが空の場合は、サーヴァント用テンプレート全体を新規生成します。</p>
      <section class="fsc-section"><h3>基本設定</h3><div class="fsc-grid">
        ${field("No.", textInput("servantNo"))}
        ${field("真名", textInput("trueName"))}
        ${field("レアリティ", select("rarity", [[0,"★0"],[1,"★1"],[2,"★2"],[3,"★3"],[4,"★4"],[5,"★5"]], 5))}
        ${field("クラス", select("classKey", classOptions, "剣"))}
        ${field("ステータス傾向", select("tendency", Object.keys(TENDENCY).map((v)=>[v,v]), "平均"))}
        ${field("成長タイプ", select("growth", Object.keys(GROWTH).map((v)=>[v,v]), "平均"))}
        ${field("攻撃タイプ", select("type", [["physical","物理"],["magic","魔術"]], "physical"))}
      </div><div class="fsc-grid fsc-grid-secondary">
        ${field("相性", select("affinity", AFFINITIES.map((v)=>[v,v]), "天"))}
        ${field("方針", select("policy", POLICIES.map((v)=>[v,v]), "秩序"))}
        ${field("性格", select("personality", PERSONALITIES.map((v)=>[v,v]), "善"))}
        ${field("性別", select("gender", GENDERS.map((v)=>[v,v]), "男性"))}
      </div></section>
      <section class="fsc-section"><h3>特性</h3>
        <p class="fsc-help">該当する追加特性を複数選択できます。サーヴァント・人型と、性別・方針・性格・相性・クラス由来の特性は、基本設定から自動入力されます。</p>
        <div class="fsc-trait-groups">${TRAIT_GROUPS.map((group) => `<div class="fsc-trait-group"><h4>${group.label}</h4><div class="fsc-trait-options">${group.traits.map((trait) => `<label class="fsc-trait-option"><input type="checkbox" name="selectedTraits" value="${trait}"${DEFAULT_TRAITS.includes(trait) ? " checked" : ""}>${trait}</label>`).join("")}</div></div>`).join("")}</div>
        <div class="fsc-trait-restrictions" data-trait-restrictions></div>
        <div class="fsc-derived" data-derived-traits></div>
      </section>
      <section class="fsc-section"><h3>コマンドカード・通常攻撃Hit数</h3><div class="fsc-command-rows">
        <div class="fsc-command-row fsc-command-cards">
          ${field("Quick枚数", numberInput("quickCards","",0,1))}${field("Arts枚数", numberInput("artsCards","",1,1))}${field("Buster枚数", numberInput("busterCards","",0,1))}
        </div>
        <div class="fsc-command-row fsc-command-hits">
          ${field("Quick Hit数", numberInput("quickHits","",0,1))}${field("Arts Hit数", numberInput("artsHits","",1,1))}${field("Buster Hit数", numberInput("busterHits","",0,1))}
          ${field("Ex Hit数", numberInput("extraHits","",0,1))}
        </div>
      </div></section>
      <section class="fsc-section"><h3>パラメーター</h3><div class="fsc-grid">
        ${field("筋力", select("strengthRank",rankOptions,"A"))}${field("耐久", select("enduranceRank",rankOptions,"A"))}${field("敏捷", select("agilityRank",rankOptions,"A"))}
        ${field("魔力", select("magicRank",rankOptions,"A"))}${field("幸運", select("luckRank",rankOptions,"A"))}${field("宝具", select("treasureRank",rankOptions,"A"))}
      </div></section>
      <section class="fsc-section"><h3>クラススキル設定</h3>
        <p class="fsc-help">名称・ランクとアイコンファイル名を入力します。必要な数だけ追加し、上下ボタンで並べ替えられます。Lv.／OC表記は効果文へ直接入力します。</p>
        <div data-content-editor="classSkills"></div>
      </section>
      <section class="fsc-section"><h3>保有スキル設定</h3>
        <p class="fsc-help">Skill1～3の通常・強化後と、第二／第三再臨以降の差分を設定します。</p>
        <div data-content-editor="skills"></div>
      </section>
      <section class="fsc-section"><h3>宝具設定</h3>
        <p class="fsc-help">宝具は1枠です。通常の宝具種類・Hit数と、強化後、第二／第三再臨以降の名称・効果・宝具種類・Hit数の差分をまとめて設定します。効果の種類から「宝具攻撃」「特攻攻撃」を選ぶと、カード表記と倍率行を生成できます。</p>
        <div data-content-editor="noble"></div>
      </section>
      <section class="fsc-section"><h3>絆礼装設定</h3>
        <p class="fsc-help">絆礼装は1枠です。礼装名、効果アイコン、効果を設定します。</p>
        <div data-content-editor="bond"></div>
      </section>
      <section class="fsc-section"><h3>N/A補正</h3>
        <div class="fsc-checks">
          <label class="fsc-check"><input type="checkbox" name="manualNormalEnabled">通常攻撃N/Aを手動補正する</label>
          <label class="fsc-check"><input type="checkbox" name="separateNp">通常攻撃と宝具のN/Aを分ける</label>
        </div>
        <div class="fsc-grid fsc-manual">
          ${field("採用する通常攻撃N/A", numberInput("manualNormalNa",0.51,0,0.01))}
          ${field("採用する宝具攻撃N/A", numberInput("manualNpNa",0.12,0,0.01))}
        </div>
      </section>
      <div class="fsc-actions"><button type="button" class="fsc-btn" data-action="calculate">計算・コード反映</button></div>
      <section class="fsc-section"><h3>計算結果</h3><div data-result></div></section>
      <section class="fsc-section"><h3>PukiWikiコードへの反映</h3>
        <p class="fsc-help">既存ページを更新する場合はコードを貼り付けてください。空欄のまま「計算・コード反映」を押すと、添付テンプレートに全項目を反映した新規コードを生成します。</p>
        <div class="fsc-split">
          <div><b>元のコード</b><textarea class="fsc-textarea" name="sourceCode" autocomplete="on" placeholder="ここへ既存のステータス表を貼り付けます"></textarea></div>
          <div><b>反映後のコード</b><textarea class="fsc-textarea" name="outputCode" readonly></textarea></div>
        </div>
        <div data-message></div>
        <div class="fsc-actions">
          <button type="button" class="fsc-btn" data-action="copyAll">反映後コードを一括コピー</button>
          <button type="button" class="fsc-btn sub" data-action="copyHp">HP行をコピー</button>
          <button type="button" class="fsc-btn sub" data-action="copyAtk">ATK行をコピー</button>
          <button type="button" class="fsc-btn sub" data-action="copyNa">N/A・N/D行をコピー</button>
        </div>
      </section>
    </form>`;

    const query = (selector) => root.querySelector(selector);
    const statePrefix = "fgo-status-calculator:v2:";
    let contentState = createDefaultContentSettings();
    let traitRestrictionState = {};

    function renderContentEditors() {
      contentState = normalizeContentSettings(contentState);
      const editors = renderContentSettingsEditors(contentState);
      Object.entries(editors).forEach(([name, html]) => {
        const container = query(`[data-content-editor="${name}"]`);
        if (container) container.innerHTML = html;
      });
    }

    function modelTarget(path) {
      const parts = String(path || "").split(".").filter(Boolean);
      if (!parts.length) return null;
      let target = contentState;
      for (let index = 0; index < parts.length - 1; index += 1) {
        const key = /^\d+$/.test(parts[index]) ? Number(parts[index]) : parts[index];
        if (target[key] === null || typeof target[key] !== "object") target[key] = /^\d+$/.test(parts[index + 1]) ? [] : {};
        target = target[key];
      }
      const last = /^\d+$/.test(parts[parts.length - 1]) ? Number(parts[parts.length - 1]) : parts[parts.length - 1];
      return { target, key: last };
    }

    function setModelValue(path, value) {
      const resolved = modelTarget(path);
      if (resolved) resolved.target[resolved.key] = value;
    }

    function modelValue(path) {
      const parts = String(path || "").split(".").filter(Boolean);
      let target = contentState;
      for (const part of parts) {
        if (target === null || typeof target === "undefined") return undefined;
        target = target[/^\d+$/.test(part) ? Number(part) : part];
      }
      return target;
    }

    function modelList(path) {
      const target = modelValue(path);
      return Array.isArray(target) ? target : null;
    }

    function updateEffectPreviews() {
      root.querySelectorAll("[data-effect-preview-path]").forEach((preview) => {
        preview.innerHTML = effectPreviewBody(modelValue(preview.dataset.effectPreviewPath));
      });
    }

    function selectedTraitValues() {
      return Array.from(root.querySelectorAll('[name="selectedTraits"]:checked')).map((element) => element.value);
    }

    function renderTraitRestrictions() {
      const container = query("[data-trait-restrictions]");
      if (!container) return;
      const selectedTraits = normalizeSelectedTraits(selectedTraitValues());
      if (!selectedTraits.length) {
        container.innerHTML = '<p class="fsc-help">特性を選択すると、再臨段階・霊衣の限定設定がここに表示されます。</p>';
        return;
      }
      const cards = selectedTraits.map((trait) => {
        const item = traitRestrictionValue(traitRestrictionState[trait]);
        const preview = formatRestrictedTrait(trait, item);
        return `<div class="fsc-trait-restriction" data-trait-restriction-card="${escapeHtml(trait)}"><b>${escapeHtml(trait)}</b>
          <div class="fsc-trait-restriction-fields">
            <label class="fsc-field"><span>再臨範囲</span><select data-trait-range="${escapeHtml(trait)}">${optionList(TRAIT_STAGE_OPTIONS, item.range)}</select></label>
            <label class="fsc-field"><span>霊衣名（任意）</span><input type="text" data-trait-costume="${escapeHtml(trait)}" value="${escapeHtml(item.costume)}" autocomplete="on"><small>複数は「・」で区切ります</small></label>
          </div><small class="fsc-trait-restriction-preview" data-trait-restriction-preview="${escapeHtml(trait)}">出力：${escapeHtml(preview)}</small>
        </div>`;
      }).join("");
      container.innerHTML = `<h4>再臨・霊衣限定設定</h4><div class="fsc-trait-restriction-list">${cards}</div>`;
    }

    function updateTraitRestrictionPreview(trait) {
      const preview = root.querySelector(`[data-trait-restriction-preview="${trait}"]`);
      if (preview) preview.textContent = `出力：${formatRestrictedTrait(trait, traitRestrictionState[trait])}`;
    }

    renderContentEditors();
    renderTraitRestrictions();

    const getInput = () => ({
      servantNo: query('[name="servantNo"]').value, trueName: query('[name="trueName"]').value,
      rarity: query('[name="rarity"]').value, classKey: query('[name="classKey"]').value,
      tendency: query('[name="tendency"]').value, growth: query('[name="growth"]').value, type: query('[name="type"]').value,
      affinity: query('[name="affinity"]').value, policy: query('[name="policy"]').value,
      personality: query('[name="personality"]').value, gender: query('[name="gender"]').value,
      quickCards: query('[name="quickCards"]').value, artsCards: query('[name="artsCards"]').value, busterCards: query('[name="busterCards"]').value,
      quickHits: query('[name="quickHits"]').value, artsHits: query('[name="artsHits"]').value, busterHits: query('[name="busterHits"]').value,
      extraHits: query('[name="extraHits"]').value, npHits: contentState.noble.base.npHits, npType: contentState.noble.base.npType,
      strengthRank: query('[name="strengthRank"]').value, enduranceRank: query('[name="enduranceRank"]').value,
      agilityRank: query('[name="agilityRank"]').value, magicRank: query('[name="magicRank"]').value,
      luckRank: query('[name="luckRank"]').value, treasureRank: query('[name="treasureRank"]').value,
      selectedTraits: selectedTraitValues(),
      traitRestrictions: normalizeTraitRestrictions(traitRestrictionState, selectedTraitValues()),
      contentSettings: normalizeContentSettings(contentState),
      manualNormalEnabled: query('[name="manualNormalEnabled"]').checked, manualNormalNa: query('[name="manualNormalNa"]').value,
      separateNp: query('[name="separateNp"]').checked, manualNpNa: query('[name="manualNpNa"]').value
    });

    function saveState() {
      try {
        const state = Object.assign({}, getInput(), { sourceCode: query('[name="sourceCode"]').value });
        window.name = statePrefix + JSON.stringify(state);
      } catch (error) {
        // 保存機能を使用できない環境でも計算機本体は継続して動作させる。
      }
    }

    function restoreState() {
      try {
        if (window.name.indexOf(statePrefix) !== 0) return;
        const state = JSON.parse(window.name.slice(statePrefix.length));
        if (!state || typeof state !== "object") return;
        const storedNobleBase = state.contentSettings && state.contentSettings.noble && state.contentSettings.noble.base;
        contentState = normalizeContentSettings(state.contentSettings);
        if ((!storedNobleBase || !NP_TYPE[storedNobleBase.npType]) && NP_TYPE[state.npType]) {
          contentState.noble.base.npType = state.npType;
        }
        if ((!storedNobleBase || !Object.prototype.hasOwnProperty.call(storedNobleBase, "npHits")) && Object.prototype.hasOwnProperty.call(state, "npHits")) {
          contentState.noble.base.npHits = stringValue(state.npHits);
        }
        traitRestrictionState = normalizeTraitRestrictions(state.traitRestrictions,
          Object.prototype.hasOwnProperty.call(state, "selectedTraits") ? state.selectedTraits : undefined);
        Object.entries(state).forEach(([name, value]) => {
          if (name === "contentSettings" || name === "traitRestrictions") return;
          if (name === "selectedTraits") {
            setSelectedTraits(normalizeSelectedTraits(value));
            return;
          }
          const element = query(`[name="${name}"]`);
          if (!element) return;
          if (element.type === "checkbox") {
            element.checked = Boolean(value);
            return;
          }
          if (element.tagName === "SELECT" && !Array.from(element.options).some((option) => option.value === String(value))) return;
          element.value = value;
        });
        if (!Object.prototype.hasOwnProperty.call(state, "selectedTraits") && state.sourceCode) {
          const sourceTraits = parseSelectedTraitsFromSource(state.sourceCode);
          if (sourceTraits !== null) setSelectedTraits(sourceTraits);
        }
        if (!Object.prototype.hasOwnProperty.call(state, "traitRestrictions") && state.sourceCode) {
          const sourceRestrictions = parseTraitRestrictionsFromSource(state.sourceCode);
          if (sourceRestrictions !== null) traitRestrictionState = sourceRestrictions;
        }
        renderContentEditors();
        renderTraitRestrictions();
      } catch (error) {
        // 保存データを読み込めない場合は初期値で開始する。
      }
    }

    let latest = null;
    function setSelectedTraits(traits) {
      const selected = new Set(normalizeSelectedTraits(traits));
      root.querySelectorAll('[name="selectedTraits"]').forEach((element) => {
        element.checked = selected.has(element.value);
      });
    }

    function syncDisabled() {
      query('[name="manualNormalNa"]').disabled = !query('[name="manualNormalEnabled"]').checked;
      query('[name="manualNpNa"]').disabled = !query('[name="separateNp"]').checked;
    }

    function resultTable(result) {
      const levels = [1].concat(result.rarity.normal, result.rarity.grail);
      const hp = [result.initialHp].concat(result.ascHp, [result.maxHp], result.grailHp);
      const atk = [result.initialAtk].concat(result.ascAtk, [result.maxAtk], result.grailAtk);
      const header = levels.map((level) => `<th>Lv.${level}</th>`).join("");
      const valueCells = (values) => values.map((value) => `<td><button type="button" class="fsc-copy-cell" data-copy="${value}" title="クリックでコピー">${value}</button></td>`).join("");
      const limit = result.rechargeLimit === null ? "対象外" : format(result.rechargeLimit,2);
      const np = result.separateNp ? format(result.finalNpNa,2) : "通常攻撃と共通";
      return `<div class="fsc-scroll"><table class="fsc-result-table"><thead><tr><th>能力値</th>${header}</tr></thead><tbody>
        <tr><th>HP</th>${valueCells(hp)}</tr><tr><th>ATK</th>${valueCells(atk)}</tr></tbody></table></div>
        <div class="fsc-cards">
          <div class="fsc-card"><b>SW</b><strong>${result.sw}</strong></div><div class="fsc-card"><b>SR</b><strong>${format(result.sr,1)}</strong></div>
          <div class="fsc-card"><b>DR</b><strong>${format(result.dr,1)}</strong></div><div class="fsc-card"><b>N/D</b><strong>${format(result.nd,2)}</strong></div>
          <div class="fsc-card"><b>適正N/A</b><strong>${result.properNa === null ? "計算不可" : format(result.properNa,2)}</strong></div>
          <div class="fsc-card"><b>15％以下補正値</b><strong>${limit}</strong></div><div class="fsc-card"><b>採用する通常攻撃N/A</b><strong>${result.finalNormalNa === null ? "計算不可" : format(result.finalNormalNa,2)}</strong></div>
          <div class="fsc-card"><b>採用する宝具攻撃N/A</b><strong>${np}</strong></div>
        </div>${result.warnings.length ? `<div class="fsc-message warn">${result.warnings.map(escapeHtml).join("<br>")}</div>` : ""}`;
    }

    function refresh() {
      syncDisabled();
      const result = calculate(getInput());
      const replaced = replaceSource(query('[name="sourceCode"]').value, result);
      latest = { result, replaced };
      query("[data-result]").innerHTML = resultTable(result);
      query('[name="outputCode"]').value = replaced.text;
      const displayedTraits = parseTraitsFromSource(replaced.text) || [];
      query("[data-derived-traits]").textContent = `入力した特性：${displayedTraits.join(" / ")}`;
      const message = query("[data-message]");
      if (replaced.generatedTemplate) {
        message.className = replaced.missing.length ? "fsc-message warn" : "fsc-message";
        message.textContent = replaced.missing.length
          ? `テンプレートから新規生成しました。見つからなかった項目：${replaced.missing.join("、")}`
          : `テンプレートから新規コードを生成し、${replaced.replaced.length}項目を反映しました。`;
      } else {
        message.className = replaced.missing.length ? "fsc-message warn" : "fsc-message";
        message.textContent = replaced.missing.length
          ? `反映済み：${replaced.replaced.length}項目。見つからなかった項目：${replaced.missing.join("、")}`
          : `計算対象の${replaced.replaced.length}項目を反映しました。`;
      }
      root.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", () => copyText(button.dataset.copy, message)));
    }

    function updateContentControl(control) {
      const path = control && control.dataset ? control.dataset.modelPath : "";
      if (!path) return false;
      setModelValue(path, control.type === "checkbox" ? control.checked : control.value);
      if (control.hasAttribute("data-rerender")) renderContentEditors();
      else updateEffectPreviews();
      return true;
    }

    function updateTraitRestrictionControl(control) {
      const trait = control && control.dataset
        ? (control.dataset.traitRange || control.dataset.traitCostume || "")
        : "";
      if (!EDITABLE_TRAIT_SET.has(trait)) return false;
      const item = traitRestrictionValue(traitRestrictionState[trait]);
      if (control.hasAttribute("data-trait-range")) item.range = control.value;
      if (control.hasAttribute("data-trait-costume")) item.costume = control.value;
      traitRestrictionState[trait] = item;
      updateTraitRestrictionPreview(trait);
      return true;
    }

    root.addEventListener("input", (event) => {
      if (!event.target.matches("[data-model-path]")) return;
      updateContentControl(event.target);
      saveState();
    });

    root.addEventListener("change", (event) => {
      if (!event.target.matches("[data-model-path]")) return;
      updateContentControl(event.target);
      saveState();
      refresh();
    });

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-content-action]");
      if (!button) return;
      const action = button.dataset.contentAction;
      if (action === "addEffect") {
        const list = modelList(button.dataset.listPath);
        if (list) list.push(emptyEffect());
      } else if (action === "removeEffect") {
        const list = modelList(button.dataset.listPath);
        if (list) list.splice(Number(button.dataset.index), 1);
      } else if (action === "moveEffect") {
        const list = modelList(button.dataset.listPath);
        const index = Number(button.dataset.index);
        const destination = index + Number(button.dataset.direction);
        if (list && destination >= 0 && destination < list.length) {
          const moved = list.splice(index, 1)[0];
          list.splice(destination, 0, moved);
        }
      } else if (action === "addClassSkill") {
        contentState.classSkills.push({ name: "", icon: "", effects: [] });
      } else if (action === "removeClassSkill") {
        contentState.classSkills.splice(Number(button.dataset.index), 1);
      } else if (action === "moveClassSkill") {
        const index = Number(button.dataset.index);
        const destination = index + Number(button.dataset.direction);
        if (destination >= 0 && destination < contentState.classSkills.length) {
          const moved = contentState.classSkills.splice(index, 1)[0];
          contentState.classSkills.splice(destination, 0, moved);
        }
      } else if (action === "toggleToken") {
        const resolved = modelTarget(button.dataset.targetPath);
        if (resolved) resolved.target[resolved.key] = toggleEffectNotation(resolved.target[resolved.key], button.dataset.token || "");
      } else if (action === "appendDuration") {
        const row = button.closest(".fsc-effect-row");
        const selectedValue = (kind) => {
          if (!row) return "";
          const custom = row.querySelector(`[data-duration-custom="${kind}"]`);
          return custom ? custom.value : "";
        };
        const token = formatEffectSuffix(button.dataset.durationFormat, selectedValue("count"), selectedValue("turn"));
        const resolved = modelTarget(button.dataset.targetPath);
        if (resolved && token) resolved.target[resolved.key] = insertEffectNotation(resolved.target[resolved.key], token);
      } else if (action === "scrollToEditor") {
        const target = document.getElementById(button.dataset.scrollTarget || "");
        if (target && root.contains(target)) {
          if (target.tagName === "DETAILS") target.open = true;
          const entry = target.closest(".fsc-entry");
          if (entry) entry.open = true;
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      } else return;
      renderContentEditors();
      saveState();
      refresh();
    });

    root.addEventListener("change", (event) => {
      if (event.target.matches("[data-model-path]")) return;
      if (event.target.matches('[name="selectedTraits"]')) {
        renderTraitRestrictions();
        saveState();
        refresh();
        return;
      }
      if (event.target.matches("[data-trait-range],[data-trait-costume]")) {
        updateTraitRestrictionControl(event.target);
        saveState();
        refresh();
        return;
      }
      if (event.target.matches("select,input")) {
        saveState();
        refresh();
      }
    });
    root.addEventListener("input", (event) => {
      if (event.target.matches("[data-model-path]")) return;
      if (event.target.matches("[data-trait-costume]")) {
        updateTraitRestrictionControl(event.target);
        saveState();
        return;
      }
      if (event.target.matches("input")) saveState();
    });
    query('[name="sourceCode"]').addEventListener("input", () => {
      const sourceTraits = parseSelectedTraitsFromSource(query('[name="sourceCode"]').value);
      if (sourceTraits !== null) {
        setSelectedTraits(sourceTraits);
        traitRestrictionState = parseTraitRestrictionsFromSource(query('[name="sourceCode"]').value) || {};
        renderTraitRestrictions();
      }
      saveState();
      refresh();
    });
    query('[data-action="calculate"]').addEventListener("click", () => {
      saveState();
      refresh();
    });

    query('[data-action="copyAll"]').addEventListener("click", () => copyText(query('[name="outputCode"]').value, query("[data-message]")));
    query('[data-action="copyHp"]').addEventListener("click", () => copyText(buildStatusRow(latest.result,"HP"), query("[data-message]")));
    query('[data-action="copyAtk"]').addEventListener("click", () => copyText(buildStatusRow(latest.result,"ATK"), query("[data-message]")));
    query('[data-action="copyNa"]').addEventListener("click", () => copyText(buildNaLine(latest.result), query("[data-message]")));
    restoreState();
    refresh();
    window.addEventListener("pageshow", refresh, { once: true });
  }

  function copyText(text, message) {
    const done = () => { if (message) { message.className = "fsc-message"; message.textContent = "コピーしました。"; } };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(String(text)).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    const area = document.createElement("textarea");
    area.value = String(text); area.style.position = "fixed"; area.style.opacity = "0";
    document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); done();
  }

  function initialize() {
    const root = document.getElementById("fgo-status-calculator");
    if (!root || root.dataset.initialized) return;
    root.dataset.initialized = "true";
    installStyle();
    renderApp(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
