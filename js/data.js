/* ==========================================================================
   転職市場価値診断 - スコアリング & エージェント推薦ロジック
   diagnosis / result 両ページから読み込む共通データ
   ========================================================================== */

var BASE_POINTS = 5;

var QUESTIONS = [
  {
    id: "q1",
    key: "age",
    type: "radio",
    label: "Q1 / 6",
    title: "現在の年齢を教えてください",
    hint: "最大20点",
    max: 20,
    resultLabel: "年齢",
    options: [
      { value: "20-24", label: "20〜24歳", points: 18 },
      { value: "25-29", label: "25〜29歳", points: 20 },
      { value: "30-34", label: "30〜34歳", points: 18 },
      { value: "35-39", label: "35〜39歳", points: 15 },
      { value: "40-44", label: "40〜44歳", points: 10 },
      { value: "45-49", label: "45〜49歳", points: 7 },
      { value: "50plus", label: "50歳以上", points: 5 }
    ]
  },
  {
    id: "q2",
    key: "salary",
    type: "radio",
    label: "Q2 / 6",
    title: "現在の年収を教えてください",
    hint: "最大20点",
    max: 20,
    resultLabel: "現在年収",
    options: [
      { value: "under300", label: "300万円未満", points: 5 },
      { value: "300-400", label: "300万〜400万円未満", points: 8 },
      { value: "400-500", label: "400万〜500万円未満", points: 12 },
      { value: "500-600", label: "500万〜600万円未満", points: 15 },
      { value: "600-800", label: "600万〜800万円未満", points: 18 },
      { value: "800plus", label: "800万円以上", points: 20 }
    ]
  },
  {
    id: "q3",
    key: "industry",
    type: "radio",
    label: "Q3 / 6",
    title: "現在の業種を教えてください",
    hint: "最大20点",
    max: 20,
    resultLabel: "業種",
    options: [
      { value: "it", label: "IT・Web", points: 20, tag: "it" },
      { value: "consulting", label: "コンサルティング", points: 18, tag: "consulting" },
      { value: "finance", label: "金融", points: 16, tag: "finance" },
      { value: "manufacturer", label: "メーカー", points: 14, tag: "manufacturer" },
      { value: "other", label: "その他", points: 10, tag: "other" }
    ]
  },
  {
    id: "q4",
    key: "jobChanges",
    type: "radio",
    label: "Q4 / 6",
    title: "これまでの転職回数を教えてください",
    hint: "最大15点",
    max: 15,
    resultLabel: "転職回数",
    options: [
      { value: "0", label: "0回(今回が初めての転職)", points: 12 },
      { value: "1-2", label: "1〜2回", points: 15 },
      { value: "3", label: "3回", points: 10 },
      { value: "4", label: "4回", points: 7 },
      { value: "5plus", label: "5回以上", points: 4 }
    ]
  },
  {
    id: "q5",
    key: "skills",
    type: "checkbox",
    label: "Q5 / 6",
    title: "保有している資格・スキルを選んでください",
    hint: "最大15点(複数選択可)",
    max: 15,
    resultLabel: "保有資格・スキル",
    options: [
      { value: "language", label: "語学力(英語ビジネスレベル以上)", points: 5 },
      { value: "it_skill", label: "ITスキル・プログラミング経験", points: 5 },
      { value: "management", label: "マネジメント経験", points: 5 },
      { value: "finance_cert", label: "会計・財務系資格(簿記2級以上など)", points: 5 },
      { value: "specialist_cert", label: "専門資格(士業・技術士など)", points: 5 },
      { value: "none", label: "特になし", points: 0, exclusive: true }
    ]
  },
  {
    id: "q6",
    key: "employment",
    type: "radio",
    label: "Q6 / 6",
    title: "現在の勤務形態を教えてください",
    hint: "最大5点",
    max: 5,
    resultLabel: "勤務形態",
    options: [
      { value: "fulltime", label: "正社員", points: 5 },
      { value: "freelance", label: "フリーランス・業務委託", points: 4 },
      { value: "contract", label: "契約社員", points: 3 },
      { value: "dispatch", label: "派遣社員", points: 2 },
      { value: "other", label: "その他", points: 1 }
    ]
  }
];

var RANKS = {
  S: {
    label: "S",
    min: 85,
    color: "var(--rank-s)",
    title: "市場価値 非常に高い",
    desc: "希少性の高いハイクラス人材です。好条件のオファーを引き出せる可能性が高く、複数のエージェントを比較しながら戦略的に転職活動を進めるのがおすすめです。"
  },
  A: {
    label: "A",
    min: 70,
    color: "var(--rank-a)",
    title: "市場価値 高い",
    desc: "市場からの評価が高く、キャリアアップの選択肢が豊富にあります。専門特化型エージェントを活用すると、より条件の良い求人に出会いやすくなります。"
  },
  B: {
    label: "B",
    min: 55,
    color: "var(--rank-b)",
    title: "市場価値 平均以上",
    desc: "着実にキャリアを積み重ねています。スキルや実績の棚卸しをしっかり行うことで、さらに評価を高められる余地があります。"
  },
  C: {
    label: "C",
    min: 40,
    color: "var(--rank-c)",
    title: "市場価値 平均的",
    desc: "現時点では標準的な評価です。資格取得や実務経験の幅を広げることで、市場価値を大きく伸ばせる可能性があります。"
  },
  D: {
    label: "D",
    min: 0,
    color: "var(--rank-d)",
    title: "これから伸びしろあり",
    desc: "焦らず今のうちにスキルアップの計画を立てましょう。未経験者向けサポートが手厚いエージェントを使うと、無理のない一歩を踏み出せます。"
  }
};

