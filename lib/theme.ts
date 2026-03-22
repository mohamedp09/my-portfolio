export type Theme = "dark" | "light";

export function resolveTheme(cookie: string | undefined): Theme {
  return cookie === "light" ? "light" : "dark";
}
