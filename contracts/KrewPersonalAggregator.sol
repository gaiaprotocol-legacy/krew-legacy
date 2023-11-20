// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./KrewPersonal.sol";

contract KrewPersonalAggregator {
    KrewPersonal public immutable subject;

    constructor(KrewPersonal _subject) {
        subject = _subject;
    }

    function getBulkKeyPrices(address[] memory subjects) external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](subjects.length);
        for (uint256 i = 0; i < subjects.length; i++) {
            prices[i] = subject.getBuyPrice(subjects[i], 1);
        }
        return prices;
    }

    function getBulkKeyBalances(address holder, address[] memory subjects) external view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](subjects.length);
        for (uint256 i = 0; i < subjects.length; i++) {
            balances[i] = subject.keysBalance(subjects[i], holder);
        }
        return balances;
    }
}
