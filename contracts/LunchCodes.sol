// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


struct LogEntry {
	address person;
	bool out;
}

enum GuardExchangeState {
	NONE,
	G1_REQUESTED,
	G1_APPROVED,
	G1_EXITED,
	G2_REQUESTED,
	G2_APPROVED
}

contract LunchCodes {
	address guard1;
	address guard2;
	address extraPerson;

	address request;
	bool guard1Approve;
	bool guard2Approve;
	LogEntry[] log;

	bool entryStarted;
	bool exitStarted;

	GuardExchangeState state;

	constructor() {
		guard1 = address(1);
		guard2 = address(2);
		request = address(0);
		entryStarted = false;
		exitStarted = false;
		guard1Approve = false;
		guard2Approve = false;
		state = GuardExchangeState.NONE;
	}

	modifier canComeIn {
		require(extraPerson == address(0));
		_;
	}

	function requestEntry() public canComeIn {
		require(msg.sender != guard1);
		require(msg.sender != guard2);
		require(request == address(0));
		require(!entryStarted && !exitStarted);
		require(state == GuardExchangeState.NONE || state == GuardExchangeState.G1_EXITED);
		entryStarted = true;
		request = msg.sender;
		guard1Approve = false;
		guard2Approve = false;
	}

	function requestExit() public {
		require(msg.sender != guard1);
		require(msg.sender != guard2);
		require(msg.sender == extraPerson);
		require(request == address(0));
		require(!entryStarted && !exitStarted);
		exitStarted = true;
		request = msg.sender;
		guard1Approve = false;
		guard2Approve = false;
	}

	function approve() public {
		require(msg.sender == guard1 || msg.sender == guard2);
		require(request != address(0));
		if (msg.sender == guard1) {
			guard1Approve = true;
		} else {
			guard2Approve = true;
		}
	}

	function deny() public {
		require(msg.sender == guard1 || msg.sender == guard2);
		require(request != address(0));
		guard1Approve = false;
		guard2Approve = false;
		request = address(0);
		entryStarted = false;
		exitStarted = false;
	}

	function entry() public canComeIn() {
		require(request != address(0));
		require(msg.sender == request);
		require(guard1Approve && guard2Approve);
		require(entryStarted);
		entryStarted = false;
		extraPerson = request;
		request = address(0);
		log.push(LogEntry(msg.sender, false));

		if (state == GuardExchangeState.G1_EXITED) {
			iWantToBeAGuard();
		}
	}

	function exit() public {
		require(msg.sender == extraPerson);
		require(exitStarted);
		require(request != address(0));
		require(msg.sender == request);
		require(guard1Approve && guard2Approve);
		extraPerson = address(0);
		exitStarted = false;
		request = address(0);
		if (state == GuardExchangeState.G1_APPROVED) {
			state = GuardExchangeState.G1_EXITED;
		}
		if (state == GuardExchangeState.G2_APPROVED) {
			state = GuardExchangeState.NONE;
		}
		log.push(LogEntry(msg.sender, true));
	}

	function iWantToBeAGuard() public {
		require(extraPerson == msg.sender);
		require(exitStarted == false);
		require(state == GuardExchangeState.NONE || state == GuardExchangeState.G1_EXITED);
		if (state == GuardExchangeState.NONE) {
			state = GuardExchangeState.G1_REQUESTED;
		} else {
			state = GuardExchangeState.G2_REQUESTED;
		}
	}

	function uCanBeGuard() public {
		require(state == GuardExchangeState.G1_REQUESTED || state == GuardExchangeState.G2_REQUESTED);

		if (state == GuardExchangeState.G1_REQUESTED) {
			require(guard1 == msg.sender);
			state = GuardExchangeState.G1_APPROVED;
			address temp = guard1;
			guard1 = extraPerson;
			extraPerson = temp;
		} else {
			require(guard2 == msg.sender);
			state = GuardExchangeState.G2_APPROVED;
			address temp = guard2;
			guard2 = extraPerson;
			extraPerson = temp;
		}
	}

	function denyNewGuard() public {
		require(state == GuardExchangeState.G1_REQUESTED);
		if (state == GuardExchangeState.G1_REQUESTED) {
			require(guard1 == msg.sender);
			state = GuardExchangeState.NONE;
		}
	}
}
