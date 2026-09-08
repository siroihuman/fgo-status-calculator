"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

globalThis.__FGO_STATUS_CALC_TEST__ = true;
require("./FGO_StatusCalculator_atwiki.js");

const core = globalThis.FGOStatusCalculatorCore;
const calculatorSource = fs.readFileSync("FGO_StatusCalculator_atwiki.js", "utf8");
const atwikiPageCode = fs.readFileSync("atwiki_page_code.txt", "utf8");
assert.equal(core.VERSION, "1.5.3");
assert.doesNotMatch(calculatorSource, /\bparent(?:Element)?\b/, "atwikiのinclude_js検査で拒否される文字列を含めない");
assert.doesNotMatch(calculatorSource, /#include/, "atwikiのinclude_js検査で拒否されるinclude文字列を含めない");
assert.doesNotMatch(atwikiPageCode, /^#include_js/m, "設置コードではinclude_jsを使用しない");
assert.match(atwikiPageCode, /#javascript\(\)\{\{[\s\S]*<script type="text\/javascript" src="https:\/\/cdn\.jsdelivr\.net\/gh\/siroihuman\/fgo-status-calculator\/v1\.5\.3\/FGO_StatusCalculator_atwiki\.js"><\/script>[\s\S]*\}\}/);
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
assert.doesNotMatch(calculatorSource, /data-duration-select|function durationOptions/);
assert.match(calculatorSource, /data-content-action="scrollToEditor"/);
assert.match(calculatorSource, /fsc-effect-summary/);
assert.match(calculatorSource, /fsc-variant-tab/);
assert.match(calculatorSource, /入力した効果一覧/);
assert.match(calculatorSource, /fsc-entry-tone-/);
assert.match(calculatorSource, /差分の宝具種類/);
assert.match(calculatorSource, /再臨・霊衣限定設定/);
assert.match(calculatorSource, /霊衣名（任意）/);
assert.match(calculatorSource, /noble\.base\.npType/);
assert.match(calculatorSource, /noble\.base\.npHits/);
assert.doesNotMatch(calculatorSource, /select\("npType"|numberInput\("npHits"/);

assert.equal(core.formatEffectSuffix("turn", "", "3"), "(3T)");
assert.equal(core.formatEffectSuffix("count", "2", ""), "(2回)");
assert.equal(core.formatEffectSuffix("both", "5", "10"), "(5回・10T)");
assert.equal(core.formatEffectSuffix("both", "", "3"), "");
assert.equal(core.insertEffectNotation("攻撃<OC:効果UP>[Lv]", "(3T)"), "攻撃[Lv](3T)<OC:効果UP>");
assert.equal(core.insertEffectNotation("攻撃[Lv](3T)<OC:効果UP>", "[Lv:確率]"), "攻撃[Lv:確率](3T)<OC:効果UP>");
assert.equal(core.insertEffectNotation("攻撃[Lv](3T)<OC:効果UP>", "(2回・5T)"), "攻撃[Lv](2回・5T)<OC:効果UP>");
assert.equal(core.toggleEffectNotation("攻撃", "[Lv]"), "攻撃[Lv]", "OFFからONへ切り替える");
assert.equal(core.toggleEffectNotation("攻撃[Lv]", "[Lv]"), "攻撃", "ONからOFFへ切り替える");
assert.equal(core.toggleEffectNotation("攻撃[Lv](3T)", "[Lv:確率]"), "攻撃[Lv:確率](3T)", "同じ分類の表記を置き換える");
assert.equal(core.toggleEffectNotation("攻撃[Lv](3T)<OC:効果UP>", "<OC:効果UP>"), "攻撃[Lv](3T)", "OC表記もOFFへ切り替える");
assert.deepEqual(core.effectTokens("class"), []);
assert.deepEqual(core.effectTokens("skill"), ["[Lv]", "[Lv:確率]"]);
assert.deepEqual(core.effectTokens("noble"), ["[Lv]", "[Lv:確率]", "<OC:効果UP>", "<OC:回数UP>"]);
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
assert.equal(normalizedNobleInputs.bond.includeFieldCondition, true, "旧保存データではフィールド条件を従来どおり含める");
assert.equal(core.normalizeContentSettings({ bond: { includeFieldCondition: false } }).bond.includeFieldCondition, false);
const fixedValueNormalization = core.normalizeContentSettings({
  skills: [{ base: { effects: [{ valueMode: "fixed", values: ["10", "20", "30"] }] } }]
});
assert.deepEqual(fixedValueNormalization.skills[0].base.effects[0].values, ["10"], "固定値へ変更したらLv.2以降を破棄する");
const uiSettings = core.createDefaultContentSettings();
uiSettings.classSkills[0].effects = [{ text: "弱体耐性をアップ", valueMode: "fixed", values: ["20"] }];
uiSettings.skills[0].base.effects = [{ text: "攻撃力をアップ[Lv]", valueMode: "level10", values: ["10"] }];
uiSettings.skills[0].variants[0] = Object.assign(uiSettings.skills[0].variants[0], {
  enabled: true, changeMode: "nameEffect", effects: [{ text: "差分効果", valueMode: "fixed", values: ["20"] }]
});
uiSettings.noble.base.effects = [{ text: "防御力をダウン[Lv](3T)<OC:効果UP>", valueMode: "oc5", values: ["10"] }];
uiSettings.noble.variants[0] = Object.assign(uiSettings.noble.variants[0], {
  enabled: true, changeMode: "nameEffect", effects: [{ text: "差分効果", valueMode: "fixed", values: ["20"] }]
});
const renderedEditors = core.renderContentSettingsEditors(core.normalizeContentSettings(uiSettings));
assert.doesNotMatch(renderedEditors.classSkills, /data-content-action="toggleToken"/);
assert.match(renderedEditors.skills, /data-token="\[Lv\]"/);
assert.match(renderedEditors.skills, /data-token="\[Lv\]" aria-pressed="true">\[Lv\]：ON/);
assert.match(renderedEditors.skills, /data-token="\[Lv:確率\]" aria-pressed="false">\[Lv:確率\]：OFF/);
assert.doesNotMatch(renderedEditors.skills, /OC:効果UP|OC:回数UP/);
assert.match(renderedEditors.noble, /OC:効果UP/);
assert.match(renderedEditors.noble, /data-token="&lt;OC:効果UP&gt;" aria-pressed="true">&lt;OC:効果UP&gt;：ON/);
assert.match(renderedEditors.skills, /<details class="fsc-effect-row/);
assert.match(renderedEditors.skills, /<details class="fsc-variant-tab" id="fsc-editor-skills-0-variants-0" open>/);
assert.match(renderedEditors.skills, /data-scroll-target="fsc-editor-skills-0-variants-0"/);
assert.match(renderedEditors.noble, /data-scroll-target="fsc-editor-noble-variants-0"/);
assert.doesNotMatch(renderedEditors.skills + renderedEditors.noble, /data-duration-select/);
assert.match(renderedEditors.bond, /data-model-path="bond\.includeFieldCondition" checked/);
assert.match(renderedEditors.bond, /「自身がフィールドにいる間、」を含める/);

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
assert.doesNotMatch(generated.text.match(/^\|特性\|.*$/m)[0], / \/ \|$/, "特性欄の末尾へ空の区切りを残さない");
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
assert.doesNotMatch(updated.text.match(/^\|特性\|.*$/m)[0], / \/ \|$/, "既存コードの空欄区切りも除去する");

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

const restrictedTraits = core.replaceSource("", core.calculate(sample({
  selectedTraits: ["超巨大", "炎", "バニー系"],
  traitRestrictions: {
    "超巨大": { range: "3", costume: "" },
    "炎": { range: "12", costume: "" },
    "バニー系": { range: "2", costume: "霊衣名" }
  }
})));
const restrictedTraitLine = restrictedTraits.text.match(/^\|特性\|.*$/m)[0];
assert.match(restrictedTraitLine, /超巨大（第三再臨） \/ 炎（第一・第二再臨） \/ バニー系（第二再臨・霊衣名）/);
assert.deepEqual(core.parseSelectedTraitsFromSource(restrictedTraits.text), ["超巨大", "炎", "バニー系"]);
assert.deepEqual(core.parseTraitRestrictionsFromSource(restrictedTraits.text), {
  "超巨大": { range: "3", costume: "" },
  "炎": { range: "12", costume: "" },
  "バニー系": { range: "2", costume: "霊衣名" }
});
assert.equal(core.formatRestrictedTrait("王", { range: "none", costume: "霊衣名" }), "王（霊衣名）");
assert.equal(core.formatRestrictedTrait("王", { range: "all", costume: "霊衣名" }), "王（全再臨・霊衣名）");
const parentheticalTrait = core.replaceSource("", core.calculate(sample({
  selectedTraits: ["自己回復（魔力）"],
  traitRestrictions: { "自己回復（魔力）": { range: "1", costume: "" } }
}))).text;
assert.match(parentheticalTrait, /自己回復（魔力）（第一再臨）/);
assert.deepEqual(core.parseSelectedTraitsFromSource(parentheticalTrait), ["自己回復（魔力）"]);
assert.deepEqual(core.parseTraitRestrictionsFromSource(parentheticalTrait), { "自己回復（魔力）": { range: "1", costume: "" } });
assert.equal(core.replaceSource(restrictedTraits.text, core.calculate(sample({
  selectedTraits: ["超巨大", "炎", "バニー系"],
  traitRestrictions: core.parseTraitRestrictionsFromSource(restrictedTraits.text)
}))).text, restrictedTraits.text, "限定表記を読み戻して再反映しても維持する");

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
contentSettings.skills[1].base = {
  name: "無窮の武練 A+++", icon: "", ct: "7",
  effects: [{ text: "自身のスター集中度をアップ", valueMode: "fixed", values: ["3000"] }]
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
  includeFieldCondition: true,
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
assert.match(contentGenerated.text, /&font\(b,110%\)\{対魔力 A\}/);
assert.match(contentGenerated.text, /&font\(b,110%\)\{独自能力 EX\}/);
assert.doesNotMatch(contentGenerated.text, /【(?:対魔力 A|独自能力 EX)】/);
assert.match(contentGenerated.text, /&ref\(騎乗\.png,icon\/skill,height=48\)/);
assert.match(contentGenerated.text, /\|~\|特殊な効果\|50\|/);
assert.match(contentGenerated.text, /\*\*\*Skill1：麗しの剣 A/);
assert.match(contentGenerated.text, /#region\(close,第二再臨以降\)\n\*\*\*Skill1：麗しの剣 A\+/);
assert.match(contentGenerated.text, /#region\(close,第二再臨以降\)[\s\S]*\*\*\*Skill1\[強化後\]：麗しの剣 A\+〔強化後〕[\s\S]*#endregion\(\)/);
assert.match(contentGenerated.text, /&ref\(skill-critical-up\.png,icon\/skill,height=48\)/);
assert.match(contentGenerated.text, /#region\(close,第三再臨以降\)[\s\S]*&ref\(skill-damage-up\.png,icon\/skill,height=48\)/);
assert.match(contentGenerated.text, /\*\*\*Skill1\[強化後\]：麗しの剣 EX/);
assert.match(contentGenerated.text, /\*\*\*Skill2：無窮の武練 A\+\+\+[\s\S]*&ref\(無窮の武練\.png,icon\/skill,height=48\)/, "アイコン未入力時はランクを除いたスキル名を使う");
assert.match(contentGenerated.text, /\|~\|7\|＆宝具威力をアップ\|>\|>\|>\|>\|>\|>\|>\|>\|>\|30\|/);
assert.match(contentGenerated.text, /~エクスカリバー&br\(\)約束された勝利の剣/);
assert.match(contentGenerated.text, /\|BGCOLOR\(#F88\):Buster\|A\+\+\|対城宝具\|敵全体に強力な攻撃\[Lv\]\|300\|400\|450\|475\|500\|/);
assert.match(contentGenerated.text, /#region\(close,第三再臨以降\)[\s\S]*~エクスカリバー・モルガン&br\(\)約束された勝利の剣・黒/);
assert.match(contentGenerated.text, /#region\(close,第三再臨以降\)[\s\S]*約束された勝利の剣・黒〔強化後〕[\s\S]*\|BGCOLOR\(#F88\):Buster\|A\+\+\|対城宝具\|敵全体に強力な攻撃\[Lv\]\|>\|>\|>\|>\|600\|[\s\S]*#endregion\(\)/);
assert.match(contentGenerated.text, /約束された勝利の剣〔強化後〕/);
assert.match(contentGenerated.text, /BGCOLOR\(#17184b\):COLOR\(white\):遠き理想郷/);
assert.match(contentGenerated.text, /&font\(,b,#00cc58\)\{アルトリア〔剣〕\}装備時のみ、&br\(\)自身がフィールドにいる間、味方全体のArtsカード性能をアップ\|10\|/);
assert.equal(core.replaceSource(contentGenerated.text, contentResult).text, contentGenerated.text, "生成コードへ再反映しても重複しない");

const bondWithoutFieldSettings = core.createDefaultContentSettings();
bondWithoutFieldSettings.bond = {
  name: "星の記憶", icon: "星の記憶", includeFieldCondition: false,
  effects: [{ text: "味方全体の攻撃力をアップ", valueMode: "fixed", values: ["10"] }]
};
const bondWithoutFieldText = core.replaceSource("", core.calculate(sample({
  trueName: "謎のヒロイン", classKey: "降", contentSettings: bondWithoutFieldSettings
}))).text;
assert.match(bondWithoutFieldText, /&font\(,b,#00cc58\)\{謎のヒロイン〔降〕\}装備時のみ、&br\(\)味方全体の攻撃力をアップ\|10\|/);
assert.doesNotMatch(bondWithoutFieldText, /自身がフィールドにいる間、/);

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

const attackCases = {
  busterSingle: {
    text: "敵単体に超強力な攻撃[Lv] &font(85%,#fff,#e44,b){　Buster(x1.5)　}",
    base: [600, 800, 900, 950, 1000], upgraded: [800, 1000, 1100, 1150, 1200]
  },
  busterAll: {
    text: "敵全体に強力な攻撃[Lv] &font(85%,#fff,#e44,b){　Buster(x1.5)　}",
    base: [300, 400, 450, 475, 500], upgraded: [400, 500, 550, 575, 600]
  },
  artsSingle: {
    text: "敵単体に超強力な攻撃[Lv] &font(85%,#fff,#44e,b){　Arts(x1.0)　}",
    base: [900, 1200, 1350, 1425, 1500], upgraded: [1200, 1500, 1650, 1725, 1800]
  },
  artsAll: {
    text: "敵全体に強力な攻撃[Lv] &font(85%,#fff,#44e,b){　Arts(x1.0)　}",
    base: [450, 600, 675, 712.5, 750], upgraded: [600, 750, 825, 862.5, 900]
  },
  quickSingle: {
    text: "敵単体に超強力な攻撃[Lv] &font(85%,#fff,#4e4,b){　Quick(x0.8)　}",
    base: [1200, 1600, 1800, 1900, 2000], upgraded: [1600, 2000, 2200, 2300, 2400]
  },
  quickAll: {
    text: "敵全体に強力な攻撃[Lv] &font(85%,#fff,#4e4,b){　Quick(x0.8)　}",
    base: [600, 800, 900, 950, 1000], upgraded: [800, 1000, 1100, 1150, 1200]
  }
};
for (const [npType, attackCase] of Object.entries(attackCases)) {
  for (const strength of ["base", "upgraded"]) {
    const settings = core.createDefaultContentSettings();
    settings.noble.base = {
      npType, npHits: "5", reading: "テスト", name: "攻撃宝具", rank: "A", category: "対宝具",
      effects: [{ effectType: "nobleAttack", attackTarget: "auto", attackStrength: strength }]
    };
    const text = core.replaceSource("", core.calculate(sample({ npType, npHits: 5, contentSettings: settings }))).text;
    assert.ok(text.includes(`|${attackCase.text}|${attackCase[strength].join("|")}|`), `${npType}の${strength}倍率を出力する`);
  }
}

const consecutiveAttackSettings = core.createDefaultContentSettings();
consecutiveAttackSettings.noble.base = {
  npType: "busterAll", npHits: "5", reading: "テスト", name: "連続攻撃宝具", rank: "A", category: "対宝具",
  effects: [
    { text: "敵全体の防御力をダウン", valueMode: "fixed", values: ["10"] },
    { effectType: "nobleAttack", attackTarget: "all", attackStrength: "base" },
    { effectType: "nobleAttack", attackTarget: "single", attackStrength: "base" },
    { effectType: "nobleAttack", attackTarget: "single", attackStrength: "upgraded" },
    { text: "味方全体の攻撃力をアップ", valueMode: "fixed", values: ["10"] },
    { effectType: "nobleAttack", attackTarget: "single", attackStrength: "base" }
  ]
};
const consecutiveAttackText = core.replaceSource("", core.calculate(sample({
  npType: "busterAll", npHits: 5, contentSettings: consecutiveAttackSettings
}))).text;
const busterLabel = "&font(85%,#fff,#e44,b){　Buster(x1.5)　}";
assert.ok(consecutiveAttackText.includes(`|~|~|~|＆強力な攻撃[Lv] ${busterLabel}|300|400|450|475|500|`), "直前の通常効果と全体対象が同じなら対象を省略する");
assert.ok(consecutiveAttackText.includes(`|~|~|~|＆超強力な攻撃[Lv] ${busterLabel}|800|1000|1100|1150|1200|`), "直前の宝具攻撃と単体対象が同じなら対象を省略する");
assert.equal((consecutiveAttackText.match(/敵単体に超強力な攻撃\[Lv\]/g) || []).length, 2, "対象が異なる直後と対象不明の直後は単体対象を省略しない");

const specialAttackSettings = core.createDefaultContentSettings();
specialAttackSettings.noble.base = {
  npType: "artsAll", npHits: "5", reading: "テスト", name: "特攻宝具", rank: "A", category: "対宝具",
  effects: [
    { effectType: "nobleAttack", attackTarget: "auto", attackStrength: "base" },
    { effectType: "specialAttack", specialTarget: "サーヴァント", valueMode: "oc5", values: ["150", "162.5", "175", "187.5", "200"] },
    { effectType: "specialAttack", specialTarget: "サーヴァント", valueMode: "np5", values: ["150", "162.5", "175", "187.5", "200"] },
    { effectType: "specialAttack", specialTarget: "サーヴァント", valueMode: "fixed", values: ["150"] }
  ]
};
const specialAttackGenerated = core.replaceSource("", core.calculate(sample({
  npType: "artsAll", npHits: 5, contentSettings: specialAttackSettings
}))).text;
const artsSpecialLabel = "&font(85%,#fff,#44e,b){　Arts(x1.0)　}";
assert.ok(specialAttackGenerated.includes(`|~|~|~|＆〔サーヴァント〕特攻<OC:特攻威力UP> ${artsSpecialLabel}|150|162.5|175|187.5|200|`));
assert.ok(specialAttackGenerated.includes(`|~|~|~|＆〔サーヴァント〕特攻[Lv] ${artsSpecialLabel}|150|162.5|175|187.5|200|`));
assert.ok(specialAttackGenerated.includes(`|~|~|~|＆〔サーヴァント〕特攻 ${artsSpecialLabel}|>|>|>|>|150|`));

console.log("All tests passed.");
