from pathlib import Path
from random import Random

from PIL import Image, ImageDraw


WIDTH, HEIGHT = 720, 960
OUTPUT = Path(__file__).resolve().parents[1] / 'static' / 'travel'
OUTPUT.mkdir(parents=True, exist_ok=True)


def gradient(top, bottom):
    image = Image.new('RGB', (WIDTH, HEIGHT))
    drawing = ImageDraw.Draw(image)
    for row in range(HEIGHT):
        ratio = row / HEIGHT
        color = tuple(round(start + (end - start) * ratio) for start, end in zip(top, bottom))
        drawing.line((0, row, WIDTH, row), fill=color)
    return image, drawing


def waves(drawing, start, color, seed=7):
    random = Random(seed)
    for row in range(start, HEIGHT, 24):
        offset = random.randrange(-70, 40)
        for column in range(offset, WIDTH, 125):
            drawing.arc((column, row, column + 90, row + 10), 5, 172, fill=color, width=2)


def birds(drawing, positions, color):
    for column, row, size in positions:
        drawing.line([(column - size, row + 3), (column, row), (column + size, row + 3)], fill=color, width=3)


def finish(image, name):
    random = Random(2026)
    texture = Image.new('RGB', image.size)
    texture_pixels = texture.load()
    for row in range(HEIGHT):
        for column in range(WIDTH):
            shade = random.randrange(65, 190)
            texture_pixels[column, row] = (shade, shade, shade)
    image = Image.blend(image, texture, 0.035)
    image.save(OUTPUT / f'{name}.jpg', quality=88, optimize=True)
    previous_png = OUTPUT / f'{name}.png'
    if previous_png.exists():
        previous_png.unlink()


def arrival():
    image, drawing = gradient((36, 62, 78), (128, 157, 151))
    drawing.ellipse((510, 140, 600, 230), fill='#f4dfa8')
    drawing.ellipse((480, 121, 577, 214), fill='#304c5b')
    random = Random(11)
    for _ in range(45):
        column, row = random.randrange(30, 690), random.randrange(60, 400)
        drawing.ellipse((column, row, column + 2, row + 2), fill='#dfdcb6')
    drawing.polygon([(0, 510), (130, 455), (240, 486), (350, 419), (490, 480), (720, 457), (720, 680), (0, 680)], fill='#668d8b')
    for column, height in [(12, 120), (81, 180), (135, 107), (207, 145), (286, 190), (349, 130), (420, 103), (480, 155), (556, 215), (634, 143)]:
        drawing.rectangle((column, 565 - height, column + 48, 588), fill='#355a64')
        for window in range(580 - height, 565, 22):
            drawing.rectangle((column + 12, window, column + 18, window + 5), fill='#d1c391')
            drawing.rectangle((column + 30, window, column + 36, window + 5), fill='#92a998')
    drawing.rectangle((0, 580, WIDTH, HEIGHT), fill='#426d76')
    waves(drawing, 610, '#75958f')
    drawing.polygon([(123, 282), (277, 256), (390, 211), (402, 219), (324, 267), (407, 280), (411, 292), (300, 290), (260, 334), (246, 335), (253, 287), (142, 300)], fill='#f2e9d2')
    drawing.line((20, 315, 112, 294), fill='#bbcab9', width=2)
    drawing.line((40, 331, 98, 317), fill='#8ea99f', width=2)
    finish(image, 'arrival')


def river():
    image, drawing = gradient((219, 221, 201), (177, 196, 177))
    drawing.ellipse((470, 160, 594, 284), fill='#edc580')
    drawing.polygon([(0, 408), (90, 360), (185, 395), (295, 315), (388, 390), (480, 351), (650, 405), (720, 370), (720, 550), (0, 550)], fill='#9bae99')
    for column, height in [(25, 70), (78, 87), (134, 55), (210, 78), (415, 72), (477, 110), (545, 82), (610, 130), (672, 92)]:
        drawing.rectangle((column, 466 - height, column + 35, 480), fill='#7c968a')
    drawing.rectangle((0, 473, WIDTH, HEIGHT), fill='#8aaa9b')
    waves(drawing, 510, '#c2c9aa')
    for column in range(-50, 700, 190):
        drawing.polygon([(column + 60, 480), (column + 90, 480), (column + 110, 730), (column + 41, 730)], fill='#b7ac8c')
        drawing.line([(column, 465), (column + 90, 350), (column + 190, 465)], fill='#716958', width=8)
        drawing.line([(column, 350), (column + 90, 465), (column + 190, 350)], fill='#82765f', width=6)
        drawing.line((column + 90, 350, column + 90, 465), fill='#716958', width=6)
    drawing.line((0, 473, WIDTH, 473), fill='#5e675c', width=17)
    drawing.line((0, 349, WIDTH, 349), fill='#756d58', width=9)
    birds(drawing, [(165, 228, 16), (210, 213, 12), (245, 244, 15)], '#7a8d7e')
    finish(image, 'river')


