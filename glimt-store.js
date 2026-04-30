// ============================================================
//  Glimt – glimt-store.js
//  Sentralt lagringslag som speiler brukerens data i Firestore.
//
//  Struktur i Firestore (per bruker):
//    users/{uid}/userGlimts/{id}      - reisebrev (tidligere "glimt.userGlimts")
//    users/{uid}/myCreatedGlimt/{id}  - egne enkeltglimt ("glimt.myCreatedGlimt")
//    users/{uid}/savedGlimt/{id}      - lagrede glimt fra andre ("glimt.savedGlimt")
//    users/{uid}/myCalendar/{id}      - lagrede events ("glimt.myCalendar")
//    users/{uid}/reiseplaner/{id}     - egne reiseplaner ("glimt.reiseplaner")
//
//  Bruk:
//    await GlimtStore.init(firebase.auth().currentUser.uid)
//    const glimts = GlimtStore.getUserGlimts();           // synkron lesning fra cache
//    await GlimtStore.saveUserGlimt(guide);               // persistér til Firestore
//    await GlimtStore.deleteUserGlimt(id);
//
//  Lesninger er synkrone mot en minne-cache som fylles ved init().
//  Skrivinger oppdaterer cachen umiddelbart og persisterer til
//  Firestore asynkront. Dette bevarer kallesignaturen i resten
//  av appen (som var bygget rundt localStorage).
// ============================================================

