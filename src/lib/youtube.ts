/**
 * Read the 11-character video ID from a YouTube link or a bare ID.
 * Accepts watch links (youtube.com/watch?v=…), share links (youtu.be/…), embed, shorts and
 * live links, with or without www./m. and extra parameters. Returns null if it isn't one.
 */
export function youtubeId(input: string): string | null {
  const value = input.trim();
  const isId = (s: string | null): s is string => !!s && /^[A-Za-z0-9_-]{11}$/.test(s);
  if (isId(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ?? null;
  }
  return isId(id) ? id : null;
}
