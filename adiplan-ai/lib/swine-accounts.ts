/**
 * Top-10 swine accounts per country (seeded for May 7 demo).
 * In production, these come from Adisseo CRM.
 */

export type SwineCountry = "CN" | "VN" | "TH" | "PH";

export interface SwineAccount {
  id: string;
  name: string;
  country: SwineCountry;
  type: "Integrator" | "Premixer" | "Distributor" | "Cooperative";
  notes: string;
  distributorPortfolio: string[];
}

export const swineAccounts: SwineAccount[] = [
  {
    id: "acc-muyuan",
    name: "Muyuan Foods",
    country: "CN",
    type: "Integrator",
    notes: "World's largest pork producer; tech-forward; runs own nutrition R&D.",
    distributorPortfolio: ["Direct"],
  },
  {
    id: "acc-newhope",
    name: "New Hope Liuhe",
    country: "CN",
    type: "Integrator",
    notes: "Vertically integrated; strong premix arm; ASF-resilience focus.",
    distributorPortfolio: ["Direct", "Sichuan Premix Co."],
  },
  {
    id: "acc-wens",
    name: "Wens Foodstuffs",
    country: "CN",
    type: "Integrator",
    notes: "Company+farmer model; vet KOL relationships valuable.",
    distributorPortfolio: ["Direct"],
  },
  {
    id: "acc-cofco-meat",
    name: "COFCO Meat",
    country: "CN",
    type: "Integrator",
    notes: "State-owned; sustainability-reporting pressure from parent.",
    distributorPortfolio: ["Direct"],
  },
  {
    id: "acc-cp-vn",
    name: "CP Vietnam",
    country: "VN",
    type: "Integrator",
    notes: "CPF subsidiary; Mekong Delta strength; vet-led purchasing.",
    distributorPortfolio: ["Direct", "Provincial reps"],
  },
  {
    id: "acc-dabaco",
    name: "Dabaco Group",
    country: "VN",
    type: "Integrator",
    notes: "Northern Vietnam leader; rapid expansion; biosecurity-anxious.",
    distributorPortfolio: ["Direct"],
  },
  {
    id: "acc-mavin",
    name: "Mavin Group",
    country: "VN",
    type: "Integrator",
    notes: "Australian-Vietnamese JV; English-comfortable; export-driven.",
    distributorPortfolio: ["Direct"],
  },
  {
    id: "acc-cpf-th",
    name: "Charoen Pokphand Foods (CPF)",
    country: "TH",
    type: "Integrator",
    notes: "Regional giant; multi-country buying; HQ-level decisions.",
    distributorPortfolio: ["Direct"],
  },
  {
    id: "acc-betagro",
    name: "Betagro",
    country: "TH",
    type: "Integrator",
    notes: "Thai #2; quality + traceability brand; premium positioning.",
    distributorPortfolio: ["Direct", "Aggregator network"],
  },
  {
    id: "acc-sanmiguel",
    name: "San Miguel Foods",
    country: "PH",
    type: "Integrator",
    notes: "Largest PH meat producer; biosecurity rebuilding post-ASF.",
    distributorPortfolio: ["Direct", "Luzon distributor"],
  },
  {
    id: "acc-cp-ph",
    name: "Charoen Pokphand Philippines",
    country: "PH",
    type: "Integrator",
    notes: "Strong contract-grower network; field-vet driven.",
    distributorPortfolio: ["Direct", "Visayas distributor"],
  },
];
