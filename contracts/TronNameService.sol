pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract TronNameService is Ownable {
    struct Record {
        uint96 id;
        address owner;
        address target;
        uint96 expiredAt;
        uint256 price;
        uint256 orderId;
    }

    struct Order {
        address buyer;
        uint256 price;
        uint256 nextId;
    }

    address public payoutAddress;
    uint96 public count;
    bool public open = false;
    bool public offerEnabled = false;
    uint256 public sunPerMinute = 694; // 694 sun for 1 minute
    uint256 public fee = 100; // 1%
    uint256 public orderCount;
    uint256 public orderBalance;
    mapping (address => bool) public isAdmin;
    mapping (uint256 => Order) public orders;
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

    modifier onlyOrderOwner(uint256 orderId) {
        require(orders[orderId].buyer == msg.sender);
        _;
    }

    modifier onlyOrderExists(uint256 orderId) {
        require(orders[orderId].price > 0);
        _;
    }

    modifier onlyOfferEnabled() {
        require(offerEnabled);
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

    function setOfferEnabled(bool newOfferEnabled) external onlyAdmin {
        offerEnabled = newOfferEnabled;
    }

    function start() external onlyAdmin {
        open = true;
    }

    function withdraw() external onlyAdmin {
        payoutAddress.transfer(address(this).balance - orderBalance);
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
        address user = records[name].owner;
        uint256 amount = price * (10000 - fee) / 10000;
        emit Trade(records[name].id, records[name].owner, msg.sender, price);
        records[name].owner = msg.sender;
        records[name].price = 0;
        emit RecordUpdate(records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price);
        user.transfer(amount);
        if (msg.value > price) {
            msg.sender.transfer(msg.value - price);
        }
    }

    function offer(string name) external payable onlyOfferEnabled {
        require(!expired(name));
        require(msg.value > 0);
        uint256 orderId = ++orderCount;
        Order memory order = Order(msg.sender, msg.value, 0);
        if (records[name].orderId == 0) {
            records[name].orderId = orderId;
        } else {
            uint256 worseOrderId = records[name].orderId;
            uint256 betterOrderId;
            while (orders[worseOrderId].price >= msg.value) {
                betterOrderId = worseOrderId;
                if (orders[worseOrderId].nextId == 0) {
                    worseOrderId = 0;
                    break;
                } else {
                    worseOrderId = orders[worseOrderId].nextId;
                }
            }
            if (worseOrderId != 0) {
                order.nextId = worseOrderId;
            }
            if (betterOrderId == 0) {
                records[name].orderId = orderId;
            } else {
                orders[betterOrderId].nextId = orderId;
            }
        }
        orders[orderId] = order;
        orderBalance += msg.value;
    }

    function accept(string name, uint256 orderId) external onlyOfferEnabled onlyRecordOwner(name) onlyOrderExists(orderId) {
        bool result;
        uint256 preId;
        (result, preId) = searchOrder(name, orderId);
        require(result);
        address user = records[name].owner;
        records[name].owner = orders[orderId].buyer;
        records[name].price = 0;
        uint256 amount = orders[orderId].price * (10000 - fee) / 10000;
        removeOrder(name, orderId, preId);
        user.transfer(amount);
    }

    function cancelOffer(string name, uint256 orderId) external onlyOrderOwner(orderId) onlyOrderExists(orderId) {
        bool result;
        uint256 preId;
        (result, preId) = searchOrder(name, orderId);
        require(result);
        address user = orders[orderId].buyer;
        uint256 amount = orders[orderId].price;
        removeOrder(name, orderId, preId);
        user.transfer(amount);
    }

    function removeOrder(string name, uint256 orderId, uint256 preId) internal {
        if (preId == 0) {
            records[name].orderId = orders[orderId].nextId;
        } else {
            orders[preId].nextId = orders[orderId].nextId;
        }
        orderBalance -= orders[orderId].price;
        orders[orderId].buyer = 0;
        orders[orderId].price = 0;
        orders[orderId].nextId = 0;
    }

    function expired(string memory name) public view returns (bool) {
        return records[name].owner == address(0) || now > records[name].expiredAt;
    }

    function getRecord(string memory name) public view returns (uint96, address, address, uint96, uint256, uint256) {
        return (records[name].id, records[name].owner, records[name].target, records[name].expiredAt, records[name].price, records[name].orderId);
    }

    function getRecordById(uint96 id) public view returns (uint96, address, address, uint96, uint256, uint256) {
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

    function searchOrder(string memory name, uint256 orderId) public view returns (bool, uint256) {
        uint256 preId = 0;
        uint256 nextId = records[name].orderId;
        while (nextId != orderId) {
            if (nextId == 0) {
                return (false, preId);
            }
            preId = nextId;
            nextId = orders[nextId].nextId;
        }
        return (true, preId);
    }
}
