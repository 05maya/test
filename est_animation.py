"""EST 숏폼 드라마 EP.01 《수행평가 지옥 탈출》 — 블랙&골드 캐릭터 애니메이션 릴스 (1080x1920, 60초)

- 블랙 + 골드 시네마틱 톤, 셀 셰이딩 캐릭터, 카메라 줌/이동, 빛줄기/먼지/그레인
- 대사는 음성(espeak-ng 한국어)으로 출력되고, 입 모양이 음성 크기에 맞춰 움직임 (자막 없음)

사용법:
  python3 est_animation.py                   -> est_animation.mp4
  python3 est_animation.py --frames 3 20 30  -> preview/ 에 해당 초의 PNG 저장
"""
import math
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H, FPS, TOTAL = 1080, 1920, 30, 60.0
OUTPUT = "est_animation.mp4"
FONT_PATH = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
SUBTITLES = False  # 대사는 음성으로 전달 (True로 바꾸면 자막도 표시)

GOLD = (255, 205, 80)
GOLD_DK = (160, 112, 28)
WHITE = (255, 255, 255)
RED = (255, 90, 90)
INK = (10, 10, 12)
SKIN = (255, 220, 192)
SKIN_SH = (232, 178, 150)
HAIR = (34, 26, 30)
HAIR_HI = (92, 74, 80)
BLAZER = (20, 22, 32)

# ---------------- 타임라인 ----------------
NOTIFS = [(1.0, "국어", "탐구 발표"), (2.2, "영어", "주제 보고서"), (3.4, "생명과학", "실험 설계")]
# (시작, 대사, 허용 길이, 말투)
LINES = [
    (4.2, "아니, 나보고 이걸 다 하라고?", 2.8, "kid"),
    (8.0, "탐구 주제 추천…… 이건 너무 뻔하잖아!", 3.6, "kid"),
    (14.0, "주제를 못 정하겠어……", 2.6, "kid"),
    (17.2, "실험 설계는 어떻게 하지?", 2.5, "kid"),
    (20.2, "자료는 어디서 찾아……", 2.0, "kid"),
    (22.6, "시간이 없다고오!!", 1.8, "kid"),
    (30.0, "뭐야…… 여기가 어디야?", 3.0, "kid"),
    (33.8, "잠깐! 이걸 다 쓸 수 있다고?", 3.2, "kid"),
    (38.3, "오! 이 개념으로 실험을 설계하고!", 2.5, "kid"),
    (41.3, "이걸 연결하면 탐구가 확장되잖아!", 2.7, "kid"),
    (44.5, "영어 발표까지 해결!", 2.0, "kid"),
    (48.6, "됐다! 이제 뭘 해야 할지 알겠어!", 2.0, "kid"),
    (53.0, "EST야…… 문 열어.", 2.3, "kid"),
    (57.8, "EST. 수행평가의 히든카드.", 2.2, "deep"),
]
CAPTION_TXT = {l[0]: l[1] for l in LINES}
CHIPS = [(14.0, "주제 선정 ???", (420, 330)), (16.5, "실험 설계 막막", (700, 430)),
         (19.0, "자료 부족", (380, 560)), (21.5, "D-3  시간 부족", (700, 620))]
ITEMS = [(38.0, "생", "생명과학", "자료 발견!"), (41.0, "화", "화학 자료와", "연결!"),
         (44.0, "교", "교과 연계", "자료 발견!")]
CHECKS = [(46.8, "탐구 주제 선정"), (47.6, "실험 설계"), (48.4, "교과 연계")]
PAPERS = [(8.2, 140), (9.5, 230), (10.8, 940), (12.1, 310), (15.0, 880), (18.0, 990)]
BURSTS = [27.0, 55.5]
DINGS = [n[0] for n in NOTIFS] + [38.0, 41.0, 44.0, 51.8]
PUNCH = [1.0, 2.2, 3.4, 22.5, 27.0, 51.8]

