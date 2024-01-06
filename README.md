# cryptoneversleeps

> DCA crypto bot for buying in the weekend

It buys crypto of your desire using the [Firi API](https://developers.firi.com) and notifies on Discord when buys are made.

## Install

### Build the docker image

```bash
docker build -t cryptoneversleeps .
```

### Schedule the cronjob

```bash
crontab -e

# Add the following line to the crontab:
37 13 * * 0,6 docker run --rm cryptoneversleeps
```

## Environment variables

See [.env.example](.env.example) for the required environment variables.

## Config file

See [buy-config.json.example](buy-config.json.example) for an example config file.
