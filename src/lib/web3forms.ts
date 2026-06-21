/**
 * Web3Forms — serverless form-to-email (no backend). Submissions are POSTed to
 * Web3Forms and delivered straight to the registered inbox.
 *
 * The access key is PUBLIC by design: it only permits delivery to the single
 * email it's registered to, so it's safe to ship in client code (like the
 * Google Maps browser key). Get one free at https://web3forms.com by entering
 * sarah@desertpaddleboards.com — the key arrives by email; paste it below.
 *
 * While the key is empty, callers fall back to a mailto: link so the form
 * still works (just via the visitor's mail client instead of direct delivery).
 */
export const WEB3FORMS_ACCESS_KEY = "c4611b11-880b-48ed-b12d-606e0ed4754c";

export interface Web3FormsResult {
  success: boolean;
  /** "not-configured" when no key is set, else the API/error message. */
  message?: string;
}

/** POST a flat set of fields to Web3Forms. Never throws — returns success:false. */
export async function submitWeb3Form(
  fields: Record<string, string>,
): Promise<Web3FormsResult> {
  if (!WEB3FORMS_ACCESS_KEY) return { success: false, message: "not-configured" };
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        botcheck: "", // honeypot — bots fill this, humans never see it
        ...fields,
      }),
    });
    const data = await res.json();
    return { success: Boolean(data.success), message: data.message };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "network-error" };
  }
}
