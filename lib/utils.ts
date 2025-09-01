import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomDomain(): string {
  const adjectives = [
    "cool",
    "awesome",
    "amazing",
    "brilliant",
    "clever",
    "dynamic",
  ];
  const nouns = ["faq", "help", "docs", "guide", "info", "support"];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}-${randomNoun}-${randomNumber}`;
}
