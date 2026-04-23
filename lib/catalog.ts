export type CatalogItem = {
  id: string;
  name: string;
  defaultRate?: number;
};

// Items sourced from Kavi Wholesale Ltd invoice KWL649 (19/04/2026).
// Rates are the last purchase rates — adjust as needed per sale.
export const CATALOG: CatalogItem[] = [
  { id: "wing-beans", name: "Wing beans 12pcs", defaultRate: 2.25 },
  { id: "betel-leave", name: "Betel leave 1pcs", defaultRate: 8.5 },
  { id: "drumstick-leave", name: "Drumstick leave (20pcs)", defaultRate: 2.25 },
  { id: "long-beans", name: "Long beans", defaultRate: 7.75 },
  { id: "km", name: "Km", defaultRate: 2.25 },
  { id: "sundka", name: "Sundka", defaultRate: 2.25 },
  { id: "kappal-banana", name: "Kappal banana 18.400kg", defaultRate: 6.5 },
  { id: "onion-flower", name: "Onion flower 7kg", defaultRate: 9.5 },
  { id: "curry-leaves", name: "Curry leaves (80pcs)", defaultRate: 0.6 },
  { id: "butter-beans", name: "Butter beans 7kg", defaultRate: 7.5 },
  { id: "rasvali", name: "Rasvali", defaultRate: 7.75 },
  { id: "gotukola-mix", name: "Gotukola 6kg mix", defaultRate: 6.75 },
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
