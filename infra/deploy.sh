# Set wallet environment variables
ONE=LHDAEQ7QDPK4CB56GPWNW5FQHW5N2B3D4PUP3E3MWI6OXGW5UH7WBZXTNI
TWO=LZMV3V7XNQNN6T53DU6ENIGRWTE5DP5SYTSD6MTJ6RKEMK4IKX2XXONF3U
THREE=PXSALUFZEU5DUB5N5FFHS7ZD4GTNI5CF7ULM4MEUVGA6ZPEIMFHN3O6XRU
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

# Opt-in to contract
goal app optin --app-id 1 --from $TWO

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