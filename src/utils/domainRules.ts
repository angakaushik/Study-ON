// Domain validation, normalization, and alert severity classification for ClassWatch

// Common high-distraction social media, video, streaming, game, and chat domains
export const HIGH_SEVERITY_DOMAINS = new Set([
  'youtube.com',
  'youtu.be',
  'discord.com',
  'discord.gg',
  'instagram.com',
  'tiktok.com',
  'facebook.com',
  'fb.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'roblox.com',
  'twitch.tv',
  'netflix.com',
  'steamcommunity.com',
  'steampowered.com',
  'epicgames.com',
  'spotify.com',
  'whatsapp.com',
  'web.whatsapp.com',
  'telegram.org',
  'snapchat.com',
  'pinterest.com',
  'disneyplus.com',
  'hulu.com',
  'primevideo.com',
  'chess.com',
  'coolmathgames.com',
  'poki.com',
  'krunker.io',
]);

/**
 * Normalizes a raw input domain or URL to a clean lowercase hostname without www.
 */
export function normalizeDomain(rawInput: string): string {
  if (!rawInput) return '';
  let cleaned = rawInput.trim().toLowerCase();

  // Strip protocol if present
  if (cleaned.startsWith('http://')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('https://')) {
    cleaned = cleaned.slice(8);
  }

  // Strip path and query parameters
  const slashIndex = cleaned.indexOf('/');
  if (slashIndex !== -1) {
    cleaned = cleaned.slice(0, slashIndex);
  }
  const colonIndex = cleaned.indexOf(':');
  if (colonIndex !== -1) {
    cleaned = cleaned.slice(0, colonIndex);
  }

  // Strip leading www.
  if (cleaned.startsWith('www.')) {
    cleaned = cleaned.slice(4);
  }

  return cleaned;
}

/**
 * Validates whether an active domain is a real, legitimate external hostname
 * Ignores bare words (e.g. "youtube", "newtab", "localhost"), browser internals ("chrome://", "about:blank"), and extension pages.
 */
export function isValidHostname(domain: string): boolean {
  if (!domain) return false;
  const normalized = normalizeDomain(domain);

  // Ignored internal strings and bare words
  const ignoredPrefixes = ['chrome://', 'chrome-extension://', 'about:', 'moz-extension://', 'edge://'];
  for (const prefix of ignoredPrefixes) {
    if (domain.toLowerCase().startsWith(prefix)) return false;
  }

  const ignoredWords = ['newtab', 'localhost', 'about:blank', 'blank', 'extension', 'away', 'offline'];
  if (ignoredWords.includes(normalized)) return false;

  // Must contain at least one dot
  const dotIndex = normalized.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === normalized.length - 1) {
    return false;
  }

  // TLD must be at least 2 characters (e.g. .org, .com, .edu, .in) and only letters
  const tld = normalized.slice(dotIndex + 1);
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return false;
  }

  return true;
}

/**
 * Checks if a candidate domain is allowed under the teacher's allowlist.
 * Subdomains of an allowed site are treated as allowed:
 * e.g. "en.wikipedia.org" matches allowed "wikipedia.org"
 */
export function isDomainAllowed(domain: string, allowedDomains: string[]): boolean {
  if (!domain) return true;
  const normalized = normalizeDomain(domain);

  for (const allowed of allowedDomains) {
    const normAllowed = normalizeDomain(allowed);
    if (!normAllowed) continue;

    // Exact match or subdomain
    if (normalized === normAllowed || normalized.endsWith('.' + normAllowed)) {
      return true;
    }
  }

  return false;
}

/**
 * Determines alert severity:
 * HIGH for social media, video, chat and games.
 * MEDIUM for other non-allowed sites.
 */
export function getDomainAlertSeverity(domain: string): {
  severity: 'HIGH' | 'MEDIUM';
  reason: string;
} {
  const normalized = normalizeDomain(domain);

  // Check if it matches or is a subdomain of a high severity domain
  for (const highDomain of HIGH_SEVERITY_DOMAINS) {
    if (normalized === highDomain || normalized.endsWith('.' + highDomain)) {
      return {
        severity: 'HIGH',
        reason: 'Social media, video streaming, chat, or gaming site',
      };
    }
  }

  return {
    severity: 'MEDIUM',
    reason: 'Non-allowlisted external website',
  };
}
