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
