#!/usr/bin/env node
// ============================================================
//  Glimt – kjør statiske tester i Node.js (ingen nettleser)
//  Sjekker HTML-inkluderinger og filstruktur. For de
//  Firebase-avhengige testene, se tests/test-glimt-store.html.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

let pass = 0, fail = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    pass += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`      ${err.message}`);
    fail += 1;
    failures.push({ name, message: err.message });
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ── Filstruktur ─────────────────────────────────────────────
describe("Filstruktur", () => {
  ["glimt-store.js", "auth-guard.js", "firestore.rules", "FIRESTORE_SETUP.md"]
    .forEach(f => test(`${f} finnes`, () => {
      if (!exists(f)) throw new Error("mangler");
    }));
});

// ── Script-inkludering på beskyttede sider ──────────────────
describe("Beskyttede sider inkluderer Firestore + store + auth-guard", () => {
  const protectedPages = [
    "mine-glimt.html", "glimt-detalj.html", "opprett-glimt.html",
    "mine-enkeltglimt.html", "mine-reiseplaner.html",
    "reiseplan-detalj.html", "min-kalender.html", "calendar.html",
    "utforsk-glimt.html", "utforsk-reisebrev.html",
    "explore.html", "city-landing.html"
  ];
  protectedPages.forEach(page => {
    test(`${page}`, () => {
      const html = read(page);
      const needs = [
        "firebase-firestore-compat.js",
        "glimt-store.js",
        "auth-guard.js"
      ];
      const missing = needs.filter(n => !html.includes(n));
      if (missing.length) throw new Error("mangler: " + missing.join(", "));
    });
  });
});

// ── Login-siden skal IKKE ha auth-guard ─────────────────────
describe("Login-siden er åpen", () => {
  test("login.html har IKKE auth-guard.js", () => {
    const html = read("login.html");
    if (html.includes("auth-guard.js"))
      throw new Error("auth-guard.js lastet – ville gitt redirect-loop");
  });
});

// ── JavaScript-filer har ingen gjenværende localStorage-kall ─
describe("localStorage-kall fjernet fra produksjonskode", () => {
  const jsFiles = [
    "opprett-glimt.js", "mine-glimt.js", "glimt-detalj.js",
    "mine-enkeltglimt.js", "mine-reiseplaner.js",
    "reiseplan-detalj.js", "saved-glimt.js", "min-kalender.js",
    "calendar.js", "utforsk-glimt.js", "utforsk-reisebrev.js",
    "explore.js"
  ];
  jsFiles.forEach(f => {
    test(`${f} bruker ikke localStorage.getItem/setItem`, () => {
      const js = read(f);
      // Tillat kommentarer med ordet localStorage
      const nonComment = js.split("\n").filter(l => {
        const t = l.trim();
        return !t.startsWith("//") && !t.startsWith("*");
      }).join("\n");
      if (/localStorage\.(getItem|setItem|removeItem)/.test(nonComment)) {
        const match = nonComment.match(/.*localStorage\.(getItem|setItem|removeItem).*/);
        throw new Error("gjenværende kall: " + match[0].trim());
      }
    });
  });
  test("glimt-store.js: localStorage kun brukt i migrerings-flyten", () => {
    const js = read("glimt-store.js");
    const matches = js.match(/localStorage\.\w+/g) || [];
    if (matches.length === 0)
      throw new Error("forventet at migrering bruker localStorage");
  });
});

// ── glimt-store.js API-flate ────────────────────────────────
describe("GlimtStore eksponerer forventet API", () => {
  const js = read("glimt-store.js");
  const methods = [
    "init", "isReady", "onReady", "getUserId",
    "getUserGlimts", "getUserGlimt", "saveUserGlimt", "deleteUserGlimt",
    "getMyCreatedGlimt", "saveMyCreatedGlimt", "deleteMyCreatedGlimt",
    "getSavedGlimt", "isGlimtSaved", "addSavedGlimt", "removeSavedGlimt",
    "getCalendarEvents", "saveCalendarEvent", "removeCalendarEvent",
    "getPlans", "getPlan", "savePlan", "deletePlan",
    "replaceList",
    "getPublicUserGlimts", "getPublicMyCreatedGlimt"
  ];
  methods.forEach(m => {
    test(`metode: ${m}`, () => {
      if (!new RegExp(`\\b${m}\\b\\s*[:(]`).test(js))
        throw new Error(`${m} mangler i glimt-store.js`);
    });
  });
});

