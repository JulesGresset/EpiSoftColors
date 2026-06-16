console.log("Extension 'EpiSoftColors' active");

function buildColorOverride(key, value) {
  let css = `--soft-${key}: ${value.primary};`;
  css += `--soft-secondary-${key}: ${value.secondary};`;
  css += `--mantine-color-${key}-filled: var(--soft-${key}) !important;`;
  for (let i = 0; i <= 9; i++) {
    css += `--mantine-color-${key}-${i}: var(--soft-${key}) !important;`;
    css += `--mantine-color-${key}-light-${i}: var(--soft-${key}) !important;`;
    css += `--mantine-color-${key}-secondary-${i}: var(--soft-secondary-${key}) !important;`;
  }
  return css;
}

function buildCSSText(colors, planningSaturation) {
  let css = ":root {";
  for (const [key, value] of Object.entries(colors)) {
    if (value.enabled === false) continue;
    css += buildColorOverride(key, value);
  }
  css += "}";
  css += `.fc-event { filter: saturate(${planningSaturation}%) !important; }`;
  return css;
}

function getOrCreateStyleTag() {
  let style = document.getElementById("episoftcolors-custom");
  if (!style) {
    style = document.createElement("style");
    style.id = "episoftcolors-custom";
    document.head.appendChild(style);
  }
  return style;
}

function mergeColors(stored) {
  const merged = {};
  for (const key of Object.keys(DEFAULTS)) {
    merged[key] = {
      primary: stored[key]?.primary || DEFAULTS[key].primary,
      secondary: stored[key]?.secondary || DEFAULTS[key].secondary,
      enabled: stored[key]?.enabled ?? DEFAULTS[key].enabled,
    };
  }
  return merged;
}

function applyCustomStyles(softColors, planningSaturation) {
  const colors = mergeColors(softColors || {});
  const saturation = planningSaturation ?? DEFAULT_PLANNING_SATURATION;
  getOrCreateStyleTag().textContent = buildCSSText(colors, saturation);
}

chrome.storage.sync.get(["softColors", "planningSaturation"], (result) => {
  applyCustomStyles(result.softColors, result.planningSaturation);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (!changes.softColors && !changes.planningSaturation) return;
  chrome.storage.sync.get(["softColors", "planningSaturation"], (result) => {
    applyCustomStyles(result.softColors, result.planningSaturation);
  });
});
