# Stop russia desinformation - DDoS their websites

## Our current targets
  - https://eadaily.com/
  - https://www.moex.com/
  - https://fsvts.gov.ru/
  - http://mid.ru

We automatically update list of sites, need just restart script to load updated targets.

## Requirements:
Use vpn during attacks. You can use a free [UrbanVPN](https://www.urban-vpn.com) extension to turn it on. It’s preferable to use the Russian region.

### Install NodeJS:
Download and install at least 16 version here: https://nodejs.org/en/ 
or via homebrew if you’re pro https://formulae.brew.sh/formula/node

### Run script:
- Open terminal
- Launch script `npx stop-russia-desinformation` in the opened terminal
- Keep terminal opened

- If script stucks, re-launch it:
  - Stop it using command `ctrl+c` in terminal
  - Launch `npx stop-russia-desinformation` again


## Notes:
To check if website is down use the following tools:
- https://port.ping.pe/eadaily.com:443
- https://www.uptrends.com/tools/uptime
