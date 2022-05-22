"""
Lottery Smart Contract

* Each time a user purchases a ticket, a ticket number equal to the tickets
    sold + 1 is assigned to him.

Initialize
-----------
* Set contract owner to transaction sender.
* Set donation addres to designated address.
* Set ticket cost to designated ticket cost.
* Set tickets sold to 0.
* Set next draw epoch to one week from now.
* Set round number to 1.
* Set drawn to False.

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
* Psuedo-randomly select winning ticket between 1 and tickets_sold.
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
* Set drawn to False.

Restart Draw
---------
* Reset tickets sold to 0.
* Increment global state round number by one.
* Set next draw epoch to a week's time from now.

Emergency Dispense
------------------
* If there is an malfunction with the state of the program, add an option
    that would return funds to the users and destroy the contract.

Randomness
----------
Hash of the block timestamp and a shuffled concatenation of the addresses of 
some of the participants in the lottery.

Limitations
-----------
* Maximum tickets per wallet: 15
"""
from pyteal import *
from pyteal_helpers import program


MICRO_ALGO = 1
ALGO = MICRO_ALGO * (10 ** 6)
TICKET_COST_ALGO = ALGO * 1
WEEK_IN_SECONDS = 604800

DONATION_ADDR = Txn.sender()


def approval():
    ## Globals ################################################################
    global_owner = Bytes("owner")  # byteslice
    global_donation_addr = Bytes("donation_addr")  # byteslice
    global_drawn = Bytes("drawn")  # uint64
    global_round_num = Bytes("round_num")  # uint64
    global_tickets_sold = Bytes("tickets_sold")  # uint64
    global_next_draw_epoch = Bytes("next_draw_epoch")  # uint64
    global_ticket_algo_cost = Bytes("ticket_cost")  # uint64

    ## Locals #################################################################
    ticket_vars = [f"t{i}" for i in range(1, 16)]
    local_tickets = [Bytes(t_var) for t_var in ticket_vars]  # uint64 x 15
    local_draw_round = Bytes("draw_round")  # uint64

    ## Operations #############################################################

    # Purchase tickets
    # Inputs: num_of_tickets
    op_purchase = Bytes("purchase")
    # Triggers the draw if the minimum time has elapsed.
    op_draw = Bytes("draw")
    # Rewards winner of lottery
    op_reward = Bytes("reward")
    # Restarts a new round
    op_restart = Bytes("restart")

    ## General ################################################################
    def generic_checks(grp_size):
        return [
            program.check_self(group_size=Int(grp_size), group_index=Int(0)),
            program.check_rekey_zero(1)
        ]

    ## Purchase Tickets #######################################################
    purchase_pre_checks = Assert(

    )

    @Subroutine(TealType.none)
    def purchase_ticket():
        return Seq(
            *generic_checks(1),
            purchase_pre_checks,
        )

    ## Trigger Draw ###########################################################
    @Subroutine(TealType.none)
    def trigger_draw():
        pass

    ## Dispense Reward ########################################################
    @Subroutine(TealType.none)
    def dispense_reward():
        pass

    ## Restart Draw ###########################################################
    @Subroutine(TealType.none)
    def restart_draw():
        pass

    ## Intialize Contract #####################################################
    init_round_epoch = Add(Global.latest_timestamp(), Int(WEEK_IN_SECONDS))
    on_init = Seq([
        App.globalPut(global_owner, Txn.sender()),
        App.globalPut(global_donation_addr, DONATION_ADDR),
        App.globalPut(global_ticket_algo_cost, TICKET_COST_ALGO),
        App.globalPut(global_tickets_sold, Int(0)),
        App.globalPut(global_next_draw_epoch, init_round_epoch),
        App.globalPut(global_round_num, Int(1)),
        App.globalPut(global_drawn, Int(0)),
        Approve(),
    ]),

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
                    Txn.application_args[0] == op_draw,
                    trigger_draw(),
                ],
                [
                    Txn.application_args[0] == op_reward,
                    dispense_reward(),
                ],
                [
                    Txn.application_args[0] == op_restart,
                    restart_draw(),
                ],
            ),
        )
    )

def clear():
    return Approve()
