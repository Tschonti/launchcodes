# L(a)unch Codes
A high security facility always houses a shift of two soldiers. It must also provide regular access to low-security clearance staff (food delivery, cleaning, ...). All entries and exits are tracked and authorized by a distributed ledger (a tamper-proof electronic lock on the main entrance continuously monitors the ledger and decides whether it should open or close; requests and authorizations are supported by smart cards and electronic terminals).
1. Entry is requested from the outside and must be authorized by both soldiers on duty.
2. Successful entry must be logged inside by the entering party (after the door is closed).
3. The protocol for exits is the same in the reverse.
4. Shift  changes  happen  in  two  phases  (first,soldier1’replaces soldier1in  a  full entry-exit cycle, followed bysoldier2’replacingsoldier2in the same manner).
5. Guard duty is transferred inside by a mutual “acknowledgement” of the involved two soldiers.
6. There must not be more than 3 persons in the facility at any time.
7. Shift change must take place when the facility is empty, and no entry is allowed until it is over.
8. A soldier cannot enter or exit the facility while they areon guard duty.

Designand implement a smart contract supporting the above access management protocol.