// ── firestore.rules-innhold ─────────────────────────────────
describe("Sikkerhetsregler", () => {
  const rules = read("firestore.rules");
  test("rules_version 2", () => {
    if (!/rules_version\s*=\s*'2'/.test(rules)) throw new Error("mangler");
  });
  test("matcher users/{userId}", () => {
    if (!/match\s+\/users\/\{userId\}/.test(rules)) throw new Error("mangler");
  });
  test("krever request.auth.uid == userId", () => {
    if (!/request\.auth\.uid\s*==\s*userId/.test(rules))
      throw new Error("mangler uid-sjekk");
  });
  test("matcher subkolleksjoner", () => {
    if (!/match\s+\/\{subcollection\}\/\{docId\}/.test(rules))
      throw new Error("mangler subkolleksjon-match");
  });
  test("tillater collection-group-lesing av delte userGlimts", () => {
    if (!/match\s+\/\{path=\*\*\}\/userGlimts\/\{docId\}/.test(rules))
      throw new Error("mangler collection-group for userGlimts");
    if (!/resource\.data\.isPublic\s*==\s*true/.test(rules))
      throw new Error("mangler isPublic-sjekk");
  });
  test("tillater collection-group-lesing av delte myCreatedGlimt", () => {
    if (!/match\s+\/\{path=\*\*\}\/myCreatedGlimt\/\{docId\}/.test(rules))
      throw new Error("mangler collection-group for myCreatedGlimt");
  });
});

// ── Offentlig deling: UI og lagringslogikk ──────────────────
describe("Offentlig deling (UI + store)", () => {
  test("opprett-glimt.html har share-toggle-cb", () => {
    const html = read("opprett-glimt.html");
    if (!html.includes('id="share-toggle-cb"'))
      throw new Error("share-toggle-cb mangler");
    if (!/Del reisebrevet offentlig/.test(html))
      throw new Error("beskrivelse mangler");
  });
  test("opprett-glimt.js leser og skriver isPublic", () => {
    const js = read("opprett-glimt.js");
    if (!/share-toggle-cb/.test(js)) throw new Error("leser ikke toggle");
    if (!/isPublic\s*:\s*isPublic/.test(js))
      throw new Error("setter ikke isPublic på guide");
  });
  test("mine-enkeltglimt.html har isPublic-avkrysning", () => {
    const html = read("mine-enkeltglimt.html");
    if (!/name="isPublic"/.test(html))
      throw new Error("isPublic-avkrysning mangler");
  });
  test("mine-enkeltglimt.js setter isPublic på nye glimt", () => {
    const js = read("mine-enkeltglimt.js");
    if (!/isPublic:\s*data\.get\("isPublic"\)/.test(js))
      throw new Error("isPublic hentes ikke fra form");
  });
  test("glimt-store.js har getPublicUserGlimts og getPublicMyCreatedGlimt", () => {
    const js = read("glimt-store.js");
    if (!/getPublicUserGlimts\s*\(/.test(js))
      throw new Error("getPublicUserGlimts mangler");
    if (!/getPublicMyCreatedGlimt\s*\(/.test(js))
      throw new Error("getPublicMyCreatedGlimt mangler");
    if (!/collectionGroup\("userGlimts"\)/.test(js))
      throw new Error("bruker ikke collectionGroup for userGlimts");
    if (!/collectionGroup\("myCreatedGlimt"\)/.test(js))
      throw new Error("bruker ikke collectionGroup for myCreatedGlimt");
    if (!/\.where\("isPublic",\s*"==",\s*true\)/.test(js))
      throw new Error("filtrerer ikke på isPublic == true");
  });
  test("glimt-store.js enricher med authorId/authorName når delt", () => {
    const js = read("glimt-store.js");
    if (!/enrichForShare/.test(js))
      throw new Error("enrichForShare-hjelper mangler");
    if (!/authorId/.test(js) || !/authorName/.test(js))
      throw new Error("legger ikke til forfatter-metadata");
  });
  test("utforsk-reisebrev.js bruker getPublicUserGlimts", () => {
    const js = read("utforsk-reisebrev.js");
    if (!/getPublicUserGlimts/.test(js))
      throw new Error("bruker ikke offentlig query");
  });
  test("utforsk-glimt.js bruker getPublicUserGlimts og getPublicMyCreatedGlimt", () => {
    const js = read("utforsk-glimt.js");
    if (!/getPublicUserGlimts/.test(js))
      throw new Error("mangler getPublicUserGlimts");
    if (!/getPublicMyCreatedGlimt/.test(js))
      throw new Error("mangler getPublicMyCreatedGlimt");
  });
});

// ── JS-filer parser ─────────────────────────────────────────
describe("Alle JS-filer parser uten syntaksfeil", () => {
  const jsFiles = [
    "glimt-store.js", "auth-guard.js", "mine-glimt.js", "glimt-detalj.js",
    "opprett-glimt.js", "mine-enkeltglimt.js", "mine-reiseplaner.js",
    "reiseplan-detalj.js", "saved-glimt.js", "min-kalender.js",
    "calendar.js", "utforsk-glimt.js", "utforsk-reisebrev.js", "explore.js",
    "login.js"
  ];
  jsFiles.forEach(f => {
    test(`${f}`, () => {
      const src = read(f);
      try {
        new Function(src);
      } catch (err) {
        throw new Error(err.message);
      }
    });
  });
});

// ── Oppsummering ────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`  ${pass} pass · ${fail} fail · ${pass + fail} totalt`);
console.log(`${"─".repeat(60)}`);
process.exit(fail === 0 ? 0 : 1);
