// In-memory history storage
// In a production app, this would be stored in a database

interface HistoryEntry {
  expression: string;
  result: number;
  timestamp: string;
}

let calculationHistory: HistoryEntry[] = [];

export function getHistory(): HistoryEntry[] {
  return [...calculationHistory]; // Return a copy to prevent mutation
}

export function addToHistory(entry: HistoryEntry): void {
  calculationHistory.unshift(entry); // Add to beginning for most recent first
  
  // Keep only the last 50 entries
  if (calculationHistory.length > 50) {
    calculationHistory = calculationHistory.slice(0, 50);
  }
}

export function clearHistory(): void {
  calculationHistory = [];
}