# Algolotto
Algorand Lottery

## Development Environment

### Sandbox
1. Clone the sandbox repository from [here](https://github.com/algorand/sandbox).
2. Modify `docker-compose.yml` by adding a volume that maps to our compiled contracts, as so:
```
    volumes:
      - type: bind
        source: /home/moataz/projects/crypto/algolotto/algolotto/build
        target: /data
```
3. Initialize the docker containers by running `./sandbox up`.

### Running a Smart Contract Locally
1. Build the smart contract module folder by running `./build.sh assets.lotto`.
2. Enter the algod container by running `./sandbox enter algod`. The smart contract TEAL files should now be available in the container in the `/data` directory.
3. Deploy program to local sandbox environment using the command:
```
goal app create --creator <owner address> --approval-prog /data/approval.teal --clear-prog /data/clear.teal --global-byteslices <n> --global-ints <n> --local-byteslices <n> --local-ints <n>
```

### Testing Operations
* To opt-in to the app:
```
goal app optin --app-id 1 --from $TWO 
```
* To purchase a ticket:
```
goal app call --app-id 1 --from $TWO --app-arg "str:purchase" --app-arg "int:1"
```
* To dump transaction for inspection
```
goal app call ... --dryrun-dump -o tx.dr
```
* To launch debuger for a given transaction dump
```
tealdbg debug -d tx.dr --listen 0.0.0.0
```
* To view local storage of an account
```
goal app read --app-id 1 -f $TWO --local
```
* To check balance of an account
```
goal account balance -a $TWO
```
* To send algo between accounts
```
goal clerk send -a 100000 -f $ONE -t $TWO
```

### Deployment Operations
* To retrieve application address using application id
```
python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(<app id>).to_bytes(8, 'big'))))"
```

### Notes
* Integer arguments still have to be converted using Btoi as specifying "int:x" as an argument only tells TEAL how to encode the argument but it is still passed as a byte.
