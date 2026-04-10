const select = document.getElementById("eventType");
const gasten = document.getElementById("gasten");
const datum = document.getElementById("Datum");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const stepIndicator = document.getElementById("stepIndicator");

const steps = document.querySelectorAll(".step");
const totalSteps = 5;
let currentStep = 1;

// Samenvatting
const sumEvent = document.getElementById("sumEvent");
const sumGuests = document.getElementById("sumGuests");
const sumDate = document.getElementById("sumDate");
const sumRoom = document.getElementById("sumRoom");

// ✅ Nieuw (stap 3): items + totaal in samenvatting
const sumItems = document.getElementById("sumItems");
const sumTotal = document.getElementById("sumTotal");

// State
const state = { eventType: "", guests: "", date: "", room: "", items: [] };

// Stap 4 elementen (kunnen null zijn)
const offerBtn = document.getElementById("offerBtn");
const akkoord = document.getElementById("akkoord");
const backToStep2 = document.getElementById("backToStep2");

const eventNaam = document.getElementById("eventNaam");
const voornaam = document.getElementById("voornaam");
const achternaam = document.getElementById("achternaam");
const email = document.getElementById("email");

/* =========================
   Stap 3: item catalogus
========================= */
const ITEM_CATALOG = {
  "piatti-ontbijt": { name: "Piatti ontbijt", pricePP: 13.30 },
  "piatti-luxe": { name: "Piatti luxe ontbijt", pricePP: 20.64 },
  "koffie-thee": { name: "Koffie / thee + Sweets", pricePP: 8.72 },
  "juice-healthy": { name: "Juice of the day + Healthy bite", pricePP: 8.72 },
};

function formatEUR(amount) {
  return amount.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function showStep(step) {
  steps.forEach(s => s.classList.remove("active"));
  const el = document.querySelector(`.step[data-step="${step}"]`);
  if (el) el.classList.add("active");

  stepIndicator.textContent = `Stap ${step} / ${totalSteps}`;

  // standaard footer knoppen
  prevBtn.style.display = "inline-flex";
  prevBtn.disabled = (step === 1);
  nextBtn.textContent = "Volgende →";

  // STAP 4: tekst aanpassen + knoppen in de content verbergen
  if (step === 4) {
    nextBtn.textContent = "Offerte aanvragen";

    if (backToStep2) backToStep2.style.display = "none";
    if (offerBtn) offerBtn.style.display = "none";
  } else {
    // op andere stappen weer tonen (als je ze ooit nodig hebt)
    if (backToStep2) backToStep2.style.display = "";
    if (offerBtn) offerBtn.style.display = "";
  }

  // STAP 5: klaar
  if (step === 5) {
    nextBtn.textContent = "Klaar →";
  }

  updateNextButton();
}

function updateSummary() {
  sumEvent.textContent = state.eventType ? `Soort event: ${state.eventType}` : "—";
  sumGuests.textContent = state.guests ? `Aantal gasten: ${state.guests}` : "—";
  sumDate.textContent = state.date ? `Datum: ${state.date}` : "—";
  sumRoom.textContent = state.room ? `Ruimte: ${state.room}` : "—";

  // ✅ Items + totaal (stap 3)
  if (sumItems) sumItems.innerHTML = "";

  const guests = Number(state.guests || 0);
  let total = 0;

  state.items.forEach((id) => {
    const item = ITEM_CATALOG[id];
    if (!item) return;

    const line = item.pricePP * guests;
    total += line;

    if (sumItems) {
      const row = document.createElement("div");
      row.className = "sum-item-row";
      row.innerHTML = `
        <span>${item.name}</span>
        <span>${formatEUR(line)}</span>
      `;
      sumItems.appendChild(row);
    }
  });

  if (sumTotal) sumTotal.textContent = formatEUR(total);
}

function step1Valid() {
  const gastenNum = Number(gasten.value);
  return select.value !== "" && gasten.value !== "" && Number.isFinite(gastenNum) && gastenNum > 0;
}

function step2Valid() {
  return !!document.querySelector('input[name="ruimte"]:checked');
}

function step4Valid() {
  const ok =
    eventNaam?.value.trim() &&
    voornaam?.value.trim() &&
    achternaam?.value.trim() &&
    email?.value.trim() &&
    akkoord?.checked;

  return !!ok;
}

// (optioneel) wil je stap 3 verplicht maken? Zet dit op true
const REQUIRE_AT_LEAST_ONE_ITEM = false;

function step3Valid() {
  if (!REQUIRE_AT_LEAST_ONE_ITEM) return true;
  return state.items.length > 0;
}

function updateNextButton() {
  if (currentStep === 1) nextBtn.disabled = !step1Valid();
  else if (currentStep === 2) nextBtn.disabled = !step2Valid();
  else if (currentStep === 3) nextBtn.disabled = !step3Valid();
  else if (currentStep === 4) nextBtn.disabled = !step4Valid();
  else nextBtn.disabled = false; // stap 5
}

/* Step 1 listeners */
select.addEventListener("change", () => {
  state.eventType = select.value;
  updateSummary();
  updateNextButton();
});

gasten.addEventListener("input", () => {
  state.guests = gasten.value;
  updateSummary();
  updateNextButton();
});

datum.addEventListener("input", () => {
  state.date = datum.value; // optioneel
  updateSummary();
});

/* Step 2: room cards */
const roomCards = document.querySelectorAll(".room-card");
const roomButtons = document.querySelectorAll("[data-select-room]");

const roomRestaurant = document.getElementById("roomRestaurant");
const roomZuid = document.getElementById("roomZuid");

function selectRoom(room) {
  if (room === "Restaurant" && roomRestaurant) roomRestaurant.checked = true;
  if (room === "Zuid" && roomZuid) roomZuid.checked = true;

  state.room = room;
  updateSummary();

  roomCards.forEach(card => {
    card.classList.toggle("selected", card.dataset.room === room);
  });

  updateNextButton();
}

roomButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectRoom(btn.dataset.selectRoom);
  });
});

