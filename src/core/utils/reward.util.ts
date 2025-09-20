export function calculateReward(amount: number): number {
    if (amount >= 100 && amount <= 1000) {
      return Math.floor(Math.random() * (7 - 1 + 1)) + 1; // 1–7
    } else if (amount >= 1001 && amount <= 25000) {
      return Math.floor(Math.random() * (12 - 3 + 1)) + 3; // 3–12
    } else if (amount > 25000) {
      return Math.floor(Math.random() * (50 - 10 + 1)) + 10; // 10–50
    }
    return 0; // below 100, no reward
  }
  