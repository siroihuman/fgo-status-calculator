(function () {
  "use strict";

  const VERSION = "1.1.2";

  const RARITY = {
    1: { base: 1, label: "C", initHp: 1500, maxHp: 7500, initAtk: 1000, maxAtk: 5500, normal: [20, 30, 40, 50, 60], grail: [70, 80, 90, 100, 120] },
    2: { base: 2, label: "UC", initHp: 1600, maxHp: 8500, initAtk: 1100, maxAtk: 6200, normal: [25, 35, 45, 55, 65], grail: [70, 80, 90, 100, 120] },
    3: { base: 3, label: "R", initHp: 1800, maxHp: 10000, initAtk: 1300, maxAtk: 7000, normal: [30, 40, 50, 60, 70], grail: [80, 90, 100, 120] },
    4: { base: 4, label: "SR", initHp: 2000, maxHp: 12500, initAtk: 1500, maxAtk: 9000, normal: [40, 50, 60, 70, 80], grail: [90, 100, 120] },
    5: { base: 5, label: "SSR", initHp: 2200, maxHp: 15000, initAtk: 1700, maxAtk: 11000, normal: [50, 60, 70, 80, 90], grail: [100, 120] }
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
    none: { label: "対象外（Buster・補助宝具）", factor: null, targets: null },
    artsSingle: { label: "Arts単体", factor: 3, targets: 1 },
    artsAll: { label: "Arts全体", factor: 3, targets: 3 },
    quickSingle: { label: "Quick単体", factor: 1, targets: 1 },
    quickAll: { label: "Quick全体", factor: 1, targets: 3 }
  };

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

  function format(value, digits) {
    return Number(value).toFixed(digits);
  }

  function calculate(raw) {
    const requestedRarity = numberOr(raw.rarity, 1);
    const baseRarity = requestedRarity === 0 ? 2 : requestedRarity;
    const rarity = RARITY[baseRarity];
    const classData = CLASS[raw.classKey] || CLASS["剣"];
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
    const npHits = optionalNumber(raw.npHits);
    const type = raw.type === "magic" ? "magic" : "physical";

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
    const npType = NP_TYPE[raw.npType] || NP_TYPE.none;
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
      classKey: raw.classKey || "剣",
      tendency: raw.tendency || "平均",
      growth: growthName,
      type,
      quickCards: qCards,
      artsCards,
      busterCards: bCards,
      quickHits,
      artsHits,
      busterHits,
      extraHits,
      npHits,
      treasureRank: raw.treasureRank || "-"
    });

    return {
      version: VERSION,
      input,
      rarity,
      classData,
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
    if (result.separateNp) {
      const np = result.finalNpNa === null ? "計算不可" : format(result.finalNpNa, 2);
      const normalNote = result.properNa !== null && result.finalNormalNa !== result.properNa
        ? `通常攻撃時。適正値：${proper}`
        : "通常攻撃時";
      return `${normal}&footnote(${normalNote})&br()${np}&footnote(宝具攻撃時)`;
    }
    if (result.properNa !== null && result.finalNormalNa !== result.properNa) {
      return `${normal}&footnote(適正値：${proper})`;
    }
    return normal;
  }

  function buildNaLine(result) {
    return `|N/A&footnote(攻撃時のNP上昇基礎値)|>|>|>|>|${buildNaCell(result)}|N/D&footnote(攻撃を受けた際のNP上昇基礎値)|${format(result.nd, 2)}|`;
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

  function replaceSource(source, result) {
    let text = String(source || "").replace(/\r\n?/g, "\n");
    const report = { replaced: [], missing: [] };
    if (!text.trim()) {
      return { text: buildComputedSnippet(result), replaced: [], missing: ["既存コード（未入力）"] };
    }

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
      [/((?:^|\n)\|>\|>\|BGCOLOR\(#e6e6fa\):Class\|>\|>\|)[^|\n]*/m, `$1${result.classData.name}`, "クラス"],
      [/(\|>\|BGCOLOR\(#e6e6fa\):Rare\|)[^|\n]*/m, `$1${result.input.rarity}`, "レアリティ"],
      [/(\|>\|BGCOLOR\(#e6e6fa\):傾向\|>\|)[^|\n]*/m, `$1${result.input.tendency}`, "ステータス傾向"],
      [/(\|BGCOLOR\(#e6e6fa\):タイプ\|)[^|\n]*/m, `$1${result.input.type === "physical" ? "物理" : "魔術"}`, "タイプ"]
    ];
    metaPatterns.forEach(([pattern, replacement, label]) => {
      text = replaceLine(text, pattern, replacement, label, report);
    });

    text = replaceLine(text,
      /^\|BGCOLOR\(#e6e6fa\):成長\|.*\|スター発生率\|[^|\n]*\|$/m,
      (line) => {
        const cells = line.split("|");
        cells[2] = result.input.growth;
        cells[cells.length - 2] = format(result.sr, 1);
        return cells.join("|");
      }, "成長・スター発生率", report);
    text = replaceLine(text,
      /^\|ヒット数\|.*\|スター集中度\|[^|\n]*\|$/m,
      (line) => replaceLastCell(line, result.sw), "スター集中度", report);
    text = replaceLine(text,
      /^\|~\|.*\|DR&footnote\([^\n]*\)\|[^|\n]*\|$/m,
      (line) => {
        const cells = line.split("|");
        cells[2] = result.input.quickHits === null ? "" : String(result.input.quickHits);
        cells[3] = result.input.artsHits === null ? "" : String(result.input.artsHits);
        cells[4] = result.input.busterHits === null ? "" : String(result.input.busterHits);
        cells[5] = result.input.extraHits === null ? "" : String(result.input.extraHits);
        cells[6] = result.input.npHits === null ? "" : String(result.input.npHits);
        cells[cells.length - 2] = format(result.dr, 1);
        return cells.join("|");
      }, "Hit数・DR", report);
    text = replaceLine(text,
      /^\|N\/A&footnote\([^\n]*\)\|.*\|N\/D&footnote\([^\n]*\)\|[^|\n]*\|$/m,
      buildNaLine(result), "N/A・N/D", report);

    text = replaceLine(text, /^\|\s*筋力\s*\|[^\n]*\|\s*耐久\s*\|[^\n]*$/m,
      buildParameterRow("筋力", result.input.strengthRank, " ", "耐久", result.input.enduranceRank), "筋力・耐久パラメーター", report);
    text = replaceLine(text, /^\|\s*敏捷\s*\|[^\n]*\|\s*魔力\s*\|[^\n]*$/m,
      buildParameterRow("敏捷", result.input.agilityRank, "~", "魔力", result.input.magicRank), "敏捷・魔力パラメーター", report);
    text = replaceLine(text, /^\|\s*幸運\s*\|[^\n]*\|\s*宝具\s*\|[^\n]*$/m,
      buildParameterRow("幸運", result.input.luckRank, "~", "宝具", result.input.treasureRank), "幸運・宝具パラメーター", report);

    return { text, replaced: report.replaced, missing: report.missing };
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

  const core = { VERSION, calculate, replaceSource, buildColumnStyle, buildHeaderLine, buildStatusRow, buildNaLine, buildParameterRow };
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

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
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
      .fsc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:10px}
      .fsc-command-rows{display:flex;flex-direction:column;gap:10px}.fsc-command-row{display:grid;gap:10px}
      .fsc-command-cards{grid-template-columns:repeat(4,minmax(120px,1fr))}.fsc-command-hits{grid-template-columns:repeat(5,minmax(110px,1fr))}
      .fsc-field{display:flex;flex-direction:column;gap:4px;font-weight:600;font-size:13px}
      .fsc-field small{font-weight:400;color:#64748b}.fsc-field select,.fsc-field input,.fsc-textarea{width:100%;border:1px solid #aebfd0;border-radius:6px;background:#fff;padding:8px;font:inherit;color:#111827}
      .fsc-checks{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.fsc-check{display:flex;gap:7px;align-items:center;font-weight:600}
      .fsc-check input{width:17px;height:17px}.fsc-manual{margin-top:10px}
      .fsc-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.fsc-btn{border:1px solid #35698f;border-radius:7px;background:#477fad;color:#fff;padding:8px 13px;font-weight:700;cursor:pointer}
      .fsc-btn:hover{background:#35698f}.fsc-btn.sub{background:#fff;color:#35698f}.fsc-btn.sub:hover{background:#e8f1f8}
      .fsc-result-table{border-collapse:collapse;width:100%;min-width:620px}.fsc-scroll{overflow-x:auto}
      .fsc-result-table th,.fsc-result-table td{border:1px solid #c7d5e2;padding:6px;text-align:center;white-space:nowrap}.fsc-result-table th{background:#e7eff7}
      .fsc-copy-cell{border:0;background:transparent;color:#075985;font-weight:700;cursor:pointer;padding:3px 6px;border-radius:4px}.fsc-copy-cell:hover{background:#dff3ff}
      .fsc-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px}.fsc-card{background:#edf5fb;border:1px solid #c1d6e7;border-radius:7px;padding:9px}.fsc-card b{display:block;font-size:12px;color:#526579}.fsc-card strong{font-size:18px}
      .fsc-textarea{min-height:230px;resize:vertical;font-family:Consolas,"BIZ UDGothic",monospace;font-size:12px;line-height:1.45}
      .fsc-message{padding:9px;border-radius:6px;margin:8px 0;background:#edf7ed;color:#245c2a}.fsc-message.warn{background:#fff4d6;color:#7a4d00}
      .fsc-help{font-size:12px;color:#64748b;margin:6px 0}.fsc-split{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      @media(max-width:700px){.fsc-shell{padding:10px}.fsc-split{grid-template-columns:1fr}.fsc-section{padding:10px}.fsc-command-cards,.fsc-command-hits{grid-template-columns:repeat(2,minmax(120px,1fr))} }
    `;
    document.head.appendChild(style);
  }

  function renderApp(root) {
    const rankOptions = Object.keys(RANK).map((rank) => [rank, rank]);
    const classOptions = Object.entries(CLASS).map(([key, value]) => [key, `${key}：${value.name}`]);
    root.innerHTML = `<form class="fsc-shell" autocomplete="on">
      <h2 class="fsc-title">FGO ステータス自動計算機</h2>
      <p class="fsc-lead">入力内容からステータスを計算し、既存のPukiWikiコードへ計算セルだけを反映します。同じタブでページを再読み込みした場合は入力内容を復元します。</p>
      <section class="fsc-section"><h3>基本設定</h3><div class="fsc-grid">
        ${field("レアリティ", select("rarity", [[0,"★0"],[1,"★1"],[2,"★2"],[3,"★3"],[4,"★4"],[5,"★5"]], 5))}
        ${field("クラス", select("classKey", classOptions, "剣"))}
        ${field("ステータス傾向", select("tendency", Object.keys(TENDENCY).map((v)=>[v,v]), "平均"))}
        ${field("成長タイプ", select("growth", Object.keys(GROWTH).map((v)=>[v,v]), "平均"))}
        ${field("攻撃タイプ", select("type", [["physical","物理"],["magic","魔術"]], "physical"))}
      </div></section>
      <section class="fsc-section"><h3>コマンドカード・Hit数</h3><div class="fsc-command-rows">
        <div class="fsc-command-row fsc-command-cards">
          ${field("Quick枚数", numberInput("quickCards","",0,1))}${field("Arts枚数", numberInput("artsCards","",1,1))}${field("Buster枚数", numberInput("busterCards","",0,1))}
          ${field("宝具の種類", select("npType", Object.entries(NP_TYPE).map(([k,v])=>[k,v.label]), "artsAll"), "15％以下補正値の計算に使用")}
        </div>
        <div class="fsc-command-row fsc-command-hits">
          ${field("Quick Hit数", numberInput("quickHits","",0,1))}${field("Arts Hit数", numberInput("artsHits","",1,1))}${field("Buster Hit数", numberInput("busterHits","",0,1))}
          ${field("Ex Hit数", numberInput("extraHits","",0,1))}${field("宝具 Hit数", numberInput("npHits","",0,1))}
        </div>
      </div></section>
      <section class="fsc-section"><h3>パラメーター</h3><div class="fsc-grid">
        ${field("筋力", select("strengthRank",rankOptions,"A"))}${field("耐久", select("enduranceRank",rankOptions,"A"))}${field("敏捷", select("agilityRank",rankOptions,"A"))}
        ${field("魔力", select("magicRank",rankOptions,"A"))}${field("幸運", select("luckRank",rankOptions,"A"))}${field("宝具", select("treasureRank",rankOptions,"A"))}
      </div></section>
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
        <p class="fsc-help">サーヴァント編集ページのコードを貼り付けてください。名前・属性・特性などは残し、計算対象の行だけを書き換えます。</p>
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
    const getInput = () => ({
      rarity: query('[name="rarity"]').value, classKey: query('[name="classKey"]').value,
      tendency: query('[name="tendency"]').value, growth: query('[name="growth"]').value, type: query('[name="type"]').value,
      quickCards: query('[name="quickCards"]').value, artsCards: query('[name="artsCards"]').value, busterCards: query('[name="busterCards"]').value,
      quickHits: query('[name="quickHits"]').value, artsHits: query('[name="artsHits"]').value, busterHits: query('[name="busterHits"]').value,
      extraHits: query('[name="extraHits"]').value, npHits: query('[name="npHits"]').value, npType: query('[name="npType"]').value,
      strengthRank: query('[name="strengthRank"]').value, enduranceRank: query('[name="enduranceRank"]').value,
      agilityRank: query('[name="agilityRank"]').value, magicRank: query('[name="magicRank"]').value,
      luckRank: query('[name="luckRank"]').value, treasureRank: query('[name="treasureRank"]').value,
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
        Object.entries(state).forEach(([name, value]) => {
          const element = query(`[name="${name}"]`);
          if (!element) return;
          if (element.type === "checkbox") {
            element.checked = Boolean(value);
            return;
          }
          if (element.tagName === "SELECT" && !Array.from(element.options).some((option) => option.value === String(value))) return;
          element.value = value;
        });
      } catch (error) {
        // 保存データを読み込めない場合は初期値で開始する。
      }
    }

    let latest = null;
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
      const message = query("[data-message]");
      if (query('[name="sourceCode"]').value.trim()) {
        message.className = replaced.missing.length ? "fsc-message warn" : "fsc-message";
        message.textContent = replaced.missing.length
          ? `反映済み：${replaced.replaced.length}項目。見つからなかった項目：${replaced.missing.join("、")}`
          : `計算対象の${replaced.replaced.length}項目を反映しました。`;
      } else {
        message.className = "fsc-message warn";
        message.textContent = "元のコードが未入力のため、計算対象行だけを出力しています。";
      }
      root.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", () => copyText(button.dataset.copy, message)));
    }

    root.addEventListener("change", (event) => {
      if (event.target.matches("select,input")) {
        saveState();
        refresh();
      }
    });
    root.addEventListener("input", (event) => {
      if (event.target.matches("input")) saveState();
    });
    query('[name="sourceCode"]').addEventListener("input", () => {
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
