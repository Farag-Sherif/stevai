/**
 * Strip HTML tags (e.g. <p>, </p>, <br>) from a string so they are not shown as literal text.
 * Use for any API text that may contain HTML when displayed as plain text.
 * @param {string} str - Raw string that may contain HTML
 * @returns {string} - Plain text without HTML tags
 */
export function stripHtml(str) {
  if (str == null || typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
