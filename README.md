# Stop russia desinformation - DDoS their websites

## Our current targets
  - https://eadaily.com/
  - https://www.moex.com/

We automatically update list of sites, need just restart script to load updated targets.

## Requirements:
Use vpn during attacks. You can use a free [UrbanVPN](https://www.urban-vpn.com) extension to turn it on. It’s preferable to use the Russian region.

### Install NodeJS:
Download and install at least 16 version here: https://nodejs.org/en/ 
or via homebrew if you’re pro https://formulae.brew.sh/formula/node

### Download code from repository: https://github.com/ArtemTopolskyi/stop-russia-desinformation (code => download zip) OR clone via http or ssh if you have a github account 
- Open terminal, navigate to downloaded folder:
On MacOS simply drag folder to the terminal window
On windows in the folder: right click => open terminal here

- Launch script node ddos in the opened terminal, you should see smth like this:
- Keep terminal opened

- If script stucks, re-launch it:
  - Stop it using command `ctrl+c` in terminal
  - Write `node ddos` again

## Notes:
To check if website is down use the following tools:
https://port.ping.pe/eadaily.com:443
https://www.uptrends.com/tools/uptime 
