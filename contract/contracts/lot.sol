// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Strings.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract CryptoLottery {
    using Strings for uint256;

    struct User {
        address referrer;
        address level1;
        address level2;
        address level3;
        uint256 pairs;
        uint256 earnings;
    }

    struct Ticket {
        string ticketId;
        address buyer;
        bool isWinner;
    }

    enum ContestType {
        Weekly,
        Monthly,
        Quarterly,
        HalfYearly,
        GrandFirst,
        GrandSecond,
        GrandThird,
        GrandFourth,
        GrandFifth,
        GrandSixth
    }

    struct WinnerInfo {
        string ticketId;
        address winner;
        uint256 prizeAmount;
    }

    IERC20 public usdt;
    address public owner;
    bool public ownerTicketGenerated = false;
    string public ownerTicketId;

    uint256 public ticketNumber = 1;
    bytes1 public suffix = "A";

    mapping(address => User) public users;
    mapping(address => bool) public userHasPurchasedTicket;
    address[] public userList;
    mapping(string => Ticket) public tickets;
    mapping(address => string[]) public userTickets;

    // Contest Drawings
    mapping(ContestType => mapping(uint256 => WinnerInfo[])) public contestWinners;
    mapping(ContestType => uint256) public currentRound;

    address public prizeWallet;
    address public commissionWallet;
    address public productWallet;
    address public profitWallet;
    address public serviceWallet;

    uint256 public constant TICKET_PRICE = 1e19; // 0.01 USDT (18 decimals)

    event Registered(address indexed user, address indexed referrer);
    event TicketPurchased(address indexed user, string ticketId, uint256 amount);
    event PayoutRequested(address indexed user, uint256 amount, uint256 serviceFee);
    event WinnerDeclared(address indexed user, string ticketId);

    constructor(address _usdt, address _wallet) {
        owner = msg.sender;
        usdt = IERC20(_usdt);

        prizeWallet = _wallet;
        commissionWallet = _wallet;
        productWallet = _wallet;
        profitWallet = _wallet;
        serviceWallet = _wallet;

        // Register owner as first user (no referrer)
        users[msg.sender] = User({
            referrer: address(0),
            level1: address(0),
            level2: address(0),
            level3: address(0),
            pairs: 0,
            earnings: 0
        });
        userList.push(msg.sender);
    }

    function register(address referrerAddr) internal {
        require(users[msg.sender].referrer == address(0), "Already registered");

        address actualReferrer = referrerAddr;
        address level2 = address(0);
        address level3 = address(0);

        if (users[actualReferrer].referrer != address(0)) {
            level2 = users[actualReferrer].referrer;
            if (users[level2].referrer != address(0)) {
                level3 = users[level2].referrer;
            }
        }

        users[msg.sender] = User({
        
    
            referrer: actualReferrer,
            level1: actualReferrer,
            level2: level2,
            level3: level3,
            pairs: 0,
            earnings: 0
        });
        userList.push(msg.sender);
        emit Registered(msg.sender, actualReferrer);
    }
    function getAllUsers() external view returns (address[] memory) {
        return userList;
    }
    function buyTicket(string memory referralTicketId) external {
        // Owner cannot use buyTicket (owner gets a ticket via generateOwnerTicket)
        require(msg.sender != owner, "Owner cannot buy ticket");
        require(!userHasPurchasedTicket[msg.sender], "User has already purchased a ticket");

        // Referral ticket ID must be provided
        require(bytes(referralTicketId).length > 0, "Referral ticket ID required");
        require(tickets[referralTicketId].buyer != address(0), "Referral ticket does not exist");

        address referrerAddr = tickets[referralTicketId].buyer;
        require(referrerAddr != msg.sender, "Cannot refer yourself");

        // Only allow registration if not already registered
        if (users[msg.sender].referrer == address(0)) {
            register(referrerAddr);
        }

        // require(usdt.transferFrom(msg.sender, address(this), TICKET_PRICE), "USDT transfer failed");

        // // Distribute
        // usdt.transfer(prizeWallet, (TICKET_PRICE * 2329) / 10000);
        // usdt.transfer(commissionWallet, (TICKET_PRICE * 2300) / 10000);
        // usdt.transfer(productWallet, (TICKET_PRICE * 2971) / 10000);
        // usdt.transfer(profitWallet, (TICKET_PRICE * 2400) / 10000);

        distributeCommission(msg.sender);

        // Mint ticket
        string memory newTicketId = generateTicketId();
        tickets[newTicketId] = Ticket(newTicketId, msg.sender, false);
        userTickets[msg.sender].push(newTicketId);
        userHasPurchasedTicket[msg.sender] = true;

        emit TicketPurchased(msg.sender, newTicketId, TICKET_PRICE);
    }

    function generateTicketId() internal returns (string memory) {
        if (ticketNumber > 99999) {
            ticketNumber = 1;
            suffix = bytes1(uint8(suffix) + 1); // Increment suffix letter
        }

        string memory numberStr = ticketNumber.toString();
        while (bytes(numberStr).length < 7) {
            numberStr = string(abi.encodePacked("0", numberStr));
        }

        string memory fullId = string(abi.encodePacked("CL252", numberStr, suffix));
        ticketNumber++;
        return fullId;
    }

    function distributeCommission(address user) internal {
        address ref1 = users[user].level1;
        address ref2 = users[user].level2;
        address ref3 = users[user].level3;

        if (ref1 != address(0)) {
            users[ref1].earnings += (TICKET_PRICE * 10) / 100;
        }
        if (ref2 != address(0)) {
            users[ref2].earnings += (TICKET_PRICE * 2) / 100;
        }
        if (ref3 != address(0)) {
            users[ref3].earnings += (TICKET_PRICE * 1) / 100;
        }
    }

    function generateOwnerTicket() external {
        require(msg.sender == owner, "Only owner");
        require(!ownerTicketGenerated, "Owner ticket already generated");

        // Mint ticket
        ownerTicketId = generateTicketId();
        tickets[ownerTicketId] = Ticket(ownerTicketId, msg.sender, false);
        userTickets[msg.sender].push(ownerTicketId);
        ownerTicketGenerated = true;
        userHasPurchasedTicket[msg.sender] = true;

        emit TicketPurchased(msg.sender, ownerTicketId, 0); // Price is 0 for owner
    }

    function drawWinner(string memory ticketId) external {
        require(msg.sender == owner, "Only owner");
        require(tickets[ticketId].buyer != address(0), "Invalid ticket");
        tickets[ticketId].isWinner = true;
        emit WinnerDeclared(tickets[ticketId].buyer, ticketId);
    }

    function requestPayout() external {
        uint256 payout = users[msg.sender].earnings;
        require(payout > 0, "No earnings");

        uint256 serviceFee = (payout * 5) / 100;
        uint256 finalAmount = payout - serviceFee;
        users[msg.sender].earnings = 0;

        require(usdt.transfer(serviceWallet, serviceFee), "Fee failed");
        require(usdt.transfer(msg.sender, finalAmount), "Payout failed");

        emit PayoutRequested(msg.sender, finalAmount, serviceFee);
    }

    function drawContestWinners(
        ContestType contestType,
        string[] memory ticketIds,
        uint256 prizeAmount
    ) external {
        require(msg.sender == owner, "Only owner can draw");
        uint256 round = currentRound[contestType];

        for (uint256 i = 0; i < ticketIds.length; i++) {
            string memory ticketId = ticketIds[i];
            require(tickets[ticketId].buyer != address(0), "Invalid ticket");
            address winner = tickets[ticketId].buyer;

            tickets[ticketId].isWinner = true;
            contestWinners[contestType][round].push(WinnerInfo(ticketId, winner, prizeAmount));

            // Optional: Enable auto-payout
            // require(usdt.transfer(winner, prizeAmount), "Prize transfer failed");

            emit WinnerDeclared(winner, ticketId);
        }

        currentRound[contestType] += 1;
    }

    function getWinners(ContestType contestType, uint256 round) external view returns (WinnerInfo[] memory) {
        return contestWinners[contestType][round];
    }

    function getUser(address user) external view returns (
        address referrer,
        address level1,
        address level2,
        address level3,
        uint256 pairs,
        uint256 earnings
    ) {
        User memory u = users[user];
        return (u.referrer, u.level1, u.level2, u.level3, u.pairs, u.earnings);
    }

    function getUserTickets(address user) external view returns (string[] memory) {
        return userTickets[user];
    }

    function getTicket(string memory ticketId) external view returns (string memory, address, bool) {
        Ticket memory t = tickets[ticketId];
        return (t.ticketId, t.buyer, t.isWinner);
    }

    /*
    Prize Breakdown:
    - Weekly: 10 x 50 USDT
    - Monthly: 4 x 200 USDT
    - Quarterly: 4 x 400 USDT
    - Half-Yearly: 4 x 800 USDT
    - Grand Prizes:
        - 1st: 1 x 100,000 USDT
        - 2nd: 2 x 50,000 USDT
        - 3rd: 10 x 10,000 USDT
        - 4th: 100 x 1,000 USDT
        - 5th: 1,000 x 100 USDT
        - 6th: 2,000 x 50 USDT
    */
}