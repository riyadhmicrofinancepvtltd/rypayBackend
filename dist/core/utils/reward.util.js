"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReward = calculateReward;
function calculateReward(amount) {
    const amt = Math.floor(Number(amount));
    if (amt >= 100 && amt <= 1000) {
        return Math.floor(Math.random() * 7) + 1;
    }
    else if (amt >= 1001 && amt <= 25000) {
        return Math.floor(Math.random() * 10) + 3;
    }
    else if (amt > 25000) {
        return Math.floor(Math.random() * 41) + 10;
    }
    return 0;
}
//# sourceMappingURL=reward.util.js.map