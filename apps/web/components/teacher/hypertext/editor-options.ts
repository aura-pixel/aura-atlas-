export type Theme = "LIGHT" | "DARK";

export type Palette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
};

export const PALETTES: Palette[] = [
  {
    id: "olive",
    name: "Olive Green",
    primary: "#4D694E",
    secondary: "#FFF3D5",
  },
  {
    id: "teal",
    name: "Teal",
    primary: "#008080",
    secondary: "#F5F5DC",
  },
  {
    id: "cherry",
    name: "Cherry",
    primary: "#890149",
    secondary: "#F3F3E7",
  },
  {
    id: "mocha",
    name: "Mocha",
    primary: "#5E3F27",
    secondary: "#FFDDEF",
  },
  {
    id: "vanilla-lilac",
    name: "Vanilla Lilac",
    primary: "#CBCFF4",
    secondary: "#FFF9DC",
  },
  {
    id: "yellow-sky",
    name: "Yellow Sky",
    primary: "#E8CBEE",
    secondary: "#CBE8F0",
  },
  {
    id: "orange-lemon",
    name: "Orange Dream",
    primary: "#EB9F6E",
    secondary: "#FFEABD",
  },
  {
    id: "vanilla-cocoa",
    name: "Vanilla Cocoa",
    primary: "#EFCEDB",
    secondary: "#4F2B1F",
  },
  {
    id: "east-bay",
    name: "East Bay",
    primary: "#474C80",
    secondary: "#F8F7E2",
  },
];

export const FONT_OPTIONS = [
  {
    id: "Alegreya",
    name: "Alegreya",
    category: "Serif",
  },
  {
    id: "CMU Serif",
    name: "CMU Serif",
    category: "Serif",
  },
  {
    id: "DM Serif Display",
    name: "DM Serif Display",
    category: "Serif",
  },
  {
    id: "Montserrat",
    name: "Montserrat",
    category: "Sans",
  },
  {
    id: "Poppins",
    name: "Poppins",
    category: "Sans",
  },
  {
    id: "Quicksand",
    name: "Quicksand",
    category: "Sans",
  },
  {
    id: "TeX Gyre Termes",
    name: "TeX Gyre Termes",
    category: "Serif",
  },
];

export type CoverOption = {
  id: string;
  name: string;
  background: string;
  accent: string;
  imageUrl?: string;
};

export const COVER_OPTIONS: CoverOption[] = [
  {
    id: "lavender",
    name: "Lavanda",
    background: "linear-gradient(135deg, #F3EFFF, #E6E0FF)",
    accent: "#7D5DFF",
  },
  {
    id: "sage",
    name: "Sage",
    background: "linear-gradient(135deg, #EEF4EC, #DCE9DD)",
    accent: "#4D694E",
  },
  {
    id: "sky",
    name: "Cielo",
    background: "linear-gradient(135deg, #EFF8FA, #D5EDF2)",
    accent: "#008080",
  },
  {
    id: "cherry",
    name: "Cherry",
    background: "linear-gradient(135deg, #F8EAF1, #F1D4E2)",
    accent: "#890149",
  },
  {
    id: "peach",
    name: "Durazno",
    background: "linear-gradient(135deg, #FFF1E7, #FFE0C8)",
    accent: "#EB9F6E",
  },
  {
    id: "night",
    name: "Noche",
    background: "linear-gradient(135deg, #25283A, #161820)",
    accent: "#CBCFF4",
  },
];

export const ILLUSTRATED_COVERS = [
  "/hypertext/covers/1.png",
  "/hypertext/covers/2.png",
  "/hypertext/covers/3.png",
  "/hypertext/covers/4.png",
  "/hypertext/covers/5.png",
  "/hypertext/covers/6.png",
  "/hypertext/covers/7.png",
  "/hypertext/covers/8.png",
];
