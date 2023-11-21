// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

contract KrewPersonal is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address payable;

    address payable public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public krewOwnerFeePercent;

    IERC20 public membershipToken;
    uint256 public membershipWeight;

    uint256 private constant BASE_DIVIDER = 100;

    mapping(address => mapping(address => uint256)) public keysBalance;
    mapping(address => uint256) public keysSupply;
    mapping(address => uint256) public accumulatedFees;

    event SetProtocolFeeDestination(address indexed destination);
    event SetProtocolFeePercent(uint256 percent);
    event SetKrewOwnerFeePercent(uint256 percent);
    event SetMembershipToken(address indexed token);
    event SetMembershipWeight(uint256 weight);

    event Trade(
        address indexed trader,
        address indexed krew,
        bool indexed isBuy,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 krewOwnerFee,
        uint256 supply
    );
    event ClaimKrewFee(address indexed krew, uint256 fee);

    function initialize(
        address payable _protocolFeeDestination,
        uint256 _protocolFeePercent,
        uint256 _krewOwnerFeePercent
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        protocolFeeDestination = _protocolFeeDestination;
        protocolFeePercent = _protocolFeePercent;
        krewOwnerFeePercent = _krewOwnerFeePercent;

        emit SetProtocolFeeDestination(_protocolFeeDestination);
        emit SetProtocolFeePercent(_protocolFeePercent);
        emit SetKrewOwnerFeePercent(_krewOwnerFeePercent);
    }

    function setProtocolFeeDestination(address payable _feeDestination) public onlyOwner {
        protocolFeeDestination = _feeDestination;
        emit SetProtocolFeeDestination(_feeDestination);
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        protocolFeePercent = _feePercent;
        emit SetProtocolFeePercent(_feePercent);
    }

    function setKrewOwnerFeePercent(uint256 _feePercent) public onlyOwner {
        krewOwnerFeePercent = _feePercent;
        emit SetKrewOwnerFeePercent(_feePercent);
    }

    function setMembershipToken(address _token) public onlyOwner {
        membershipToken = IERC20(_token);
        emit SetMembershipToken(_token);
    }

    function setMembershipWeight(uint256 _weight) public onlyOwner {
        require(_weight <= protocolFeePercent, "Weight cannot exceed protocol fee percent");
        membershipWeight = _weight;
        emit SetMembershipWeight(_weight);
    }

    function calculateAdditionalFee(uint256 price, address krewOwner) public view returns (uint256) {
        if (address(membershipToken) == address(0)) {
            return 0;
        }

        uint256 memberBalance = membershipToken.balanceOf(krewOwner);
        uint256 feeIncrease = (((price * membershipWeight) / 1 ether) * memberBalance) / 1 ether;
        uint256 maxAdditionalFee = (price * protocolFeePercent) / 1 ether;

        return feeIncrease < maxAdditionalFee ? feeIncrease : maxAdditionalFee;
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = ((supply * (supply + 1)) * (2 * supply + 1)) / 6;
        uint256 sum2 = (((supply + amount) * (supply + 1 + amount)) * (2 * (supply + amount) + 1)) / 6;
        uint256 summation = sum2 - sum1;
        return (summation * 1 ether) / BASE_DIVIDER;
    }

    function getBuyPrice(address krew, uint256 amount) public view returns (uint256) {
        return getPrice(keysSupply[krew], amount);
    }

    function getSellPrice(address krew, uint256 amount) public view returns (uint256) {
        return getPrice(keysSupply[krew] - amount, amount);
    }

    function getBuyPriceAfterFee(address krew, uint256 amount) public view returns (uint256) {
        uint256 price = getBuyPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 krewOwnerFee = (price * krewOwnerFeePercent) / 1 ether;
        return price + protocolFee + krewOwnerFee;
    }

    function getSellPriceAfterFee(address krew, uint256 amount) public view returns (uint256) {
        uint256 price = getSellPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 krewOwnerFee = (price * krewOwnerFeePercent) / 1 ether;
        return price - protocolFee - krewOwnerFee;
    }

    function executeTrade(address krew, uint256 amount, uint256 price, bool isBuy) private nonReentrant {
        uint256 krewOwnerFee = (price * krewOwnerFeePercent) / 1 ether;
        uint256 additionalFee = calculateAdditionalFee(price, krew);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether - additionalFee;

        uint256 supply = keysSupply[krew];

        if (isBuy) {
            require(msg.value >= price + protocolFee + krewOwnerFee + additionalFee, "Insufficient payment");
            keysBalance[krew][msg.sender] += amount;
            supply += amount;
            keysSupply[krew] = supply;
            accumulatedFees[krew] += krewOwnerFee + additionalFee;
            protocolFeeDestination.sendValue(protocolFee);
            if (msg.value > price + protocolFee + krewOwnerFee + additionalFee) {
                uint256 refund = msg.value - price - protocolFee - krewOwnerFee - additionalFee;
                payable(msg.sender).sendValue(refund);
            }
        } else {
            require(keysBalance[krew][msg.sender] >= amount, "Insufficient keys");
            keysBalance[krew][msg.sender] -= amount;
            supply -= amount;
            keysSupply[krew] = supply;
            uint256 netAmount = price - protocolFee - krewOwnerFee - additionalFee;
            accumulatedFees[krew] += krewOwnerFee + additionalFee;
            payable(msg.sender).sendValue(netAmount);
            protocolFeeDestination.sendValue(protocolFee);
        }

        emit Trade(msg.sender, krew, isBuy, amount, price, protocolFee, krewOwnerFee + additionalFee, supply);
    }

    function buyKeys(address krew, uint256 amount) public payable {
        uint256 price = getBuyPrice(krew, amount);
        executeTrade(krew, amount, price, true);
    }

    function sellKeys(address krew, uint256 amount) public {
        uint256 price = getSellPrice(krew, amount);
        executeTrade(krew, amount, price, false);
    }

    function claimKrewFee() external nonReentrant {
        uint256 fee = accumulatedFees[msg.sender];
        accumulatedFees[msg.sender] = 0;

        payable(msg.sender).sendValue(fee);

        emit ClaimKrewFee(msg.sender, fee);
    }
}
