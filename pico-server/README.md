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

1. Copy these three files onto the Pico's flash (using
   [Thonny](https://thonny.org) or `mpremote`):

   ```
   pico-server/main.py      →  main.py
   monarch-game/index.html  →  index.html
   monarch-game/game.html   →  game.html
   ```

   With `mpremote` from this repo's root:

   ```bash
   mpremote cp pico-server/main.py :main.py
   mpremote cp monarch-game/index.html :index.html
   mpremote cp monarch-game/game.html :game.html
   ```

2. **If your Pico is already a WiFi hub with its own IP:** you're done —
   `main.py` runs automatically on boot and serves on port 80.

   > Heads-up: if your existing hub setup lives in `main.py` or
   > `boot.py` on the Pico, merge it — put your network code in
   > `boot.py` and let this `main.py` handle the web serving.

   **If it isn't a hub yet:** open `main.py`, set
   `START_ACCESS_POINT = True`, and change `AP_PASSWORD`. The Pico
   will broadcast its own network (default name `MonarchGarden`) on
   boot, typically at `192.168.4.1`.

3. On the phone: join the Pico's WiFi network, open the browser, and
   go to `http://<pico-ip>/` (e.g. `http://192.168.4.1/`). The story
   page loads first; "Play the Game" starts it.

## Notes

- The server streams files in 1 KB chunks and handles one visitor at a
  time — plenty for a garden kiosk, and easy on the Pico's RAM.
- It only serves plain files that exist in flash (no directories), so
  there's nothing else on the Pico a visitor can reach.
- The pygame game in [`rpi-game/`](../rpi-game/) is a different beast:
  it needs a full Raspberry Pi with a screen. This folder is for the
  microcontroller-sized Pico.