def cliff():
    image, drawing = gradient((200, 219, 205), (99, 161, 158))
    drawing.ellipse((454, 143, 589, 278), fill='#eee1ac')
    drawing.polygon([(0, 433), (120, 403), (250, 427), (390, 390), (530, 439), (720, 410), (720, 960), (0, 960)], fill='#71a5a0')
    waves(drawing, 460, '#a0c1ae')
    drawing.polygon([(0, 196), (113, 260), (200, 236), (270, 330), (298, 486), (378, 598), (302, 776), (394, 960), (0, 960)], fill='#c0b08c')
    drawing.polygon([(0, 288), (86, 313), (149, 453), (232, 443), (213, 646), (301, 745), (270, 960), (0, 960)], fill='#a69f7f')
    drawing.line([(110, 267), (165, 384), (150, 465), (245, 584), (218, 725)], fill='#ded0a8', width=5)
    drawing.line([(237, 354), (226, 476), (290, 548), (260, 629)], fill='#8f9678', width=4)
    drawing.polygon([(0, 162), (55, 130), (109, 188), (160, 168), (201, 235), (95, 260), (0, 228)], fill='#466b56')
    drawing.line([(202, 240), (223, 350), (221, 445), (247, 512)], fill='#f0dfac', width=3)
    drawing.ellipse((222, 410, 243, 431), fill='#edce87')
    drawing.line((234, 437, 242, 480), fill='#b85645', width=16)
    drawing.line([(233, 446), (211, 454), (200, 431)], fill='#dfbca0', width=7)
    drawing.line([(239, 449), (257, 425), (255, 407)], fill='#dfbca0', width=7)
    drawing.line([(240, 478), (216, 508), (226, 521)], fill='#36564f', width=9)
    drawing.line([(240, 478), (261, 496), (260, 517)], fill='#36564f', width=9)
    birds(drawing, [(465, 340, 17), (516, 316, 12)], '#648d7c')
    finish(image, 'cliff')


def sunset():
    image, drawing = gradient((220, 168, 137), (242, 208, 158))
    drawing.ellipse((345, 221, 553, 429), fill='#f4d49a')
    drawing.polygon([(0, 461), (80, 425), (190, 470), (300, 436), (414, 468), (575, 420), (720, 455), (720, 570), (0, 570)], fill='#b3a48b')
    drawing.rectangle((0, 493, WIDTH, HEIGHT), fill='#78958b')
    waves(drawing, 520, '#b3baa0')
    for row in range(530, 860, 24):
        half_width = int((row - 490) * 0.2 + 20)
        drawing.line((446 - half_width, row, 446 + half_width, row), fill='#d1c397', width=5)
    drawing.line((-30, 529, 750, 444), fill='#e4d8b8', width=17)
    for column, top, bottom in [(186, 280, 630), (561, 229, 575)]:
        drawing.line((column, top, column, bottom), fill='#eae1c6', width=13)
        drawing.line((column + 36, top, column + 36, bottom - 5), fill='#ded5b8', width=12)
        drawing.line((column, top + 40, column + 36, top + 40), fill='#eae1c6', width=8)
        for destination in range(column - 180, column + 211, 37):
            deck_height = int(526 - destination * 0.112)
            drawing.line((column + 18, top + 26, destination, deck_height), fill='#e3d9ba', width=2)
    drawing.polygon([(0, 733), (104, 702), (204, 781), (279, 802), (406, 960), (0, 960)], fill='#506f60')
    birds(drawing, [(93, 234, 14), (133, 216, 10)], '#9a917a')
    finish(image, 'sunset')


