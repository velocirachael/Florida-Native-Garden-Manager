#!/usr/bin/env python3
"""
Monarch Flight — a Florida native garden game for the Raspberry Pi.

You are a mother monarch butterfly. Sip nectar from Florida native
flowers to keep your energy up, dodge the wasps, and lay your eggs
on milkweed — the only plant a monarch caterpillar can eat.

Part of the Florida Native Garden Manager project. This game picks up
where the browser story (monarch-game/) leaves off: the caterpillar
you guided there has grown up, and now the cycle begins again.

Controls:
    Arrow keys / WASD ... fly
    SPACE ............... lay an egg (while over a milkweed plant)
    F ................... toggle fullscreen
    ESC ................. quit

Runs on any Raspberry Pi with:
    sudo apt install python3-pygame
    python3 monarch_flight.py
"""

import math
import random
import sys

import pygame

# ---------------------------------------------------------------
# The game renders to a small 320x240 surface and scales it up to
# the window, so it stays fast on a Pi and keeps a pixel-art look.
# ---------------------------------------------------------------
GAME_W, GAME_H = 320, 240
WINDOW_SCALE = 3
FPS = 30

EGGS_TO_WIN = 6
MAX_ENERGY = 100.0
ENERGY_DRAIN_PER_SEC = 2.2      # flying is hungry work
NECTAR_PER_SIP = 22.0
WASP_STING_COST = 18.0
EGG_COST = 10.0                 # laying an egg takes energy too

# Palette (matches the browser game's colors)
SKY_TOP = (167, 216, 232)
SKY_BOTTOM = (247, 201, 160)
GRASS_DARK = (47, 82, 51)
GRASS_MID = (79, 121, 66)
GRASS_LIGHT = (122, 155, 92)
CREAM = (244, 233, 216)
MONARCH_ORANGE = (232, 114, 44)
MONARCH_BLACK = (43, 35, 32)
EGG_GLOW = (255, 247, 214)
WASP_YELLOW = (240, 200, 60)

# Florida native flowers the garden grows (name, petal color, center color)
FLOWER_KINDS = [
    ("Firebush", (200, 60, 40), (240, 140, 60)),
    ("Blanketflower", (230, 130, 40), (150, 40, 30)),
    ("Tropical Sage", (210, 40, 60), (230, 120, 120)),
    ("Dune Sunflower", (240, 200, 70), (90, 60, 30)),
    ("Blazing Star", (170, 110, 200), (210, 170, 230)),
]


class Flower:
    """A nectar source. Nectar regrows slowly after each sip."""

    def __init__(self, x, y):
        self.x = x
        self.y = y
        name, petal, center = random.choice(FLOWER_KINDS)
        self.name = name
        self.petal = petal
        self.center = center
        self.nectar = True
        self.regrow_timer = 0.0
        self.sway = random.uniform(0, math.tau)

    def update(self, dt):
        self.sway += dt * 1.5
        if not self.nectar:
            self.regrow_timer -= dt
            if self.regrow_timer <= 0:
                self.nectar = True

    def sip(self):
        self.nectar = False
        self.regrow_timer = random.uniform(8.0, 14.0)

    def draw(self, surf):
        wob = math.sin(self.sway) * 1.5
        # stem
        pygame.draw.line(surf, GRASS_DARK, (self.x, self.y + 14),
                         (self.x + wob, self.y), 1)
        # petals: a ring of 6 dots around the center
        for i in range(6):
            a = i * math.tau / 6 + self.sway * 0.05
            px = self.x + wob + math.cos(a) * 4
            py = self.y + math.sin(a) * 4
            pygame.draw.circle(surf, self.petal, (int(px), int(py)), 2)
        pygame.draw.circle(surf, self.center, (int(self.x + wob), int(self.y)), 2)
        if self.nectar:
            # a bright glint means nectar is ready
            surf.set_at((int(self.x + wob), int(self.y) - 1), EGG_GLOW)


