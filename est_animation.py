"""EST 숏폼 드라마 EP.01 《수행평가 지옥 탈출》 — 캐릭터 애니메이션 릴스 (1080x1920, 60초)

학생 캐릭터가 수행평가를 준비하며 겪는 어려움(알림 폭탄 / 뻔한 주제 / 실험 설계 막막 /
자료 부족 / 시간 부족)을 연기하고, EST 비밀자료실에서 해결하는 흐름.

사용법:
  python3 est_animation.py                  -> est_animation.mp4
  python3 est_animation.py --frames 3 20 30 -> preview/ 에 해당 초의 PNG 저장
"""
import math
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

W, H, FPS, TOTAL = 1080, 1920, 30, 60.0
OUTPUT = "est_animation.mp4"
FONT_PATH = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"

GOLD = (255, 205, 80)
WHITE = (255, 255, 255)
RED = (255, 90, 90)
SKIN = (255, 218, 185)
HAIR = (52, 38, 42)
UNI = (38, 52, 110)

# ---------------- 타임라인 ----------------
NOTIFS = [(1.0, "국어", "탐구 발표"), (2.2, "영어", "주제 보고서"), (3.4, "생명과학", "실험 설계")]
CAPTIONS = [
    (4.2, 7.0, "아니, 나보고\n이걸 다 하라고?"),
    (8.0, 11.5, "탐구 주제 추천……\n이건 너무 뻔하잖아!"),
    (14.0, 16.7, "주제를 못 정하겠어……"),
    (17.2, 19.7, "실험 설계는\n어떻게 하지?"),
    (20.2, 22.2, "자료는 어디서 찾아……"),
    (22.6, 24.4, "시간이 없다고오!!"),
    (30.0, 33.0, "뭐야…… 여기가 어디야?"),
    (33.8, 37.0, "잠깐! 이걸 다\n쓸 수 있다고?"),
    (38.3, 40.8, "오! 이 개념으로\n실험을 설계하고!"),
    (41.3, 44.0, "이걸 연결하면\n탐구가 확장되잖아!"),
    (44.5, 46.6, "영어 발표까지 해결!"),
    (48.6, 50.6, "됐다! 이제 뭘\n해야 할지 알겠어!"),
    (53.0, 55.3, "EST야…… 문 열어."),
]
CHIPS = [(14.0, "주제 선정 ???", (420, 330)), (16.5, "실험 설계 막막", (700, 430)),
         (19.0, "자료 부족", (380, 560)), (21.5, "D-3  시간 부족", (700, 620))]
ITEMS = [(38.0, "생", "생명과학", "자료 발견!"), (41.0, "화", "화학 자료와", "연결!"),
         (44.0, "교", "교과 연계", "자료 발견!")]
CHECKS = [(46.8, "탐구 주제 선정"), (47.6, "실험 설계"), (48.4, "교과 연계")]
PAPERS = [(8.2, 140), (9.5, 230), (10.8, 940), (12.1, 310), (15.0, 880), (18.0, 990)]
BURSTS = [27.0, 55.5]
DINGS = [n[0] for n in NOTIFS] + [38.0, 41.0, 44.0, 51.8]

# (시작시간, 자세, 표정, 머리 처짐)
KEYS = [
    (0.0, "TYPE", "neutral", 0), (1.0, "TYPE", "shock", 0), (2.2, "HEAD", "shock", 0),
    (4.0, "HEAD", "shock", 0), (7.0, "TYPE", "think", 0), (9.0, "TYPE", "tired", 12),
    (12.0, "COVER", "tired", 30), (14.0, "HEAD", "tired", 15), (17.0, "DOWN", "tired", 45),
    (20.0, "HEAD", "panic", 0), (22.5, "UP", "panic", -10), (24.0, "DOWN", "tired", 35),
    (24.8, "SHELF", "think", 0), (26.2, "SHELF", "neutral", 0), (27.0, "UP", "shock", -8),
    (33.6, "UP", "happy", -8), (37.5, "TYPE", "happy", 0), (50.2, "UP", "happy", -6),
    (51.8, "TYPE", "frozen", 0), (53.4, "SHELF", "neutral", 0),
]
POSES = {
    "TYPE": ((450, 1175), (630, 1175)), "HEAD": ((425, 830), (655, 830)),
    "UP": ((330, 650), (750, 650)), "SHELF": ((285, 830), (640, 1175)),
    "COVER": ((505, 870), (575, 870)), "DOWN": ((420, 1215), (660, 1215)),
}


# ---------------- 도구 ----------------
_fonts = {}


def font(size):
    size = max(8, int(size))
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT_PATH, size)
    return _fonts[size]


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def clamp01(x):
    return min(max(x, 0.0), 1.0)


def lerp(a, b, p):
    return a + (b - a) * p


YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
_g = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
BASE = (np.array((14, 18, 44), np.float32) * (1 - _g) + np.array((34, 28, 66), np.float32) * _g) \
    * np.ones((1, W, 1), np.float32)


def add_light(arr, cx, cy, r, s, color=GOLD):
    if s <= 0.001:
        return
    d2 = ((XX - cx) ** 2 + (YY - cy) ** 2) / (r * r)
    arr += (s * np.exp(-d2))[..., None] * np.array(color, np.float32)


def txt(img, xy, s, size, fill=WHITE, a=1.0, anchor="mm", stroke=0, scale=1.0, spacing=14):
    if a <= 0.01:
        return
    f = font(size * scale)
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = d.multiline_textbbox(xy, s, font=f, anchor=anchor, spacing=spacing,
                                          align="center", stroke_width=stroke)
    pad = 6
    x0, y0, x1, y1 = int(x0) - pad, int(y0) - pad, int(x1) + pad, int(y1) + pad
    kw = dict(font=f, anchor=anchor, spacing=spacing, align="center")
    off = (xy[0] - x0, xy[1] - y0)
    inner = Image.new("L", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(inner).multiline_text(off, s, fill=255, **kw)
    if stroke:
        outer = Image.new("L", inner.size, 0)
        ImageDraw.Draw(outer).multiline_text(off, s, fill=255, stroke_width=stroke, **kw)
        img.paste((0, 0, 0), (x0, y0), outer.point(lambda v: int(v * a)))
    img.paste(fill, (x0, y0), inner.point(lambda v: int(v * a)))


def panel(img, box, fill=(20, 26, 54), outline=GOLD, width=3, radius=36, a=1.0):
    layer = Image.new("RGBA", (box[2] - box[0] + 8, box[3] - box[1] + 8), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        (4, 4, layer.width - 5, layer.height - 5), radius=radius, fill=fill + (int(235 * a),),
        outline=(outline + (int(255 * a),)) if outline else None, width=width)
    img.paste(layer, (box[0] - 4, box[1] - 4), layer)


def shake_amount(t, t0, dur, amp):
    k = t - t0
    return amp * (1 - k / dur) if 0 <= k < dur else 0


def caption(img, t):
    for a, b, s in CAPTIONS:
        if a <= t < b:
            p = ease((t - a) / 0.25)
            txt(img, (W // 2, 1640), s, 62, WHITE, p * clamp01((b - t) / 0.25),
                stroke=6, scale=0.92 + 0.08 * p)


# ---------------- 학생 캐릭터 ----------------
OX, OY, CW, CH, SS = 130, 520, 820, 800, 2


def student_state(t):
    idx = 0
    for i, k in enumerate(KEYS):
        if t >= k[0]:
            idx = i
    kt, pose, expr, dy = KEYS[idx]
    prev = KEYS[idx - 1] if idx else KEYS[0]
    p = ease((t - kt) / 0.45)
    hands = []
    for s in range(2):
        a, b = POSES[prev[1]][s], POSES[pose][s]
        hands.append((lerp(a[0], b[0], p), lerp(a[1], b[1], p)))
    if pose == "TYPE":  # 타이핑 떨림
        hands = [(h[0] + math.sin(t * 22 + i) * 6, h[1] + math.cos(t * 27 + i) * 5)
                 for i, h in enumerate(hands)]
    dy = lerp(prev[3], dy, p) + (math.sin(t * 2.2) * 3)
    look = (-12, -2) if 24.4 <= t < 27 else ((10, -10) if expr == "think" else (0, 0))
    return hands, expr, dy, look


def student(img, t):
    hands, expr, dy, look = student_state(t)
    layer = Image.new("RGBA", (CW * SS, CH * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def P(x, y):
        return ((x - OX) * SS, (y - OY) * SS)

    def R(x0, y0, x1, y1):
        return (*P(x0, y0), *P(x1, y1))

    def line(pts, fill, w):
        d.line([P(*p) for p in pts], fill=fill, width=int(w * SS), joint="curve")
        for p in pts:
            x, y = P(*p)
            d.ellipse((x - w * SS / 2, y - w * SS / 2, x + w * SS / 2, y + w * SS / 2), fill=fill)

    cx, cy = 540, 860 + dy
    top = 1000 + dy * 0.5
    # 머리카락(뒤) / 목 / 몸통
    d.ellipse(R(cx - 140, cy - 158, cx + 140, cy + 100), fill=HAIR)
    d.rectangle(R(cx - 36, cy + 90, cx + 36, top + 60), fill=SKIN)
    d.rounded_rectangle(R(350, top, 730, 1340), radius=80 * SS, fill=UNI)
    d.ellipse(R(308, top + 10, 432, top + 134), fill=UNI)
    d.ellipse(R(648, top + 10, 772, top + 134), fill=UNI)
    d.polygon([P(500, top), P(580, top), P(540, top + 80)], fill=(245, 245, 250))
    d.polygon([P(540, top + 70), P(522, top + 108), P(558, top + 108)], fill=(200, 50, 60))

    # 팔 (2-링크 IK)
    L = 175
    for s, (sx, hand) in enumerate(((370, hands[0]), (710, hands[1]))):
        S = (sx, top + 40)
        dx_, dy_ = hand[0] - S[0], hand[1] - S[1]
        dist = max(40, min(math.hypot(dx_, dy_), 2 * L - 2))
        ux, uy = dx_ / math.hypot(dx_, dy_), dy_ / math.hypot(dx_, dy_)
        hand = (S[0] + ux * dist, S[1] + uy * dist)
        h = math.sqrt(max(L * L - (dist / 2) ** 2, 0))
        mid = (S[0] + ux * dist / 2, S[1] + uy * dist / 2)
        c1 = (mid[0] - uy * h, mid[1] + ux * h)
        c2 = (mid[0] + uy * h, mid[1] - ux * h)
        elbow = c1 if c1[1] > c2[1] else c2
        line([S, elbow, hand], UNI, 58)
        hands[s] = hand

    # 얼굴
    face = SKIN if expr != "frozen" else (215, 228, 245)
    d.ellipse(R(cx - 125, cy - 135, cx + 125, cy + 135), fill=face)
    if expr in ("happy", "shock"):
        for sx in (-1, 1):
            d.ellipse(R(cx + sx * 78 - 24, cy + 44, cx + sx * 78 + 24, cy + 70), fill=(255, 170, 170, 150))
    # 눈썹 (바깥 y, 안쪽 y)
    brow = {"neutral": (0, 0), "shock": (-24, -24), "tired": (6, -12), "panic": (-8, -28),
            "happy": (-8, -8), "frozen": (0, 0), "think": (0, -4)}[expr]
    for sx in (-1, 1):
        o, i_ = brow
        if expr == "think" and sx == 1:
            o, i_ = -16, -16
        line([(cx + sx * 82, cy - 50 + o), (cx + sx * 24, cy - 50 + i_)], HAIR, 9)
    # 눈
    for sx in (-1, 1):
        ex, ey = cx + sx * 50, cy + 12
        if expr in ("neutral", "think"):
            d.ellipse(R(ex - 14, ey - 20, ex + 14, ey + 20), fill=(30, 25, 40))
            px, py = ex + look[0] * 0.6, ey + look[1] * 0.6
            d.ellipse(R(px - 5, py - 12, px + 3, py - 4), fill=WHITE)
        elif expr == "shock":
            d.ellipse(R(ex - 28, ey - 30, ex + 28, ey + 30), fill=WHITE, outline=(30, 25, 40), width=4 * SS)
            d.ellipse(R(ex - 6 + look[0] * .5, ey - 6 + look[1] * .5, ex + 6 + look[0] * .5, ey + 6 + look[1] * .5), fill=(30, 25, 40))
        elif expr == "tired":
            d.arc(R(ex - 24, ey - 22, ex + 24, ey + 14), 200, 340, fill=(30, 25, 40), width=7 * SS)
            d.arc(R(ex - 26, ey + 14, ex + 26, ey + 40), 20, 160, fill=(150, 130, 190), width=5 * SS)
        elif expr == "panic":
            for k in range(1, 4):
                r_ = 8 * k
                d.arc(R(ex - r_, ey - r_, ex + r_, ey + r_), (t * 400 + k * 90) % 360, (t * 400 + k * 90) % 360 + 250,
                      fill=(30, 25, 40), width=4 * SS)
        elif expr == "happy":
            d.arc(R(ex - 24, ey - 20, ex + 24, ey + 22), 200, 340, fill=(30, 25, 40), width=8 * SS)
        elif expr == "frozen":
            d.ellipse(R(ex - 5, ey - 5, ex + 5, ey + 5), fill=(30, 25, 40))
    # 입
    mx, my = cx, cy + 88
    if expr == "neutral":
        d.line([P(mx - 20, my), P(mx + 20, my)], fill=(150, 70, 70), width=6 * SS)
    elif expr == "think":
        d.ellipse(R(mx - 9, my - 8, mx + 9, my + 10), fill=(150, 70, 70))
    elif expr == "shock":
        d.ellipse(R(mx - 20, my - 14, mx + 20, my + 34), fill=(120, 40, 50))
    elif expr == "tired":
        pts = [P(mx - 30 + k * 6, my + math.sin(k * 1.4 + t * 5) * 5) for k in range(11)]
        d.line(pts, fill=(150, 70, 70), width=6 * SS)
    elif expr == "panic":
        d.ellipse(R(mx - 34, my - 14, mx + 34, my + 40), fill=(120, 40, 50))
        d.ellipse(R(mx - 18, my + 16, mx + 18, my + 40), fill=(240, 120, 130))
    elif expr == "happy":
        d.pieslice(R(mx - 36, my - 22, mx + 36, my + 36), 0, 180, fill=(120, 40, 50))
        d.pieslice(R(mx - 20, my + 6, mx + 20, my + 36), 0, 180, fill=(240, 120, 130))
    elif expr == "frozen":
        d.line([P(mx - 14, my + 4), P(mx + 14, my + 4)], fill=(120, 130, 170), width=6 * SS)
        for k in range(-2, 3):
            d.line([P(cx + k * 24, cy - 120), P(cx + k * 24, cy - 82)], fill=(80, 110, 200), width=5 * SS)
    # 앞머리
    d.pieslice(R(cx - 138, cy - 156, cx + 138, cy + 40), 180, 360, fill=HAIR)
    d.polygon([P(cx - 130, cy - 40), P(cx - 60, cy - 88), P(cx + 10, cy - 100), P(cx - 20, cy - 36),
               P(cx - 70, cy - 20)], fill=HAIR)
    d.polygon([P(cx + 130, cy - 40), P(cx + 70, cy - 90), P(cx + 10, cy - 100), P(cx + 30, cy - 40),
               P(cx + 80, cy - 24)], fill=HAIR)
    # 손
    for hx, hy in hands:
        x, y = P(hx, hy)
        d.ellipse((x - 34 * SS, y - 34 * SS, x + 34 * SS, y + 34 * SS), fill=face)

    out = layer.resize((CW, CH), Image.LANCZOS)
    img.paste(out, (OX, OY), out)
    return expr, cx, cy


def star4(d, x, y, r, fill):
    d.polygon([(x, y - r), (x + r * .28, y - r * .28), (x + r, y), (x + r * .28, y + r * .28),
               (x, y + r), (x - r * .28, y + r * .28), (x - r, y), (x - r * .28, y - r * .28)], fill=fill)


def fx(img, t, expr, cx, cy):
    d = ImageDraw.Draw(img)
    if expr in ("shock", "tired", "panic", "frozen"):
        for i in range(3):
            ph = (t * 1.4 + i / 3) % 1
            x = cx + (150 if i % 2 else -150) + (i - 1) * 14
            y = cy - 90 + ph * 150
            d.polygon([(x, y - 22), (x - 11, y + 4), (x, y + 14), (x + 11, y + 4)], fill=(120, 200, 255))
    if expr == "think":
        txt(img, (cx + 170, cy - 170 + math.sin(t * 3) * 6), "?", 90, GOLD, stroke=4)
    if expr == "panic":
        for i in range(4):
            a = t * 4 + i * math.pi / 2
            x, y = cx + math.cos(a) * 190, cy - 170 + math.sin(a) * 40
            star4(d, x, y, 18, (255, 230, 110))
    if expr == "happy":
        for i in range(4):
            a = t * 2.5 + i * math.pi / 2
            star4(d, cx + math.cos(a) * 200, cy - 80 + math.sin(a) * 120, 16 + 5 * math.sin(t * 6 + i), (255, 235, 140))


# ---------------- 배경/소품 ----------------
def room(img, t, shelf_open):
    d = ImageDraw.Draw(img)
    # 창문
    d.rounded_rectangle((820, 300, 1040, 580), 18, fill=(24, 30, 74), outline=(120, 100, 80), width=8)
    d.line([(930, 300), (930, 580)], fill=(120, 100, 80), width=6)
    d.line([(820, 440), (1040, 440)], fill=(120, 100, 80), width=6)
    d.ellipse((960, 330, 1010, 380), fill=(250, 240, 200))
    for i, (sx, sy) in enumerate([(850, 350), (890, 520), (990, 470), (870, 410)]):
        star4(d, sx, sy + math.sin(t * 2 + i) * 2, 6, (255, 245, 200))
    # 책장 (포털)
    x0, x1, y0, y1 = 40, 290, 380, 1150
    if shelf_open > 0:
        d.rectangle((x0, y0, x1, y1), fill=(255, 240, 190))
        d.rectangle((x0 + 20, y0 + 20, x1 - 20, y1 - 20), fill=(255, 252, 235))
    shift = int(shelf_open * 130)
    for half, (a, b) in enumerate(((x0, 165), (165, x1))):
        sh = -shift if half == 0 else shift
        d.rectangle((a + sh, y0, b + sh, y1), fill=(98, 66, 46), outline=(60, 40, 30), width=4)
        for r in range(1, 5):
            yy = y0 + r * (y1 - y0) // 5
            d.rectangle((a + sh, yy - 6, b + sh, yy + 6), fill=(70, 46, 34))
        cols = [(200, 80, 80), (80, 140, 200), (90, 180, 120), (220, 170, 70), (150, 100, 190)]
        for r in range(5):
            yy = y0 + r * (y1 - y0) // 5
            for k in range(3):
                bx = a + 12 + k * 40 + sh
                if bx + 30 < b + sh:
                    bh = 70 + ((k * 13 + r * 7) % 40)
                    d.rectangle((bx, yy + (y1 - y0) // 5 - 6 - bh, bx + 30, yy + (y1 - y0) // 5 - 6),
                                fill=cols[(k + r * 2) % 5])
    if shelf_open < 0.05:  # EST 책 (금색)
        d.rectangle((72, 640, 112, 760), fill=GOLD, outline=(160, 110, 20), width=3)
        d.text((92, 700), "E\nS\nT", font=font(22), fill=(90, 50, 10), anchor="mm", align="center")


def desk(img, t):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 1180, W, 1260), fill=(150, 108, 80))
    d.rectangle((0, 1250, W, 1480), fill=(96, 66, 50))
    d.line([(0, 1180), (W, 1180)], fill=(190, 145, 110), width=5)
    # 노트북 (뒷모습)
    d.rounded_rectangle((385, 1010, 695, 1200), 16, fill=(70, 74, 92), outline=(110, 116, 140), width=4)
    d.ellipse((525, 1090, 555, 1120), fill=(150, 156, 176))
    d.rectangle((350, 1196, 730, 1214), fill=(60, 64, 80))
    # 폰
    buzz = any(0 <= t - n[0] < 0.5 for n in NOTIFS) or 51.8 <= t < 52.4
    vx = int(math.sin(t * 90) * 5) if buzz else 0
    d.rounded_rectangle((770 + vx, 1130, 890 + vx, 1196), 12, fill=(30, 32, 44),
                        outline=(255, 235, 150) if buzz else (90, 96, 120), width=4)
    # 구겨진 종이
    for t0, x in PAPERS:
        k = t - t0
        if k >= 0:
            y = 1146 - max(0, (1 - k / 0.35)) * 240 * (1 - k / 0.35) + (abs(math.sin(k * 14)) * -14 * max(0, 1 - k / 0.5))
            pts = [(x + math.cos(a) * (34 + (i % 3) * 5), y + math.sin(a) * (30 + (i % 2) * 6))
                   for i, a in enumerate(np.linspace(0, 2 * math.pi, 9)[:-1] + x)]
            d.polygon(pts, fill=(238, 238, 244), outline=(160, 160, 176))
            d.line([pts[0], pts[3], pts[5]], fill=(180, 180, 196), width=3)


def bubble(img, xy, s, size=40, fill=(250, 250, 255), color=(40, 40, 70), a=1.0, tail=(540, 700)):
    d = ImageDraw.Draw(img)
    f = font(size)
    bb = d.multiline_textbbox((0, 0), s, font=f, align="center")
    w, h = bb[2] - bb[0] + 60, bb[3] - bb[1] + 40
    x, y = xy
    panel(img, (int(x - w / 2), int(y - h / 2), int(x + w / 2), int(y + h / 2)), fill=fill,
          outline=(120, 120, 150), width=3, radius=int(h / 2), a=a)
    txt(img, (x, y), s, size, color, a)


def notif_card(img, y, app, title, dx=0, color=GOLD, big=1.0):
    w, h = int(900 * big), int(130 * big)
    x0 = (W - w) // 2 + dx
    panel(img, (x0, y, x0 + w, y + h), fill=(30, 36, 70), outline=color, width=3, radius=int(30 * big))
    d = ImageDraw.Draw(img)
    d.ellipse((x0 + 26 * big, y + h // 2 - 34 * big, x0 + 94 * big, y + h // 2 + 34 * big), fill=color)
    d.text((x0 + 60 * big, y + h // 2), "!", font=font(44 * big), fill=(20, 20, 40), anchor="mm")
    d.text((x0 + 124 * big, y + h // 2 - 26 * big), app, font=font(30 * big), fill=(170, 175, 205), anchor="lm")
    d.text((x0 + 124 * big, y + h // 2 + 24 * big), title, font=font(46 * big), fill=WHITE, anchor="lm")


CARD_LABELS = ["탐구보고서", "실험 자료", "교과 연계", "세특 사례", "발표 자료", "개념 정리"]
CARD_POS = [(150, 640), (930, 640), (130, 920), (950, 920), (170, 1300), (910, 1300)]
_card_imgs = {}


def card_img(i):
    if i not in _card_imgs:
        c = Image.new("RGBA", (210, 270), (0, 0, 0, 0))
        d = ImageDraw.Draw(c)
        d.rounded_rectangle((2, 2, 207, 267), 22, fill=(250, 245, 230, 255), outline=GOLD, width=4)
        d.rounded_rectangle((20, 24, 190, 40), 6, fill=(200, 160, 60, 255))
        for k in range(5):
            d.rounded_rectangle((20, 64 + k * 24, 190 - (k % 3) * 30, 74 + k * 24), 4, fill=(190, 190, 200, 255))
        d.text((105, 232), CARD_LABELS[i], font=font(28), fill=(60, 50, 20, 255), anchor="mm")
        _card_imgs[i] = c
    return _card_imgs[i]


def draw_cards(img, t, t_in, t_out, links_from=None):
    if not (t_in <= t < t_out):
        return
    a = ease((t - t_in) / 0.8) * clamp01((t_out - t) / 0.5)
    pts = [(x + math.sin(t * 1.3 + i) * 22, y + math.cos(t * 1.1 + i * 1.7) * 28) for i, (x, y) in enumerate(CARD_POS)]
    if links_from:
        d = ImageDraw.Draw(img)
        order = [0, 2, 4, 5, 3, 1, 0]
        n = int(clamp01((t - links_from) / 6.0) * (len(order) - 1))
        for k in range(n):
            d.line([pts[order[k]], pts[order[k + 1]]], fill=GOLD, width=3)
    for i, (x, y) in enumerate(pts):
        c = card_img(i).rotate(math.sin(t * 0.9 + i * 2) * 10, expand=True, resample=Image.BICUBIC)
        c.putalpha(c.getchannel("A").point(lambda v: int(v * a)))
        img.paste(c, (int(x - c.width / 2), int(y - c.height / 2)), c)


def checkmark(img, cx, cy, size, p, color=(90, 230, 150)):
    d = ImageDraw.Draw(img)
    a, b, c = (cx - size, cy), (cx - size * 0.3, cy + size * 0.7), (cx + size, cy - size * 0.8)
    if p <= 0.5:
        q = p / 0.5
        d.line([a, (a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q)], fill=color, width=14)
    else:
        q = (p - 0.5) / 0.5
        d.line([a, b], fill=color, width=14)
        d.line([b, (b[0] + (c[0] - b[0]) * q, b[1] + (c[1] - b[1]) * q)], fill=color, width=14)


def clock(img, cx, cy, t):
    d = ImageDraw.Draw(img)
    d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=(250, 250, 255), outline=RED, width=8)
    a = t * 6
    d.line([(cx, cy), (cx + math.sin(a) * 52, cy - math.cos(a) * 52)], fill=(40, 40, 70), width=6)
    d.line([(cx, cy), (cx + math.sin(a / 12) * 34, cy - math.cos(a / 12) * 34)], fill=(40, 40, 70), width=9)


def burst_text(img, t, t0):
    k = t - t0
    if 0 <= k < 2.0:
        pop = 1.0 + 0.35 * max(0, 1 - k / 0.25) + 0.06 * k
        txt(img, (W // 2, 1000), "콰아아앙!", 140, GOLD, clamp01((2.0 - k) / 0.6), stroke=8, scale=pop)


# ---------------- 프레임 ----------------
def shelf_open_amount(t):
    if t < 26.4:
        return 0.0
    if t < 48.4:
        return ease((t - 26.4) / 0.6)
    if t < 49.2:
        return 1 - ease((t - 48.4) / 0.8)
    if t < 55.5:
        return 0.0
    return ease((t - 55.5) / 0.4)


def frame(t):
    # ---- 엔딩 (블랙 + 로고) ----
    if t >= 57.0:
        arr = np.zeros((H, W, 3), np.float32)
        k = t - 57.0
        add_light(arr, W // 2, 900, 520, 0.55 * ease(k / 1.0), GOLD)
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        p = ease((k - 0.2) / 0.8)
        txt(img, (W // 2, 900), "EST", 300, GOLD, p, scale=0.85 + 0.15 * p)
        w = int(360 * ease((k - 0.9) / 0.6))
        ImageDraw.Draw(img).rounded_rectangle((W // 2 - w // 2, 1060, W // 2 + w // 2, 1068), 4, fill=GOLD)
        txt(img, (W // 2, 1160), "수행평가의 히든카드", 66, WHITE, ease((k - 1.3) / 0.7))
        return np.asarray(img)

    arr = BASE.copy()
    stress = clamp01((t - 14.0) / 10.0) * (1 if t < 24.5 else clamp01((26.5 - t) / 2)) if t < 26.5 else 0
    arr[..., 0] += 38 * stress
    so = shelf_open_amount(t)
    for b in BURSTS:
        k = t - b
        if 0 <= k < 3.0:
            add_light(arr, W // 2, 960, 300 + 700 * ease(k / 0.6), 1.3 * (1 - clamp01(k / 3.0)) ** 1.5)
    if 24.6 <= t < 27.0 or 53.0 <= t < 55.5:  # 책장 틈새로 새는 빛
        base = 24.6 if t < 30 else 53.0
        add_light(arr, 165, 780, 420, 0.8 * clamp01((t - base) / 2.0))
    if 27.0 <= t < 50.0:
        add_light(arr, 165, 780, 520, 0.5)
        add_light(arr, W // 2, 960, 560, 0.25 + 0.06 * math.sin(t * 2.0))
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    txt(img, (W // 2, 110), "EST 숏폼 드라마 EP.01  ·  수행평가 지옥 탈출", 34, (190, 170, 110))
    room(img, t, so)
    shake = 0

    # 카드/제목 (자료실 구간) – 학생보다 뒤
    if 27.0 <= t < 50.0:
        draw_cards(img, t, 28.0, 49.0, links_from=38.0)
    expr, hx, hy = student(img, t)
    desk(img, t)
    fx(img, t, expr, hx, hy)

    # ---- 장면별 오버레이 ----
    if t < 7.0:
        if t < 2.0:
            txt(img, (W // 2, 330), "수행평가\n지옥", 130, GOLD, ease(t / 0.5) * clamp01((2.0 - t) / 0.4), stroke=6)
        for i, (t0, app, title) in enumerate(NOTIFS):
            if t0 <= t:
                dx = int((1 - ease((t - t0) / 0.4)) * W) + int(ease((t - 6.5) / 0.5) * W)
                s = shake_amount(t, t0 + 0.4, 0.4, 12)
                notif_card(img, 240 + i * 118, app, title, dx + int(math.sin(t * 90) * s), big=0.72)
        shake = max(shake_amount(t, 1.0, 0.5, 10), shake_amount(t, 2.2, 0.5, 10), shake_amount(t, 3.4, 0.5, 10))
    elif t < 14.0:
        if 7.2 <= t:  # 검색창 + 물음표
            p = ease((t - 7.2) / 0.4) * clamp01((13.5 - t) / 0.4)
            panel(img, (260, 330, 820, 410), fill=(250, 250, 255), outline=(120, 120, 150), radius=40, a=p)
            txt(img, (540, 370), "탐구 주제 추천  ...", 36, (60, 60, 90), p)
            for i in range(3):
                txt(img, (330 + i * 210, 480 + math.sin(t * 3 + i) * 8), "?", 70, GOLD, p, stroke=3)
    elif t < 26.5:
        for t0, label, (x, y) in CHIPS:
            if t >= t0 and t < 26:
                p = ease((t - t0) / 0.35)
                bubble(img, (x, y + math.sin(t * 2 + t0) * 6), label, 38, a=p)
        if t >= 21.5:
            clock(img, 930, 700, t)
        shake = shake_amount(t, 22.5, 1.8, 10) + (3 if t >= 17 else 0)
    elif 27.0 <= t < 38.0:
        k = t - 27.6
        pop = ease(k / 0.8)
        txt(img, (W // 2, 270), "EST", 150, GOLD, pop, scale=0.8 + 0.2 * pop)
        txt(img, (W // 2, 390), "SECRET ARCHIVE", 72, WHITE, ease((k - 0.3) / 0.8) * clamp01((37.5 - t) / 0.5))
        shake = shake_amount(t, 27.0, 0.8, 18)
    elif t < 50.5:
        cur = None
        for it in ITEMS:
            if t >= it[0]:
                cur = it
        if t < 46.6 and cur:
            k = t - cur[0]
            p = ease(k / 0.4)
            panel(img, (160, 300, 920, 520), fill=(18, 22, 50), width=5, a=p)
            d = ImageDraw.Draw(img)
            d.ellipse((190, 340, 310, 460), fill=GOLD)
            d.text((250, 400), cur[1], font=font(72), fill=(30, 24, 10), anchor="mm")
            txt(img, (640, 372), cur[2], 64, WHITE, p)
            txt(img, (640, 452), cur[3], 64, GOLD, p)
            if k < 0.25:
                img = Image.blend(img, Image.new("RGB", (W, H), (255, 240, 200)), 0.45 * (1 - k / 0.25))
            shake = shake_amount(t, cur[0], 0.3, 6)
        elif t >= 46.6:
            panel(img, (180, 290, 900, 640), fill=(18, 22, 50), width=5, a=ease((t - 46.6) / 0.3))
            for i, (t0, label) in enumerate(CHECKS):
                y = 380 + i * 100
                ImageDraw.Draw(img).rounded_rectangle((230, y - 34, 298, y + 34), 12, outline=GOLD, width=5)
                checkmark(img, 264, y, 20, clamp01((t - t0) / 0.35))
                txt(img, (340, y), label, 52, WHITE, ease((t - t0) / 0.3), anchor="lm")
    elif t < 56.6:
        if 51.8 <= t < 55.5:
            k = t - 51.8
            dx = int((1 - ease(k / 0.35)) * W)
            s = shake_amount(t, 52.15, 1.2, 14)
            notif_card(img, 300, "수학", "수행평가 추가 공지", dx + int(math.sin(t * 80) * s), color=RED, big=0.9)
            txt(img, (W // 2, 520), "!!", 110, RED, ease((k - 0.4) / 0.3))
        shake = 4 if 53.0 <= t < 55.5 else 0

    burst_text(img, t, 27.0)
    burst_text(img, t, 55.5)
    caption(img, t)

    for b in BURSTS:
        k = t - b
        if 0 <= k < 0.5:
            img = Image.blend(img, Image.new("RGB", (W, H), (255, 244, 210)), 0.9 * (1 - k / 0.5))
    if 56.0 <= t < 57.0:
        img = Image.blend(img, Image.new("RGB", (W, H), (0, 0, 0)), clamp01((t - 56.0) / 0.9))
    if 26.5 <= t < 27.0:
        img = Image.blend(img, Image.new("RGB", (W, H), (255, 244, 210)), (t - 26.5) / 0.5)
    if shake:
        img = ImageChops.offset(img, int(math.sin(t * 97) * shake), int(math.cos(t * 83) * shake))
    return np.asarray(img)


# ---------------- 오디오 ----------------
SR = 44100


def synth_audio(path):
    n = int(SR * TOTAL)
    out = np.zeros(n, np.float32)

    def add(start, sig):
        i = int(start * SR)
        if i < n:
            sig = sig[: n - i]
            out[i:i + len(sig)] += sig

    def tone(freq, dur, amp=0.2, wave_="sine", decay=6.0):
        x = np.arange(int(dur * SR)) / SR
        ph = 2 * np.pi * freq * x
        s = np.sin(ph) if wave_ == "sine" else np.sign(np.sin(ph)) * 0.6 + np.sin(ph) * 0.4
        return (amp * s * np.exp(-decay * x) * np.minimum(1, x / 0.005)).astype(np.float32)

    def noise(dur, amp, decay):
        x = np.arange(int(dur * SR)) / SR
        return (amp * np.random.uniform(-1, 1, len(x)) * np.exp(-decay * x)).astype(np.float32)

    def hz(m):
        return 440.0 * 2 ** ((m - 69) / 12)

    for k in range(0, 52):  # 긴장감 있는 저음 (지옥 구간)
        add(k * 0.5, tone(hz(45 if k % 8 < 4 else 43), 0.45, 0.14, "saw", 3.0))
    for k in range(0, 8):  # 째깍째깍
        add(21.5 + k * 0.4, noise(0.04, 0.35, 90))
    for m in (57, 61, 64, 69):  # 웅장한 패드
        add(27.0, tone(hz(m), 11.0, 0.05, "sine", 0.15))
    step = 60 / 128 / 2  # 신나는 아르페지오 (31~50초)
    prog = [(57, 61, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]
    t0, i = 31.0, 0
    while t0 < 50.0:
        chord = prog[int((t0 - 31.0) / (step * 8)) % 4]
        add(t0, tone(hz(chord[i % 3] + 12), 0.2, 0.13, "saw", 9.0))
        if i % 2 == 0:
            add(t0, tone(hz(chord[0] - 12), 0.22, 0.2, "sine", 7.0))
        else:
            add(t0, noise(0.05, 0.05, 80))
        t0 += step
        i += 1
    for d in DINGS:
        add(d, tone(1318.5, 0.5, 0.2, "sine", 7.0) + tone(1760, 0.5, 0.12, "sine", 7.0))
    for b in BURSTS:
        add(b, tone(55, 2.6, 0.7, "sine", 1.6))
        add(b, noise(1.8, 0.5, 2.8))
    for m in (57, 64, 69, 73):
        add(57.0, tone(hz(m), 3.0, 0.11, "sine", 0.8))
    out *= 0.9 / max(1e-6, np.abs(out).max())
    fade = int(SR * 0.6)
    out[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((out * 32767).astype("<i2").tobytes())


# ---------------- 메인 ----------------
def main():
    if "--frames" in sys.argv:
        os.makedirs("preview", exist_ok=True)
        for s in sys.argv[sys.argv.index("--frames") + 1:]:
            Image.fromarray(frame(float(s))).save(f"preview/t{float(s):05.1f}.png")
            print("saved", s)
        return
    audio = "/tmp/est_audio.wav"
    synth_audio(audio)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", audio,
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-c:a", "aac",
           "-b:a", "160k", "-shortest", "-movflags", "+faststart", OUTPUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int(TOTAL * FPS)
    for i in range(n):
        p.stdin.write(frame(i / FPS).tobytes())
        if i % 150 == 0:
            print(f"{i}/{n}", flush=True)
    p.stdin.close()
    p.wait()
    print(f"완료: {OUTPUT}")


if __name__ == "__main__":
    main()
