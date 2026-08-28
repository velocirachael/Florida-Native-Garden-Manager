# Garden web server for the Raspberry Pi Pico 2 W (MicroPython).
#
# Serves the browser game from monarch-game/ and the plant log from
# plant-log/ to anyone who joins the Pico's WiFi network. Copy these
# files onto the Pico's flash:
#
#     main.py       (this file)
#     index.html    (from monarch-game/)
#     game.html     (from monarch-game/)
#     plants.html   (from plant-log/index.html)
#
# Then visit http://<pico-ip>/ from any device on the Pico's network.
# The plant log lives at http://<pico-ip>/plants.html and stores its
# entries in plants.json on the Pico's flash via /api/plants.
#
# This script assumes your Pico is already set up as a WiFi hub with
# its own IP. If it isn't, flip START_ACCESS_POINT to True below and
# the Pico will broadcast its own network on boot.

import json
import os
import socket

# Two ways to get the Pico on a network — pick ONE:
#
# 1. Join your home WiFi (recommended): fill in HOME_SSID/HOME_PASSWORD
#    below. Every device already on your router can then reach the Pico
#    at the IP your router assigns it (printed on boot, e.g. 192.168.1.x).
#
# 2. Broadcast its own network: set START_ACCESS_POINT = True. Devices
#    must join the Pico's WiFi directly; the Pico is then 192.168.4.1.
HOME_SSID = ""              # your home WiFi name
HOME_PASSWORD = ""          # your home WiFi password

START_ACCESS_POINT = False
AP_SSID = "MonarchGarden"
AP_PASSWORD = "milkweed1"   # min 8 characters; change this!

PORT = 80
CHUNK = 1024                # stream files in small pieces to save RAM

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".ico": "image/x-icon",
}

PLANT_FILE = "plants.json"
MAX_PLANT_BYTES = 32 * 1024   # cap the log so a bad POST can't eat the RAM
EMPTY_PLANTS = b'{"plants":[]}'


def start_access_point():
    import network
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=AP_SSID, password=AP_PASSWORD)
    ap.active(True)
    while not ap.active():
        pass
    print("Access point up:", AP_SSID, "IP:", ap.ifconfig()[0])


def join_home_wifi():
    import network
    import time
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(HOME_SSID, HOME_PASSWORD)
        for _ in range(100):            # wait up to ~20 seconds
            if wlan.isconnected():
                break
            time.sleep_ms(200)
    if wlan.isconnected():
        print("Joined", HOME_SSID, "— reach the garden at http://" + wlan.ifconfig()[0] + "/")
    else:
        print("Could not join", HOME_SSID, "— check the name and password")


def file_size(path):
    try:
        return os.stat(path)[6]
    except OSError:
        return None


def content_type(path):
    for ext, ctype in CONTENT_TYPES.items():
        if path.endswith(ext):
            return ctype
    return "application/octet-stream"


def send_headers(conn, status, ctype, length):
    conn.send(
        "HTTP/1.0 {}\r\n"
        "Content-Type: {}\r\n"
        "Content-Length: {}\r\n"
        "Cache-Control: max-age=300\r\n"
        "Connection: close\r\n\r\n".format(status, ctype, length).encode()
    )


def send_file(conn, path):
    size = file_size(path)
    send_headers(conn, "200 OK", content_type(path), size)
    with open(path, "rb") as f:
        while True:
            chunk = f.read(CHUNK)
            if not chunk:
                break
            conn.send(chunk)


NOT_FOUND = (b"<h1>404</h1><p>No leaf here. Try <a href='/'>the garden</a>.</p>")


def send_json(conn, status, payload):
    conn.send(
        "HTTP/1.0 {}\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: {}\r\n"
        "Cache-Control: no-store\r\n"
        "Connection: close\r\n\r\n".format(status, len(payload)).encode()
    )
    conn.send(payload)


def handle_plants(conn, method, head, body):
    if method == "GET":
        if file_size(PLANT_FILE) is None:
            send_json(conn, "200 OK", EMPTY_PLANTS)
            return
        with open(PLANT_FILE, "rb") as f:
            send_json(conn, "200 OK", f.read())
        return
    if method != "POST":
        send_json(conn, "405 Method Not Allowed", b'{"error":"GET or POST"}')
        return
    length = 0
    for line in head.split(b"\r\n")[1:]:
        if line.lower().startswith(b"content-length:"):
            try:
                length = int(line.split(b":", 1)[1])
            except ValueError:
                length = 0
    if length <= 0 or length > MAX_PLANT_BYTES:
        send_json(conn, "413 Payload Too Large", b'{"error":"log too large"}')
        return
    while len(body) < length:
        chunk = conn.recv(512)
        if not chunk:
            break
        body += chunk
    try:
        data = json.loads(body)
        if not isinstance(data.get("plants"), list):
            raise ValueError("no plants list")
    except (ValueError, AttributeError):
        send_json(conn, "400 Bad Request", b'{"error":"bad plant data"}')
        return
    # write to a temp file and swap, so a power blip can't half-write the log
    with open("plants.tmp", "wb") as f:
        f.write(body)
    os.rename("plants.tmp", PLANT_FILE)
    send_json(conn, "200 OK", b'{"ok":true}')


def read_request(conn):
    # read up to the end of the headers (give up past 2 KB of them)
    req = b""
    while b"\r\n\r\n" not in req:
        chunk = conn.recv(512)
        if not chunk:
            break
        req += chunk
        if len(req) > 2048:
            break
    return req


def handle(conn):
    req = read_request(conn)
    if not req:
        return
    head, _, body = req.partition(b"\r\n\r\n")
    try:
        parts = head.split(b"\r\n")[0].split(b" ")
        method = parts[0].decode()
        path = parts[1].decode()
    except (IndexError, UnicodeError):
        return
    path = path.split("?")[0]
    if path == "/api/plants":
        handle_plants(conn, method, head, body)
        return
    if path == "/":
        path = "/index.html"
    name = path.lstrip("/")
    # only serve plain filenames that exist in flash — no directories
    if "/" in name or ".." in name or file_size(name) is None:
        send_headers(conn, "404 Not Found", "text/html", len(NOT_FOUND))
        conn.send(NOT_FOUND)
        return
    send_file(conn, name)


def serve():
    addr = socket.getaddrinfo("0.0.0.0", PORT)[0][-1]
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(2)
    print("Serving the monarch garden on port", PORT)
    while True:
        conn = None
        try:
            conn, client = s.accept()
            conn.settimeout(5)
            handle(conn)
        except Exception as e:
            print("request error:", e)
        finally:
            if conn:
                conn.close()


if START_ACCESS_POINT:
    start_access_point()
elif HOME_SSID:
    join_home_wifi()
serve()
