# Set wallet environment variables
ONE=E2HNFPXPVZSVIKOVM4FA7MFXHNOGLKMMBNUQ7H5XR3TLKLTPJIYWR4AWEY
TWO=KTSPLIRCNAUUZTGARMAF5VESLSESKMEDBE4MPCDCZUGXVN4QIWDTKEKFLQ
THREE=3OZ34J4SUB5BYRWUZY6XSODMJLFKSIQQGPE44NL7LGCGMTTXT5SV4TFSE4
FOUR=NJD25R7GLHLE75IFFMWT3VT2GVBVWRN5EIBR7JY4WYATOVJ3EU6ARE4JZQ
APP_ADDR=WCS6TVPJRBSARHLN2326LRU5BYVJZUKI2VJ53CAWKYYHDE455ZGKANWMGM

# Deploy application to alogrand
goal app create \
    --creator $ONE \
    --approval-prog /data/approval.teal \
    --clear-prog /data/clear.teal \
    --global-byteslices 2 \
    --global-ints 6 \
    --local-byteslices 0 \
    --local-ints 16

# Send balance to user account
goal clerk send -a 100000000 -f $ONE -t $FOUR

# Opt-in to contract
goal app optin --app-id 1 --from $TWO

# Purchase ####################################################################
# Create purchase ticket transaction
goal app call --app-id 1 --from $TWO --app-arg "str:purchase" --app-arg "int:4" -o purchase.tx

# Create payment transaction
goal clerk send -a "4000000" -t $APP_ADDR -f $TWO -o purchase_payment.tx

# Group transactions
cat purchase.tx purchase_payment.tx > purchase_ticket.tx
goal clerk group -i purchase_ticket.tx -o purchase_grouped.tx
goal clerk split -i purchase_grouped.tx -o purchase_split.tx

# Sign individual transactions
goal clerk sign -i purchase_split-0.tx -o purchase-signed-0.tx
goal clerk sign -i purchase_split-1.tx -o purchase-signed-1.tx

# Re-combine signed
cat purchase-signed-0.tx purchase-signed-1.tx > purchase-signed.tx
# goal clerk dryrun --dryrun-dump -t purchase-signed.tx -o tx.dr
goal clerk rawsend -f purchase-signed.tx

# Trigger Draw ################################################################
goal app call --app-id 1 --from $TWO --app-arg "str:draw"

# Dispense and Restart ########################################################
goal app call --app-id 1 --from $TWO --app-arg "str:dispense_and_restart" --app-arg "addr:$ONE" --fee 3000 --app-account $ONE
