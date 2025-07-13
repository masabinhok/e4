export function dateConverter(rawDate: string) {
  const date = new Date(rawDate);

  const formatted = date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formatted;
}
