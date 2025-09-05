import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Product IDs for different plans
export const STRIPE_PRODUCTS = {
  CLIENT_PRO: process.env.STRIPE_CLIENT_PRO_PRODUCT_ID || "prod_client_pro",
  PROFESSIONAL_PRO:
    process.env.STRIPE_PROFESSIONAL_PRO_PRODUCT_ID || "prod_professional_pro",
  BUSINESS_PRO:
    process.env.STRIPE_BUSINESS_PRO_PRODUCT_ID || "prod_business_pro",
} as const;

// Price IDs for different plans
export const STRIPE_PRICES = {
  CLIENT_PRO:
    process.env.STRIPE_CLIENT_PRO_PRICE_ID || "price_1S40W1Pe85E4xQkNkzxqosuG", // Created programmatically
  PROFESSIONAL_PRO:
    process.env.STRIPE_PROFESSIONAL_PRO_PRICE_ID ||
    "price_1S40W1Pe85E4xQkNq8fiEzzg", // Created programmatically
  BUSINESS_PRO:
    process.env.STRIPE_BUSINESS_PRO_PRICE_ID ||
    "price_1S40W2Pe85E4xQkNYpjEmY5v", // Created programmatically
} as const;
