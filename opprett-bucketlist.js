// ============================================================
//  Glimt - opprett-bucketlist.js
//  Oppretter et reisebrev med templateType="bucketlist"
// ============================================================

(function () {
  "use strict";
  var STORAGE_KEY = "glimt.userGlimts";

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function loadGuides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveGuides(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  function imageRowHtml(val) {
    val = val || "";
    return '<div class="bl-image-row">' +
      '<div style="flex:1;display:flex;flex-direction:column;gap:4px">' +
        '<input type="url" name="image" class="bl-input" placeholder="Lim inn bilde-URL eller last opp..." value="' + val.replace(/"/g, "&quot;") + '" />' +
        '<div class="img-upload-wrap" data-target-name="image">' +
          '<input type="file" class="img-upload-file" accept="image/*" hidden />' +
          '<button type="button" class="img-upload-btn">⬆ Last opp bilde</button>' +
          '<div class="img-upload-progress" hidden><div class="img-upload-progressbar"><div class="img-upload-bar"></div></div><span class="img-upload-text">0%</span></div>' +
          '<div class="img-upload-preview" hidden><img class="img-upload-thumb" alt="" /><button type="button" class="img-upload-remove" aria-label="Fjern bilde">×</button></div>' +
          '<div class="img-upload-error" hidden></div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="bl-remove-btn" data-remove="image" aria-label="Fjern">×</button>' +
    '</div>';
  }

  function itemRowHtml(val) {
    val = val || "";
    return '<div class="bl-item-row">' +
      '<input type="text" class="bl-input" placeholder="F.eks. Se Colosseum, Spise ekte carbonara..." value="' + val.replace(/"/g, "&quot;") + '" maxlength="160" />' +
      '<button type="button" class="bl-remove-btn" data-remove="item" aria-label="Fjern">×</button>' +
    '</div>';
  }

  function init() {
    // Fyll by-dropdown
    var citySel = document.getElementById("bl-city");
    if (citySel && typeof CITIES !== "undefined") {
      CITIES.forEach(function (c) {
        var opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = c.name;
        citySel.appendChild(opt);
      });
    }

    var imagesList = document.getElementById("bl-images-list");
    var itemsList  = document.getElementById("bl-items-list");
    var addImgBtn  = document.getElementById("bl-add-image");
    var addItemBtn = document.getElementById("bl-add-item");

    // Start med 1 tom bilde-rad og 3 tomme punkt-rader
    if (imagesList) imagesList.innerHTML = imageRowHtml("");
    if (itemsList)  itemsList.innerHTML  = itemRowHtml("") + itemRowHtml("") + itemRowHtml("");

    if (addImgBtn) addImgBtn.addEventListener("click", function () {
      var rows = imagesList.querySelectorAll(".bl-image-row").length;
      if (rows >= 5) { alert("Maks 5 bilder."); return; }
      imagesList.insertAdjacentHTML("beforeend", imageRowHtml(""));
    });
    if (addItemBtn) addItemBtn.addEventListener("click", function () {
      itemsList.insertAdjacentHTML("beforeend", itemRowHtml(""));
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".bl-remove-btn");
      if (!btn) return;
      var type = btn.dataset.remove;
      if (type === "image") {
        var imgRows = imagesList.querySelectorAll(".bl-image-row");
        if (imgRows.length <= 1) { imgRows[0].querySelector("input[name='image']").value = ""; return; }
        btn.closest(".bl-image-row").remove();
      } else if (type === "item") {
        var itemRows = itemsList.querySelectorAll(".bl-item-row");
        if (itemRows.length <= 1) { itemRows[0].querySelector("input").value = ""; return; }
        btn.closest(".bl-item-row").remove();
      }
    });

    var form = document.getElementById("bl-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = document.getElementById("bl-title").value.trim();
      var subtitle = document.getElementById("bl-subtitle").value.trim();
      var city = document.getElementById("bl-city").value;
      var images = Array.from(imagesList.querySelectorAll("input[name='image']"))
        .map(function (i) { return i.value.trim(); })
        .filter(function (v) { return v; });
      var items = Array.from(itemsList.querySelectorAll("input"))
        .map(function (i) { return i.value.trim(); })
        .filter(function (v) { return v; });
      if (!title) { alert("Tittel er påkrevd"); return; }
      if (items.length === 0) { alert("Legg til minst ett punkt i listen"); return; }

      var guide = {
        id: uid(),
        title: title,
        subtitle: subtitle,
        city: city,
        templateType: "bucketlist",
        bucketlistImages: images,
        glimts: items.map(function (t) { return { title: t, checked: false }; }),
        isGuide: false,
        isReiseplan: false,
        createdAt: new Date().toISOString()
      };

      var list = loadGuides();
      list.unshift(guide);
      try {
        saveGuides(list);
      } catch (err) {
        alert("Kunne ikke lagre: " + (err.message || "ukjent feil"));
        return;
      }
      window.location.href = "glimt-detalj.html?id=" + encodeURIComponent(guide.id);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
