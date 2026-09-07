"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

globalThis.__FGO_STATUS_CALC_TEST__ = true;
require("./FGO_StatusCalculator_atwiki.js");

const core = globalThis.FGOStatusCalculatorCore;

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
assert.match(generated.text, /\/\/─┤クラススキル├/);
assert.match(generated.text, /\/\/─┤絆礼装├/);

const oldSource = templateFile
  .replace(/【ページ名】/g, "旧名")
  .replace("サーヴァント / 人型 /  /  /  /  /  /", "サーヴァント / 人型 / 新選組のサーヴァント / 独自特性 /  / ");
assert.deepEqual(core.parseSelectedTraitsFromSource(oldSource), ["サーヴァント", "人型", "新選組"]);
const updated = core.replaceSource(oldSource, core.calculate(sample({ trueName: "新名", selectedTraits: ["サーヴァント", "人型", "新選組"] })));
assert.equal(updated.generatedTemplate, false);
assert.match(updated.text, /page=新名\/ボイス,text=編集/);
assert.match(updated.text, /サーヴァント \/ 人型 \/ 女性 \/ 混沌 \/ 悪 \/ 地の力 \/ バーサーカー \/ 新選組 \/ 独自特性/);
assert.doesNotMatch(updated.text, /新選組のサーヴァント/);

const omitted = core.replaceSource("", core.calculate(sample({
  classKey: "降",
  affinity: "星",
  personality: "夏",
  gender: "-",
  selectedTraits: ["サーヴァント", "人型", "夏", "星の力", "バニー系", "ワルキューレ"]
})));
const omittedTraitLine = omitted.text.match(/^\|特性\|.*$/m)[0];
assert.match(omittedTraitLine, /サーヴァント \/ 人型 \/ 性別不明 \/ 混沌 \/ 夏 \/ 星の力 \/ ワルキューレ \/ バニー系/);
assert.doesNotMatch(omittedTraitLine, /フォーリナー/);

console.log("All tests passed.");
