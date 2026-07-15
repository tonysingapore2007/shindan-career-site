(function () {
  var STORAGE_KEY = "careerDiagnosisResult";

  var state = {
    step: 0,
    answers: {}
  };

  var els = {
    progressFill: document.getElementById("progressFill"),
    progressLabel: document.getElementById("progressLabel"),
    questionMount: document.getElementById("questionMount"),
    backBtn: document.getElementById("backBtn"),
    nextBtn: document.getElementById("nextBtn"),
    errorMsg: document.getElementById("errorMsg")
  };

  function currentQuestion() {
    return QUESTIONS[state.step];
  }

  function render() {
    var q = currentQuestion();
    var total = QUESTIONS.length;

    els.progressLabel.textContent = q.label;
    els.progressFill.style.width = Math.round(((state.step + 1) / total) * 100) + "%";
    els.errorMsg.classList.remove("is-visible");

    var selected = state.answers[q.key];
    var isChecked = q.type === "checkbox";

    var optionsHtml = q.options
      .map(function (opt) {
        var checked = isChecked
          ? (selected || []).indexOf(opt.value) !== -1
          : selected === opt.value;
        var inputType = isChecked ? "checkbox" : "radio";
        return (
          '<label class="option' + (checked ? " is-selected" : "") + '" data-value="' + opt.value + '">' +
            '<input type="' + inputType + '" name="' + q.key + '" value="' + opt.value + '"' + (checked ? " checked" : "") + ">" +
            '<span class="option__label">' + opt.label + "</span>" +
          "</label>"
        );
      })
      .join("");

    els.questionMount.innerHTML =
      '<div class="question-card">' +
        '<div class="question-card__label">' + q.label + "</div>" +
        '<h1 class="question-card__title">' + q.title + "</h1>" +
        '<p class="question-card__hint">' + q.hint + "</p>" +
        '<div class="option-list">' + optionsHtml + "</div>" +
      "</div>";

    Array.prototype.forEach.call(
      els.questionMount.querySelectorAll(".option"),
      function (optionEl) {
        optionEl.addEventListener("click", function (e) {
          if (e.target.tagName !== "INPUT") e.preventDefault();
          handleSelect(q, optionEl.getAttribute("data-value"));
        });
      }
    );

    els.backBtn.style.visibility = state.step === 0 ? "hidden" : "visible";
    els.nextBtn.textContent = state.step === total - 1 ? "診断結果を見る" : "次へ";
  }

  function handleSelect(q, value) {
    if (q.type === "checkbox") {
      var opt = q.options.filter(function (o) { return o.value === value; })[0];
      var current = state.answers[q.key] || [];

      if (opt.exclusive) {
        current = current.indexOf(value) !== -1 ? [] : [value];
      } else {
        current = current.filter(function (v) {
          var o = q.options.filter(function (x) { return x.value === v; })[0];
          return !o || !o.exclusive;
        });
        var idx = current.indexOf(value);
        if (idx === -1) {
          current.push(value);
        } else {
          current.splice(idx, 1);
        }
      }
      state.answers[q.key] = current;
    } else {
      state.answers[q.key] = value;
    }
    render();
  }

  function isAnswered(q) {
    var v = state.answers[q.key];
    if (q.type === "checkbox") return v && v.length > 0;
    return !!v;
  }

  function goNext() {
    var q = currentQuestion();
    if (!isAnswered(q)) {
      els.errorMsg.classList.add("is-visible");
      return;
    }

    if (state.step === QUESTIONS.length - 1) {
      submit();
      return;
    }

    state.step += 1;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (state.step === 0) return;
    state.step -= 1;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    var result = calcScore(state.answers);
    var rankKey = getRankKey(result.total);
    var agents = recommendAgents(result.tag, rankKey);

    var payload = {
      total: result.total,
      breakdown: result.breakdown,
      tag: result.tag,
      rankKey: rankKey,
      mainAgentId: agents.mainId,
      subAgentId: agents.subId,
      createdAt: Date.now()
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.location.href = "result/";
  }

  els.nextBtn.addEventListener("click", goNext);
  els.backBtn.addEventListener("click", goBack);

  render();
})();
