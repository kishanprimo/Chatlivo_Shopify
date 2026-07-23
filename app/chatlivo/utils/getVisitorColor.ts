// ✅ Helper: Bind visitor_id with predefined color & persist in localStorage
export const getVisitorColor = (visitorId: string): string => {
  if (typeof window === "undefined") return "#888888"; // SSR safety

  const storageKey = "visitorColors";
  const storedColors = JSON.parse(localStorage.getItem(storageKey) || "{}");

  // Predefined color list
  const colorList = ["#5C8484", "#84775C", "#72845C"];

  if (storedColors[visitorId]) {
    return storedColors[visitorId];
  }

  // Assign next color in round-robin manner
  const assignedColors = Object.values(storedColors);
  let availableColors = colorList.filter(c => !assignedColors.includes(c));

  if (availableColors.length === 0) {
    // If all colors are used, start reusing from the beginning
    availableColors = colorList;
  }

  const newColor = availableColors[0];

  storedColors[visitorId] = newColor;
  localStorage.setItem(storageKey, JSON.stringify(storedColors));

  return newColor;
}
