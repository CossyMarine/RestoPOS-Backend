// Returns "2026-06-08" in the user's local timezone
export const getUserLocalDate = (timezone = "UTC") => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
};