roomCards.forEach(card => {
  card.addEventListener("click", () => {
    selectRoom(card.dataset.room);
  });
});

// ===== STEP 3: items + totaal =====
const itemsListEl = document.querySelector(".items-list"); // wrapper van de item-rows
const sumItemsEl = document.getElementById("sumItems");
const sumTotalEl = document.getElementById("sumTotal");

state.items = state.items || []; // [{name, price}]

function formatEuro(num) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(num);
}

function getGuestsCount() {
  const n = Number(gasten?.value || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function updateItemsSummary() {
  if (!sumItemsEl || !sumTotalEl) return;

  // lijst
  if (state.items.length === 0) {
    sumItemsEl.innerHTML = "";
  } else {
    sumItemsEl.innerHTML = state.items
      .map(item => {
        const lineTotal = item.price * getGuestsCount();
        return `
          <div class="sum-item-row">
            <span>${item.name}</span>
            <span>${formatEuro(lineTotal)}</span>
          </div>
        `;
      })
      .join("");
  }

  // totaal
  const total = state.items.reduce((acc, item) => acc + item.price * getGuestsCount(), 0);
  sumTotalEl.textContent = formatEuro(total);
}

// Event delegation: werkt ook als je HTML later wijzigt
if (itemsListEl) {
  itemsListEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".item-btn");
    if (!btn) return;

    const row = btn.closest(".item-row");
    if (!row) return;

    const name = row.dataset.name;
    const price = Number(String(row.dataset.price || "").replace(",", "."));

    if (!name || !Number.isFinite(price)) {
      console.warn("Item mist data-name of data-price:", row);
      return;
    }

    const existingIndex = state.items.findIndex(i => i.name === name);

    if (existingIndex >= 0) {
      // verwijderen
      state.items.splice(existingIndex, 1);
      btn.classList.remove("added");
      btn.innerHTML = "<span>+</span>";
    } else {
      // toevoegen
      state.items.push({ name, price });
      btn.classList.add("added");
      btn.innerHTML = "<span>✓</span>";
    }

    updateItemsSummary();
  });
}

// Als aantal gasten verandert: totalen opnieuw rekenen
if (gasten) {
  gasten.addEventListener("input", () => {
    updateItemsSummary();
  });
}

// init
updateItemsSummary();


/* Stap 4 input listeners (voor validatie van de onderste knop) */
[eventNaam, voornaam, achternaam, email].forEach(el => {
  if (!el) return;
  el.addEventListener("input", () => {
    updateNextButton();
  });
});
if (akkoord) akkoord.addEventListener("change", updateNextButton);

/* Volgende / Terug */
nextBtn.addEventListener("click", () => {
  if (nextBtn.disabled) return;

  // stap 5: klaar → terug naar index.html
  if (currentStep === 5) {
    window.location.href = "index.html";
    return;
  }

  // normaal door naar volgende stap: 1->2->3->4->5
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
});

// init
updateSummary();
showStep(currentStep);
updateNextButton();
