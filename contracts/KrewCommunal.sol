// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

contract KrewCommunal is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address payable;

    uint256 private constant BASE_DIVIDER = 16000;
    uint256 private constant ACC_FEE_PRECISION = 1e4;

    address payable public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public holderFeePercent;

    struct Krew {
        uint256 supply;
        uint256 accFeePerUnit;
    }

    struct Holder {
        uint256 balance;
        int256 feeDebt;
    }

    uint256 public nextKrewId;
    mapping(uint256 => Krew) public krews;
    mapping(uint256 => mapping(address => Holder)) public holders;

    event SetProtocolFeeDestination(address indexed destination);
    event SetProtocolFeePercent(uint256 percent);
    event SetHolderFeePercent(uint256 percent);

    event KrewCreated(uint256 indexed krewId, address indexed creator);
    event Trade(
        address indexed trader,
        uint256 indexed krew,
        bool indexed isBuy,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 holderFee,
        uint256 supply
    );
    event ClaimHolderFee(address indexed holder, uint256 indexed krew, uint256 fee);

    function initialize(
        address payable _protocolFeeDestination,
        uint256 _protocolFeePercent,
        uint256 _holderFeePercent
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        protocolFeeDestination = _protocolFeeDestination;
        protocolFeePercent = _protocolFeePercent;
        holderFeePercent = _holderFeePercent;

        emit SetProtocolFeeDestination(_protocolFeeDestination);
        emit SetProtocolFeePercent(_protocolFeePercent);
        emit SetHolderFeePercent(_holderFeePercent);
    }

    function setProtocolFeeDestination(address payable _feeDestination) external onlyOwner {
        protocolFeeDestination = _feeDestination;
        emit SetProtocolFeeDestination(_feeDestination);
    }

    function setProtocolFeePercent(uint256 _feePercent) external onlyOwner {
        protocolFeePercent = _feePercent;
        emit SetProtocolFeePercent(_feePercent);
    }

    function setHolderFeePercent(uint256 _feePercent) external onlyOwner {
        holderFeePercent = _feePercent;
        emit SetHolderFeePercent(_feePercent);
    }

    function createKrew() external {
        uint256 krewId = nextKrewId++;
        krews[krewId].supply = 1;
        holders[krewId][msg.sender].balance = 1;
        emit KrewCreated(krewId, msg.sender);
    }

    function existsKrew(uint256 krewId) public view returns (bool) {
        return krews[krewId].supply > 0;
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = supply == 0 ? 0 : ((supply - 1) * (supply) * (2 * (supply - 1) + 1)) / 6;
        uint256 sum2 = supply == 0 && amount == 1
            ? 0
            : ((supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1)) / 6;
        uint256 summation = sum2 - sum1;
        return (summation * 1 ether) / BASE_DIVIDER;
    }

    function getBuyPrice(uint256 krew, uint256 amount) public view returns (uint256) {
        return getPrice(krews[krew].supply, amount);
    }

    function getSellPrice(uint256 krew, uint256 amount) public view returns (uint256) {
        return getPrice(krews[krew].supply - amount, amount);
    }

    function getBuyPriceAfterFee(uint256 krew, uint256 amount) external view returns (uint256) {
        uint256 price = getBuyPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 holderFee = (price * holderFeePercent) / 1 ether;
        return price + protocolFee + holderFee;
    }

    function getSellPriceAfterFee(uint256 krew, uint256 amount) external view returns (uint256) {
        uint256 price = getSellPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 holderFee = (price * holderFeePercent) / 1 ether;
        return price - protocolFee - holderFee;
    }

    function buyKey(uint256 krew, uint256 amount) external payable nonReentrant {
        require(existsKrew(krew), "KrewCommunal: Krew does not exist");

        uint256 price = getBuyPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 holderFee = (price * holderFeePercent) / 1 ether;

        require(msg.value >= price + protocolFee + holderFee, "KrewCommunal: insufficient payment");

        Krew memory k = krews[krew];
        Holder storage holder = holders[krew][msg.sender];

        holder.balance += amount;
        holder.feeDebt += int256((amount * k.accFeePerUnit) / ACC_FEE_PRECISION);

        k.supply += amount;
        k.accFeePerUnit += (holderFee * ACC_FEE_PRECISION) / k.supply;
        krews[krew] = k;

        protocolFeeDestination.sendValue(protocolFee);
        if (msg.value > price + protocolFee + holderFee) {
            uint256 refund = msg.value - price - protocolFee - holderFee;
            payable(msg.sender).sendValue(refund);
        }

        emit Trade(msg.sender, krew, true, amount, price, protocolFee, holderFee, k.supply);
    }

    function sellKey(uint256 krew, uint256 amount) external nonReentrant {
        require(existsKrew(krew), "KrewCommunal: Krew does not exist");

        uint256 price = getSellPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 holderFee = (price * holderFeePercent) / 1 ether;

        Krew memory k = krews[krew];
        Holder storage holder = holders[krew][msg.sender];

        k.accFeePerUnit += (holderFee * ACC_FEE_PRECISION) / k.supply;
        k.supply -= amount;
        krews[krew] = k;

        require(holder.balance >= amount, "KrewCommunal: insufficient balance");
        holder.balance -= amount;
        holder.feeDebt -= int256((amount * k.accFeePerUnit) / ACC_FEE_PRECISION);

        uint256 netAmount = price - protocolFee - holderFee;
        payable(msg.sender).sendValue(netAmount);
        protocolFeeDestination.sendValue(protocolFee);

        emit Trade(msg.sender, krew, false, amount, price, protocolFee, holderFee, k.supply);
    }

    function claimableHolderFee(uint256 krew, address holder) external view returns (uint256 claimableFee) {
        Krew memory k = krews[krew];
        Holder memory h = holders[krew][holder];

        int256 accumulatedFee = int256((h.balance * k.accFeePerUnit) / ACC_FEE_PRECISION);
        claimableFee = uint256(accumulatedFee - h.feeDebt);
    }

    function claimHolderFee(uint256 krew) external nonReentrant {
        Krew memory k = krews[krew];
        Holder storage holder = holders[krew][msg.sender];

        int256 accumulatedFee = int256((holder.balance * k.accFeePerUnit) / ACC_FEE_PRECISION);
        uint256 claimableFee = uint256(accumulatedFee - holder.feeDebt);

        holder.feeDebt = accumulatedFee;

        payable(msg.sender).sendValue(claimableFee);

        emit ClaimHolderFee(msg.sender, krew, claimableFee);
    }
}
