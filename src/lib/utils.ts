import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a formula syntax string to extract argument names.
 * Example: "=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])"
 * Returns: ["lookup_value", "lookup_array", "return_array", "[if_not_found]"]
 * @param syntax The formula syntax string.
 * @returns An array of argument names.
 */
export function parseArguments(syntax: string): string[] {
  if (!syntax) return [];
  const argString = syntax.match(/\((.*)\)/);
  if (!argString || !argString[1]) {
    return [];
  }
  
  // This simple regex-based split handles nested parentheses poorly, but is sufficient for this app's needs.
  // It splits by commas that are not inside parentheses.
  // For a more robust solution, a more complex parser would be needed.
  return argString[1].split(/,(?![^()]*\))/).map(arg => arg.trim());
}
