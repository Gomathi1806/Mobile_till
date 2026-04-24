export type CatalogItem = {
  id: string;
  name: string;
  defaultRate?: number;
};

// Friendly Mart catalog — units embedded in the name so the PDF line item is
// self-describing (e.g. "Onion flower (per kg)" vs "Curry leaves (each)").
export const CATALOG: CatalogItem[] = [
  { id: "drumstick-leaves", name: "Drumstick leaves (each)", defaultRate: 3.99 },
  { id: "vallarai", name: "Vallarai (each)", defaultRate: 3.99 },
  { id: "ponnangani-keerai", name: "Ponnangani keerai (each)", defaultRate: 3.99 },
  { id: "agathi-keerai", name: "Agathi keerai (each)", defaultRate: 3.99 },
  { id: "kankun", name: "Kankun (each)", defaultRate: 3.99 },
  { id: "onion-flower", name: "Onion flower (per kg)", defaultRate: 12.99 },
  { id: "ramba-leaves", name: "Ramba leaves (per bag)", defaultRate: 2.49 },
  { id: "curry-leaves", name: "Curry leaves (each)", defaultRate: 0.99 },
  { id: "banana-leaf", name: "Banana leaf (each)", defaultRate: 1.0 },
  { id: "neem-leaves", name: "Neem leaves (each)", defaultRate: 1.0 },
  { id: "betal-leaves", name: "Betal leaves (each)", defaultRate: 1.0 },
  { id: "vilva-leaves", name: "Vilva leaves (each)", defaultRate: 3.0 },
  { id: "mango-leaves", name: "Mango leaves (each)", defaultRate: 1.0 },
  { id: "long-beans", name: "Long beans (per kg)", defaultRate: 8.99 },
  { id: "rasavalli-kilangu", name: "Rasavalli kilangu (per kg)", defaultRate: 9.99 },
  { id: "rambuttan", name: "Rambuttan (per box)", defaultRate: 8.99 },
  { id: "mangoestan", name: "Mangoestan (per box)", defaultRate: 8.99 },
  { id: "pineapple", name: "Pineapple (each)", defaultRate: 2.99 },
  { id: "mango-each", name: "Mango (each)", defaultRate: 2.49 },
  { id: "mango-box", name: "Mango (per box)", defaultRate: 9.99 },
  { id: "jackfruit", name: "Jackfruit (per kg)", defaultRate: 9.99 },
  { id: "guava", name: "Guava (each)", defaultRate: 0.99 },
  { id: "bonji", name: "Bonji (per kg)", defaultRate: 8.99 },
  { id: "amberlla", name: "Amberlla (per kg)", defaultRate: 8.99 },
  { id: "banana-flower", name: "Banana flower (per kg)", defaultRate: 8.99 },
  { id: "white-pavakai", name: "White pavakai (per kg)", defaultRate: 8.99 },
  { id: "banana-stem", name: "Banana stem (per kg)", defaultRate: 8.99 },
  { id: "red-banana-small", name: "Red banana small (per kg)", defaultRate: 9.99 },
  { id: "raw-mango", name: "Raw mango (each)", defaultRate: 1.99 },
  { id: "panag-kilangu", name: "Panag kilangu (each)", defaultRate: 4.99 },
  { id: "wood-apple", name: "Wood apple (per kg)", defaultRate: 9.99 },
  { id: "sev-elani", name: "Sev elani (each)", defaultRate: 4.99 },
  { id: "karunai-kilangu", name: "Karunai kilangu (per kg)", defaultRate: 8.99 },
  { id: "drumstick", name: "Drumstick (per kg)", defaultRate: 8.99 },
  { id: "brinjal-green", name: "Brinjal green (per kg)", defaultRate: 8.99 },
  { id: "brinjal-purple", name: "Brinjal purple (per kg)", defaultRate: 7.99 },
  { id: "brinjal-long", name: "Brinjal long (per kg)", defaultRate: 6.99 },
  { id: "green-chilli", name: "Green chilli (per kg)", defaultRate: 8.99 },
  { id: "garlic", name: "Garlic (per kg)", defaultRate: 4.99 },
  { id: "ginger", name: "Ginger (per kg)", defaultRate: 4.99 },
  { id: "small-onion", name: "Small onion (per kg)", defaultRate: 7.99 },
  { id: "bombay-onion", name: "Bombay onion (each)", defaultRate: 2.99 },
  { id: "watermelon", name: "Watermelon (per kg)", defaultRate: 1.49 },
  { id: "sundaka", name: "Sundaka (each)", defaultRate: 4.99 },
  { id: "parotta-small", name: "Shankar Malabar parotta small (each)", defaultRate: 1.0 },
  { id: "parotta-large", name: "Shankar Malabar parotta large (each)", defaultRate: 2.25 },
  { id: "grated-coconut", name: "Shankar grated coconut (each)", defaultRate: 1.99 },
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