KEYS = [  # (시작, 자세, 표정, 머리 처짐)
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
# 카메라 키프레임 (시간, 줌, 중심x, 중심y)
CAM = [(0, 1.0, 540, 960), (4, 1.06, 540, 930), (7, 1.1, 540, 900), (14, 1.18, 540, 880),
       (24, 1.3, 540, 880), (24.6, 1.25, 420, 880), (26.8, 1.2, 330, 860), (27.0, 1.0, 540, 960),
       (33, 1.0, 540, 960), (37, 1.06, 540, 930), (50, 1.06, 540, 930), (51.8, 1.0, 540, 960),
       (52.4, 1.3, 540, 900), (55.4, 1.35, 360, 880), (55.5, 1.0, 540, 960), (57, 1.0, 540, 960)]


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


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def clamp01(x):
    return min(max(x, 0.0), 1.0)


def lerp(a, b, p):
    return a + (b - a) * p


YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


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


def panel(img, box, fill=(8, 8, 10), outline=GOLD, width=3, radius=36, a=1.0):
    layer = Image.new("RGBA", (box[2] - box[0] + 8, box[3] - box[1] + 8), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        (4, 4, layer.width - 5, layer.height - 5), radius=radius, fill=fill + (int(235 * a),),
        outline=(outline + (int(255 * a),)) if outline else None, width=width)
    img.paste(layer, (box[0] - 4, box[1] - 4), layer)


def shake_amount(t, t0, dur, amp):
    k = t - t0
    return amp * (1 - k / dur) if 0 <= k < dur else 0


# ---------------- 음성 (espeak-ng) + 립싱크 ----------------
SR = 44100
VOICE_DIR = "/tmp/est_voice"
VOICES = []


def _espeak(text, speed, pitch, path):
    subprocess.run(["espeak-ng", "-v", "ko", "-s", str(int(speed)), "-p", str(int(pitch)),
                    "-a", "190", "-w", path, text], check=True)
    with wave.open(path, "rb") as wf:
        raw = np.frombuffer(wf.readframes(wf.getnframes()), "<i2").astype(np.float32) / 32768
        sr = wf.getframerate()
    n = int(len(raw) * SR / sr)
    return np.interp(np.linspace(0, len(raw) - 1, n), np.arange(len(raw)), raw).astype(np.float32)


def build_voices():
    if VOICES:
        return
    os.makedirs(VOICE_DIR, exist_ok=True)
    for i, (start, text, window, style) in enumerate(LINES):
        speed, pitch = (165, 68) if style == "kid" else (118, 18)
        sig = _espeak(text, speed, pitch, f"{VOICE_DIR}/l{i}.wav")
        dur = len(sig) / SR
        if dur > window:  # 허용 시간에 맞도록 빠르게 다시 합성
            speed = min(240, speed * dur / window)
            sig = _espeak(text, speed, pitch, f"{VOICE_DIR}/l{i}.wav")
        if style == "deep":  # 울림(에코)
            pad = np.zeros(len(sig) + int(0.5 * SR), np.float32)
            pad[:len(sig)] += sig
            pad[int(0.18 * SR):int(0.18 * SR) + len(sig)] += 0.4 * sig
            pad[int(0.36 * SR):int(0.36 * SR) + len(sig)] += 0.2 * sig
            sig = pad
        win = SR // FPS
        nfr = len(sig) // win
        rms = np.sqrt(np.mean(sig[:nfr * win].reshape(nfr, win) ** 2, axis=1))
        env = np.clip(rms / (np.percentile(rms, 92) + 1e-6), 0, 1)
        env = np.convolve(env, [0.25, 0.5, 0.25], mode="same")
        VOICES.append(dict(start=start, sig=sig, env=env, style=style, dur=len(sig) / SR))


def mouth_open(t):
    for v in VOICES:
        if v["style"] == "kid" and v["start"] <= t < v["start"] + v["dur"]:
            k = int((t - v["start"]) * FPS)
            return float(v["env"][min(k, len(v["env"]) - 1)])
    return -1.0  # 말하지 않음


# ---------------- 정적 배경 (블랙 & 골드) ----------------
def build_bg():
    g = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    top, mid, bot = (np.array(c, np.float32) for c in ((4, 4, 6), (14, 11, 8), (22, 16, 9)))
    arr = np.where(g < 0.5, top * (1 - g * 2) + mid * (g * 2), mid * (1 - (g - 0.5) * 2) + bot * ((g - 0.5) * 2))
    arr = arr * np.ones((1, W, 1), np.float32)
    stripe = ((np.arange(W) % 72) < 3).astype(np.float32)[None, :, None] * np.array(GOLD, np.float32) * 0.035
    arr = arr + stripe
    wall = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(wall)
    # 창문 (골드 프레임 + 도시 보케)
    d.rounded_rectangle((820, 300, 1040, 580), 16, fill=(6, 6, 14), outline=GOLD_DK, width=8)
    d.line([(930, 300), (930, 580)], fill=GOLD_DK, width=5)
    d.line([(820, 440), (1040, 440)], fill=GOLD_DK, width=5)
    rng = np.random.RandomState(7)
    for _ in range(26):
        x, y = rng.randint(830, 1030), rng.randint(470, 570)
        r = rng.randint(3, 9)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(120 + rng.randint(80), 90 + rng.randint(60), 30))
    d.ellipse((960, 330, 1006, 376), fill=(255, 236, 170))
    # 액자 (EST 모노그램)
    d.rectangle((460, 380, 660, 650), fill=(8, 8, 10), outline=GOLD, width=6)
    d.rectangle((474, 394, 646, 636), outline=GOLD_DK, width=2)
    d.text((560, 515), "EST", font=font(64), fill=GOLD, anchor="mm")
    wall = wall.filter(ImageFilter.GaussianBlur(2.2))  # 피사계 심도
    arr = np.asarray(wall).astype(np.float32)
    # 스탠드 조명 (오른쪽에서 들어오는 따뜻한 빛)
    d2 = ((XX - 900) ** 2 + (YY - 1000) ** 2) / (560 ** 2)
    arr += (0.30 * np.exp(-d2))[..., None] * np.array(GOLD, np.float32)
    return arr


