export function calculateReward(amount: number): number {
  const amt = Math.floor(Number(amount)); // ensure integer
  if (amt >= 100 && amt <= 1000) {
    return Math.floor(Math.random() * 7) + 1; // 1–7
  } else if (amt >= 1001 && amt <= 25000) {
    return Math.floor(Math.random() * 10) + 3; // 3–12
  } else if (amt > 25000) {
    return Math.floor(Math.random() * 41) + 10; // 10–50
  }
  return 0;
}
