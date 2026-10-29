import {
  Bicycle,
  CabinBag,
  GolfBag,
  LargeCase,
  Luggage,
  MediumCase,
  Ski,
  Stroller,
  Water,
  Wheelchair,
  WinterSport,
} from "../../svg";

export function getLuggageIcon(name?: string) {
  const key = (name || "").toLowerCase();
  if (key.includes("large")) return LargeCase;
  if (key.includes("medium")) return MediumCase;
  if (key.includes("cabin") || key.includes("hand") || key.includes("carry")) return CabinBag;
  if (key.includes("bicycle") || key.includes("bike")) return Bicycle;
  if (key.includes("stroller") || key.includes("baby")) return Stroller;
  if (key.includes("ski")) return Ski;
  if (key.includes("winter") || key.includes("snow")) return WinterSport;
  if (key.includes("golf")) return GolfBag;
  if (key.includes("wheelchair") || key.includes("accessible")) return Wheelchair;
  if (key.includes("water")) return Water;
  return Luggage;
}
