// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract KrewPersonal is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address payable;
    using ECDSAUpgradeable for bytes32;

    uint256 private constant BASE_DIVIDER = 16000;

    address payable public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public krewOwnerFeePercent;

    address public oracleAddress;

    struct Krew {
        address owner;
        uint256 supply;
        uint256 accumulatedFee;
    }

    uint256 public nextKrewId;
    mapping(uint256 => Krew) public krews;
    mapping(uint256 => mapping(address => uint256)) public holderBalance;

    event SetProtocolFeeDestination(address indexed destination);
    event SetProtocolFeePercent(uint256 percent);
    event SetKrewOwnerFeePercent(uint256 percent);
    event SetOracleAddress(address indexed oracle);

    event KrewCreated(uint256 indexed krewId, address indexed creator);
    event Trade(
        address indexed trader,
        uint256 indexed krew,
        bool indexed isBuy,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 krewOwnerFee,
        uint256 additionalFee,
        uint256 supply
    );
    event ClaimKrewFee(address indexed owner, uint256 indexed krew, uint256 fee);

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

    function setOracleAddress(address _oracle) public onlyOwner {
        oracleAddress = _oracle;
        emit SetOracleAddress(_oracle);
    }

    function splitSignatureData(bytes memory signature) internal pure returns (uint256 feeRatio, bytes32 originalHash) {
        require(signature.length == 96, "KrewPersonal: Invalid signature length");

        // Split the signature into two parts: the feeRatio and the original signed hash
        bytes32 feeRatioBytes;
        assembly {
            feeRatioBytes := mload(add(signature, 32))
            originalHash := mload(add(signature, 64))
        }

        feeRatio = uint256(feeRatioBytes);
        require(feeRatio <= 1 ether, "KrewPersonal: Fee ratio out of bounds");
        return (feeRatio, originalHash);
    }

    function calculateAdditionalTokenOwnerFee(
        uint256 price,
        bytes memory oracleSignature
    ) public view returns (uint256) {
        if (oracleSignature.length == 0) return 0;

        // Extract the fee ratio from the oracle's signed message
        (uint256 feeRatio, bytes32 originalHash) = splitSignatureData(oracleSignature);
        bytes32 hash = keccak256(abi.encodePacked(price, feeRatio)).toEthSignedMessageHash();

        require(originalHash == hash, "KrewPersonal: Invalid data provided");
        address signer = hash.recover(oracleSignature);
        require(signer == oracleAddress, "KrewPersonal: Invalid oracle signature");

        return (price * feeRatio) / 1 ether;
    }

    function createKrew() external {
        uint256 krewId = nextKrewId++;

        Krew storage krew = krews[krewId];
        krew.owner = msg.sender;
        krew.supply = 1;

        holderBalance[krewId][msg.sender] = 1;
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

    function getBuyPriceAfterFee(uint256 krew, uint256 amount) public view returns (uint256) {
        uint256 price = getBuyPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 krewOwnerFee = (price * krewOwnerFeePercent) / 1 ether;
        return price + protocolFee + krewOwnerFee;
    }

    function getSellPriceAfterFee(uint256 krew, uint256 amount) public view returns (uint256) {
        uint256 price = getSellPrice(krew, amount);
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether;
        uint256 krewOwnerFee = (price * krewOwnerFeePercent) / 1 ether;
        return price - protocolFee - krewOwnerFee;
    }

    function executeTrade(
        uint256 krewId,
        uint256 amount,
        uint256 price,
        bool isBuy,
        bytes memory oracleSignature
    ) private nonReentrant {
        require(existsKrew(krewId), "KrewPersonal: Krew does not exist");

        uint256 additionalFee = calculateAdditionalTokenOwnerFee(price, oracleSignature);
        uint256 krewOwnerFee = (price * krewOwnerFeePercent) / 1 ether + additionalFee;
        uint256 protocolFee = (price * protocolFeePercent) / 1 ether - additionalFee;

        Krew storage krew = krews[krewId];
        uint256 supply = krew.supply;

        if (isBuy) {
            require(msg.value >= price + protocolFee + krewOwnerFee, "KrewPersonal: Insufficient payment");
            holderBalance[krewId][msg.sender] += amount;
            supply += amount;
            krew.supply = supply;
            krew.accumulatedFee += krewOwnerFee;
            protocolFeeDestination.sendValue(protocolFee);
            if (msg.value > price + protocolFee + krewOwnerFee) {
                uint256 refund = msg.value - price - protocolFee - krewOwnerFee;
                payable(msg.sender).sendValue(refund);
            }
        } else {
            require(holderBalance[krewId][msg.sender] >= amount, "KrewPersonal: Insufficient keys");
            holderBalance[krewId][msg.sender] -= amount;
            supply -= amount;
            krew.supply = supply;
            uint256 netAmount = price - protocolFee - krewOwnerFee;
            krew.accumulatedFee += krewOwnerFee;
            payable(msg.sender).sendValue(netAmount);
            protocolFeeDestination.sendValue(protocolFee);
        }

        emit Trade(msg.sender, krewId, isBuy, amount, price, protocolFee, krewOwnerFee, additionalFee, supply);
    }

    function buyKeys(uint256 krew, uint256 amount, bytes memory oracleSignature) public payable {
        uint256 price = getBuyPrice(krew, amount);
        executeTrade(krew, amount, price, true, oracleSignature);
    }

    function sellKeys(uint256 krew, uint256 amount, bytes memory oracleSignature) public {
        uint256 price = getSellPrice(krew, amount);
        executeTrade(krew, amount, price, false, oracleSignature);
    }

    function claimKrewFee(uint256 krew) external nonReentrant {
        require(krews[krew].owner == msg.sender, "KrewPersonal: Only krew owner can claim fee");

        uint256 fee = krews[krew].accumulatedFee;
        krews[krew].accumulatedFee = 0;

        payable(msg.sender).sendValue(fee);

        emit ClaimKrewFee(msg.sender, krew, fee);
    }
}
