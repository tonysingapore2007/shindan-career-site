(function () {
  var STORAGE_KEY = "careerDiagnosisResult";

  var raw = sessionStorage.getItem(STORAGE_KEY);
  var mainEl = document.getElementById("resultMain");
  var emptyEl = document.getElementById("resultEmpty");

  if (!raw) {
    mainEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  var data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    mainEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  var rank = RANKS[data.rankKey];
  var mainAgent = AGENTS[data.mainAgentId];
  var subAgent = AGENTS[data.subAgentId];

  document.getElementById("rankBadge").textContent = rank.label;
  document.getElementById("rankBadge").style.background = rank.color;
  document.getElementById("scoreValue").textContent = data.total;
  document.getElementById("rankTitle").textContent = rank.title;
  document.getElementById("rankDesc").textContent = rank.desc;
  document.getElementById("industryTag").textContent = TAG_LABELS[data.tag] + "業界";

  var breakdownMount = document.getElementById("breakdownMount");
  breakdownMount.innerHTML = data.breakdown
    .map(function (row) {
      var pct = Math.round((row.points / row.max) * 100);
      return (
        '<div class="breakdown__row">' +
          '<div class="breakdown__top">' +
            '<span class="breakdown__label">' + row.label + "</span>" +
            '<span class="breakdown__value">' + row.points + " / " + row.max + " 点</span>" +
          "</div>" +
          '<div class="breakdown__bar"><div class="breakdown__bar-fill" style="width:' + pct + '%"></div></div>' +
        "</div>"
      );
    })
    .join("");

  function agentCardHtml(agent, badgeText, cardClass) {
    var tagsHtml = agent.tags
      .map(function (t) { return '<span class="mini-tag">' + t + "</span>"; })
      .join("");
    return (
      '<div class="agent-card ' + cardClass + '">' +
        '<div class="agent-card__badge">' + badgeText + "</div>" +
        '<div class="agent-card__name">' + agent.name + "</div>" +
        '<div class="agent-card__tags">' + tagsHtml + "</div>" +
        '<p class="agent-card__desc">' + agent.desc + "</p>" +
        '<a class="btn btn-primary btn-block" href="' + agent.url + '" target="_blank" rel="noopener">公式サイトを見る</a>' +
      "</div>"
    );
  }

  document.getElementById("agentMount").innerHTML =
    agentCardHtml(mainAgent, "あなたに最もおすすめ", "is-main") +
    agentCardHtml(subAgent, "あわせて登録したい", "is-sub");

  document.getElementById("retryBtn").addEventListener("click", function () {
    sessionStorage.removeItem(STORAGE_KEY);
  });
})();
