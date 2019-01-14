pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract TronNameService is Ownable {
    struct Record {
        address owner;
        address target;
        uint96 expiredAt;
        uint256 price;
    }

    address public payoutAddress;
    uint256 public sunPerMinute = 694; // 694 sun for 1 minute
    uint256 public fee = 100; // 1%
    mapping (address => bool) public isAdmin;
    mapping (string => Record) records;

    modifier onlyAdmin {
        require(msg.sender == owner || isAdmin[msg.sender]);
        _;
    }

    modifier onlyExpired(string name) {
        require(expired(name));
        _;
    }

    modifier onlyRecordOwner(string name) {
        require(!expired(name) && records[name].owner == msg.sender);
        _;
    }

    modifier onlyRecordOnSale(string name) {
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

    function withdraw() external onlyAdmin {
        address(payoutAddress).transfer(address(this).balance);
    }

    function register(string name, address target) external payable enoughToPay onlyExpired(name) {
        records[name].owner = msg.sender;
        records[name].target = target;
        records[name].expiredAt = uint96(now + (msg.value / sunPerMinute) * 60);
    }

    function extend(string name) external payable enoughToPay onlyRecordOwner(name) {
        records[name].expiredAt = uint96(now + (msg.value / sunPerMinute) * 60);
    }

    function setTarget(string name, address target) external payable onlyRecordOwner(name) {
        records[name].target = target;
    }

    function sell(string name, uint256 price) external onlyRecordOwner(name) {
        records[name].price = price;
    }

    function buy(string name) external payable onlyRecordOnSale(name) {
        uint256 price = records[name].price;
        require(msg.value >= price);
        uint256 afterFee = price * fee / 10000;
        address(records[name].owner).transfer(afterFee);
        if (msg.value > price) {
            msg.sender.transfer(msg.value - price);
        }
        records[name].owner = msg.sender;
    }

    function expired(string name) public view returns (bool) {
        return records[name].owner == address(0) || now > records[name].expiredAt;
    }

    function getRecord(string name) public view returns (address, address, uint96, uint256) {
        return (records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
    }
}
