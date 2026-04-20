// ============================================================
//  Glimt - emoji-picker.js
//  Liten emoji-velger som kobles på alle input[name='emoji'].
//  Vises kun på enheter med mus/hover (desktop).
// ============================================================

(function () {
  "use strict";

  var CATEGORIES = [
    { label: "Mat & drikke", icon: "🍕", emojis: ["🍕","🍣","🍔","🌮","🥐","🥖","🧀","🥗","🍜","🍝","🍛","🍱","🍙","🍰","🍨","🍦","🍪","☕","🍷","🍺","🍸","🍹","🍾","🥂","🍽️","🥤"] },
    { label: "Steder", icon: "🏛️", emojis: ["🏛️","🏰","🏯","⛪","🕌","🕍","🕋","🗼","🗽","⛲","🏙️","🌉","🌇","🌆","🏟️","🎡","🎢","🎠","🎦","🎨","🏭","🏠","🏡","🏨"] },
    { label: "Natur", icon: "🌅", emojis: ["🌅","🌄","🌊","🏔️","⛰️","🗻","🏞️","🏖️","🏝️","🌋","🌲","🌳","🌴","🌸","🌹","🌻","🌺","🌵","🌿","🍀","🍁","🍂","🏕️"] },
    { label: "Aktivitet", icon: "🚴", emojis: ["🚶","🏃","🚴","🏊","⛷️","🏂","🧗","🏇","🏄","🚣","🤿","🎣","⛳","🧘","🏋️","🎯","🎨","🎭","🎬","🎤","🎸","🎧","🎾","⚽","🏀","⚾"] },
    { label: "Transport", icon: "✈️", emojis: ["✈️","🚁","🚂","🚆","🚇","🚊","🚉","🚗","🚕","🚙","🚌","🚎","🚐","🛵","🏍️","🚢","⛵","🛳️","⛴️","🛶","🚲","🛺","🛹","🚀"] },
    { label: "Symboler", icon: "✨", emojis: ["📍","🗺️","📌","⭐","✨","💫","🎉","❤️","💛","💚","💙","💜","🧡","🖤","🤍","💰","💎","🎁","🏆","🥇","✅","🔥","☀️","🌟"] }
  ];

  function injectStyles() {
    if (document.getElementById("emoji-picker-style")) return;
    var css = [
      ".emoji-picker-btn { display: none; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid #e4e4e4; border-radius: 8px; background: #fafafa; cursor: pointer; font-size: 18px; margin-left: 6px; padding: 0; vertical-align: middle; transition: all 0.15s; }",
      ".emoji-picker-btn:hover { background: #FFEEBC; border-color: #5D372A; }",
      ".emoji-input-row { display: flex; align-items: center; gap: 0; }",
      ".emoji-input-row .meg-input { flex: 1; }",
      "@media (hover: hover) and (pointer: fine) { .emoji-picker-btn { display: inline-flex; } }",
      ".emoji-picker-popover { position: absolute; background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 10px 28px rgba(0,0,0,0.18); width: 320px; max-width: 94vw; z-index: 10000; padding: 8px; font-family: inherit; }",
      ".emoji-picker-tabs { display: flex; gap: 2px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 6px; overflow-x: auto; }",
      ".emoji-picker-tab { border: none; background: transparent; font-size: 18px; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; flex-shrink: 0; padding: 0; }",
      ".emoji-picker-tab:hover { background: #f5f5f5; }",
      ".emoji-picker-tab--active { background: #FFEEBC; }",
      ".emoji-picker-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; max-height: 240px; overflow-y: auto; }",
      ".emoji-picker-item { border: none; background: transparent; font-size: 20px; padding: 6px; border-radius: 6px; cursor: pointer; line-height: 1; transition: all 0.1s; }",
      ".emoji-picker-item:hover { background: #FFEEBC; transform: scale(1.25); }"
    ].join("\n");
    var style = document.createElement("style");
    style.id = "emoji-picker-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildGrid(category) {
    return category.emojis.map(function (e) {
      return '<button type="button" class="emoji-picker-item" data-emoji="' + e + '">' + e + '</button>';
    }).join("");
  }

  function outsideHandler(e) {
    if (e.target.closest(".emoji-picker-popover") || e.target.closest(".emoji-picker-btn")) return;
    closeAllPopovers();
  }

  function closeAllPopovers() {
    document.querySelectorAll("[data-emoji-picker]").forEach(function (p) { p.remove(); });
    document.removeEventListener("click", outsideHandler, true);
  }

  function openPopover(btn, input) {
    closeAllPopovers();
    var pop = document.createElement("div");
    pop.className = "emoji-picker-popover";
    pop.dataset.emojiPicker = "1";
    var tabsHtml = CATEGORIES.map(function (c, i) {
      return '<button type="button" class="emoji-picker-tab' + (i === 0 ? ' emoji-picker-tab--active' : '') + '" data-cat="' + i + '" title="' + c.label + '">' + c.icon + '</button>';
    }).join("");
    pop.innerHTML = '<div class="emoji-picker-tabs">' + tabsHtml + '</div><div class="emoji-picker-grid">' + buildGrid(CATEGORIES[0]) + '</div>';
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 6;
    var left = r.left + window.scrollX;
    if (left + 320 > window.innerWidth - 10) left = window.innerWidth - 330;
    pop.style.top = top + "px";
    pop.style.left = Math.max(10, left) + "px";
    pop.addEventListener("click", function (e) {
      var tab = e.target.closest(".emoji-picker-tab");
      if (tab) {
        pop.querySelectorAll(".emoji-picker-tab").forEach(function (t) { t.classList.remove("emoji-picker-tab--active"); });
        tab.classList.add("emoji-picker-tab--active");
        var cat = CATEGORIES[parseInt(tab.dataset.cat, 10)];
        pop.querySelector(".emoji-picker-grid").innerHTML = buildGrid(cat);
        return;
      }
      var item = e.target.closest(".emoji-picker-item");
      if (item) {
        input.value = item.dataset.emoji;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        closeAllPopovers();
      }
    });
    setTimeout(function () { document.addEventListener("click", outsideHandler, true); }, 10);
  }

  function initInput(input) {
    if (input.dataset.emojiPickerInited) return;
    input.dataset.emojiPickerInited = "1";
    var parent = input.parentElement;
    if (!parent) return;
    var wrap = document.createElement("span");
    wrap.className = "emoji-input-row";
    parent.insertBefore(wrap, input);
    wrap.appendChild(input);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "emoji-picker-btn";
    btn.setAttribute("aria-label", "Velg emoji");
    btn.title = "Velg emoji";
    btn.textContent = "😀";
    wrap.appendChild(btn);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (document.querySelector("[data-emoji-picker]")) closeAllPopovers();
      else openPopover(btn, input);
    });
  }

  function initAll() {
    injectStyles();
    document.querySelectorAll("input[name='emoji']").forEach(initInput);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll);
  else initAll();
  new MutationObserver(function () { initAll(); }).observe(document.body, { childList: true, subtree: true });
})();
