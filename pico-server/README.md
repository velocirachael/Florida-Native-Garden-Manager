# Pico 2 W Garden Game Server 📡🦋

Turn a Raspberry Pi Pico 2 W into a tiny web server that hosts the
browser game from [`monarch-game/`](../monarch-game/). Any device that
joins the Pico's WiFi — like an old cell phone — can open the Pico's IP
in a browser and play. No internet needed; the whole game lives on the
Pico's flash.

The game already has touch controls (tap to advance the story, an
on-screen D-pad, and EAT / SPIN SILK buttons), so a phone works great
as the "console."

## What you need

- Raspberry Pi Pico 2 W running MicroPython
- Any phone/tablet/laptop with a browser (an old Android works fine)

## Setup

1. Copy these four files onto the Pico's flash (using
   [Thonny](https://thonny.org) or `mpremote`):

   ```
   pico-server/main.py      →  main.py
   monarch-game/index.html  →  index.html
   monarch-game/game.html   →  game.html
   plant-log/index.html     →  plants.html
   ```

   With `mpremote` from this repo's root:

   ```bash
   mpremote cp pico-server/main.py :main.py
   mpremote cp monarch-game/index.html :index.html
   mpremote cp monarch-game/game.html :game.html
   mpremote cp plant-log/index.html :plants.html
   ```

2. Get the Pico on a network — pick one:

   **Home WiFi (recommended):** open `main.py` and fill in `HOME_SSID`
   and `HOME_PASSWORD` with your router's WiFi name and password. On
   boot the Pico joins your home network and prints its address (e.g.
   `http://192.168.1.47/`) — every device on your router can reach it.
   Tip: reserve that IP for the Pico in your router's DHCP settings so
   the address never changes.

   **Its own hotspot:** set `START_ACCESS_POINT = True` and change
   `AP_PASSWORD`. The Pico broadcasts its own network (default name
   `MonarchGarden`), typically at `192.168.4.1` — but only devices
   that join the Pico's WiFi directly can see it.

   > Heads-up: if your existing network setup lives in `main.py` or
   > `boot.py` on the Pico, merge it — put your network code in
   > `boot.py` and let this `main.py` handle the web serving.

3. From any device on the same network, open `http://<pico-ip>/` in a
   browser. The story page loads first; "Play the Game" starts it, and
   the Palmetto Ledger plant log is at `http://<pico-ip>/plants.html`.

## The plant log

`plants.html` is the Palmetto Ledger — a phone-friendly log of every
plant in the garden. Entries are saved to `plants.json` on the Pico's
flash through the `/api/plants` endpoint, so the log is shared by every
device on the network and survives reboots. The save is written to a
temp file and swapped in, so a power blip can't corrupt the log, and
uploads are capped at 32 KB (thousands of plants) to protect the
Pico's RAM.

## Notes

- The server streams files in 1 KB chunks and handles one visitor at a
  time — plenty for a garden kiosk, and easy on the Pico's RAM.
- It only serves plain files that exist in flash (no directories), so
  there's nothing else on the Pico a visitor can reach.
- The pygame game in [`rpi-game/`](../rpi-game/) is a different beast:
  it needs a full Raspberry Pi with a screen. This folder is for the
  microcontroller-sized Pico.
