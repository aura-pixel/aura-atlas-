export const SUBJECT_COLORS = [
  { name: "Rosa empolvado", value: "#E8BCCB" },
  { name: "Durazno", value: "#F2C6AF" },
  { name: "Vainilla", value: "#F1DFAD" },
  { name: "Salvia", value: "#CADABD" },
  { name: "Menta", value: "#BFE0D5" },
  { name: "Cielo", value: "#C4DFF0" },
  { name: "Azul bruma", value: "#C2CFE6" },
  { name: "Lavanda", value: "#D3C7EB" },
  { name: "Malva", value: "#DFC4DE" },
  { name: "Arena", value: "#E4D5C2" },
] as const;

export function getSubjectTextColor(hex: string): string {
  let color = hex.replace(/^#/, "");
  if (color.length === 3)
    color = Array.from(color, (digit) => digit + digit).join("");
  if (!/^[\da-f]{6}$/i.test(color)) return "#FFFDF8";
  const [red, green, blue] = [0, 2, 4].map((offset) => {
    const channel = parseInt(color.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  // Compare contrast against the interface's wine and ivory foregrounds.
  const wineContrast = (luminance + 0.05) / (0.0191 + 0.05);
  const ivoryContrast = (0.983 + 0.05) / (luminance + 0.05);
  return wineContrast >= ivoryContrast ? "#4A1115" : "#FFFDF8";
}
