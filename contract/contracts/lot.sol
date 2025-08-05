// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Strings.sol";

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
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
        address leftChild;
        address rightChild;
        uint256 leftCount;
        uint256 rightCount;
    }

    struct Ticket {
        string ticketId;
        address buyer;
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

    IERC20 public usdt;
    address public owner;
    bool public ownerTicketGenerated = false;
    string public ownerTicketId;

    uint256 public ticketNumber = 1;
    bytes1 public suffix = "A";

    mapping(address => User) public users;
    mapping(address => bool) public userHasPurchasedTicket;
    address[] public userList;
    string[] public allTickets;
    mapping(string => Ticket) public tickets;
    mapping(address => string[]) public userTickets;
    mapping(ContestType => string[]) public selectedWinners;

    address public prizeWallet;
    address public commissionWallet;
    address public productWallet;
    address public profitWallet;
    address public serviceWallet;

    uint256 public constant TICKET_PRICE = 1e19;

    event Registered(address indexed user, address indexed referrer);
    event TicketPurchased(address indexed user, string ticketId, address referrer, uint256 amount);
    event ReferralCommission(
        address indexed user,
        address indexed fromUser,
        uint256 level,
        uint256 amount
    );
    event WinnerSelected(ContestType contest, string ticketId, address winner);
    event PayoutProcessed(address indexed user, uint256 amount, uint256 serviceFee);

    constructor(address _usdt, address _wallet) {
        owner = msg.sender;
        usdt = IERC20(_usdt);

        prizeWallet = _wallet;
        commissionWallet = _wallet;
        productWallet = _wallet;
        profitWallet = _wallet;
        serviceWallet = _wallet;

        users[msg.sender] = User({
            referrer: address(0),
            level1: address(0),
            level2: address(0),
            level3: address(0),
            pairs: 0,
            earnings: 0,
            leftChild: address(0),
            rightChild: address(0),
            leftCount: 0,
            rightCount: 0
        });
        userList.push(msg.sender);
    }

    function register(address referrerAddr) internal {
        require(users[msg.sender].referrer == address(0), "Already registered");

        address actualReferrer = referrerAddr;
        address level2 = users[actualReferrer].referrer;
        address level3 = users[level2].referrer;

        users[msg.sender] = User({
            referrer: actualReferrer,
            level1: actualReferrer,
            level2: level2,
            level3: level3,
            pairs: 0,
            earnings: 0,
            leftChild: address(0),
            rightChild: address(0),
            leftCount: 0,
            rightCount: 0
        });

        if (users[actualReferrer].leftChild == address(0)) {
            users[actualReferrer].leftChild = msg.sender;
        } else if (users[actualReferrer].rightChild == address(0)) {
            users[actualReferrer].rightChild = msg.sender;
        }

        updatePairCounts(actualReferrer);
        userList.push(msg.sender);
        emit Registered(msg.sender, actualReferrer);
    }

    function updatePairCounts(address referrer) internal {
        while (referrer != address(0)) {
            address left = users[referrer].leftChild;
            address right = users[referrer].rightChild;

            users[referrer].leftCount = countTeam(left);
            users[referrer].rightCount = countTeam(right);

            uint256 minPairs = users[referrer].leftCount <
                users[referrer].rightCount
                ? users[referrer].leftCount
                : users[referrer].rightCount;

            uint256 newPairs = minPairs - users[referrer].pairs;
            if (newPairs > 0) {
                users[referrer].pairs += newPairs;
                uint256 commission = (TICKET_PRICE * 2 * newPairs) / 100;
                users[referrer].earnings += commission;
                emit ReferralCommission(referrer, msg.sender, 0, commission);
            }

            referrer = users[referrer].referrer;
        }
    }

    function countTeam(address node) internal view returns (uint256) {
        if (node == address(0)) return 0;
        return
            1 +
            countTeam(users[node].leftChild) +
            countTeam(users[node].rightChild);
    }

    function buyTicket(string memory referralTicketId) external {
        require(msg.sender != owner, "Owner cannot buy ticket");
        require(!userHasPurchasedTicket[msg.sender], "Already purchased");
        require(
            bytes(referralTicketId).length > 0,
            "Referral ticket ID required"
        );
        require(
            tickets[referralTicketId].buyer != address(0),
            "Invalid referral"
        );

        address referrerAddr = tickets[referralTicketId].buyer;
        require(referrerAddr != msg.sender, "Cannot refer yourself");

        if (users[msg.sender].referrer == address(0)) {
            register(referrerAddr);
        }

        distributeCommission(msg.sender);

        string memory newTicketId = generateTicketId();
        tickets[newTicketId] = Ticket(newTicketId, msg.sender);
        userTickets[msg.sender].push(newTicketId);
        allTickets.push(newTicketId);
        userHasPurchasedTicket[msg.sender] = true;

        emit TicketPurchased(msg.sender, newTicketId, referrerAddr, TICKET_PRICE);
    }

    function generateTicketId() internal returns (string memory) {
        if (ticketNumber > 99999) {
            ticketNumber = 1;
            suffix = bytes1(uint8(suffix) + 1);
        }

        string memory numberStr = ticketNumber.toString();
        while (bytes(numberStr).length < 7) {
            numberStr = string(abi.encodePacked("0", numberStr));
        }

        string memory fullId = string(
            abi.encodePacked("CL252", numberStr, suffix)
        );
        ticketNumber++;
        return fullId;
    }
    function selectWinners(
        ContestType contestType,
        uint256 numberOfWinners
    ) external {
        uint256 totalTickets = allTickets.length;

        if (numberOfWinners >= totalTickets) {
            selectedWinners[contestType] = allTickets;
            for (uint256 i = 0; i < totalTickets; i++) {
                emit WinnerSelected(contestType, allTickets[i], tickets[allTickets[i]].buyer);
            }
            return;
        }

        string[] memory winners = new string[](numberOfWinners);
        bool[] memory selected = new bool[](totalTickets); // local flag array to track used indices

        for (uint256 i = 0; i < numberOfWinners; i++) {
            uint256 rand;
            do {
                rand =
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                block.timestamp,
                                block.prevrandao,
                                msg.sender,
                                i,
                                block.number
                            )
                        )
                    ) %
                    totalTickets;
            } while (selected[rand]);

            selected[rand] = true;
            winners[i] = allTickets[rand];
            emit WinnerSelected(contestType, allTickets[rand], tickets[allTickets[rand]].buyer);
        }

        selectedWinners[contestType] = winners;
    }

    function getWinnersByContest(
        ContestType contestType
    ) external view returns (string[] memory) {
        return selectedWinners[contestType];
    }

    function distributeCommission(address user) internal {
        address ref1 = users[user].level1;
        address ref2 = users[user].level2;
        address ref3 = users[user].level3;

        if (ref1 != address(0)) {
            uint256 commission = (TICKET_PRICE * 10) / 100;
            users[ref1].earnings += commission;
            emit ReferralCommission(ref1, user, 1, commission);
        }
        if (ref2 != address(0)) {
            uint256 commission = (TICKET_PRICE * 2) / 100;
            users[ref2].earnings += commission;
            emit ReferralCommission(ref2, user, 2, commission);
        }
        if (ref3 != address(0)) {
            uint256 commission = (TICKET_PRICE * 1) / 100;
            users[ref3].earnings += commission;
            emit ReferralCommission(ref3, user, 3, commission);
        }
    }

    function generateOwnerTicket() external {
        require(!ownerTicketGenerated, "Owner ticket exists");
        ownerTicketId = generateTicketId();
        tickets[ownerTicketId] = Ticket(ownerTicketId, msg.sender);
        userTickets[msg.sender].push(ownerTicketId);
        allTickets.push(ownerTicketId);
        ownerTicketGenerated = true;
        userHasPurchasedTicket[msg.sender] = true;
        emit TicketPurchased(msg.sender, ownerTicketId, address(0), 0);
    }

    function requestPayout() external {
        uint256 payout = users[msg.sender].earnings;
        require(payout > 0, "No earnings");
        uint256 serviceFee = (payout * 5) / 100;
        uint256 finalAmount = payout - serviceFee;
        users[msg.sender].earnings = 0;
        require(usdt.transfer(serviceWallet, serviceFee), "Fee failed");
        require(usdt.transfer(msg.sender, finalAmount), "Payout failed");
        emit PayoutProcessed(msg.sender, finalAmount, serviceFee);
    }

    function getUser(
        address user
    )
        external
        view
        returns (
            address,
            address,
            address,
            address,
            uint256,
            uint256,
            address,
            address,
            uint256,
            uint256
        )
    {
        User memory u = users[user];
        return (
            u.referrer,
            u.level1,
            u.level2,
            u.level3,
            u.pairs,
            u.earnings,
            u.leftChild,
            u.rightChild,
            u.leftCount,
            u.rightCount
        );
    }
    function getUserTickets(
        address user
    ) external view returns (string[] memory) {
        return userTickets[user];
    }

    function getTicket(
        string memory ticketId
    ) external view returns (string memory, address) {
        Ticket memory t = tickets[ticketId];
        return (t.ticketId, t.buyer);
    }
}