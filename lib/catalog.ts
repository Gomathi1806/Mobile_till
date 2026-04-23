export type CatalogItem = {
  id: string;
  name: string;
  defaultRate?: number;
};

export const CATALOG: CatalogItem[] = [
  { id: "item-01", name: "Placeholder Item 1", defaultRate: 0 },
  { id: "item-02", name: "Placeholder Item 2", defaultRate: 0 },
  { id: "item-03", name: "Placeholder Item 3", defaultRate: 0 },
  { id: "item-04", name: "Placeholder Item 4", defaultRate: 0 },
  { id: "item-05", name: "Placeholder Item 5", defaultRate: 0 },
  { id: "item-06", name: "Placeholder Item 6", defaultRate: 0 },
  { id: "item-07", name: "Placeholder Item 7", defaultRate: 0 },
  { id: "item-08", name: "Placeholder Item 8", defaultRate: 0 },
];

export const BUSINESS = {
  name: "YOUR BUSINESS NAME",
  tagline: "Your tagline / short description",
  addressLine1: "Street Address Line 1",
  addressLine2: "City, State - PIN",
  phone: "+91 00000 00000",
  email: "hello@yourbusiness.com",
  gstin: "GSTIN PLACEHOLDER",
  logoUrl: "",
};

export const CURRENCY = "Rs.";
