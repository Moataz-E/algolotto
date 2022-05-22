"""
Lottery Smart Contract

* Each time a user purchases a ticket, a ticket number equal to the tickets
    sold + 1 is assigned to him.

Purchase Ticket
---------------
* Deduct cost of tickets from transaction.
* Add to prize pot.
* Store tickets in local state tickets array.
* Store round number in local state.

Trigger Draw
------------
* Validate drawn is false and latest_timestamp() is after next draw epoch.
* Ensure transaction has enough gas to execute the next few statements.
* Set drawn to true
* Psuedo-randomly select winning ticket between 0 and (tickets_sold - 1).
* Store value of winning ticket in global variable.

Reward Winner
--------------
* Identify holder of the winning ticket off-chain.
* Call application with reward operation and include address of wallet
    holding winning ticket.
* Check wallet was participant in current draw (local round == current global 
    round) and that wallet is a holder of the winning ticket.
* If true, send prize pot to winning wallet and reward umpire with 1% of prize
    pot floored at 1 ALGO and capped at 10 ALGO.

New Round
---------
* Reset tickets sold to 0.
* Increment global state round number by one.
* Set next draw epoch to a week's time from now.

Emergency Dispense
------------------
* If there is an malfunction with the state of the program, add an option
    that would return funds to the users and destroy the contract.
"""
from pyteal import *
from pyteal_helpers import program

def approval():
    # globals
    global_owner = Bytes("owner")  # byteslice
    global_donation_addr = Bytes("donation_addr")  # byteslice
    global_tickets_sold = Bytes("tickets_sold")  # uint64
    global_next_draw_epoch = Bytes("next_draw_epoch")  # uint64

    # locals
    local_tickets = Bytes("tickets")  # uint64
    local_draw_epoch = Bytes("draw_epoch")  # uint64

    ## Operations
    # Purchase tickets
    op_purchase = Bytes("purchase")
    # Triggers the draw if the minimum time has elapsed.
    op_trigger = Bytes("trigger")

    on_init = Seq([
        App.globalPut(global_owner, Txn.sender()),
        App.globalPut(global_donation_addr, Txn.sender()),
        Approve(),
    ]),

    # Conditions
    # is_draw_time = Global.latest_timestamp()

    ## Randomness
    # hash of the block timestamp and a shuffled concatenation of the
    # addresses of some of the participants in the lottery.

    @Subroutine(TealType.none)
    def purchase_ticket():
        pass


    @Subroutine(TealType.none)
    def trigger_draw():
        pass

    return program.event(
        init=on_init,
        opt_in=Approve(),
        no_op=Seq(
            Cond(
                [
                    Txn.application_args[0] == op_purchase,
                    purchase_ticket(),
                ],
                [
                    Txn.application_args[0] == op_trigger,
                    trigger_draw(),
                ],
            ),
        )
    )

def clear():
    return Approve()
