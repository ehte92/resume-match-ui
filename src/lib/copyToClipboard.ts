/**
 * Copy text to clipboard and return success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

/**
 * Format multiple items as a bulleted list for copying
 */
export function formatAsList(items: string[]): string {
  return items.map((item) => `• ${item}`).join('\n');
}
