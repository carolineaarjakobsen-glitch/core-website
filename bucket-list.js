// ============================================================
//  Glimt - bucket-list.js
//  Enkel bucket list: tittel + huk av. Lagres i localStorage.
// ============================================================

(function () {
  "use strict";

  var STORAGE_KEY = "glimt-bucket-list";

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function save(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      return d.toLocaleDateString("no", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { return ""; }
  }

  function render() {
    var list = load();
    var ul = document.getElementById("bucket-list");
    var empty = document.getElementById("bucket-empty");
    var progress = document.getElementById("bucket-progress");
    if (!ul) return;

    if (list.length === 0) {
      ul.innerHTML = "";
      if (empty) empty.hidden = false;
      if (progress) progress.textContent = "Start listen din";
      return;
    }
    if (empty) empty.hidden = true;

    // Sorter: u-avkrysset først (nyeste først), deretter avkrysset (nyligste avkrysning først)
    var pending = list.filter(function (i) { return !i.done; }).sort(function (a, b) {
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    var done = list.filter(function (i) { return i.done; }).sort(function (a, b) {
      return (b.completedAt || "").localeCompare(a.completedAt || "");
    });
    var sorted = pending.concat(done);

    ul.innerHTML = sorted.map(function (item) {
      var dateHtml = item.done && item.completedAt
        ? '<span class="bucket-item-date">✓ ' + esc(fmtDate(item.completedAt)) + '</span>'
        : '';
      return '<li class="bucket-item' + (item.done ? ' bucket-item--done' : '') + '" data-id="' + esc(item.id) + '">' +
        '<input type="checkbox" class="bucket-checkbox" ' + (item.done ? 'checked' : '') + ' aria-label="Huk av" />' +
        '<span class="bucket-item-title">' + esc(item.title) + '</span>' +
        dateHtml +
        '<button type="button" class="bucket-item-delete" aria-label="Slett" title="Slett">×</button>' +
        '</li>';
    }).join("");

    if (progress) {
      var total = list.length;
      var doneCount = list.filter(function (i) { return i.done; }).length;
      progress.textContent = doneCount + " av " + total + " fullført";
    }
  }

  function addItem(title) {
    var t = (title || "").trim();
    if (!t) return;
    var list = load();
    list.unshift({ id: uid(), title: t, done: false, createdAt: new Date().toISOString() });
    save(list);
    render();
  }

  function toggleItem(id) {
    var list = load();
    var idx = list.findIndex(function (i) { return i.id === id; });
    if (idx < 0) return;
    list[idx].done = !list[idx].done;
    list[idx].completedAt = list[idx].done ? new Date().toISOString() : null;
    save(list);
    render();
  }

  function deleteItem(id) {
    if (!confirm("Slette dette målet?")) return;
    var list = load().filter(function (i) { return i.id !== id; });
    save(list);
    render();
  }

  function init() {
    var form = document.getElementById("bucket-add-form");
    var input = document.getElementById("bucket-add-input");
    var ul = document.getElementById("bucket-list");

    if (form && input) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        addItem(input.value);
        input.value = "";
        input.focus();
      });
    }

    if (ul) {
      ul.addEventListener("change", function (e) {
        var cb = e.target.closest(".bucket-checkbox");
        if (!cb) return;
        var li = cb.closest(".bucket-item");
        if (li) toggleItem(li.dataset.id);
      });
      ul.addEventListener("click", function (e) {
        var del = e.target.closest(".bucket-item-delete");
        if (!del) return;
        var li = del.closest(".bucket-item");
        if (li) deleteItem(li.dataset.id);
      });
    }

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
