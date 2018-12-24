pragma solidity ^0.4.23;

contract TronNameService
{
    uint defaultPrice = 1;
    uint incrementRate = 30;
    uint cooldownTime = 1 days;
    address admin;

    struct Record {
        address owner;
        uint price;
        uint cooldown;
    }

    struct User {
        uint pendingWithdraw;
    }

    mapping (string => Record) records;
    mapping (address => User) users;

    constructor() public {
        admin = msg.sender;
    }

    function setAddress(string name) public payable {
        uint increase;
        uint price;

        require(records[name].cooldown <= now);

        if (records[name].owner == address(0)) {
            require(msg.value >= 1000000);
            users[admin].pendingWithdraw = SafeMath.add(users[admin].pendingWithdraw, msg.value);
            records[name].owner = msg.sender;
            records[name].price = msg.value;
            records[name].cooldown = uint(now + cooldownTime);
        } else {
            increase = SafeMath.div(SafeMath.mul(records[name].price, incrementRate), 100);
            price = SafeMath.add(records[name].price, increase);
            require(msg.value >= price);
            users[admin].pendingWithdraw = SafeMath.add(users[admin].pendingWithdraw, msg.value);
            records[name].owner = msg.sender;
            records[name].price = msg.value;
            records[name].cooldown = uint(now + cooldownTime);
        }
    }

    function getRecord(string name) public view returns (address, uint, uint) {
        return (records[name].owner, records[name].price, records[name].cooldown);
    }

    function checkPendingWithdraw() public view returns (uint) {
        return users[msg.sender].pendingWithdraw;
    }

    function withdraw() public {
        if (users[msg.sender].pendingWithdraw > 0) {
            uint amount = users[msg.sender].pendingWithdraw;
            users[msg.sender].pendingWithdraw = 0;
            msg.sender.transfer(amount);
        }
    }
}

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a / b;
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}
