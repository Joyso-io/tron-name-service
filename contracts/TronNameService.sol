pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract TronNameService is Ownable {
    struct Record {
        uint96 id;
        address owner;
        address target;
        uint96 expiredAt;
        uint256 price;
    }

    address public payoutAddress;
    uint96 public count;
    bool public open = false;
    uint256 public sunPerMinute = 694; // 694 sun for 1 minute
    uint256 public fee = 100; // 1%
    mapping (address => bool) public isAdmin;
    mapping (string => Record) private records;
    mapping (uint96 => string) private idToNames;

    event RecordUpdate(uint96 indexed id, address owner, address target, uint96 expiredAt, uint256 price);
    event Trade(uint96 indexed id, address seller, address buyer, uint256 price);

    modifier onlyAdmin {
        require(msg.sender == owner || isAdmin[msg.sender]);
        _;
    }

    modifier onlyOpen {
        require(open);
        _;
    }

    modifier onlyExpired(string memory name) {
        require(expired(name));
        _;
    }

    modifier onlyRecordOwner(string memory name) {
        require(!expired(name) && records[name].owner == msg.sender);
        _;
    }

    modifier onlyRecordOnSale(string memory name) {
        require(!expired(name) && records[name].price > 0);
        _;
    }

    modifier enoughToPay() {
        require(msg.value > sunPerMinute);
        _;
    }

    constructor() public {
        payoutAddress = msg.sender;
    }

    function addToAdmin(address admin, bool isAdd) external onlyOwner {
        isAdmin[admin] = isAdd;
    }

    function setPayoutAddress(address newPayoutAddress) external onlyOwner {
        payoutAddress = newPayoutAddress;
    }

    function setPrice(uint256 price) external onlyAdmin {
        sunPerMinute = price;
    }

    function setFee(uint256 newFee) external onlyAdmin {
        fee = newFee;
    }

    function start() external onlyAdmin {
        open = true;
    }

    function withdraw() external onlyAdmin {
        payoutAddress.transfer(address(this).balance);
    }

    function setRecord(string name, address owner, address target, uint96 expiredAt) external onlyAdmin {
        require(!open);
        require(verifyName(name));
        uint96 id = records[name].id;
        if (id == 0) {
            id = ++count;
            idToNames[id] = name;
            records[name].id = id;
        }
        records[name].owner = owner;
        records[name].target = target;
        records[name].expiredAt = expiredAt;
        emit RecordUpdate(id, owner, target, expiredAt, 0);
    }

    function register(string name, address target) external payable onlyOpen enoughToPay onlyExpired(name) {
        require(verifyName(name));
        uint96 id = records[name].id;
        if (id == 0) {
            id = ++count;
            idToNames[id] = name;
            records[name].id = id;
        }
        records[name].owner = msg.sender;
        records[name].target = target;
        records[name].expiredAt = uint96(now + (msg.value / sunPerMinute) * 60);
        emit RecordUpdate(id, msg.sender, target, records[name].expiredAt, 0);
    }

    function extend(string name) external payable enoughToPay onlyRecordOwner(name) {
        records[name].expiredAt = uint96(now + (msg.value / sunPerMinute) * 60);
        emit RecordUpdate(records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }

    function setTarget(string name, address target) external payable onlyRecordOwner(name) {
        records[name].target = target;
        emit RecordUpdate(records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }

    function sell(string name, uint256 price) external onlyRecordOwner(name) {
        records[name].price = price;
        emit RecordUpdate(records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }

    function give(string name, address newOwner) external onlyRecordOwner(name) {
        records[name].owner = newOwner;
        emit RecordUpdate(records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }

    function buy(string name) external payable onlyRecordOnSale(name) {
        uint256 price = records[name].price;
        require(msg.value >= price);
        uint256 afterFee = price * fee / 10000;
        records[name].owner.transfer(afterFee);
        if (msg.value > price) {
            msg.sender.transfer(msg.value - price);
        }
        emit Trade(records[name].id, records[name].owner, msg.sender, price);
        records[name].owner = msg.sender;
        records[name].price = 0;
        emit RecordUpdate(records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }

    function expired(string memory name) public view returns (bool) {
        return records[name].owner == address(0) || now > records[name].expiredAt;
    }

    function getRecord(string memory name) public view returns (uint96, address, address, uint96, uint256) {
        return (records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }

    function getRecordById(uint96 id) public view returns (uint96, address, address, uint96, uint256) {
        return getRecord(idToNames[id]);
    }

    function getNameById(uint96 id) public view returns (string memory) {
        return idToNames[id];
    }

    function verifyName(string memory name) public pure returns (bool) {
        bytes memory chars = bytes(name);
        for (uint256 i = 0; i < chars.length; ++i) {
            // [0-9a-z] or -
            bool valid = chars[i] >= 97 && chars[i] <= 122 ||
                chars[i] >= 48 && chars[i] <= 57 ||
                chars[i] == 45;
            if (!valid) {
                return false;
            }
        }
        return true;
    }
}