class Milkweed:
    """The host plant. Each plant can hold one monarch egg."""

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.has_egg = False
        self.sway = random.uniform(0, math.tau)

    def update(self, dt):
        self.sway += dt * 1.2

    def draw(self, surf):
        wob = math.sin(self.sway) * 1.5
        # stem with paired leaves — milkweed's signature look
        pygame.draw.line(surf, GRASS_MID, (self.x, self.y + 16),
                         (self.x + wob, self.y - 2), 2)
        for ly in (4, 9, 14):
            pygame.draw.ellipse(surf, GRASS_LIGHT,
                                (self.x - 7 + wob, self.y + ly - 2, 7, 4))
            pygame.draw.ellipse(surf, GRASS_LIGHT,
                                (self.x + wob, self.y + ly - 2, 7, 4))
        # orange bloom cluster on top (butterfly milkweed)
        for i in range(5):
            a = i * math.tau / 5
            bx = self.x + wob + math.cos(a) * 3
            by = self.y - 3 + math.sin(a) * 2
            pygame.draw.circle(surf, MONARCH_ORANGE, (int(bx), int(by)), 2)
        if self.has_egg:
            # the egg sits under a leaf, glowing softly
            pygame.draw.circle(surf, EGG_GLOW, (int(self.x - 4 + wob), self.y + 9), 2)


