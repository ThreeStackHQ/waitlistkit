/**
 * Blocks known disposable / free-spam email domains.
 * List covers the most commonly abused TLDs and providers.
 * Extend as needed.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Free spam TLDs (Freenom)
  "tk", "ml", "cf", "ga", "gq",
  // Common disposable providers
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.info",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "spam4.me",
  "trashmail.com",
  "trashmail.at",
  "trashmail.io",
  "trashmail.me",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "dispostable.com",
  "mailnull.com",
  "maildrop.cc",
  "throwam.com",
  "throwam.com",
  "fakeinbox.com",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spam.la",
  "getairmail.com",
  "filzmail.com",
  "wnauq.com",
  "mailnew.com",
  "discard.email",
  "spamex.com",
  "mailexpire.com",
  "sharklasers.com",
]);

/**
 * Returns true if the email uses a disposable domain and should be rejected.
 */
export function isDisposableEmail(email: string): boolean {
  const lower = email.toLowerCase();
  const atIdx = lower.lastIndexOf("@");
  if (atIdx === -1) return false;

  const domain = lower.slice(atIdx + 1);
  // Check full domain
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // Check TLD only (e.g. "anything.tk")
  const tld = domain.split(".").pop() ?? "";
  if (DISPOSABLE_DOMAINS.has(tld)) return true;

  return false;
}
