// src/data/config.js
// Stałe konfiguracyjne przeniesione z dawnego app.js

/*  ─────────  ŚCIEŻKI PLIKÓW  ───────── */
export const SVG_FILE = "g17.svg";
export const TEXTURE  = "img/glock17.png";
export const BG = [
  "img/t1.png","img/t2.png","img/t3.png","img/t4.png",
  "img/t5.png","img/t6.png","img/t7.png"
];

/*  ─────────  CENNIK CZĘŚCI  ───────── */
export const PRICE = {
  zamek:    400,
  szkielet: 400,
  spust:    150,
  lufa:     200,
  zerdz:     50,
  pazur:     50,
  zrzut:     50,
  blokadap:  50,
  blokada2:  50,
  pin:       50,
  stopka:   150,
  plytka:     0
};

/*  ─────────  PALETA CERAKOTE  ───────── */
/*  Pełna lista próbników – 1-do-1 z Twojego oryginalnego app.js */
export const COLORS = {
  "H-146 Graphite Black": "#3b3b3b",
  "H-190 Armor Black":    "#212121",
  "H-199 Desert Sand":    "#baa378",
  "H-237 Tungsten":       "#7f7f7f",
  "H-265 Flat Dark Earth":"#907b60",
  "H-267 Magpul FDE":     "#a28b6d",
  "H-170 OD Green":       "#52624d",
  "H-232 Magpul OD Green":"#5a6d4d",
  "H-220 Battleship Grey":"#9da1a3",
  "H-267 Magpul Stealth Grey":"#888c90",
  "H-112 Coyote":         "#816b46",
  "H-109 Tactical Grey":  "#5d5f60",
  "H-312 Kodiak Brown":   "#4d3926",
  "H-148 Burnt Bronze":   "#635543",
  "H-297 Stormtrooper White":"#e7e7e7",
  "H-122 Gold":           "#c6a856",
  "H-141 Prison Pink":    "#f28ab0",
  "H-171 NRA Blue":       "#1b3d7d",
  "H-140 Bright Purple":  "#6c4f8c",
  "H-189 Noveske Bazooka Green":"#5e784c",
  "H-148 Burnt Bronze (Matte)": "#5c4d3d",
  "H-144 Robin's Egg":    "#8fd5d6",
  "H-245 Smith & Wesson Red": "#820f14",
  "H-268 Troy Coyote Tan":"#9f906c",
  "H-190 Armor Black (Satin)": "#2b2b2b",
  "H-127 Kel-Tec Navy Blue":"#003355",
  "H-216 Smith & Wesson Grey":"#77818d",
  "H-224 Sig Dark Grey":  "#4d5154",
  "H-232 Magpul Foliage": "#6d796b",
  "H-236 OD Green (Dark)":"#3f4c37",
  "H-299 USMC Red":       "#8c0000",
  "H-300 USMC Crimson":   "#5e1a17",
  "H-30118 Federal Brown":"#705942",
  "H-30372 Brown Sand":   "#c1b08c",
  "H-30751 Tan Earth":    "#a38e6f",
  "H-400 NRA Brown":      "#4e3d28",
  "H-8000 Milspec Green": "#4c5631",
  "H-210 Sig Pink":       "#eac0c8",
  "H-214 Smith & Wesson Tan":"#968a72"
  /* …jeśli miałeś więcej wpisów, dodaj je poniżej
     klucz = nazwa Cerakote, wartość = hex koloru */
};
