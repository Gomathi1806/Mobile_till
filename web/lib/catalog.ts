export const UNITS = ["kg", "g", "bunch", "single"] as const;
export type Unit = (typeof UNITS)[number];

export type CatalogItem = {
  id: string;
  /**
   * Clean display name (no embedded units). The cashier picks the unit per
   * line at ring-up time, so names like "Long beans (per kg)" are now just
   * "Long beans". Variants where the difference IS the unit (e.g. boxed vs
   * loose) keep a parenthesised hint — "Mango" vs "Mango (box)".
   */
  name: string;
  /** Unit used by default when this tile is tapped. Cashier can override. */
  defaultUnit: Unit;
  /** Default rate per the `defaultUnit`. Optional — newer items may be blank. */
  defaultRate?: number;
  /** Quick visual fallback. Shown when `image` is absent. */
  emoji: string;
  /**
   * Optional path to a real product photo (e.g. `/items/mango.jpg`).
   * When present, the tile shows the photo instead of the emoji.
   */
  image?: string;
};

// Friendly Mart catalog. Existing items retain their kg/each rates; the unit
// is now a per-line choice on the receipt rather than baked into the name.
export const CATALOG: CatalogItem[] = [
  // Leafy greens — typically sold by bunch.
  { id: "drumstick-leaves", name: "Drumstick leaves", defaultUnit: "bunch", defaultRate: 3.99, emoji: "🌿", image: "/items/drumstick-leaves.jpg" },
  { id: "vallarai", name: "Vallarai", defaultUnit: "bunch", defaultRate: 3.99, emoji: "🌿" },
  { id: "ponnangani-keerai", name: "Ponnangani keerai", defaultUnit: "bunch", defaultRate: 3.99, emoji: "🌿", image: "/items/ponnangani-keerai.jpg" },
  { id: "agathi-keerai", name: "Agathi keerai", defaultUnit: "bunch", defaultRate: 3.99, emoji: "🌿", image: "/items/agathi-keerai.jpg" },
  { id: "kankun", name: "Kankun", defaultUnit: "bunch", defaultRate: 3.99, emoji: "🥬" },
  { id: "curry-leaves", name: "Curry leaves", defaultUnit: "bunch", defaultRate: 0.99, emoji: "🍃", image: "/items/curry-leaves.jpg" },
  { id: "greens", name: "Greens", defaultUnit: "bunch", emoji: "🌿", image: "/items/greens.jpg" },

  // Single-leaf items.
  { id: "banana-leaf", name: "Banana leaf", defaultUnit: "single", defaultRate: 1.0, emoji: "🍌", image: "/items/banana-leaf.jpg" },
  { id: "neem-leaves", name: "Neem leaves", defaultUnit: "single", defaultRate: 1.0, emoji: "🌿", image: "/items/neem-leaves.jpg" },
  { id: "betal-leaves", name: "Betal leaves", defaultUnit: "single", defaultRate: 1.0, emoji: "🌿" },
  { id: "vilva-leaves", name: "Vilva leaves", defaultUnit: "single", defaultRate: 3.0, emoji: "🍀", image: "/items/vilva-leaves.jpg" },
  { id: "mango-leaves", name: "Mango leaves", defaultUnit: "single", defaultRate: 1.0, emoji: "🌿", image: "/items/mango-leaves.jpg" },

  // Bagged / packaged.
  { id: "ramba-leaves", name: "Ramba leaves (bag)", defaultUnit: "single", defaultRate: 2.49, emoji: "🌿" },

  // Roots, gourds, vegetables — by kg.
  { id: "onion-flower", name: "Onion flower", defaultUnit: "kg", defaultRate: 12.99, emoji: "🌸" },
  { id: "long-beans", name: "Long beans", defaultUnit: "kg", defaultRate: 8.99, emoji: "🫛" },
  { id: "rasavalli-kilangu", name: "Rasavalli kilangu", defaultUnit: "kg", defaultRate: 9.99, emoji: "🍠" },
  { id: "jackfruit", name: "Jackfruit", defaultUnit: "kg", defaultRate: 9.99, emoji: "🌳", image: "/items/jackfruit.jpg" },
  { id: "bonji", name: "Bonji", defaultUnit: "kg", defaultRate: 8.99, emoji: "🥒" },
  { id: "amberlla", name: "Amberlla", defaultUnit: "kg", defaultRate: 8.99, emoji: "🥒" },
  { id: "banana-flower", name: "Banana flower", defaultUnit: "kg", defaultRate: 8.99, emoji: "🌺", image: "/items/banana-flower.jpg" },
  { id: "white-pavakai", name: "White pavakai", defaultUnit: "kg", defaultRate: 8.99, emoji: "🥒", image: "/items/white-pavakai.jpg" },
  { id: "pavakai", name: "Pavakai", defaultUnit: "kg", emoji: "🥒", image: "/items/pavakai.jpg" },
  { id: "banana-stem", name: "Banana stem", defaultUnit: "kg", defaultRate: 8.99, emoji: "🌱", image: "/items/banana-stem.jpg" },
  { id: "red-banana-small", name: "Red banana (small)", defaultUnit: "kg", defaultRate: 9.99, emoji: "🍌", image: "/items/red-banana-small.jpg" },
  { id: "karunai-kilangu", name: "Karunai kilangu", defaultUnit: "kg", defaultRate: 8.99, emoji: "🍠", image: "/items/karunai-kilangu.jpg" },
  { id: "drumstick", name: "Drumstick", defaultUnit: "kg", defaultRate: 8.99, emoji: "🌿", image: "/items/drumstick.jpg" },
  { id: "brinjal-green", name: "Brinjal (green)", defaultUnit: "kg", defaultRate: 8.99, emoji: "🍆" },
  { id: "brinjal-purple", name: "Brinjal (purple)", defaultUnit: "kg", defaultRate: 7.99, emoji: "🍆" },
  { id: "brinjal-long", name: "Brinjal (long)", defaultUnit: "kg", defaultRate: 6.99, emoji: "🍆" },
  { id: "green-chilli", name: "Green chilli", defaultUnit: "kg", defaultRate: 8.99, emoji: "🌶️" },
  { id: "garlic", name: "Garlic", defaultUnit: "kg", defaultRate: 4.99, emoji: "🧄" },
  { id: "ginger", name: "Ginger", defaultUnit: "kg", defaultRate: 4.99, emoji: "🫚" },
  { id: "small-onion", name: "Small onion", defaultUnit: "kg", defaultRate: 7.99, emoji: "🧅" },
  { id: "watermelon", name: "Watermelon", defaultUnit: "kg", defaultRate: 1.49, emoji: "🍉" },

  // Single-piece fruit.
  { id: "pineapple", name: "Pineapple", defaultUnit: "single", defaultRate: 2.99, emoji: "🍍" },
  { id: "mango", name: "Mango", defaultUnit: "single", defaultRate: 2.49, emoji: "🥭" },
  { id: "mango-box", name: "Mango (box)", defaultUnit: "single", defaultRate: 9.99, emoji: "🥭" },
  { id: "rambuttan", name: "Rambuttan (box)", defaultUnit: "single", defaultRate: 8.99, emoji: "🍒" },
  { id: "mangoestan", name: "Mangoestan (box)", defaultUnit: "single", defaultRate: 8.99, emoji: "🍑" },
  { id: "guava", name: "Guava", defaultUnit: "single", defaultRate: 0.99, emoji: "🍐", image: "/items/guava.jpg" },
  { id: "custard-apple", name: "Custard apple", defaultUnit: "single", emoji: "🟢", image: "/items/custard-apple.jpg" },
  { id: "raw-mango", name: "Raw mango", defaultUnit: "single", defaultRate: 1.99, emoji: "🥭" },
  { id: "panag-kilangu", name: "Panag kilangu", defaultUnit: "single", defaultRate: 4.99, emoji: "🍠" },
  { id: "elani", name: "Elani", defaultUnit: "single", emoji: "🥥", image: "/items/elani.jpg" },
  { id: "sev-elani", name: "Sev elani", defaultUnit: "single", defaultRate: 4.99, emoji: "🥔", image: "/items/sev-elani.jpg" },
  { id: "bombay-onion", name: "Bombay onion", defaultUnit: "single", defaultRate: 2.99, emoji: "🧅" },
  { id: "sundaka", name: "Sundaka", defaultUnit: "single", defaultRate: 4.99, emoji: "🫐", image: "/items/sundaka.jpg" },

  // Bakery / packaged.
  { id: "parotta-small", name: "Shankar Malabar parotta (small)", defaultUnit: "single", defaultRate: 1.0, emoji: "🫓" },
  { id: "parotta-large", name: "Shankar Malabar parotta (large)", defaultUnit: "single", defaultRate: 2.25, emoji: "🫓" },
  { id: "grated-coconut", name: "Shankar grated coconut", defaultUnit: "single", defaultRate: 1.99, emoji: "🥥", image: "/items/grated-coconut.jpg" },

  // ───── New items (no defaultRate yet — cashier types rate at ring-up) ─────
  { id: "ashgourd", name: "Ash gourd", defaultUnit: "kg", emoji: "🥒", image: "/items/ashgourd.jpg" },
  { id: "bird-eye-chilli", name: "Bird eye chilli", defaultUnit: "g", emoji: "🌶️", image: "/items/bird-eye-chilli.jpg" },
  { id: "chinese-long-beans", name: "Chinese long beans", defaultUnit: "bunch", emoji: "🫛", image: "/items/chinese-long-beans.jpg" },
  { id: "cluster-beans", name: "Cluster beans", defaultUnit: "kg", emoji: "🫛", image: "/items/cluster-beans.jpg" },
  { id: "coconut-whole", name: "Coconut (whole)", defaultUnit: "single", emoji: "🥥", image: "/items/coconut-whole.jpg" },
  { id: "green-plantains", name: "Green plantains", defaultUnit: "kg", emoji: "🍌", image: "/items/green-plantains.jpg" },
  { id: "gooseberry", name: "Gooseberry", defaultUnit: "kg", emoji: "🫐", image: "/items/gooseberry.jpg" },
  { id: "gooseberry-pack", name: "Gooseberry (pack)", defaultUnit: "single", emoji: "🫐", image: "/items/gooseberry-pack.jpg" },
];

export const BUSINESS = {
  name: "FRIENDLY MART",
  tagline: "Good Food, Good Mood, Friendly Neighbourhood",
  addressLine1: "59B London Road",
  addressLine2: "Grantham, NG31 6ET",
  phone: "Tel: 01476 249369",
  email: "",
  vat: "",
  logoUrl: "/logo.png",
};

export const CURRENCY = "£";

/**
 * Short label for a unit on receipts and PDFs. "single" reads awkwardly so
 * we map it to the cashier convention "ea" (each).
 */
export function unitLabel(unit: Unit): string {
  return unit === "single" ? "ea" : unit;
}