var AGENTS = {
  "recruit-agent": {
    name: "リクルートエージェント",
    desc: "業界最大級の求人数を誇る総合型エージェント。あらゆる業種・職種をカバーし、初めての転職でも安心して利用できます。",
    tags: ["総合型", "求人数No.1"],
    url: "#"
  },
  "doda": {
    name: "doda",
    desc: "求人数・サポート体制ともに充実した総合型エージェント。特にメーカーや営業職の求人に強みがあります。",
    tags: ["総合型", "メーカーに強い"],
    url: "#"
  },
  "bizreach": {
    name: "ビズリーチ",
    desc: "即戦力人材・ハイクラス転職に特化したスカウト型サービス。年収800万円以上のオファーが多く届きます。",
    tags: ["ハイクラス", "スカウト型"],
    url: "#"
  },
  "jac-recruitment": {
    name: "JACリクルートメント",
    desc: "外資系・グローバル企業やハイクラス求人に強いエージェント。管理職・専門職の転職支援に定評があります。",
    tags: ["外資・グローバル", "管理職向け"],
    url: "#"
  },
  "levtech-career": {
    name: "レバテックキャリア",
    desc: "IT・Web業界に特化したエージェント。エンジニア・クリエイターの転職市場に精通したアドバイザーが在籍。",
    tags: ["IT・Web特化"],
    url: "#"
  },
  "ms-japan": {
    name: "MS-Japan",
    desc: "経理・財務・法務など管理部門や士業に特化したエージェント。専門職としてのキャリア形成をサポート。",
    tags: ["管理部門特化", "士業特化"],
    url: "#"
  },
  "mynavi-agent": {
    name: "マイナビエージェント",
    desc: "20代・第二新卒や未経験からの転職サポートに定評がある総合型エージェント。手厚いフォローが特徴。",
    tags: ["総合型", "未経験・第二新卒向け"],
    url: "#"
  },
  "type-agent": {
    name: "type転職エージェント",
    desc: "首都圏を中心にIT・メーカー系求人に強い総合型エージェント。きめ細かいキャリア相談に強み。",
    tags: ["IT・メーカーに強い", "首都圏"],
    url: "#"
  }
};

var TAG_LABELS = {
  it: "IT・Web",
  consulting: "コンサルティング",
  finance: "金融",
  manufacturer: "メーカー",
  other: "その他"
};

var MAIN_AGENT_BY_TAG = {
  it: "levtech-career",
  consulting: "jac-recruitment",
  finance: "ms-japan",
  manufacturer: "type-agent",
  other: "recruit-agent"
};

var SUB_AGENT_BY_RANK = {
  S: "bizreach",
  A: "bizreach",
  B: "doda",
  C: "mynavi-agent",
  D: "mynavi-agent"
};

function calcScore(answers) {
  var breakdown = [];
  var total = BASE_POINTS;
  var tag = "other";

  QUESTIONS.forEach(function (q) {
    var value = answers[q.key];
    var points = 0;

    if (q.type === "radio") {
      var opt = q.options.filter(function (o) { return o.value === value; })[0];
      if (opt) {
        points = opt.points;
        if (opt.tag) tag = opt.tag;
      }
    } else if (q.type === "checkbox") {
      var values = value || [];
      points = q.options
        .filter(function (o) { return values.indexOf(o.value) !== -1; })
        .reduce(function (sum, o) { return sum + o.points; }, 0);
      if (points > q.max) points = q.max;
    }

    total += points;
    breakdown.push({
      key: q.key,
      label: q.resultLabel,
      points: points,
      max: q.max
    });
  });

  breakdown.push({ key: "base", label: "基礎点", points: BASE_POINTS, max: BASE_POINTS });

  if (total > 100) total = 100;

  return { total: total, breakdown: breakdown, tag: tag };
}

function getRankKey(total) {
  if (total >= RANKS.S.min) return "S";
  if (total >= RANKS.A.min) return "A";
  if (total >= RANKS.B.min) return "B";
  if (total >= RANKS.C.min) return "C";
  return "D";
}

function recommendAgents(tag, rankKey) {
  var mainId = MAIN_AGENT_BY_TAG[tag] || "recruit-agent";
  var subId = SUB_AGENT_BY_RANK[rankKey] || "recruit-agent";
  if (subId === mainId) subId = "recruit-agent";
  return { mainId: mainId, subId: subId };
}
