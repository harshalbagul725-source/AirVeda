import { AQICategory } from "../types";

export interface AQITheme {
  category: AQICategory;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  glowColor: string;
  iconName: "ShieldCheck" | "CheckCircle2" | "AlertCircle" | "AlertTriangle" | "ShieldAlert" | "Flame";
  shortWarning: string;
  cpcbRange: string;
}

export function getAQITheme(category: string | undefined): AQITheme {
  const norm = (category || "").toLowerCase();

  if (norm.includes("good")) {
    return {
      category: "Good",
      colorHex: "#059669",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
      badgeText: "text-emerald-700",
      badgeBorder: "border-emerald-300",
      cardBorder: "border-l-4 border-l-emerald-500",
      glowColor: "rgba(5, 150, 105, 0.2)",
      iconName: "ShieldCheck",
      shortWarning: "Ideal clean air. Safe for all outdoor activities.",
      cpcbRange: "0 - 50",
    };
  } else if (norm.includes("satisfactory")) {
    return {
      category: "Satisfactory",
      colorHex: "#65A30D",
      badgeBg: "bg-lime-50 text-lime-800 border-lime-300",
      badgeText: "text-lime-700",
      badgeBorder: "border-lime-300",
      cardBorder: "border-l-4 border-l-lime-500",
      glowColor: "rgba(101, 163, 13, 0.2)",
      iconName: "CheckCircle2",
      shortWarning: "Acceptable air quality. Minor discomfort for sensitive people.",
      cpcbRange: "51 - 100",
    };
  } else if (norm.includes("moderate")) {
    return {
      category: "Moderate",
      colorHex: "#D97706",
      badgeBg: "bg-amber-50 text-amber-900 border-amber-300",
      badgeText: "text-amber-700",
      badgeBorder: "border-amber-300",
      cardBorder: "border-l-4 border-l-amber-500",
      glowColor: "rgba(217, 119, 6, 0.2)",
      iconName: "AlertCircle",
      shortWarning: "Breathing discomfort to asthmatics & sensitive groups.",
      cpcbRange: "101 - 200",
    };
  } else if (norm.includes("very poor")) {
    return {
      category: "Very Poor",
      colorHex: "#DC2626",
      badgeBg: "bg-red-50 text-red-900 border-red-300",
      badgeText: "text-red-700",
      badgeBorder: "border-red-300",
      cardBorder: "border-l-4 border-l-red-600",
      glowColor: "rgba(220, 38, 38, 0.2)",
      iconName: "ShieldAlert",
      shortWarning: "Respiratory illness on prolonged exposure. Wear N95.",
      cpcbRange: "301 - 400",
    };
  } else if (norm.includes("poor")) {
    return {
      category: "Poor",
      colorHex: "#EA580C",
      badgeBg: "bg-orange-50 text-orange-900 border-orange-300",
      badgeText: "text-orange-700",
      badgeBorder: "border-l-4 border-orange-300",
      cardBorder: "border-l-4 border-l-orange-500",
      glowColor: "rgba(234, 88, 12, 0.2)",
      iconName: "AlertTriangle",
      shortWarning: "Breathing discomfort to most people. Limit outdoor exertion.",
      cpcbRange: "201 - 300",
    };
  } else {
    // Severe / Hazardous
    return {
      category: "Severe",
      colorHex: "#7F1D1D",
      badgeBg: "bg-rose-100 text-rose-950 border-rose-400",
      badgeText: "text-rose-900",
      badgeBorder: "border-rose-400",
      cardBorder: "border-l-4 border-l-rose-800",
      glowColor: "rgba(127, 29, 29, 0.25)",
      iconName: "Flame",
      shortWarning: "Emergency health warning. Avoid all unnecessary outdoor transit.",
      cpcbRange: "401 - 500+",
    };
  }
}

