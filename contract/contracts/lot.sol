// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";


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

    enum RewardType {
        None,
        BluetoothEarbudsSmartwatch,
        BPMonitoringMachine,
        Nebulizer
    }

    struct User {
        address referrer;
        address level1;
        address level2;
        address level3;
        uint256 pairs;
        uint256 prizeEarnings;
        uint256 referralEarnings;
        address leftChild;
        address rightChild;
        uint256 leftCount;
        uint256 rightCount;
        uint256 rewardedMilestone;
        RewardType claimedReward;
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

    enum EarningType {
        Prize,
        Referral
    }

    struct PayoutRequest {
        address user;
        uint256 amount;
        uint256 serviceFee;
        bool approved;
        bool processed;
        EarningType earningType;
    }

    PayoutRequest[] public payoutRequests;
    mapping(address => uint256[]) public userPayoutRequestIndexes;

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
    mapping(string => bool) public ticketHasWon;

    address public prizeWallet;
    address public commissionWallet;
    address public productWallet;
    address public profitWallet;
    address public serviceWallet;

    uint256 public constant TICKET_PRICE = 1e19;

    event Registered(address indexed user, address indexed referrer);
    event TicketPurchased(
        address indexed user,
        string ticketId,
        address referrer,
        uint256 amount
    );
    event ReferralCommission(
        address indexed user,
        address indexed fromUser,
        uint256 level,
        uint256 amount
    );
    event WinnerSelected(
        ContestType contest,
        string ticketId,
        address indexed user,
        uint256 amount
    );
    event PayoutProcessed(
        address indexed user,
        uint256 amount,
        uint256 serviceFee,
        bool approved
    );
    event PairMatchingReward(
        address indexed user,
        uint256 pairs,
        uint256 amount
    );
    event RewardClaimed(
        address indexed user,
        address indexed referrer,
        RewardType rewardType
    );

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
            prizeEarnings: 0,
            referralEarnings: 0,
            leftChild: address(0),
            rightChild: address(0),
            leftCount: 0,
            rightCount: 0,
            rewardedMilestone: 0,
            claimedReward: RewardType.None
        });
        userList.push(msg.sender);
    }

    function register(address referrerAddr) internal {
        require(users[msg.sender].referrer == address(0));

        address actualReferrer = referrerAddr;
        address level2 = users[actualReferrer].referrer;
        address level3 = users[level2].referrer;

        users[msg.sender] = User({
            referrer: actualReferrer,
            level1: actualReferrer,
            level2: level2,
            level3: level3,
            pairs: 0,
            prizeEarnings: 0,
            referralEarnings: 0,
            leftChild: address(0),
            rightChild: address(0),
            leftCount: 0,
            rightCount: 0,
            rewardedMilestone: 0,
            claimedReward: RewardType.None
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

    function getMilestoneBonus(
        uint256 milestone
    ) internal pure returns (uint256) {
        if (milestone == 3) return (100 * TICKET_PRICE * 200) / 10000;
        if (milestone == 6) return (500 * TICKET_PRICE * 175) / 10000;
        if (milestone == 2500) return (2500 * TICKET_PRICE * 150) / 10000;
        if (milestone == 5000) return (5000 * TICKET_PRICE * 125) / 10000;
        if (milestone == 10000) return (10000 * TICKET_PRICE * 100) / 10000;
        if (milestone == 25000) return (25000 * TICKET_PRICE * 75) / 10000;
        if (milestone == 50000) return (50000 * TICKET_PRICE * 50) / 10000;
        if (milestone == 100000) return (100000 * TICKET_PRICE * 25) / 10000;
        return 0;
    }

    function checkAndRewardMilestones(address userAddr) internal {
        User storage user = users[userAddr];
        uint256 pairs = user.pairs;
        uint256 reward;

        if (pairs >= 3 && user.rewardedMilestone < 3) {
            reward = getMilestoneBonus(3) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 3;
            emit PairMatchingReward(userAddr, 100, reward);
        }
        if (pairs >= 6 && user.rewardedMilestone < 6) {
            reward = getMilestoneBonus(6) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 500;
            emit PairMatchingReward(userAddr, 500, reward);
        }
        if (pairs >= 2500 && user.rewardedMilestone < 2500) {
            reward = getMilestoneBonus(2500) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 2500;
            emit PairMatchingReward(userAddr, 2500, reward);
        }
        if (pairs >= 5000 && user.rewardedMilestone < 5000) {
            reward = getMilestoneBonus(5000) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 5000;
            emit PairMatchingReward(userAddr, 5000, reward);
        }
        if (pairs >= 10000 && user.rewardedMilestone < 10000) {
            reward = getMilestoneBonus(10000) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 10000;
            emit PairMatchingReward(userAddr, 10000, reward);
        }
        if (pairs >= 25000 && user.rewardedMilestone < 25000) {
            reward = getMilestoneBonus(25000) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 25000;
            emit PairMatchingReward(userAddr, 25000, reward);
        }
        if (pairs >= 50000 && user.rewardedMilestone < 50000) {
            reward = getMilestoneBonus(50000) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 50000;
            emit PairMatchingReward(userAddr, 50000, reward);
        }
        if (pairs >= 100000 && user.rewardedMilestone < 100000) {
            reward = getMilestoneBonus(100000) - getMilestoneBonus(user.rewardedMilestone);
            user.prizeEarnings += reward;
            user.rewardedMilestone = 100000;
            emit PairMatchingReward(userAddr, 100000, reward);
        }
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
                checkAndRewardMilestones(referrer);
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
        require(msg.sender != owner);
        require(!userHasPurchasedTicket[msg.sender]);
        require(bytes(referralTicketId).length > 0);
        require(tickets[referralTicketId].buyer != address(0));

        address referrerAddr = tickets[referralTicketId].buyer;
        require(referrerAddr != msg.sender);

        if (users[msg.sender].referrer == address(0)) {
            register(referrerAddr);
        }
        require(usdt.transferFrom(msg.sender, address(this), TICKET_PRICE), "Transfer failed");
        usdt.transfer(prizeWallet, (TICKET_PRICE * 2329) / 10000);
        usdt.transfer(commissionWallet, (TICKET_PRICE * 2300) / 10000);
        usdt.transfer(productWallet, (TICKET_PRICE * 2971) / 10000);
        usdt.transfer(profitWallet, (TICKET_PRICE * 2400) / 10000);
        distributeCommission(msg.sender);

        string memory newTicketId = generateTicketId();
        tickets[newTicketId] = Ticket(newTicketId, msg.sender);
        userTickets[msg.sender].push(newTicketId);
        allTickets.push(newTicketId);
        userHasPurchasedTicket[msg.sender] = true;

        emit TicketPurchased(
            msg.sender,
            newTicketId,
            referrerAddr,
            TICKET_PRICE
        );
    }

    function generateTicketId() internal returns (string memory) {
    if (ticketNumber > 99999) {
        ticketNumber = 1;
        suffix = bytes1(uint8(suffix) + 1);
    }

    // Convert the number to a string with leading zeros using abi.encodePacked
    // Instead of looping, format in one go.
    string memory numberStr = uintToPaddedString(ticketNumber, 7);

    string memory fullId = string(
        abi.encodePacked("CL252", numberStr, suffix)
    );

    ticketNumber++;
    return fullId;
}

// Helper: zero-pads uint to desired length
function uintToPaddedString(uint256 num, uint256 length) internal pure returns (string memory) {
    bytes memory buffer = new bytes(length);
    for (uint256 i = length; i > 0; i--) {
        buffer[i - 1] = bytes1(uint8(48 + (num % 10)));
        num /= 10;
    }
    return string(buffer);
}


    function getRewardAmount(
        ContestType contest
    ) public pure returns (uint256) {
        if (contest == ContestType.Weekly) return 50e18;
        if (contest == ContestType.Monthly) return 100e18;
        if (contest == ContestType.Quarterly) return 200e18;
        if (contest == ContestType.HalfYearly) return 400e18;
        if (contest == ContestType.GrandFirst) return 100000e18;
        if (contest == ContestType.GrandSecond) return 20000e18;
        if (contest == ContestType.GrandThird) return 10000e18;
        if (contest == ContestType.GrandFourth) return 1000e18;
        if (contest == ContestType.GrandFifth) return 100e18;
        if (contest == ContestType.GrandSixth) return 50e18;
        return 0;
    }

    function distributeRewards(
        ContestType contest,
        uint256 rewardAmount
    ) internal {
        string[] memory winners = selectedWinners[contest];
        require(winners.length > 0);
        require(rewardAmount > 0);

        for (uint256 i = 0; i < winners.length; i++) {
            address winner = tickets[winners[i]].buyer;
            users[winner].prizeEarnings += rewardAmount;
        }
    }

    function selectWinners(
        ContestType contestType,
        uint256 numberOfWinners
    ) external {
        // Step 1: Collect eligible tickets (not yet winners)
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (!ticketHasWon[allTickets[i]]) {
                eligibleCount++;
            }
        }

        require(eligibleCount > 0);

        // If number of winners exceeds eligible tickets, adjust
        if (numberOfWinners > eligibleCount) {
            numberOfWinners = eligibleCount;
        }

        string[] memory eligibleTickets = new string[](eligibleCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allTickets.length; i++) {
            if (!ticketHasWon[allTickets[i]]) {
                eligibleTickets[index++] = allTickets[i];
            }
        }

        string[] memory winners = new string[](numberOfWinners);
        bool[] memory selected = new bool[](eligibleCount); // track selected indices
        uint256 rewardAmount = getRewardAmount(contestType);

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
                    eligibleCount;
            } while (selected[rand]);

            selected[rand] = true;
            string memory winningTicket = eligibleTickets[rand];
            winners[i] = winningTicket;
            ticketHasWon[winningTicket] = true;

            emit WinnerSelected(
                contestType,
                winningTicket,
                tickets[winningTicket].buyer,
                rewardAmount
            );
        }

        selectedWinners[contestType] = winners;
        distributeRewards(contestType, rewardAmount);
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
            users[ref1].referralEarnings += commission;
            emit ReferralCommission(ref1, user, 1, commission);
        }
        if (ref2 != address(0)) {
            uint256 commission = (TICKET_PRICE * 2) / 100;
            users[ref2].referralEarnings += commission;
            emit ReferralCommission(ref2, user, 2, commission);
        }
        if (ref3 != address(0)) {
            uint256 commission = (TICKET_PRICE * 1) / 100;
            users[ref3].referralEarnings += commission;
            emit ReferralCommission(ref3, user, 3, commission);
        }
    }

    function generateOwnerTicket() external {
        require(!ownerTicketGenerated);
        ownerTicketId = generateTicketId();
        tickets[ownerTicketId] = Ticket(ownerTicketId, msg.sender);
        userTickets[msg.sender].push(ownerTicketId);
        allTickets.push(ownerTicketId);
        ownerTicketGenerated = true;
        userHasPurchasedTicket[msg.sender] = true;
        emit TicketPurchased(msg.sender, ownerTicketId, address(0), 0);
    }

    function requestPayout(uint256 amount, EarningType earningType) external {
        require(amount > 0);
        uint256 userEarnings;
        console.log("EarningType:", uint256(earningType));
        if (earningType == EarningType.Prize) {
            userEarnings = users[msg.sender].prizeEarnings;
        } else {
            userEarnings = users[msg.sender].referralEarnings;
        }
        require(amount <= userEarnings);

        uint256 serviceFee = (amount * 5) / 100;
        uint256 finalAmount = amount - serviceFee;

        if (earningType == EarningType.Prize) {
            users[msg.sender].prizeEarnings -= amount;
        } else {
            users[msg.sender].referralEarnings -= amount;
        }

        payoutRequests.push(
            PayoutRequest({
                user: msg.sender,
                amount: finalAmount,
                serviceFee: serviceFee,
                approved: false,
                processed: false,
                earningType: earningType
            })
        );

        userPayoutRequestIndexes[msg.sender].push(payoutRequests.length - 1);
    }

    function processPayout(uint256 requestId, bool approve) external {
        PayoutRequest storage request = payoutRequests[requestId];
        require(!request.processed);

        request.processed = true;
        request.approved = approve;

        if (approve) {
            // Deposit USDT into this contract
            if (request.earningType == EarningType.Prize) {
                usdt.transferFrom(prizeWallet, address(this), request.amount + request.serviceFee);
            } else {
                usdt.transferFrom(commissionWallet, address(this), request.amount + request.serviceFee);
            }
            usdt.transfer(serviceWallet, request.serviceFee);
            usdt.transfer(request.user, request.amount);
        } else {
            // Refund user
            if (request.earningType == EarningType.Prize) {
                users[request.user].prizeEarnings += (request.amount + request.serviceFee);
            } else {
                users[request.user].referralEarnings += (request.amount + request.serviceFee);
            }
        }

        emit PayoutProcessed(
            request.user,
            request.amount,
            request.serviceFee,
            approve
        );
    }
    function claimReward(RewardType rewardType) external {
        User storage user = users[msg.sender];
        require(user.claimedReward == RewardType.None, "Reward already claimed");
        require(rewardType != RewardType.None, "Invalid reward type");
        user.claimedReward = rewardType;
        emit RewardClaimed(msg.sender,user.referrer, rewardType);
    }

    function getAllPayoutRequests()
        external
        view
        returns (PayoutRequest[] memory)
    {
        return payoutRequests;
    }

    function getUserPayoutRequests(
        address user
    ) external view returns (uint256[] memory) {
        return userPayoutRequestIndexes[user];
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
            uint256,
            address,
            address,
            uint256,
            uint256,
            uint256,
            RewardType // Added RewardType
        )
    {
        User storage u = users[user];
        return (
            u.referrer,
            u.level1,
            u.level2,
            u.level3,
            u.pairs,
            u.prizeEarnings,
            u.referralEarnings,
            u.leftChild,
            u.rightChild,
            u.leftCount,
            u.rightCount,
            u.rewardedMilestone,
            u.claimedReward // Added claimedReward
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