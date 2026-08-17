# Monarch game web server for the Raspberry Pi Pico 2 W (MicroPython).
#
# Serves the browser game from monarch-game/ to anyone who joins the
# Pico's WiFi network. Copy these files onto the Pico's flash:
#
#     main.py       (this file)
#     index.html    (from monarch-game/)
#     game.html     (from monarch-game/)
#
# Then visit http://<pico-ip>/ from any device on the Pico's network.
#
# This script assumes your Pico is already set up as a WiFi hub with
# its own IP. If it isn't, flip START_ACCESS_POINT to True below and
# the Pico will broadcast its own network on boot.

import os
import socket

START_ACCESS_POINT = False
AP_SSID = "MonarchGarden"
AP_PASSWORD = "milkweed1"   # min 8 characters; change this!

PORT = 80
CHUNK = 1024                # stream files in small pieces to save RAM

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".ico": "image/x-icon",
}


def start_access_point():
    import network
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=AP_SSID, password=AP_PASSWORD)
    ap.active(True)
    while not ap.active():
        pass
    print("Access point up:", AP_SSID, "IP:", ap.ifconfig()[0])


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


def handle(conn):
    # read just the request line; we don't need the headers
    req = conn.recv(512)
    if not req:
        return
    try:
        path = req.split(b" ")[1].decode()
    except (IndexError, UnicodeError):
        return
    path = path.split("?")[0]
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
serve()
