"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReward = calculateReward;
function calculateReward(amount) {
    if (amount >= 100 && amount <= 1000) {
        return Math.floor(Math.random() * (7 - 1 + 1)) + 1;
    }
    else if (amount >= 1001 && amount <= 25000) {
        return Math.floor(Math.random() * (12 - 3 + 1)) + 3;
    }
    else if (amount > 25000) {
        return Math.floor(Math.random() * (50 - 10 + 1)) + 10;
    }
    return 0;
}
//# sourceMappingURL=reward.util.js.map