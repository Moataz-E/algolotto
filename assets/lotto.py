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

Pseudo-Random Variables
-----------------------
* txn.Sender().
* txn.TxID().
* Hash of random elements of the scratch space.
* Global.latest_timestamp().

Reward Winner
--------------
* Identify holder of the winning ticket off-chain.
* Call application with reward operation and include address of wallet
    holding winning ticket.
* Check wallet was participant in current draw (local round == current global 
    round), wallet is a holder of the winning ticket, and that wallet
    has opted into this contract.
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
MAX_TICKETS = 15

TRUE = Int(1)
FALSE = Int(0)


def approval():
    ## Globals ################################################################
    global_owner = Bytes("owner")  # byteslice
    global_donation_addr = Bytes("donation_addr")  # byteslice
    global_drawn = Bytes("drawn")  # uint64
    global_round_num = Bytes("round_num")  # uint64
    global_tickets_sold = Bytes("tickets_sold")  # uint64
    global_next_draw_epoch = Bytes("next_draw_epoch")  # uint64
    global_ticket_cost = Bytes("ticket_cost")  # uint64
    global_winner = Bytes("winner")  # uint64

    ## Locals #################################################################
    ticket_vars = [f"t{i}" for i in range(1, MAX_TICKETS+1)]
    local_tickets = [Bytes(t_var) for t_var in ticket_vars]  # uint64 x 15
    local_draw_round = Bytes("draw_round")  # uint64

    ## Operations #############################################################

    # Purchase tickets
    # Additional Inputs: num_of_tickets
    op_purchase = Bytes("purchase")
    # Triggers the draw if the minimum time has elapsed.
    # Additional Inputs: None
    op_draw = Bytes("draw")
    # Rewards winner of lottery and restart draw
    # Additonal Inputs: winner_address
    op_dispense_restart = Bytes("dispense_and_restart")

    ## General ################################################################
    def generic_checks(grp_size, trx_args):
        return [
            program.check_self(group_size=Int(grp_size), group_index=Int(0)),
            program.check_rekey_zero(1),
            Assert(Txn.application_args.length() == Int(trx_args))
        ]

    ## Purchase Tickets #######################################################
    @Subroutine(TealType.none)
    def is_valid_purchase_request(tickets_to_buy):
        return Seq(
            Assert(App.optedIn(Txn.sender(), Global.current_application_id())),
            Assert(tickets_to_buy <= Int(MAX_TICKETS)),
            Assert(App.globalGet(global_drawn) == FALSE)
        )

    @Subroutine(TealType.uint64)
    def is_old_participant(draw_round, t0):
        """True if wallet previously bought a lottery ticket."""
        return Return(
            And(draw_round < App.globalGet(global_round_num), t0 != Int(0))
        )

    @Subroutine(TealType.uint64)
    def is_valid_purchase(existing_tickets: ScratchVar, tickets_to_buy: Expr):
        """Validate ticket purchase"""
        return Return(And(
            # Ensure not purchasing more than required tickets
            (existing_tickets.load() + tickets_to_buy) <= Int(MAX_TICKETS),
            # Second transaction is a payment transaction
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.current_application_address(),
            Gtxn[1].close_remainder_to() == Global.zero_address(),
            # Ensure user sent correct amount to purchase tickets
            (Gtxn[1].amount() >= 
                (tickets_to_buy * App.globalGet(global_ticket_cost))),
        ))

    @Subroutine(TealType.none)
    def reset_tickets(account: Expr):
        i = ScratchVar()
        init = i.store(Int(0))
        cond = i.load() < Int(MAX_TICKETS)
        it = i.store(i.load() + Int(1))
        return Seq(
            For(init, cond, it).Do(
                App.localPut(
                    account, Extract(Itob(i.load()), Int(7), Int(1)), Int(0)
                )
            ),
        )

    @Subroutine(TealType.uint64)
    def get_existing_tickets():
        i = ScratchVar()
        current_ticket = ScratchVar()
        init = i.store(Int(0))
        cond = i.load() < Int(MAX_TICKETS)
        it = i.store(i.load() + Int(1))
        return Seq(
            For(init, cond, it).Do(
                Seq([
                    current_ticket.store(
                        App.localGet(
                            Txn.sender(),
                            Extract(Itob(i.load()), Int(7), Int(1))
                        )
                    ),
                    If(current_ticket.load() == Int(0)).Then(Break())
                ])
            ),
            Return(i.load())
        )

    @Subroutine(TealType.none)
    def store_tickets(
            account, existing_tickets: ScratchVar, tickets_to_buy: Expr):
        i = ScratchVar()
        current_ticket = ScratchVar()
        init = i.store(existing_tickets.load())
        cond = i.load() < (existing_tickets.load() + tickets_to_buy)
        it = i.store(i.load() + Int(1))
        return Seq(
            # Retrieve the next ticket number to be sold this round
            current_ticket.store(App.globalGet(global_tickets_sold)),
            # Set ticket slots equivalent to tickets purchased
            For(init, cond, it).Do(
                Seq([
                    current_ticket.store(current_ticket.load() + Int(1)),
                    # Set ticket slot to next ticket number
                    App.localPut(
                        account, 
                        Extract(Itob(i.load()), Int(7), Int(1)), 
                        current_ticket.load()
                    )

                ])
            ),
            App.globalPut(global_tickets_sold, current_ticket.load())
        )

    @Subroutine(TealType.none)
    def process_purchase(account, tickets_to_buy):
        existing_tickets = ScratchVar(TealType.uint64)
        return Seq([
            existing_tickets.store(get_existing_tickets()),
            Assert(is_valid_purchase(existing_tickets, tickets_to_buy)),
            store_tickets(account, existing_tickets, tickets_to_buy),
            # Update account's round number to be current
            App.localPut(
                account, 
                local_draw_round, 
                App.globalGet(global_round_num)
            )
        ])

    @Subroutine(TealType.none)
    def purchase_tickets():
        """Purchase tickets.

        Three starting states
            1. No tickets purchased before ever.
            2. Purchased tickets in previous round -> reset_tickets.
            3. Bought tickets in current round but need to buy more.
            4. Bought maximum tickets in current round allocation.        
        """
        tickets_to_buy = Btoi(Txn.application_args[1])
        sch_draw_round = ScratchVar(TealType.uint64)
        sch_first_ticket = ScratchVar(TealType.uint64)
        return Seq(
            *generic_checks(2, 2),
            is_valid_purchase_request(tickets_to_buy),
            sch_draw_round.store(
                App.localGet(Txn.sender(), local_draw_round)),
            sch_first_ticket.store(
                App.localGet(Txn.sender(), Itob(Int(0)))),
            # If user participated before, then reset all tickets state
            If(
                is_old_participant(
                    sch_draw_round.load(), sch_first_ticket.load())
            ).Then(reset_tickets(Txn.sender())),
            process_purchase(Txn.sender(), tickets_to_buy),
            Approve()
        )

    ## Trigger Draw ###########################################################
    @Subroutine(TealType.none)
    def can_draw():
        return Seq(
            Assert(App.globalGet(global_tickets_sold) > Int(0)),
            Assert(App.globalGet(global_drawn) == FALSE),
            Assert(
                Global.latest_timestamp() >
                App.globalGet(global_next_draw_epoch)
            )
        )

    # TODO: need a better way of randomly selecting tickets
    @Subroutine(TealType.uint64)
    def select_winner():
        return Return(
            Add(
                Mod(
                    Global.latest_timestamp(), 
                    App.globalGet(global_tickets_sold)
                ),
                Int(1)
            )
        )

    @Subroutine(TealType.none)
    def trigger_draw():
        return Seq(
            *generic_checks(1, 0),
            can_draw(),
            App.globalPut(global_drawn, Int(1)),
            App.globalPut(global_winner, select_winner()),
            Approve()
        )

    ## Dispense Reward and Restart ############################################
    @Subroutine(TealType.uint64)
    def has_winning_ticket(addr: Expr):
        i = ScratchVar()
        current_ticket = ScratchVar()
        init = i.store(Int(0))
        cond = i.load() < Int(MAX_TICKETS)
        it = i.store(i.load() + Int(1))
        return Seq(
            For(init, cond, it).Do(
                Seq([
                    current_ticket.store(
                        App.localGet(
                            addr,
                            Extract(Itob(i.load()), Int(7), Int(1))
                        )
                    ),
                    If(current_ticket.load() == App.globalGet(global_winner))
                    .Then(Return(TRUE))
                ])
            ),
            Return(FALSE)
        )

    @Subroutine(TealType.none)
    def is_winner(addr: Expr):
        """Validate that address is holder of the winning ticket."""
        return Seq(
            # Confirm that the winner's wallet has opted in
            Assert(App.optedIn(addr, Global.current_application_id())),
            # Confirm that the winner is the holder of the winning ticket
            Assert(has_winning_ticket(addr) == TRUE),
            # Confirm the winner bought his tickets in the current round
            Assert(
                App.localGet(
                    addr, local_draw_round) == App.globalGet(global_round_num)
            ),
        )

    @Subroutine(TealType.none)
    def send_prize(account: Expr, amount: Expr):
        return Seq(
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: account,
                TxnField.amount: amount,
                TxnField.fee: Int(0)
            }),
            InnerTxnBuilder.Submit()
        )

    @Subroutine(TealType.none)
    def reset():
        return Seq(
            App.globalPut(global_tickets_sold, Int(0)),
            App.globalPut(
                global_round_num, 
                App.globalGet(global_round_num) + Int(1)
            ),
            App.globalPut(
                global_next_draw_epoch,
                Global.latest_timestamp() + Int(WEEK_IN_SECONDS)
            ),
            App.globalPut(global_drawn, Int(0)),
            App.globalPut(global_winner, Int(0))
        )

    @Subroutine(TealType.none)
    def dispense_and_restart():
        winner_addr = Txn.application_args[1]
        return Seq(
            *generic_checks(1, 1),
            # Ensure transaction fees cover cost of sending prize
            Assert(Txn.fee() >= Global.min_txn_fee() * Int(2)),
            is_winner(winner_addr),
            # TODO: Send money to winner
            # Reset state and start next round
            reset()
        )

    ## Intialize Contract #####################################################
    init_round_epoch = Add(Global.latest_timestamp(), Int(WEEK_IN_SECONDS))
    on_init = Seq([
        App.globalPut(global_owner, Txn.sender()),
        App.globalPut(global_donation_addr, DONATION_ADDR),
        App.globalPut(global_ticket_cost, Int(TICKET_COST_ALGO)),
        App.globalPut(global_tickets_sold, Int(0)),
        App.globalPut(global_next_draw_epoch, init_round_epoch),
        App.globalPut(global_round_num, Int(1)),
        App.globalPut(global_drawn, Int(0)),
        App.globalPut(global_winner, Int(0)),
        Approve(),
    ])

    opt_in = Seq([
        reset_tickets(Txn.sender()),
        App.localPut(Txn.sender(), local_draw_round, Int(0)),
        Approve()
    ])

    return program.event(
        init=on_init,
        opt_in=opt_in,
        no_op=Seq(
            Cond(
                [
                    Txn.application_args[0] == op_purchase,
                    purchase_tickets(),
                ],
                [
                    Txn.application_args[0] == op_draw,
                    trigger_draw(),
                ],
                [
                    Txn.application_args[0] == op_dispense_restart,
                    dispense_and_restart(),
                ],
            ),
            Reject()
        )
    )

def clear():
    return Approve()
