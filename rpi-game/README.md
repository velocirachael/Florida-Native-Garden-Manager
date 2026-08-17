# Monarch Flight 🦋

A pixel-art garden game for the Raspberry Pi, part of the Florida Native
Garden Manager project. It picks up where the browser story
([`monarch-game/`](../monarch-game/)) leaves off: the caterpillar you
guided there has grown up, and now the cycle begins again.

You are a mother monarch butterfly. Sip nectar from Florida native
flowers to keep your energy up, dodge the wasps, and lay all six of your
eggs on milkweed — the only plant a monarch caterpillar can eat.

## Running on a Raspberry Pi

Works on any Pi (including a Pi Zero) running Raspberry Pi OS:

```bash
sudo apt update
sudo apt install python3-pygame
python3 monarch_flight.py
```

That's it — no other files or downloads needed. The game renders at
320x240 and scales up, so it stays smooth even on older Pis.

It also runs on any laptop or desktop with Python 3 and pygame
(`pip install pygame`).

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Fly |
| SPACE | Lay an egg (while over a milkweed plant) |
| F | Toggle fullscreen |
| ESC | Quit |

## The garden

The flowers are real Florida natives you might plant for pollinators:

- **Firebush** (*Hamelia patens*)
- **Blanketflower** (*Gaillardia pulchella*)
- **Tropical Sage** (*Salvia coccinea*)
- **Dune Sunflower** (*Helianthus debilis*)
- **Blazing Star** (*Liatris spicata*)

And the milkweed with the orange blooms is **Butterfly Milkweed**
(*Asclepias tuberosa*) — the host plant monarchs depend on. Flowers
feed the butterfly; only milkweed can feed her caterpillars. That's
why native gardeners plant both.
