// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface OptimisticOracleV2Interface {
    struct RequestSettings {
        bool eventBased; // True if the request is set to be event-based.
        bool refundOnDispute; // True if the requester should be refunded their reward on dispute.
        bool callbackOnPriceProposed; // True if callbackOnPriceProposed callback is required.
        bool callbackOnPriceDisputed; // True if callbackOnPriceDisputed callback is required.
        bool callbackOnPriceSettled; // True if callbackOnPriceSettled callback is required.
        uint256 bond; // Bond that the proposer and disputer must pay on top of the final fee.
        uint256 customLiveness; // Custom liveness value set by the requester.
    }
    struct Request {
        address proposer; // Address of the proposer.
        address disputer; // Address of the disputer.
        IERC20 currency; // ERC20 token used to pay rewards and fees.
        bool settled; // True if the request is settled.
        RequestSettings requestSettings; // Custom settings associated with a request.
        int256 proposedPrice; // Price that the proposer submitted.
        int256 resolvedPrice; // Price resolved once the request is settled.
        uint256 expirationTime; // Time at which the request auto-settles without a dispute.
        uint256 reward; // Amount of the currency to pay to the proposer on settlement.
        uint256 finalFee; // Final fee to pay to the Store upon request to the DVM.
    }
    function requestPrice(bytes32 identifier, uint256 timestamp, bytes memory ancillaryData, IERC20 currency, uint256 reward) external returns (uint256 totalBond);
    function proposePrice(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData, int256 proposedPrice) external returns (uint256 totalBond);
    function setCustomLiveness(bytes32 identifier, uint256 timestamp, bytes memory ancillaryData, uint256 customLiveness) external;
    function settle(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external returns (uint256 payout);
    function getRequest(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external view returns (Request memory);
}

contract Assert {
    
    OptimisticOracleV2Interface oo = OptimisticOracleV2Interface(0xA5B9d8a0B0Fa04Ba71BDD68069661ED5C0848884);
    bytes32 identifier = bytes32("YES_OR_NO_QUERY");

    event Asserted(address indexed asserter, uint256 requestTime);

    function makeAssertion(string calldata assertion) public {
        bytes memory ancillaryData = bytes(assertion);
        uint256 requestTime = block.timestamp - 1;
        IERC20 bondCurrency = IERC20(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6); // Goerli WETH
        uint256 reward = 0;

        oo.requestPrice(identifier, requestTime, ancillaryData, bondCurrency, reward);
        oo.setCustomLiveness(identifier, requestTime, ancillaryData, 60);
        oo.proposePrice(address(this), identifier, requestTime, ancillaryData, 1 ether);
        emit Asserted(msg.sender, requestTime);
    }

    function settle(string calldata assertion, uint256 requestTime) public {
        bytes memory ancillaryData = bytes(assertion);
        oo.settle(address(this), identifier, requestTime, ancillaryData);
    }

    function getTruth(string calldata assertion, uint256 requestTime) public view returns (int256) {
        bytes memory ancillaryData = bytes(assertion);
        return oo.getRequest(address(this), identifier, requestTime, ancillaryData).resolvedPrice;
    }
}