(function (global) {
  "use strict";

  // Kolleksjonsnavn i Firestore – speiler tidligere localStorage-nøkler
  const COLLECTIONS = {
    userGlimts:     "userGlimts",
    myCreatedGlimt: "myCreatedGlimt",
    savedGlimt:     "savedGlimt",
    myCalendar:     "myCalendar",
    reiseplaner:    "reiseplaner"
  };

  // Gamle localStorage-nøkler – brukes kun under engangs-migrering
  const LEGACY_KEYS = {
    userGlimts:     "glimt.userGlimts",
    myCreatedGlimt: "glimt.myCreatedGlimt",
    savedGlimt:     "glimt.savedGlimt",
    myCalendar:     "glimt.myCalendar",
    reiseplaner:    "glimt.reiseplaner"
  };

  // Markør i localStorage som viser at migreringen er kjørt
  const MIGRATION_FLAG = "glimt.migratedToFirestore";

  const state = {
    userId: null,
    db: null,
    ready: false,
    readyCallbacks: [],
    cache: {
      userGlimts:     [],
      myCreatedGlimt: [],
      savedGlimt:     [],
      myCalendar:     [],
      reiseplaner:    []
    }
  };

  // ── Intern: generisk lesning ────────────────────────────────
  async function fetchCollection(name) {
    if (!state.db || !state.userId) return [];
    const snap = await state.db
      .collection("users").doc(state.userId)
      .collection(name)
      .get();
    const result = [];
    snap.forEach(doc => {
      const data = doc.data() || {};
      // Behold id-feltet på objektet (dokument-id er kilden til sannheten)
      result.push({ ...data, id: doc.id });
    });
    return result;
  }

  // ── Intern: generisk skriving ───────────────────────────────
  async function writeDoc(name, id, data) {
    if (!state.db || !state.userId) {
      throw new Error("GlimtStore: bruker ikke initialisert");
    }
    // Lagre dokumentet med id-feltet også inne i dokumentet for enkel bruk
    const payload = { ...data, id };
    await state.db
      .collection("users").doc(state.userId)
      .collection(name)
      .doc(id)
      .set(payload);
  }

  async function deleteDoc(name, id) {
    if (!state.db || !state.userId) return;
    await state.db
      .collection("users").doc(state.userId)
      .collection(name)
      .doc(id)
      .delete();
  }

  // ── Intern: hjelper som upserter et objekt i cachen ─────────
  function upsertInCache(arrayName, item) {
    const arr = state.cache[arrayName];
    const i = arr.findIndex(x => x.id === item.id);
    if (i >= 0) arr[i] = item;
    else arr.unshift(item);
  }

  function removeFromCache(arrayName, id) {
    state.cache[arrayName] = state.cache[arrayName].filter(x => x.id !== id);
  }

  // ── Intern: sikre at både Auth og Store er klare ────────────
  // Kastes når Lagre-knappen blir trykket før Firebase Auth er
  // hydrert, eller før GlimtStore.init() er ferdig. Hindrer
  // "stille" Firestore-feil som ellers ville ført til at det
  // nettopp opprettede elementet "forsvinner" ved neste sidelast.
  function assertReady() {
    var hasAuth =
      typeof firebase !== "undefined" &&
      firebase.auth &&
      firebase.auth().currentUser;
    if (!hasAuth) {
      throw new Error("Ikke innlogget");
    }
    if (!state.ready) {
      throw new Error("Lager ikke klart");
    }
    // Sanity-sjekk: cache-bruker matcher innlogget bruker
    if (state.userId && firebase.auth().currentUser.uid !== state.userId) {
      throw new Error("Ikke innlogget");
    }
  }

  // Hent gjeldende cache-element for rollback
  function getFromCache(arrayName, id) {
    return state.cache[arrayName].find(x => x.id === id) || null;
  }

  /**
   * Legg til forfatter-metadata når et element markeres offentlig.
   * Brukes av saveUserGlimt og saveMyCreatedGlimt.
   * - isPublic === true → legg til authorId og authorName.
   * - Ellers: normaliser isPublic til false og fjern eventuell eksisterende
   *   forfatter-info (slik at dokumentet ikke havner i collection-group-
   *   spørringene lenger).
   */
  function enrichForShare(glimt) {
    const result = { ...glimt };
    if (glimt.isPublic === true) {
      result.isPublic  = true;
      result.authorId  = state.userId;
      if (firebase.auth && firebase.auth().currentUser) {
        const u = firebase.auth().currentUser;
        result.authorName = u.displayName || u.email || "Anonym";
      } else {
        result.authorName = glimt.authorName || "Anonym";
      }
    } else {
      result.isPublic = false;
      delete result.authorId;
      delete result.authorName;
    }
    return result;
  }

  // ── Engangs-migrering fra localStorage ──────────────────────
  async function migrateFromLocalStorage() {
    if (localStorage.getItem(MIGRATION_FLAG) === "done") return;

    const entries = [
      ["userGlimts",     LEGACY_KEYS.userGlimts],
      ["myCreatedGlimt", LEGACY_KEYS.myCreatedGlimt],
      ["savedGlimt",     LEGACY_KEYS.savedGlimt],
      ["myCalendar",     LEGACY_KEYS.myCalendar],
      ["reiseplaner",    LEGACY_KEYS.reiseplaner]
    ];

    const batch = state.db.batch();
    let uploaded = 0;

    for (const [coll, key] of entries) {
      let list = [];
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
        }
      } catch (_) {
        continue;
      }

      for (const item of list) {
        if (!item || !item.id) continue;
        // Hopp over demo-data (seedet av appen selv, ikke bruker-opprettet)
        if (String(item.id).startsWith("demo-")) continue;
        if (String(item.id).startsWith("sg-"))   continue;
        if (String(item.id).startsWith("plan-roma-mai")) continue;
        if (String(item.id).startsWith("plan-kobenhavn-sommer")) continue;
        if (String(item.id).startsWith("plan-gardasjoen")) continue;

        const ref = state.db
          .collection("users").doc(state.userId)
          .collection(COLLECTIONS[coll])
          .doc(String(item.id));
        batch.set(ref, { ...item, id: String(item.id) });
        uploaded += 1;
      }
    }

    if (uploaded > 0) {
      try {
        await batch.commit();
        console.info(`GlimtStore: migrerte ${uploaded} element(er) til Firestore`);
      } catch (err) {
        console.warn("GlimtStore: migrering feilet:", err);
        return; // ikke marker som ferdig – vi prøver igjen neste gang
      }
    }

    localStorage.setItem(MIGRATION_FLAG, "done");

    // Ryd opp legacy-nøkler etter vellykket migrering
    Object.values(LEGACY_KEYS).forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  }

  // ── Offentlig API ───────────────────────────────────────────

  const GlimtStore = {
    /**
     * Initialiser lageret for en gitt bruker. Laster alle
     * kolleksjonene inn i cachen og kjører engangs-migrering
     * fra localStorage hvis det ikke er gjort.
     */
    async init(userId) {
      if (!userId) throw new Error("GlimtStore.init krever userId");
      if (state.ready && state.userId === userId) return;

      if (typeof firebase === "undefined" || !firebase.firestore) {
        throw new Error("GlimtStore: firebase.firestore er ikke lastet");
      }

      state.userId = userId;
      state.db = firebase.firestore();

      // Aktiver offline-persistens (best-effort – støttes ikke i alle nettlesere)
      try {
        await state.db.enablePersistence({ synchronizeTabs: true });
      } catch (err) {
        // Kan feile hvis flere faner er åpne eller nettleseren ikke støtter det – ignorer
      }

      // 1) Migrer localStorage først, så den lastes inn når vi henter
      await migrateFromLocalStorage();

      // 2) Last alle kolleksjoner parallelt inn i cachen
      const [ug, mc, sg, cal, rp] = await Promise.all([
        fetchCollection(COLLECTIONS.userGlimts),
        fetchCollection(COLLECTIONS.myCreatedGlimt),
        fetchCollection(COLLECTIONS.savedGlimt),
        fetchCollection(COLLECTIONS.myCalendar),
        fetchCollection(COLLECTIONS.reiseplaner)
      ]);

      state.cache.userGlimts     = ug;
      state.cache.myCreatedGlimt = mc;
      state.cache.savedGlimt     = sg;
      state.cache.myCalendar     = cal;
      state.cache.reiseplaner    = rp;

      // Sorter reisebrev og enkeltglimt nyeste først
      const byCreatedDesc = (a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      state.cache.userGlimts.sort(byCreatedDesc);
      state.cache.myCreatedGlimt.sort(byCreatedDesc);

      state.ready = true;

      // Fyr av registrerte ready-callbacks
      const cbs = state.readyCallbacks.slice();
      state.readyCallbacks = [];
      cbs.forEach(cb => {
        try { cb(); } catch (e) { console.error(e); }
      });
    },

    /** Sjekker om init() er ferdig. */
    isReady() { return state.ready; },

    /** Register en callback som kjøres når init() er fullført. */
    onReady(cb) {
      if (typeof cb !== "function") return;
      if (state.ready) { cb(); return; }
      state.readyCallbacks.push(cb);
    },

    /** Returner innlogget bruker-id (eller null). */
    getUserId() { return state.userId; },

    // ── Reisebrev (userGlimts) ────────────────────────────────
    getUserGlimts() { return state.cache.userGlimts.slice(); },
    getUserGlimt(id) {
      return state.cache.userGlimts.find(g => g.id === id) || null;
    },
    async saveUserGlimt(glimt) {
      if (!glimt || !glimt.id) throw new Error("saveUserGlimt: glimt.id mangler");
      assertReady();
      const enriched = enrichForShare(glimt);
      const previous = getFromCache("userGlimts", enriched.id);
      upsertInCache("userGlimts", enriched);
      try {
        await writeDoc(COLLECTIONS.userGlimts, enriched.id, enriched);
      } catch (err) {
        // Rull tilbake cache-endringen så UI/lesere ikke ser et
        // element som faktisk ikke ble persistert til Firestore.
        if (previous) {
          upsertInCache("userGlimts", previous);
        } else {
          removeFromCache("userGlimts", enriched.id);
        }
        throw err;
      }
    },
    async deleteUserGlimt(id) {
      removeFromCache("userGlimts", id);
      await deleteDoc(COLLECTIONS.userGlimts, id);
    },

    // ── Egne enkeltglimt (myCreatedGlimt) ─────────────────────
    getMyCreatedGlimt() { return state.cache.myCreatedGlimt.slice(); },
    async saveMyCreatedGlimt(glimt) {
      if (!glimt || !glimt.id) throw new Error("saveMyCreatedGlimt: glimt.id mangler");
      assertReady();
      const enriched = enrichForShare(glimt);
      const previous = getFromCache("myCreatedGlimt", enriched.id);
      upsertInCache("myCreatedGlimt", enriched);
      try {
        await writeDoc(COLLECTIONS.myCreatedGlimt, enriched.id, enriched);
      } catch (err) {
        if (previous) {
          upsertInCache("myCreatedGlimt", previous);
        } else {
          removeFromCache("myCreatedGlimt", enriched.id);
        }
        throw err;
      }
    },
    async deleteMyCreatedGlimt(id) {
      removeFromCache("myCreatedGlimt", id);
      await deleteDoc(COLLECTIONS.myCreatedGlimt, id);
    },

    // ── Lagrede glimt fra andre (savedGlimt) ──────────────────
    getSavedGlimt() { return state.cache.savedGlimt.slice(); },
    isGlimtSaved(id) {
      return state.cache.savedGlimt.some(g => g.id === id);
    },
    async addSavedGlimt(glimt) {
      if (!glimt || !glimt.id) return false;
      if (state.cache.savedGlimt.some(g => g.id === glimt.id)) return false;
      assertReady();
      upsertInCache("savedGlimt", glimt);
      try {
        await writeDoc(COLLECTIONS.savedGlimt, glimt.id, glimt);
      } catch (err) {
        removeFromCache("savedGlimt", glimt.id);
        throw err;
      }
      return true;
    },
    async removeSavedGlimt(id) {
      removeFromCache("savedGlimt", id);
      await deleteDoc(COLLECTIONS.savedGlimt, id);
    },

    // ── Kalender-events (myCalendar) ──────────────────────────
    getCalendarEvents() { return state.cache.myCalendar.slice(); },
    async saveCalendarEvent(ev) {
      if (!ev || !ev.id) throw new Error("saveCalendarEvent: ev.id mangler");
      assertReady();
      const previous = getFromCache("myCalendar", ev.id);
      upsertInCache("myCalendar", ev);
      try {
        await writeDoc(COLLECTIONS.myCalendar, ev.id, ev);
      } catch (err) {
        if (previous) {
          upsertInCache("myCalendar", previous);
        } else {
          removeFromCache("myCalendar", ev.id);
        }
        throw err;
      }
    },
    async removeCalendarEvent(id) {
      removeFromCache("myCalendar", id);
      await deleteDoc(COLLECTIONS.myCalendar, id);
    },

    // ── Offentlig delte elementer (på tvers av brukere) ──────
    // Leser kolleksjonsgrupper hvor isPublic == true. Sikkerhets-
    // reglene må inkludere collection-group-lesing (se
    // firestore.rules). Disse metodene går direkte mot Firestore
    // (ingen cache) siden innholdet endres av andre brukere.

    /**
     * Hent alle offentlig delte reisebrev på tvers av brukere.
     * @param {Object} opts  - { city, limit }
     */
    async getPublicUserGlimts(opts) {
      if (!state.db) return [];
      const { city, limit = 60 } = opts || {};
      let q = state.db.collectionGroup("userGlimts")
        .where("isPublic", "==", true)
        .limit(limit);
      const snap = await q.get();
      const out = [];
      snap.forEach(doc => {
        const data = doc.data() || {};
        if (city && data.city !== city) return;
        out.push({ ...data, id: doc.id });
      });
      // Nyeste først
      out.sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      return out;
    },

    /**
     * Hent alle offentlig delte enkeltglimt på tvers av brukere.
     * @param {Object} opts  - { city, limit }
     */
    async getPublicMyCreatedGlimt(opts) {
      if (!state.db) return [];
      const { city, limit = 100 } = opts || {};
      let q = state.db.collectionGroup("myCreatedGlimt")
        .where("isPublic", "==", true)
        .limit(limit);
      const snap = await q.get();
      const out = [];
      snap.forEach(doc => {
        const data = doc.data() || {};
        if (city && data.city !== city) return;
        out.push({ ...data, id: doc.id });
      });
      out.sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      return out;
    },

    // ── Reiseplaner (reiseplaner) ─────────────────────────────
    getPlans() { return state.cache.reiseplaner.slice(); },
    getPlan(id) {
      return state.cache.reiseplaner.find(p => p.id === id) || null;
    },
    async savePlan(plan) {
      if (!plan || !plan.id) throw new Error("savePlan: plan.id mangler");
      assertReady();
      const previous = getFromCache("reiseplaner", plan.id);
      upsertInCache("reiseplaner", plan);
      try {
        await writeDoc(COLLECTIONS.reiseplaner, plan.id, plan);
      } catch (err) {
        if (previous) {
          upsertInCache("reiseplaner", previous);
        } else {
          removeFromCache("reiseplaner", plan.id);
        }
        throw err;
      }
    },
    async deletePlan(id) {
      removeFromCache("reiseplaner", id);
      await deleteDoc(COLLECTIONS.reiseplaner, id);
    },

    /**
     * Persistér en hel liste atomisk. Brukes av eldre kode som
     * tidligere skrev hele localStorage-arrayen om igjen.
     * Gjør diff mot cachen og utfører nødvendige skriv/slett.
     */
    async replaceList(collectionName, newList) {
      const coll = COLLECTIONS[collectionName];
      if (!coll) throw new Error("replaceList: ukjent kolleksjon " + collectionName);
      const existing = state.cache[collectionName] || [];
      const newIds = new Set(newList.map(x => x && x.id).filter(Boolean));
      const existingIds = new Set(existing.map(x => x && x.id).filter(Boolean));

      const batch = state.db.batch();
      const userCol = state.db
        .collection("users").doc(state.userId)
        .collection(coll);

      // Upsert alle nye/oppdaterte
      for (const item of newList) {
        if (!item || !item.id) continue;
        batch.set(userCol.doc(String(item.id)), { ...item, id: String(item.id) });
      }

      // Slett de som er fjernet
      for (const oldId of existingIds) {
        if (!newIds.has(oldId)) {
          batch.delete(userCol.doc(String(oldId)));
        }
      }

      await batch.commit();

      // Oppdater cachen
      state.cache[collectionName] = newList.slice();
    }
  };

  global.GlimtStore = GlimtStore;
})(window);