class Wasp:
    """A paper wasp patrolling the garden on a looping path."""

    def __init__(self):
        self.cx = random.uniform(60, GAME_W - 60)
        self.cy = random.uniform(50, GAME_H - 70)
        self.rx = random.uniform(30, 70)
        self.ry = random.uniform(15, 35)
        self.speed = random.uniform(0.8, 1.4)
        self.t = random.uniform(0, math.tau)
        self.x = self.cx
        self.y = self.cy

    def update(self, dt):
        self.t += dt * self.speed
        self.x = self.cx + math.cos(self.t) * self.rx
        self.y = self.cy + math.sin(self.t * 1.7) * self.ry

    def draw(self, surf, frame):
        x, y = int(self.x), int(self.y)
        # wings buzz fast
        wing_up = (frame // 2) % 2 == 0
        wy = y - 3 if wing_up else y - 2
        pygame.draw.line(surf, (220, 220, 230), (x - 2, wy), (x - 5, wy - 2), 1)
        pygame.draw.line(surf, (220, 220, 230), (x + 2, wy), (x + 5, wy - 2), 1)
        # striped body
        pygame.draw.rect(surf, WASP_YELLOW, (x - 3, y - 1, 7, 4))
        pygame.draw.rect(surf, MONARCH_BLACK, (x - 1, y - 1, 1, 4))
        pygame.draw.rect(surf, MONARCH_BLACK, (x + 2, y - 1, 1, 4))
        surf.set_at((x - 4, y), MONARCH_BLACK)  # head


class Butterfly:
    """The player: a mother monarch."""

    def __init__(self):
        self.x = GAME_W / 2
        self.y = GAME_H / 2
        self.vx = 0.0
        self.vy = 0.0
        self.energy = MAX_ENERGY
        self.hurt_timer = 0.0     # brief invincibility after a sting

    def update(self, dt, keys):
        accel = 260.0
        drag = 0.86
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.vx -= accel * dt
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.vx += accel * dt
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.vy -= accel * dt
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.vy += accel * dt
        self.vx *= drag
        self.vy *= drag
        self.x = max(6, min(GAME_W - 6, self.x + self.vx * dt))
        self.y = max(6, min(GAME_H - 30, self.y + self.vy * dt))
        self.energy -= ENERGY_DRAIN_PER_SEC * dt
        if self.hurt_timer > 0:
            self.hurt_timer -= dt

    def draw(self, surf, frame):
        x, y = int(self.x), int(self.y)
        # blink while recovering from a sting
        if self.hurt_timer > 0 and (frame // 3) % 2 == 0:
            return
        flap = (frame // 4) % 2 == 0
        wing_w = 6 if flap else 4
        # orange wings with black edges (drawn as layered rects)
        pygame.draw.rect(surf, MONARCH_BLACK, (x - wing_w - 1, y - 4, wing_w + 1, 8))
        pygame.draw.rect(surf, MONARCH_BLACK, (x, y - 4, wing_w + 1, 8))
        pygame.draw.rect(surf, MONARCH_ORANGE, (x - wing_w, y - 3, wing_w, 6))
        pygame.draw.rect(surf, MONARCH_ORANGE, (x, y - 3, wing_w, 6))
        # white spots on the wingtips, like a real monarch
        surf.set_at((x - wing_w, y - 2), CREAM)
        surf.set_at((x + wing_w - 1, y - 2), CREAM)
        # body
        pygame.draw.rect(surf, MONARCH_BLACK, (x - 1, y - 4, 2, 9))


def draw_background(surf):
    """Sky gradient over a grassy garden floor."""
    for y in range(GAME_H):
        t = y / GAME_H
        r = int(SKY_TOP[0] + (SKY_BOTTOM[0] - SKY_TOP[0]) * t)
        g = int(SKY_TOP[1] + (SKY_BOTTOM[1] - SKY_TOP[1]) * t)
        b = int(SKY_TOP[2] + (SKY_BOTTOM[2] - SKY_TOP[2]) * t)
        pygame.draw.line(surf, (r, g, b), (0, y), (GAME_W, y))
    pygame.draw.circle(surf, (255, 224, 138), (270, 34), 14)  # sun
    pygame.draw.rect(surf, GRASS_MID, (0, GAME_H - 26, GAME_W, 26))
    pygame.draw.rect(surf, GRASS_DARK, (0, GAME_H - 26, GAME_W, 3))


def draw_hud(surf, font, player, eggs_laid, message, message_timer):
    # energy bar
    pygame.draw.rect(surf, MONARCH_BLACK, (5, 5, 84, 9))
    fill = max(0, int(80 * player.energy / MAX_ENERGY))
    color = MONARCH_ORANGE if player.energy > 25 else (200, 50, 40)
    pygame.draw.rect(surf, color, (7, 7, fill, 5))
    surf.blit(font.render("NECTAR", False, CREAM), (92, 5))
    # egg counter
    label = font.render(f"EGGS {eggs_laid}/{EGGS_TO_WIN}", False, CREAM)
    surf.blit(label, (GAME_W - label.get_width() - 5, 5))
    # toast message
    if message and message_timer > 0:
        text = font.render(message, False, CREAM)
        bx = GAME_W // 2 - text.get_width() // 2
        pygame.draw.rect(surf, MONARCH_BLACK,
                         (bx - 4, 18, text.get_width() + 8, text.get_height() + 4))
        surf.blit(text, (bx, 20))


def draw_center_text(surf, font, big_font, title, lines):
    shade = pygame.Surface((GAME_W, GAME_H))
    shade.set_alpha(150)
    shade.fill((20, 16, 14))
    surf.blit(shade, (0, 0))
    t = big_font.render(title, False, MONARCH_ORANGE)
    surf.blit(t, (GAME_W // 2 - t.get_width() // 2, 60))
    y = 100
    for line in lines:
        s = font.render(line, False, CREAM)
        surf.blit(s, (GAME_W // 2 - s.get_width() // 2, y))
        y += 14


def new_garden():
    """Lay out flowers, milkweed, and wasps with breathing room between plants."""
    flowers = []
    milkweeds = []
    spots = []
    tries = 0
    while len(spots) < 14 and tries < 300:
        tries += 1
        x = random.randint(20, GAME_W - 20)
        y = random.randint(60, GAME_H - 40)
        if all((x - sx) ** 2 + (y - sy) ** 2 > 30 ** 2 for sx, sy in spots):
            spots.append((x, y))
    for i, (x, y) in enumerate(spots):
        if i < EGGS_TO_WIN + 1:          # one spare milkweed
            milkweeds.append(Milkweed(x, y))
        else:
            flowers.append(Flower(x, y))
    wasps = [Wasp() for _ in range(3)]
    return flowers, milkweeds, wasps


def main():
    pygame.init()
    pygame.display.set_caption("Monarch Flight — Florida Native Garden")
    window = pygame.display.set_mode((GAME_W * WINDOW_SCALE, GAME_H * WINDOW_SCALE))
    game = pygame.Surface((GAME_W, GAME_H))
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("monospace", 10, bold=True)
    big_font = pygame.font.SysFont("monospace", 18, bold=True)
    fullscreen = False

    state = "title"   # title -> play -> win / gameover
    player = Butterfly()
    flowers, milkweeds, wasps = new_garden()
    eggs_laid = 0
    message = ""
    message_timer = 0.0
    frame = 0

    def toast(text, seconds=2.2):
        nonlocal message, message_timer
        message = text
        message_timer = seconds

    def reset():
        nonlocal player, flowers, milkweeds, wasps, eggs_laid, message_timer
        player = Butterfly()
        flowers, milkweeds, wasps = new_garden()
        eggs_laid = 0
        message_timer = 0.0

    while True:
        dt = clock.tick(FPS) / 1000.0
        dt = min(dt, 0.1)  # don't let a slow frame teleport things
        frame += 1

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()
                if event.key == pygame.K_f:
                    fullscreen = not fullscreen
                    flags = pygame.FULLSCREEN | pygame.SCALED if fullscreen else 0
                    window = pygame.display.set_mode(
                        (GAME_W * WINDOW_SCALE, GAME_H * WINDOW_SCALE), flags)
                if state == "title" and event.key == pygame.K_RETURN:
                    state = "play"
                elif state in ("win", "gameover") and event.key == pygame.K_RETURN:
                    reset()
                    state = "play"
                elif state == "play" and event.key == pygame.K_SPACE:
                    # try to lay an egg on the nearest empty milkweed
                    for mw in milkweeds:
                        close = (player.x - mw.x) ** 2 + (player.y - mw.y) ** 2 < 14 ** 2
                        if close and not mw.has_egg:
                            if player.energy <= EGG_COST:
                                toast("Too tired to lay - sip some nectar first!")
                            else:
                                mw.has_egg = True
                                eggs_laid += 1
                                player.energy -= EGG_COST
                                toast("Egg laid on the milkweed!")
                                if eggs_laid >= EGGS_TO_WIN:
                                    state = "win"
                            break
                    else:
                        toast("Eggs only go on milkweed - the orange blooms!")

        if state == "play":
            keys = pygame.key.get_pressed()
            player.update(dt, keys)
            for f in flowers:
                f.update(dt)
                close = (player.x - f.x) ** 2 + (player.y - f.y) ** 2 < 10 ** 2
                if close and f.nectar and player.energy < MAX_ENERGY - 2:
                    f.sip()
                    player.energy = min(MAX_ENERGY, player.energy + NECTAR_PER_SIP)
                    toast(f"Sweet {f.name} nectar!", 1.6)
            for mw in milkweeds:
                mw.update(dt)
            for wsp in wasps:
                wsp.update(dt)
                close = (player.x - wsp.x) ** 2 + (player.y - wsp.y) ** 2 < 8 ** 2
                if close and player.hurt_timer <= 0:
                    player.energy -= WASP_STING_COST
                    player.hurt_timer = 1.5
                    # knockback away from the wasp
                    player.vx += (player.x - wsp.x) * 14
                    player.vy += (player.y - wsp.y) * 14
                    toast("Ouch - a wasp!", 1.6)
            if message_timer > 0:
                message_timer -= dt
            if player.energy <= 0:
                state = "gameover"

        # ---- draw ----
        draw_background(game)
        for f in flowers:
            f.draw(game)
        for mw in milkweeds:
            mw.draw(game)
        for wsp in wasps:
            wsp.draw(game, frame)
        player.draw(game, frame)

        if state == "title":
            draw_center_text(game, font, big_font, "MONARCH FLIGHT", [
                "You are a mother monarch.",
                "Sip nectar from the garden's flowers,",
                "dodge the wasps, and lay your eggs",
                "on milkweed (the orange blooms).",
                "",
                "Arrows/WASD fly - SPACE lays an egg",
                "",
                "Press ENTER to begin",
            ])
        elif state == "play":
            draw_hud(game, font, player, eggs_laid, message, message_timer)
        elif state == "win":
            draw_center_text(game, font, big_font, "THE CYCLE CONTINUES", [
                f"All {EGGS_TO_WIN} eggs are safe on milkweed.",
                "In three days they will hatch,",
                "and tiny caterpillars will begin",
                "their own hungry adventure.",
                "",
                "Press ENTER to play again",
            ])
        elif state == "gameover":
            draw_center_text(game, font, big_font, "OUT OF NECTAR", [
                "The garden needs more flowers...",
                "and you needed more sips.",
                "",
                f"Eggs laid: {eggs_laid}/{EGGS_TO_WIN}",
                "",
                "Press ENTER to try again",
            ])

        window.blit(pygame.transform.scale(game, window.get_size()), (0, 0))
        pygame.display.flip()


if __name__ == "__main__":
    main()