def street():
    image, drawing = gradient((218, 225, 201), (221, 210, 177))
    drawing.ellipse((450, 125, 575, 250), fill='#e9d99f')
    drawing.polygon([(0, 380), (170, 321), (330, 385), (510, 330), (720, 379), (720, 650), (0, 650)], fill='#acbda0')
    drawing.polygon([(275, 470), (387, 470), (715, 960), (55, 960)], fill='#c8baa0')
    houses = [(0, 355, 172, 316, '#e2c8a4'), (125, 305, 151, 260, '#d9d6bc'), (232, 389, 105, 170, '#c4cbb0'), (440, 330, 158, 260, '#e3d8b7'), (568, 408, 165, 300, '#d7bb99')]
    for column, row, width, height, color in houses:
        drawing.rectangle((column, row, column + width, row + height), fill=color)
        drawing.polygon([(column - 12, row), (column + width / 2, row - 66), (column + width + 12, row)], fill='#9c7862')
        for window_column in range(column + 24, column + width - 17, 46):
            for window_row in range(row + 31, row + height - 25, 66):
                drawing.rectangle((window_column - 3, window_row - 3, window_column + 22, window_row + 36), fill='#eee3c9')
                drawing.rectangle((window_column, window_row, window_column + 19, window_row + 33), fill='#7d9b89')
                drawing.line((window_column + 9, window_row, window_column + 9, window_row + 33), fill='#d9d4b7', width=2)
    for column, row in [(55, 420), (658, 336), (612, 538), (96, 632)]:
        drawing.line((column, row, column + 7, row + 242), fill='#7e8769', width=9)
        drawing.ellipse((column - 56, row - 88, column + 65, row + 53), fill='#799575')
        drawing.ellipse((column - 27, row - 106, column + 88, row + 15), fill='#8da37c')
    drawing.line((0, 213, WIDTH, 370), fill='#90977d', width=2)
    finish(image, 'street')


def returning():
    image, drawing = gradient((216, 226, 203), (159, 187, 157))
    drawing.ellipse((465, 145, 581, 261), fill='#efdfab')
    drawing.polygon([(0, 510), (135, 387), (268, 445), (410, 329), (576, 405), (720, 371), (720, 960), (0, 960)], fill='#8ea48b')
    drawing.polygon([(0, 628), (180, 474), (327, 565), (489, 461), (720, 549), (720, 960), (0, 960)], fill='#6e9078')
    drawing.polygon([(0, 800), (181, 657), (350, 754), (511, 648), (720, 708), (720, 960), (0, 960)], fill='#507760')
    drawing.line((-20, 225, 740, 390), fill='#647d68', width=4)
    for column, row, scale in [(239, 283, 1), (539, 348, 0.65)]:
        drawing.line((column, row, column, row + 42 * scale), fill='#657d68', width=4)
        drawing.rounded_rectangle((column - 48 * scale, row + 36 * scale, column + 48 * scale, row + 131 * scale), radius=15, fill='#d6b67c')
        drawing.rounded_rectangle((column - 38 * scale, row + 47 * scale, column + 38 * scale, row + 102 * scale), radius=6, fill='#a3b7a1')
        drawing.line((column, row + 46 * scale, column, row + 104 * scale), fill='#f0dfb6', width=4)
        drawing.line((column - 42 * scale, row + 116 * scale, column + 42 * scale, row + 116 * scale), fill='#b69562', width=3)
    birds(drawing, [(103, 170, 14), (151, 150, 10)], '#85977b')
    finish(image, 'return')


def map_pin():
    image = Image.new('RGBA', (72, 96))
    drawing = ImageDraw.Draw(image)
    drawing.polygon([(8, 41), (64, 41), (36, 94)], fill='#426a58')
    drawing.ellipse((2, 2, 70, 70), fill='#426a58', outline='#fffdf3', width=4)
    drawing.ellipse((24, 24, 48, 48), fill='#fffdf3')
    image.save(OUTPUT / 'map-pin.png', optimize=True)


for render in [arrival, river, cliff, sunset, street, returning, map_pin]:
    render()
print(f'Generated six original illustrated covers and a map marker in {OUTPUT}')