def build_desk():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for y in range(1180, 1480):  # 월넛 책상 + 골드 라인
        k = (y - 1180) / 300
        c = (int(70 - 40 * k), int(46 - 28 * k), int(30 - 18 * k))
        d.line([(0, y), (W, y)], fill=c + (255,))
    d.rectangle((0, 1180, W, 1262), fill=(88, 58, 38, 255))
    for y in range(1186, 1262, 9):
        d.line([(0, y), (W, y + 4)], fill=(100, 68, 44, 255), width=2)
    d.line([(0, 1180), (W, 1180)], fill=GOLD + (255,), width=5)
    d.line([(0, 1262), (W, 1262)], fill=GOLD_DK + (255,), width=4)
    d.rectangle((0, 1262, W, H), fill=(22, 15, 10, 255))
    for i, y in enumerate((1300, 1560, 1800)):  # 서랍 패널 + 골드 손잡이
        d.rectangle((60, y, 1020, y + 210 if i < 2 else H), outline=GOLD_DK + (255,), width=3)
        if i < 2:
            d.rounded_rectangle((480, y + 90, 600, y + 112), 10, fill=GOLD + (255,))
    d.text((W // 2, 1790), "EST", font=font(60), fill=GOLD_DK + (255,), anchor="mm")
    # 노트북 (뒷모습)
    d.rounded_rectangle((395, 1085, 685, 1204), 14, fill=(30, 30, 38, 255), outline=(130, 112, 70, 255), width=4)
    d.ellipse((525, 1124, 555, 1154), fill=GOLD + (255,))
    d.rectangle((356, 1200, 724, 1216), fill=(24, 24, 30, 255))
    # 책 더미
    for i, (c, w) in enumerate(((GOLD_DK, 190), ((60, 20, 28), 170), ((22, 30, 60), 180))):
        y = 1170 - i * 26
        d.rounded_rectangle((70, y, 70 + w, y + 24), 4, fill=c + (255,), outline=GOLD + (255,), width=2)
    # 스탠드
    d.ellipse((838, 1160, 938, 1184), fill=(40, 32, 20, 255), outline=GOLD + (255,), width=3)
    d.line([(888, 1170), (870, 1070), (900, 1000)], fill=GOLD + (255,), width=9)
    d.polygon([(862, 990), (958, 1010), (930, 1050), (872, 1040)], fill=(60, 44, 18, 255), outline=GOLD + (255,))
    # 머그컵
    d.rounded_rectangle((990, 1120, 1050, 1180), 8, fill=(36, 36, 46, 255), outline=GOLD_DK + (255,), width=3)
    return im


BG = build_bg()
DESK = build_desk()
VIG = (1 - 0.55 * np.clip(((XX - W / 2) / (W * 0.75)) ** 2 + ((YY - H / 2) / (H * 0.7)) ** 2, 0, 1))[..., None].astype(np.float32)
_rng = np.random.RandomState(3)
GRAIN = [(_rng.randn(H // 2, W // 2) * 5.0).astype(np.float32) for _ in range(4)]
PART = [(_rng.rand() * W, _rng.rand() * H, 0.5 + _rng.rand() * 1.5, _rng.rand() * 6.28, 2 + _rng.rand() * 3)
        for _ in range(70)]


def _shelf_half(side):
    w, h = 125, 770
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, w - 1, h - 1), fill=(46, 30, 20, 255), outline=GOLD_DK + (255,), width=4)
    cols = [(88, 24, 34), (22, 32, 66), (34, 66, 48), (120, 84, 30), (70, 40, 90)]
    for r in range(5):
        y0 = r * 154
        d.rectangle((0, y0 + 148, w, y0 + 160), fill=(30, 20, 14, 255))
        d.line([(0, y0 + 148), (w, y0 + 148)], fill=GOLD_DK + (255,), width=2)
        for k in range(3):
            bx = 10 + k * 38
            bh = 80 + ((k * 13 + r * 7) % 40)
            c = cols[(k + r * 2 + side) % 5]
            d.rectangle((bx, y0 + 146 - bh, bx + 30, y0 + 146), fill=c + (255,), outline=(0, 0, 0, 255))
            d.line([(bx + 4, y0 + 146 - bh + 14), (bx + 26, y0 + 146 - bh + 14)], fill=GOLD + (255,), width=2)
            d.line([(bx + 4, y0 + 146 - 18), (bx + 26, y0 + 146 - 18)], fill=GOLD + (255,), width=2)
    return im


SHELF = [_shelf_half(0), _shelf_half(1)]
EST_BOOK = Image.new("RGBA", (44, 126), (0, 0, 0, 0))
_d = ImageDraw.Draw(EST_BOOK)
_d.rectangle((0, 0, 43, 125), fill=GOLD + (255,), outline=GOLD_DK + (255,), width=3)
_d.text((22, 63), "E\nS\nT", font=font(24), fill=(70, 40, 6, 255), anchor="mm", align="center")


# ---------------- 캐릭터 ----------------
OX, OY, CW, CH, SS = 100, 480, 880, 860, 2


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
    if pose == "TYPE":
        hands = [(h[0] + math.sin(t * 22 + i) * 6, h[1] + math.cos(t * 27 + i) * 5) for i, h in enumerate(hands)]
    dy = lerp(prev[3], dy, p) + math.sin(t * 2.2) * 3
    look = (-12, -2) if 24.4 <= t < 27 else ((10, -10) if expr == "think" else (0, 0))
    return hands, expr, dy, look


def student(img, t):
    hands, expr, dy, look = student_state(t)
    m_open = mouth_open(t)
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

    def blob(bbox, color, a=1.0):  # 알파가 있는 타원을 그리기 (바탕 위에 합성)
        x0, y0, x1, y1 = (int(v) for v in R(*bbox))
        m = Image.new("L", (x1 - x0 + 2, y1 - y0 + 2), 0)
        ImageDraw.Draw(m).ellipse((1, 1, x1 - x0 + 1, y1 - y0 + 1), fill=int(255 * a))
        layer.paste(color, (x0 - 1, y0 - 1), m)

    cx = 540 + math.sin(t * 1.1) * 2
    cy = 860 + dy + math.sin(t * 2.2) * 2
    top = 1000 + dy * 0.5 + math.sin(t * 2.2) * 2
    skin = SKIN if expr != "frozen" else (222, 232, 248)
    shade = SKIN_SH if expr != "frozen" else (170, 190, 225)

    # 뒷머리 / 목 / 몸 (블레이저)
    d.ellipse(R(cx - 142, cy - 160, cx + 142, cy + 105), fill=HAIR)
    d.polygon([P(cx - 138, cy - 10), P(cx - 160, cy + 120), P(cx - 100, cy + 70)], fill=HAIR)
    d.polygon([P(cx + 138, cy - 10), P(cx + 160, cy + 120), P(cx + 100, cy + 70)], fill=HAIR)
    d.rectangle(R(cx - 34, cy + 90, cx + 34, top + 70), fill=skin)
    d.polygon([P(cx - 34, cy + 120), P(cx + 34, cy + 120), P(cx + 34, top + 70), P(cx - 34, top + 70)], fill=shade)
    d.polygon([P(318, top + 70), P(400, top - 6), P(500, top - 20), P(580, top - 20), P(680, top - 6),
               P(762, top + 70), P(780, 1345), P(300, 1345)], fill=BLAZER)
    d.ellipse(R(300, top + 6, 436, top + 142), fill=BLAZER)
    d.ellipse(R(644, top + 6, 780, top + 142), fill=BLAZER)
    line([(330, top + 90), (350, 1300)], (44, 48, 66), 6)  # 어깨 하이라이트
    line([(750, top + 90), (730, 1300)], (44, 48, 66), 6)
    d.polygon([P(498, top - 18), P(582, top - 18), P(540, top + 74)], fill=(244, 244, 250))  # 셔츠
    d.polygon([P(498, top - 18), P(470, top + 26), P(520, top + 34)], fill=(224, 226, 236))  # 칼라
    d.polygon([P(582, top - 18), P(610, top + 26), P(560, top + 34)], fill=(224, 226, 236))
    d.polygon([P(540, top + 40), P(522, top + 70), P(558, top + 70)], fill=GOLD)  # 골드 넥타이
    d.polygon([P(522, top + 70), P(558, top + 70), P(566, top + 150), P(540, top + 172), P(514, top + 150)], fill=GOLD)
    line([(498, top - 18), (540, top + 74), (582, top - 18)], GOLD_DK, 3)
    line([(380, top + 20), (470, top + 150)], GOLD_DK, 3)  # 라펠 골드 파이핑
    line([(700, top + 20), (610, top + 150)], GOLD_DK, 3)

    # 팔 (2-링크 IK) + 소매 + 흰 커프스 + 손
    L = 175
    arm_ends = []
    for s, (sx, hand) in enumerate(((372, hands[0]), (708, hands[1]))):
        S = (sx, top + 48)
        dx_, dy_ = hand[0] - S[0], hand[1] - S[1]
        ln = max(math.hypot(dx_, dy_), 1e-6)
        dist = max(40, min(ln, 2 * L - 2))
        ux, uy = dx_ / ln, dy_ / ln
        hand = (S[0] + ux * dist, S[1] + uy * dist)
        h = math.sqrt(max(L * L - (dist / 2) ** 2, 0))
        mid = (S[0] + ux * dist / 2, S[1] + uy * dist / 2)
        c1, c2 = (mid[0] - uy * h, mid[1] + ux * h), (mid[0] + uy * h, mid[1] - ux * h)
        elbow = c1 if c1[1] > c2[1] else c2
        line([S, elbow, hand], BLAZER, 60)
        line([S, elbow], (44, 48, 66), 8)
        ex, ey = hand[0] - elbow[0], hand[1] - elbow[1]
        el = max(math.hypot(ex, ey), 1e-6)
        cuff = (hand[0] - ex / el * 36, hand[1] - ey / el * 36)
        line([cuff, (hand[0] - ex / el * 22, hand[1] - ey / el * 22)], (244, 244, 250), 54)
        arm_ends.append(hand)

    # 얼굴 (턱선이 부드러운 애니 스타일)
    face_m = ImageChops.lighter(
        _ellipse_mask(layer.size, R(cx - 118, cy - 132, cx + 118, cy + 112)),
        _ellipse_mask(layer.size, R(cx - 94, cy - 40, cx + 94, cy + 138)))
    layer.paste(skin, (0, 0), face_m)
    layer.paste(shade, (0, 0), ImageChops.subtract(face_m, ImageChops.offset(face_m, 26 * SS, 0)).point(lambda v: int(v * 0.8)))
    band = _ellipse_mask(layer.size, R(cx - 126, cy - 150, cx + 126, cy - 24))
    strip = ImageChops.subtract(ImageChops.multiply(face_m, band),
                                ImageChops.multiply(face_m, ImageChops.offset(band, 0, -26 * SS)))
    layer.paste(shade, (0, 0), strip.point(lambda v: int(v * 0.75)))
    for sx in (-1, 1):  # 귀
        d.ellipse(R(cx + sx * 124 - 16, cy + 2, cx + sx * 124 + 16, cy + 44), fill=skin)
    if expr in ("happy", "shock", "panic"):
        for sx in (-1, 1):
            blob((cx + sx * 78 - 30, cy + 46, cx + sx * 78 + 30, cy + 78), (255, 120, 120), 0.45)

    # 눈썹
    brow = {"neutral": (0, 0), "shock": (-24, -24), "tired": (6, -12), "panic": (-8, -28),
            "happy": (-8, -8), "frozen": (0, 0), "think": (0, -4)}[expr]
    for sx in (-1, 1):
        o, i_ = brow
        if expr == "think" and sx == 1:
            o, i_ = -16, -16
        line([(cx + sx * 84, cy - 50 + o), (cx + sx * 50, cy - 60 + (o + i_) / 2), (cx + sx * 22, cy - 50 + i_)], HAIR, 8)

    # 눈 (큰 애니 눈: 흰자 / 홍채 / 동공 / 하이라이트 / 속눈썹 / 깜빡임)
    blink = (t % 3.7) < 0.12 and expr in ("neutral", "think", "shock")
    for sx in (-1, 1):
        ex, ey = cx + sx * 50, cy + 14
        if blink or expr == "happy":
            d.arc(R(ex - 26, ey - 18, ex + 26, ey + 22), 200 if expr == "happy" else 20,
                  340 if expr == "happy" else 160, fill=INK, width=8 * SS)
            continue
        if expr == "panic":
            d.ellipse(R(ex - 28, ey - 32, ex + 28, ey + 32), fill=(255, 255, 255), outline=INK, width=4 * SS)
            for k in range(1, 4):
                r_, a0 = 8 * k, (t * 400 + k * 90) % 360
                d.arc(R(ex - r_, ey - r_, ex + r_, ey + r_), a0, a0 + 250, fill=INK, width=4 * SS)
            continue
        rx, ry = (30, 36) if expr == "shock" else (26, 32)
        d.ellipse(R(ex - rx, ey - ry, ex + rx, ey + ry), fill=(252, 252, 255))
        ir = 9 if expr in ("shock", "frozen") else 19
        irh = 12 if expr in ("shock", "frozen") else 27
        ix, iy = ex + look[0] * 0.5, ey + look[1] * 0.5
        d.ellipse(R(ix - ir, iy - irh, ix + ir, iy + irh), fill=(96, 56, 24))
        d.pieslice(R(ix - ir, iy - irh, ix + ir, iy + irh), 180, 360, fill=(36, 22, 14))
        d.ellipse(R(ix - ir * .5, iy - irh * .5, ix + ir * .5, iy + irh * .5), fill=(14, 10, 12))
        d.ellipse(R(ix - ir * .55, iy - irh * .75, ix + ir * .05, iy - irh * .25), fill=WHITE)
        d.ellipse(R(ix + ir * .2, iy + irh * .25, ix + ir * .6, iy + irh * .6), fill=(255, 240, 220))
        if expr == "tired":  # 반쯤 감긴 눈꺼풀 + 다크서클
            d.polygon([P(ex - 30, ey - 40), P(ex + 30, ey - 40), P(ex + 30, ey - 2), P(ex, ey + 4), P(ex - 30, ey - 2)], fill=skin)
            d.arc(R(ex - 28, ey - 14, ex + 28, ey + 14), 190, 350, fill=INK, width=8 * SS)
            d.arc(R(ex - 28, ey + 8, ex + 28, ey + 40), 20, 160, fill=(170, 130, 190), width=5 * SS)
        else:
            d.arc(R(ex - rx - 2, ey - ry - 2, ex + rx + 2, ey + ry + 2), 188, 352, fill=INK, width=9 * SS)
            line([(ex + sx * (rx + 1), ey - ry * .35), (ex + sx * (rx + 12), ey - ry * .62)], INK, 5)  # 속눈썹 꼬리
    # 코
    d.arc(R(cx - 7, cy + 46, cx + 7, cy + 62), 20, 160, fill=(200, 140, 120), width=3 * SS)

    # 입 (음성 크기에 맞춘 립싱크)
    mx, my = cx, cy + 92
    speaking = m_open >= 0
    if speaking:
        m = clamp01(m_open * 1.15)
        wide = 38 + 26 * m + (10 if expr == "happy" else 0)
        hgt = 6 + 52 * m
        d.ellipse(R(mx - wide / 2, my - hgt * .3, mx + wide / 2, my + hgt * .7), fill=(96, 26, 36))
        if hgt > 22:
            d.ellipse(R(mx - wide * .32, my + hgt * .28, mx + wide * .32, my + hgt * .68), fill=(226, 104, 116))
        if hgt > 14:
            d.rectangle(R(mx - wide * .34, my - hgt * .28, mx + wide * .34, my - hgt * .1), fill=(250, 250, 252))
    elif expr == "neutral":
        d.line([P(mx - 18, my), P(mx + 18, my)], fill=(168, 80, 80), width=6 * SS)
    elif expr == "think":
        d.ellipse(R(mx - 9, my - 8, mx + 9, my + 10), fill=(160, 70, 76))
    elif expr == "shock":
        d.ellipse(R(mx - 20, my - 14, mx + 20, my + 34), fill=(96, 26, 36))
    elif expr == "tired":
        d.line([P(mx - 30 + k * 6, my + math.sin(k * 1.4 + t * 5) * 5) for k in range(11)], fill=(168, 80, 80), width=6 * SS)
    elif expr == "panic":
        d.ellipse(R(mx - 34, my - 14, mx + 34, my + 40), fill=(96, 26, 36))
        d.ellipse(R(mx - 18, my + 16, mx + 18, my + 40), fill=(226, 104, 116))
    elif expr == "happy":
        d.pieslice(R(mx - 38, my - 22, mx + 38, my + 38), 0, 180, fill=(96, 26, 36))
        d.pieslice(R(mx - 22, my + 6, mx + 22, my + 38), 0, 180, fill=(226, 104, 116))
    elif expr == "frozen":
        d.line([P(mx - 14, my + 4), P(mx + 14, my + 4)], fill=(120, 130, 170), width=6 * SS)
        for k in range(-2, 3):
            line([(cx + k * 24, cy - 120), (cx + k * 24, cy - 82)], (90, 120, 210), 5)

    # 앞머리: 겹겹의 가닥 + 하이라이트 + 골드 헤어핀 + 아호게
    sway = math.sin(t * 1.7) * 4
    d.pieslice(R(cx - 140, cy - 160, cx + 140, cy + 50), 180, 360, fill=HAIR)
    tufts = [(-130, -30, -96, -78, -62, 6), (-80, -86, -44, -104, -16, 10), (-30, -104, 4, -100, 26, 18),
             (20, -104, 60, -96, 86, 4), (70, -92, 110, -70, 136, -24)]
    for a, b, c_, d_, e, f in tufts:
        d.polygon([P(cx + a, cy + b), P(cx + c_ + sway * .3, cy + d_), P(cx + e + sway * .6, cy + min(f + 14, -30))], fill=HAIR)
    d.arc(R(cx - 112, cy - 148, cx + 112, cy - 40), 205, 300, fill=HAIR_HI, width=7 * SS)
    d.arc(R(cx - 90, cy - 150, cx + 70, cy - 70), 230, 285, fill=HAIR_HI, width=4 * SS)
    line([(cx + 8, cy - 150), (cx + 30 + sway, cy - 196), (cx + 6 + sway, cy - 214)], HAIR, 7)  # 아호게
    line([(cx - 96, cy - 74), (cx - 62, cy - 96)], GOLD, 9)  # 골드 헤어핀
    line([(cx - 90, cy - 62), (cx - 60, cy - 84)], GOLD, 9)

    # 손 (손바닥 + 엄지 + 음영)
    for hx, hy in arm_ends:
        x, y = P(hx, hy)
        d.ellipse((x - 36 * SS, y - 34 * SS, x + 36 * SS, y + 34 * SS), fill=skin)
        d.ellipse((x + 10 * SS, y - 8 * SS, x + 40 * SS, y + 26 * SS), fill=shade)
        d.ellipse((x - 44 * SS, y - 4 * SS, x - 18 * SS, y + 20 * SS), fill=skin)

    out = layer.resize((CW, CH), Image.LANCZOS)
    img.paste(out, (OX, OY), out)
    return expr, cx, cy


def _ellipse_mask(size, bbox):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).ellipse(bbox, fill=255)
    return m


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
            d.polygon([(x, y - 22), (x - 11, y + 4), (x, y + 14), (x + 11, y + 4)], fill=(150, 210, 255))
            d.ellipse((x - 3, y - 2, x + 1, y + 4), fill=WHITE)
    if expr == "think":
        txt(img, (cx + 170, cy - 170 + math.sin(t * 3) * 6), "?", 90, GOLD, stroke=4)
    if expr == "panic":
        for i in range(4):
            a = t * 4 + i * math.pi / 2
            star4(d, cx + math.cos(a) * 190, cy - 170 + math.sin(a) * 40, 18, (255, 230, 110))
    if expr == "happy":
        for i in range(4):
            a = t * 2.5 + i * math.pi / 2
            star4(d, cx + math.cos(a) * 200, cy - 80 + math.sin(a) * 120, 16 + 5 * math.sin(t * 6 + i), (255, 235, 140))


# ---------------- 배경 요소 ----------------
def particles(img, t, amount):
    d = ImageDraw.Draw(img)
    for i, (x, y, sp, ph, r) in enumerate(PART):
        if i / len(PART) > amount:
            continue
        yy = (y - t * 28 * sp) % H
        xx = x + math.sin(t * 0.4 + ph) * 34
        b = 0.5 + 0.5 * math.sin(t * 2 + ph)
        c = (int(255 * (0.4 + 0.6 * b)), int(205 * (0.4 + 0.6 * b)), int(80 * (0.4 + 0.6 * b)))
        rr = r * (0.6 + 0.4 * b)
        d.ellipse((xx - rr, yy - rr, xx + rr, yy + rr), fill=c)


def rays(img, t, cx, cy, alpha):
    if alpha <= 0.01:
        return
    sw = Image.new("RGBA", (W // 4, H // 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(sw)
    for i in range(7):
        a = math.radians(-35 + i * 11 + math.sin(t * 0.5 + i) * 4)
        l = 700
        w = 0.05
        d.polygon([(cx / 4, cy / 4), ((cx + math.cos(a - w) * l) / 4, (cy + math.sin(a - w) * l) / 4),
                   ((cx + math.cos(a + w) * l) / 4, (cy + math.sin(a + w) * l) / 4)],
                  fill=(255, 210, 100, int(60 * alpha)))
    sw = sw.filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.BILINEAR)
    base = img.convert("RGBA")
    img.paste(Image.alpha_composite(base, sw).convert("RGB"))


def room_shelf(img, t, so):
    x0, y0 = 40, 380
    if so > 0.01:
        ph = ease(so)
        port = Image.new("RGB", (250, 770), (255, 236, 170))
        pd = ImageDraw.Draw(port)
        for k in range(8):
            pd.ellipse((125 - 120 + k * 8, 385 - 380 + k * 16, 125 + 120 - k * 8, 385 + 380 - k * 16),
                       fill=(255, 240 + k, 190 + k * 8))
        img.paste(port, (x0, y0))
    shift = int(so * 126)
    img.paste(SHELF[0], (x0 - shift, y0), SHELF[0])
    img.paste(SHELF[1], (x0 + 125 + shift, y0), SHELF[1])
    if so < 0.05:
        img.paste(EST_BOOK, (74, 640), EST_BOOK)


def desk_props(img, t):
    d = ImageDraw.Draw(img)
    buzz = any(0 <= t - n[0] < 0.5 for n in NOTIFS) or 51.8 <= t < 52.4
    vx = int(math.sin(t * 90) * 5) if buzz else 0
    d.rounded_rectangle((770 + vx, 1130, 880 + vx, 1198), 12, fill=(16, 16, 20),
                        outline=GOLD if buzz else GOLD_DK, width=4)
    if buzz:
        d.rounded_rectangle((780 + vx, 1140, 870 + vx, 1188), 8, fill=(255, 226, 140))
    for t0, x in PAPERS:
        k = t - t0
        if k >= 0:
            y = 1146 - max(0, (1 - k / 0.35)) * 240 * (1 - k / 0.35) + (abs(math.sin(k * 14)) * -14 * max(0, 1 - k / 0.5))
            pts = [(x + math.cos(a) * (34 + (i % 3) * 5), y + math.sin(a) * (30 + (i % 2) * 6))
                   for i, a in enumerate(np.linspace(0, 2 * math.pi, 9)[:-1] + x)]
            d.polygon(pts, fill=(238, 236, 228), outline=(150, 140, 120))
            d.line([pts[0], pts[3], pts[5]], fill=(180, 172, 150), width=3)
    # 책상 위 은은한 노트북 불빛 반사
    for k in range(3):
        d.line([(430 + k * 90, 1224), (440 + k * 90, 1256)], fill=(70, 60, 40), width=3)


def bubble(img, xy, s, size=38, a=1.0):
    d = ImageDraw.Draw(img)
    bb = d.multiline_textbbox((0, 0), s, font=font(size), align="center")
    w, h = bb[2] - bb[0] + 60, bb[3] - bb[1] + 40
    x, y = xy
    panel(img, (int(x - w / 2), int(y - h / 2), int(x + w / 2), int(y + h / 2)), fill=(8, 8, 10),
          outline=GOLD, width=3, radius=int(h / 2), a=a)
    txt(img, (x, y), s, size, GOLD, a)


def notif_card(img, y, app, title, dx=0, color=GOLD, big=1.0):
    w, h = int(900 * big), int(130 * big)
    x0 = (W - w) // 2 + dx
    panel(img, (x0, y, x0 + w, y + h), fill=(8, 8, 10), outline=color, width=3, radius=int(30 * big))
    d = ImageDraw.Draw(img)
    d.ellipse((x0 + 26 * big, y + h // 2 - 34 * big, x0 + 94 * big, y + h // 2 + 34 * big), fill=color)
    d.text((x0 + 60 * big, y + h // 2), "!", font=font(44 * big), fill=(20, 14, 4), anchor="mm")
    d.text((x0 + 124 * big, y + h // 2 - 26 * big), app, font=font(30 * big), fill=(190, 170, 110), anchor="lm")
    d.text((x0 + 124 * big, y + h // 2 + 24 * big), title, font=font(46 * big), fill=WHITE, anchor="lm")


CARD_LABELS = ["탐구보고서", "실험 자료", "교과 연계", "세특 사례", "발표 자료", "개념 정리"]
CARD_POS = [(150, 640), (930, 640), (130, 920), (950, 920), (170, 1300), (910, 1300)]
_card_imgs = {}


def card_img(i):
    if i not in _card_imgs:
        c = Image.new("RGBA", (210, 270), (0, 0, 0, 0))
        d = ImageDraw.Draw(c)
        d.rounded_rectangle((2, 2, 207, 267), 22, fill=(14, 12, 10, 255), outline=GOLD + (255,), width=4)
        d.rounded_rectangle((20, 24, 190, 40), 6, fill=GOLD + (255,))
        for k in range(5):
            d.rounded_rectangle((20, 64 + k * 24, 190 - (k % 3) * 30, 74 + k * 24), 4, fill=(120, 96, 44, 255))
        d.text((105, 232), CARD_LABELS[i], font=font(28), fill=GOLD + (255,), anchor="mm")
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


def checkmark(img, cx, cy, size, p, color=GOLD):
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
    d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=(8, 8, 10), outline=GOLD, width=8)
    a = t * 6
    d.line([(cx, cy), (cx + math.sin(a) * 52, cy - math.cos(a) * 52)], fill=GOLD, width=6)
    d.line([(cx, cy), (cx + math.sin(a / 12) * 34, cy - math.cos(a / 12) * 34)], fill=WHITE, width=9)


def burst_text(img, t, t0):
    k = t - t0
    if 0 <= k < 2.0:
        pop = 1.0 + 0.35 * max(0, 1 - k / 0.25) + 0.06 * k
        txt(img, (W // 2, 1000), "콰아아앙!", 140, GOLD, clamp01((2.0 - k) / 0.6), stroke=8, scale=pop)


def camera(world, t):
    idx = 0
    for i, k in enumerate(CAM):
        if t >= k[0]:
            idx = i
    a = CAM[idx]
    b = CAM[min(idx + 1, len(CAM) - 1)]
    p = smooth((t - a[0]) / (b[0] - a[0])) if b[0] > a[0] else 0
    z, cx, cy = lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)
    z += sum(0.09 * max(0, 1 - (t - e) / 0.35) for e in PUNCH if 0 <= t - e < 0.35)
    w, h = W / z, H / z
    x0 = min(max(cx - w / 2, 0), W - w)
    y0 = min(max(cy - h / 2, 0), H - h)
    return world.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))


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


def finish(img, t, shake):
    if shake:
        img = ImageChops.offset(img, int(math.sin(t * 97) * shake), int(math.cos(t * 83) * shake))
    a = np.asarray(img).astype(np.float32) * VIG
    g = GRAIN[int(t * FPS) % 4]
    a += np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]
    return np.clip(a, 0, 255).astype(np.uint8)


def frame(t):
    # ---- 엔딩 ----
    if t >= 57.0:
        arr = np.zeros((H, W, 3), np.float32)
        k = t - 57.0
        add_light(arr, W // 2, 900, 560, 0.6 * ease(k / 1.0), GOLD)
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        particles(img, t, 1.0)
        rays(img, t, W // 2, 900, ease(k / 1.2))
        p = ease((k - 0.2) / 0.8)
        txt(img, (W // 2, 900), "EST", 300, GOLD, p, scale=0.85 + 0.15 * p)
        w = int(360 * ease((k - 0.9) / 0.6))
        ImageDraw.Draw(img).rounded_rectangle((W // 2 - w // 2, 1060, W // 2 + w // 2, 1068), 4, fill=GOLD)
        txt(img, (W // 2, 1160), "수행평가의 히든카드", 66, WHITE, ease((k - 1.0) / 0.7))
        return finish(img, t, 0)

    arr = BG.copy()
    stress = clamp01((t - 14.0) / 10.0) if t < 24.5 else (clamp01((26.5 - t) / 2) if t < 26.5 else 0)
    arr[..., 0] += 30 * stress
    arr *= 1 - 0.25 * stress
    so = shelf_open_amount(t)
    for b in BURSTS:
        k = t - b
        if 0 <= k < 3.0:
            add_light(arr, W // 2, 960, 300 + 700 * ease(k / 0.6), 1.3 * (1 - clamp01(k / 3.0)) ** 1.5)
    if 24.6 <= t < 27.0 or 53.0 <= t < 55.5:
        base = 24.6 if t < 30 else 53.0
        add_light(arr, 165, 780, 420, 0.9 * clamp01((t - base) / 2.0))
    if 27.0 <= t < 50.0:
        add_light(arr, 165, 780, 560, 0.55)
        add_light(arr, W // 2, 960, 600, 0.22 + 0.05 * math.sin(t * 2.0))
    world = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    room_shelf(world, t, so)
    particles(world, t, 0.25 if t < 26.5 else 1.0)
    if 27.0 <= t < 50.0:
        draw_cards(world, t, 28.0, 49.0, links_from=38.0)
    expr, hx, hy = student(world, t)
    world.paste(DESK, (0, 0), DESK)
    desk_props(world, t)
    fx(world, t, expr, hx, hy)
    if 27.0 <= t < 50.0:
        rays(world, t, 165, 780, 0.9)
    img = camera(world, t)

    # ---- 화면 고정 UI (자막 없음) ----
    txt(img, (W // 2, 110), "EST 숏폼 드라마 EP.01  ·  수행평가 지옥 탈출", 34, (190, 160, 90))
    shake = 0
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
        if t >= 7.2:
            p = ease((t - 7.2) / 0.4) * clamp01((13.5 - t) / 0.4)
            panel(img, (260, 330, 820, 410), outline=GOLD, radius=40, a=p)
            txt(img, (540, 370), "탐구 주제 추천  ...", 36, GOLD, p)
            for i in range(3):
                txt(img, (330 + i * 210, 480 + math.sin(t * 3 + i) * 8), "?", 70, GOLD, p, stroke=3)
    elif t < 26.5:
        for t0, label, (x, y) in CHIPS:
            if t0 <= t < 26:
                bubble(img, (x, y + math.sin(t * 2 + t0) * 6), label, 38, a=ease((t - t0) / 0.35))
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
            panel(img, (160, 300, 920, 520), width=5, a=p)
            d = ImageDraw.Draw(img)
            d.ellipse((190, 340, 310, 460), fill=GOLD)
            d.text((250, 400), cur[1], font=font(72), fill=(30, 20, 4), anchor="mm")
            txt(img, (640, 372), cur[2], 64, WHITE, p)
            txt(img, (640, 452), cur[3], 64, GOLD, p)
            if k < 0.25:
                img = Image.blend(img, Image.new("RGB", (W, H), (255, 236, 180)), 0.45 * (1 - k / 0.25))
            shake = shake_amount(t, cur[0], 0.3, 6)
        elif t >= 46.6:
            panel(img, (180, 290, 900, 640), width=5, a=ease((t - 46.6) / 0.3))
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
    if SUBTITLES:
        for st, text, window, _ in LINES:
            if st <= t < st + window:
                txt(img, (W // 2, 1640), text, 56, WHITE, 1.0, stroke=6)

    for b in BURSTS:
        k = t - b
        if 0 <= k < 0.5:
            img = Image.blend(img, Image.new("RGB", (W, H), (255, 240, 200)), 0.9 * (1 - k / 0.5))
    if 56.0 <= t < 57.0:
        img = Image.blend(img, Image.new("RGB", (W, H), (0, 0, 0)), clamp01((t - 56.0) / 0.9))
    if 26.5 <= t < 27.0:
        img = Image.blend(img, Image.new("RGB", (W, H), (255, 240, 200)), (t - 26.5) / 0.5)
    return finish(img, t, shake)


# ---------------- 오디오 (BGM + 효과음 + 음성) ----------------
def synth_audio(path):
    build_voices()
    n = int(SR * TOTAL)
    out = np.zeros(n, np.float32)

    def add(start, sig, vol=1.0):
        i = int(start * SR)
        if i < n:
            sig = sig[: n - i]
            out[i:i + len(sig)] += sig * vol

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

    for k in range(0, 52):
        add(k * 0.5, tone(hz(45 if k % 8 < 4 else 43), 0.45, 0.14, "saw", 3.0))
    for k in range(0, 8):
        add(21.5 + k * 0.4, noise(0.04, 0.35, 90))
    for m in (57, 61, 64, 69):
        add(27.0, tone(hz(m), 11.0, 0.05, "sine", 0.15))
    step = 60 / 128 / 2
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
    out *= 0.55  # 음성이 잘 들리도록 BGM은 낮춤
    for v in VOICES:  # 음성 구간에서는 BGM을 더 낮춤(덕킹)
        a, b = int(v["start"] * SR), int((v["start"] + v["dur"]) * SR)
        out[a:b] *= 0.55
        add(v["start"], v["sig"], 1.0 if v["style"] == "kid" else 1.2)
    out *= 0.92 / max(1e-6, np.abs(out).max())
    fade = int(SR * 0.6)
    out[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((out * 32767).astype("<i2").tobytes())


# ---------------- 메인 ----------------
def main():
    build_voices()
    for v, l in zip(VOICES, LINES):
        print(f"음성 {l[0]:5.1f}s  {v['dur']:.1f}s/{l[2]:.1f}s  {l[1]}")
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
