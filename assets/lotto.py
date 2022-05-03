from pyteal import *
from pyteal_helpers import program

def approval():
    return program.event(
        init=Approve(),
    )

def clear():
    return Approve()
