const container = document.getElementById("colors");
const resetButton = document.getElementById("reset");
const saturationInput = document.getElementById("planning-saturation");
const saturationValue = document.getElementById("planning-saturation-value");

let currentColors = {};

function setRowEnabled(key, enabled) {
  container.querySelectorAll(`input[type="color"][data-key="${key}"]`).forEach((input) => {
    input.disabled = !enabled;
  });
}

function buildRows(colors) {
  container.innerHTML = "";
  for (const key of Object.keys(DEFAULTS)) {
    const row = document.createElement("div");
    row.className = "color-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = colors[key].enabled;
    checkbox.dataset.key = key;

    const label = document.createElement("span");
    label.className = "color-label";
    label.textContent = LABELS[key];

    const primaryInput = document.createElement("input");
    primaryInput.type = "color";
    primaryInput.value = colors[key].primary;
    primaryInput.disabled = !colors[key].enabled;
    primaryInput.dataset.key = key;
    primaryInput.dataset.variant = "primary";

    const secondaryInput = document.createElement("input");
    secondaryInput.type = "color";
    secondaryInput.value = colors[key].secondary;
    secondaryInput.disabled = !colors[key].enabled;
    secondaryInput.dataset.key = key;
    secondaryInput.dataset.variant = "secondary";

    row.append(checkbox, label, primaryInput, secondaryInput);
    container.appendChild(row);
  }
}

function getStoredColors(callback) {
  chrome.storage.sync.get(["softColors"], (result) => {
    const stored = result.softColors || {};
    const merged = {};
    for (const key of Object.keys(DEFAULTS)) {
      merged[key] = {
        primary: stored[key]?.primary || DEFAULTS[key].primary,
        secondary: stored[key]?.secondary || DEFAULTS[key].secondary,
        enabled: stored[key]?.enabled ?? DEFAULTS[key].enabled,
      };
    }
    callback(merged);
  });
}

container.addEventListener("input", (event) => {
  const input = event.target;
  if (input.tagName !== "INPUT") return;
  const { key, variant } = input.dataset;
  if (input.type === "checkbox") {
    currentColors[key].enabled = input.checked;
    setRowEnabled(key, input.checked);
  } else {
    currentColors[key][variant] = input.value;
  }
  chrome.storage.sync.set({ softColors: currentColors });
});

saturationInput.addEventListener("input", () => {
  saturationValue.textContent = `${saturationInput.value}%`;
  chrome.storage.sync.set({ planningSaturation: Number(saturationInput.value) });
});

resetButton.addEventListener("click", () => {
  chrome.storage.sync.remove(["softColors", "planningSaturation"], () => {
    currentColors = JSON.parse(JSON.stringify(DEFAULTS));
    buildRows(currentColors);
    saturationInput.value = DEFAULT_PLANNING_SATURATION;
    saturationValue.textContent = `${DEFAULT_PLANNING_SATURATION}%`;
  });
});

getStoredColors((colors) => {
  currentColors = colors;
  buildRows(colors);
});

chrome.storage.sync.get(["planningSaturation"], (result) => {
  const value = result.planningSaturation ?? DEFAULT_PLANNING_SATURATION;
  saturationInput.value = value;
  saturationValue.textContent = `${value}%`;
});
