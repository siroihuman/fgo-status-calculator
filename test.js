"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

globalThis.__FGO_STATUS_CALC_TEST__ = true;
require("./FGO_StatusCalculator_atwiki.js");

const core = globalThis.FGOStatusCalculatorCore;
const calculatorSource = fs.readFileSync("FGO_StatusCalculator_atwiki.js", "utf8");
assert.equal(core.VERSION, "1.4.1");
assert.match(calculatorSource, /\{ label: "基本", traits: \["ギリシャ神話系男性"\] \}/);
assert.doesNotMatch(calculatorSource, /label: "追加属性"/);
assert.match(calculatorSource, /入力した特性：/);
assert.doesNotMatch(calculatorSource, /基本設定から自動入力：|例：/);
assert.match(calculatorSource, /data-content-action="addClassSkill"/);
assert.doesNotMatch(calculatorSource, /addOwnedSkill|addNoble|addBond|第四再臨/);
assert.match(calculatorSource, /効果を追加/);
assert.match(calculatorSource, /特殊記述を使用/);
assert.match(calculatorSource, /この再臨差分の強化後を使用/);
assert.match(calculatorSource, /data-content-action="appendDuration"/);
assert.match(calculatorSource, /自由入力/);
assert.match(calculatorSource, /入力した効果一覧/);
assert.match(calculatorSource, /fsc-entry-tone-/);
assert.match(calculatorSource, /差分の宝具種類/);
assert.match(calculatorSource, /noble\.base\.npType/);
assert.match(calculatorSource, /noble\.base\.npHits/);
assert.doesNotMatch(calculatorSource, /select\("npType"|numberInput\("npHits"/);

assert.equal(core.formatEffectSuffix("turn", "", "3"), "(3T)");
assert.equal(core.formatEffectSuffix("count", "2", ""), "(2回)");
assert.equal(core.formatEffectSuffix("both", "5", "10"), "(5回・10T)");
assert.equal(core.formatEffectSuffix("both", "", "3"), "");
const normalizedNobleInputs = core.normalizeContentSettings({
  noble: {
    base: { npType: "quickAll", npHits: "9" },
    variants: [{ enabled: true, stage: "2", npType: "busterSingle", npHits: "7" }]
  }
});
assert.equal(normalizedNobleInputs.noble.base.npType, "quickAll");
assert.equal(normalizedNobleInputs.noble.base.npHits, "9");
assert.equal(normalizedNobleInputs.noble.variants[0].npType, "busterSingle");
assert.equal(normalizedNobleInputs.noble.variants[0].npHits, "7");

function sample(overrides) {
  return Object.assign({
    servantNo: "068",
    trueName: "ヘリオガバルス",
    rarity: 4,
    classKey: "狂",
    tendency: "ATK寄り",
    growth: "凹型",
    type: "magic",
    affinity: "地",
    policy: "混沌",
    personality: "悪",
    gender: "女性",
    selectedTraits: ["サーヴァント", "人型", "神性", "蛇", "梁山泊", "複数で一騎"],
    quickCards: 1,
    artsCards: 2,
    busterCards: 2,
    quickHits: 3,
    artsHits: 3,
    busterHits: 4,
    extraHits: 5,
    npHits: 6,
    npType: "busterAll",
    strengthRank: "C",
    enduranceRank: "B",
    agilityRank: "A",
    magicRank: "A+",
    luckRank: "D",
    treasureRank: "EX",
    manualNormalEnabled: false,
    manualNormalNa: 0.51,
    separateNp: false,
    manualNpNa: 0.12
  }, overrides || {});
}

const templateFile = fs.readFileSync("servant_template.txt", "utf8").trim();
assert.equal(core.SERVANT_TEMPLATE, templateFile, "埋め込みテンプレートが添付テンプレートと一致する");
assert.doesNotMatch(templateFile, /#include_cache\(〔〕特性\)/, "更新版テンプレートへ置換されている");

const generated = core.replaceSource("", core.calculate(sample()));
assert.equal(generated.generatedTemplate, true);
assert.deepEqual(generated.missing, []);
assert.match(generated.text, /^\*No\.068$/m);
assert.match(generated.text, /COLOR\(white\):No\.068\|$/m);
assert.match(generated.text, /\[\[ヘリオガバルス>ヘリオガバルス\/データ\]\]/);
assert.match(generated.text, /page=ヘリオガバルス\/ボイス,text=編集/);
assert.match(generated.text, /#include_cache\(ヘリオガバルス\/ボイス\)/);
assert.match(generated.text, /page=ヘリオガバルス\/モーション,text=編集/);
assert.match(generated.text, /#include_cache\(ヘリオガバルス\/モーション\)/);
assert.doesNotMatch(generated.text, /【ページ名】/);
assert.match(generated.text, /^\|特性\|.*サーヴァント \/ 人型 \/ 女性 \/ 混沌 \/ 悪 \/ 地の力 \/ バーサーカー \/ 神性 \/ 蛇 \/ 梁山泊 \/ 複数で一騎/m);
assert.deepEqual(core.parseTraitsFromSource(generated.text), ["サーヴァント", "人型", "女性", "混沌", "悪", "地の力", "バーサーカー", "神性", "蛇", "梁山泊", "複数で一騎"]);
assert.match(generated.text, /\/\/─┤クラススキル├/);
assert.match(generated.text, /\/\/─┤絆礼装├/);
assert.match(generated.text, /^\|~\|3\|3\|4\|5\|BGCOLOR\(#F88\):6\|DR&footnote/m);

const oldSource = templateFile
  .replace(/【ページ名】/g, "旧名")
  .replace("サーヴァント / 人型 /  /  /  /  /  /", "サーヴァント / 人型 / 新選組のサーヴァント / 独自特性 /  / ");
assert.deepEqual(core.parseSelectedTraitsFromSource(oldSource), ["新選組"]);
const updated = core.replaceSource(oldSource, core.calculate(sample({ trueName: "新名", selectedTraits: ["サーヴァント", "人型", "新選組"] })));
assert.equal(updated.generatedTemplate, false);
assert.match(updated.text, /page=新名\/ボイス,text=編集/);
assert.match(updated.text, /サーヴァント \/ 人型 \/ 女性 \/ 混沌 \/ 悪 \/ 地の力 \/ バーサーカー \/ 新選組 \/ 独自特性/);
assert.doesNotMatch(updated.text, /新選組のサーヴァント/);

const specialTraits = core.replaceSource("", core.calculate(sample({
  classKey: "降",
  affinity: "星",
  personality: "夏",
  gender: "-",
  selectedTraits: ["夏", "星の力", "バニー系", "ワルキューレ"]
})));
const specialTraitLine = specialTraits.text.match(/^\|特性\|.*$/m)[0];
assert.match(specialTraitLine, /サーヴァント \/ 人型 \/ 性別不明 \/ 混沌 \/ 夏 \/ 星の力 \/ ワルキューレ \/ バニー系/);
assert.doesNotMatch(specialTraitLine, /フォーリナー/);

for (const personality of ["狂", "星", "夏", "花嫁"]) {
  const traitLine = core.replaceSource("", core.calculate(sample({ personality }))).text.match(/^\|特性\|.*$/m)[0];
  assert.ok(traitLine.includes(` / ${personality} / `), `性格「${personality}」を特性欄へ追加する`);
}

const contentSettings = core.createDefaultContentSettings();
contentSettings.classSkills = [
  { name: "対魔力 A", icon: "対魔力.png", effects: [{ text: "自身の弱体耐性をアップ", valueMode: "fixed", values: ["20"] }] },
  { name: "騎乗 B", icon: "騎乗", effects: [{ text: "自身のQuickカード性能をアップ", valueMode: "fixed", values: ["8"] }] },
  { name: "神性 A+", icon: "神性.png", effects: [{ text: "自身に与ダメージプラス状態を付与", valueMode: "fixed", values: ["210"] }] },
  { name: "陣地作成 A", icon: "陣地作成.png", effects: [] },
  { name: "独自能力 EX", icon: "独自能力.png", effects: [{ raw: true, rawCode: "|~|特殊な効果|50|" }] }
];
contentSettings.skills[0].base = {
  name: "麗しの剣 A", icon: "skill-attack-up.png", ct: "8",
  effects: [{ text: "自身の攻撃力をアップ[Lv](3T)", valueMode: "level10", values: ["10", "11", "12", "13", "14", "15", "16", "17", "18", "20"] }]
};
contentSettings.skills[0].variants[0] = {
  enabled: true, stage: "2", changeMode: "name", name: "麗しの剣 A+", icon: "", ct: "", effects: [],
  upgraded: {
    enabled: true, name: "麗しの剣 A+〔強化後〕", icon: "skill-critical-up.png", ct: "7",
    effects: [{ text: "自身のクリティカル威力をアップ", valueMode: "fixed", values: ["30"] }]
  }
};
contentSettings.skills[0].variants[1] = {
  enabled: true, stage: "3", changeMode: "all", name: "真なる麗しの剣 A++", icon: "skill-damage-up.png", ct: "7",
  effects: [{ prefix: "＆", text: "宝具威力をアップ", valueMode: "fixed", values: ["30"] }]
};
contentSettings.skills[0].upgraded = {
  enabled: true, name: "麗しの剣 EX", icon: "skill-np-charge.png", ct: "6",
  effects: [{ text: "自身のNPを増やす[Lv]", valueMode: "level10", values: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "30"] }]
};
contentSettings.noble.base = {
  reading: "エクスカリバー", name: "約束された勝利の剣", rank: "A++", category: "対城宝具",
  effects: [
    { text: "敵全体に強力な攻撃[Lv]", valueMode: "np5", values: ["300", "400", "450", "475", "500"] },
    { prefix: "＆", text: "防御力をダウン<OC:効果UP>(3T)", valueMode: "oc5", values: ["10", "15", "20", "25", "30"] }
  ]
};
contentSettings.noble.variants[1] = {
  enabled: true, stage: "3", changeMode: "name", reading: "エクスカリバー・モルガン", name: "約束された勝利の剣・黒", rank: "", category: "", effects: [],
  upgraded: {
    enabled: true, reading: "エクスカリバー・モルガン", name: "約束された勝利の剣・黒〔強化後〕", rank: "A++", category: "対城宝具",
    effects: [{ text: "敵全体に強力な攻撃[Lv]", valueMode: "fixed", values: ["600"] }]
  }
};
contentSettings.noble.upgraded = {
  enabled: true, reading: "エクスカリバー", name: "約束された勝利の剣〔強化後〕", rank: "A++", category: "対城宝具",
  effects: [{ text: "敵全体に強力な攻撃[Lv]", valueMode: "fixed", values: ["500"] }]
};
contentSettings.bond = {
  name: "遠き理想郷", icon: "skill-card-arts-up.png",
  effects: [
    { text: "味方全体のArtsカード性能をアップ", valueMode: "fixed", values: ["10"] },
    { prefix: "＆", text: "宝具威力をアップ", valueMode: "fixed", values: ["10"] }
  ]
};

const contentResult = core.calculate(sample({
  servantNo: "001", trueName: "アルトリア", classKey: "剣", rarity: 5,
  npType: "busterAll", contentSettings
}));
const contentGenerated = core.replaceSource("", contentResult);
assert.deepEqual(contentGenerated.missing, []);
assert.match(contentGenerated.text, /【対魔力 A】/);
assert.match(contentGenerated.text, /【独自能力 EX】/);
assert.match(contentGenerated.text, /&ref\(騎乗\.png,icon\/skill,height=48\)/);
assert.match(contentGenerated.text, /\|~\|特殊な効果\|50\|/);
assert.match(contentGenerated.text, /\*\*\*Skill1：麗しの剣 A/);
assert.match(contentGenerated.text, /#region\(close,第二再臨以降\)\n\*\*\*Skill1：麗しの剣 A\+/);
assert.match(contentGenerated.text, /#region\(close,第二再臨以降\)[\s\S]*\*\*\*Skill1\[強化後\]：麗しの剣 A\+〔強化後〕[\s\S]*#endregion\(\)/);
assert.match(contentGenerated.text, /&ref\(skill-critical-up\.png,icon\/skill,height=48\)/);
assert.match(contentGenerated.text, /#region\(close,第三再臨以降\)[\s\S]*&ref\(skill-damage-up\.png,icon\/skill,height=48\)/);
assert.match(contentGenerated.text, /\*\*\*Skill1\[強化後\]：麗しの剣 EX/);
assert.match(contentGenerated.text, /\|~\|7\|＆宝具威力をアップ\|>\|>\|>\|>\|>\|>\|>\|>\|>\|30\|/);
assert.match(contentGenerated.text, /~エクスカリバー&br\(\)約束された勝利の剣/);
assert.match(contentGenerated.text, /\|BGCOLOR\(#F88\):Buster\|A\+\+\|対城宝具\|敵全体に強力な攻撃\[Lv\]\|300\|400\|450\|475\|500\|/);
assert.match(contentGenerated.text, /#region\(close,第三再臨以降\)[\s\S]*~エクスカリバー・モルガン&br\(\)約束された勝利の剣・黒/);
assert.match(contentGenerated.text, /#region\(close,第三再臨以降\)[\s\S]*約束された勝利の剣・黒〔強化後〕[\s\S]*\|BGCOLOR\(#F88\):Buster\|A\+\+\|対城宝具\|敵全体に強力な攻撃\[Lv\]\|>\|>\|>\|>\|600\|[\s\S]*#endregion\(\)/);
assert.match(contentGenerated.text, /約束された勝利の剣〔強化後〕/);
assert.match(contentGenerated.text, /BGCOLOR\(#17184b\):COLOR\(white\):遠き理想郷/);
assert.match(contentGenerated.text, /&font\(,b,#00cc58\)\{アルトリア\}装備時のみ、&br\(\)自身がフィールドにいる間、味方全体のArtsカード性能をアップ\|10\|/);
assert.equal(core.replaceSource(contentGenerated.text, contentResult).text, contentGenerated.text, "生成コードへ再反映しても重複しない");

const nobleColorSettings = core.createDefaultContentSettings();
nobleColorSettings.noble.base = {
  reading: "アルス・ノヴァ", name: "訣別の時きたれり、其は世界を手放すもの", rank: "D", category: "対人宝具", effects: [],
  npType: "artsSupport", npHits: "0"
};
nobleColorSettings.noble.variants[0] = {
  enabled: true, stage: "2", changeMode: "name", npType: "busterAll", npHits: "8",
  reading: "アルス・アルマデル・サロモニス", name: "誕生の時きたれり、其は全てを修めるもの",
  rank: "", category: "", effects: []
};
const nobleColorResult = core.calculate(sample({
  npType: undefined, npHits: undefined, quickHits: 4, artsHits: 4, busterHits: 4, extraHits: 5,
  affinity: "人", contentSettings: nobleColorSettings
}));
const nobleColorGenerated = core.replaceSource("", nobleColorResult).text;
assert.match(nobleColorGenerated, /^\|BGCOLOR\(#e6e6fa\):相性\|人\|.*\|宝具\|BGCOLOR\(#9AF\):補助Ａ\|\n\|~\|~\|~\|~\|~\|~\|~\|BGCOLOR\(#F88\):全体Ｂ\|$/m);
assert.match(nobleColorGenerated, /#region\(close,第二再臨以降\)[\s\S]*\|BGCOLOR\(#F88\):Buster\|D\|対人宝具\|/);
assert.match(nobleColorGenerated, /^\|~\|4\|4\|4\|5\|BGCOLOR\(#9AF\):0\|DR&footnote[^\n]*\n\|~\|~\|~\|~\|~\|BGCOLOR\(#F88\):8\|~\|~\|$/m);
assert.doesNotMatch(nobleColorGenerated, /補助Ａ／全体Ｂ/);
assert.equal(core.replaceSource(nobleColorGenerated, nobleColorResult).text, nobleColorGenerated, "差分宝具種類を再反映しても維持する");

console.log("All tests passed.");
