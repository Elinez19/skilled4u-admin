export function resolveCategoryArtwork(slugOrTitle: string): string {
  const key = slugOrTitle.toLowerCase();
  if (key.includes("ac") || key.includes("refrig")) {
    return "/images/landing/service-ac.jpg";
  }
  if (key.includes("plumb") || key.includes("pipe")) {
    return "/images/landing/service-plumbing.svg";
  }
  if (key.includes("carpent") || key.includes("wood")) {
    return "/images/landing/service-carpentry.svg";
  }
  if (key.includes("electr") || key.includes("solar") || key.includes("inverter")) {
    return "/images/landing/service-electrical.svg";
  }
  if (key.includes("clean") || key.includes("fumig")) {
    return "/images/landing/service-cleaning.svg";
  }
  return "/images/landing/service-electronics.svg";
}

