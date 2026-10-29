import argparse
from pathlib import Path
from random import Random

from PIL import Image, ImageDraw


WIDTH, HEIGHT = 720, 960
PACKAGE_OUTPUT = Path(__file__).resolve().parents[1] / 'static' / 'travel'
CLOUD_OUTPUT = Path(__file__).resolve().parents[2] / 'docs' / 'travel'
OUTPUT = PACKAGE_OUTPUT


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


def linan_shiziyan():
    image, drawing = gradient((214, 223, 207), (151, 181, 155))
    drawing.ellipse((514, 127, 622, 235), fill='#e8dcb0')
    drawing.polygon([(235, 355), (306, 313), (373, 330), (443, 288), (509, 319), (588, 299), (653, 343), (720, 321), (720, 650), (235, 650)], fill='#b6c5ab')
    drawing.polygon([(229, 435), (307, 370), (366, 389), (435, 352), (502, 403), (573, 367), (637, 410), (720, 377), (720, 724), (229, 724)], fill='#9db697')
    drawing.polygon([(268, 529), (332, 454), (398, 489), (457, 450), (516, 511), (566, 461), (643, 499), (720, 439), (720, 816), (268, 816)], fill='#809f81')
    drawing.polygon([(276, 628), (342, 529), (409, 556), (481, 611), (538, 597), (612, 548), (666, 575), (720, 528), (720, 960), (276, 960)], fill='#658b6d')
    drawing.polygon([(455, 576), (490, 585), (524, 624), (551, 642), (580, 700), (612, 722), (644, 810), (620, 804), (593, 736), (562, 716), (539, 657), (510, 641), (478, 599)], fill='#a8b294')
    drawing.line([(464, 584), (485, 596), (519, 638), (547, 655), (574, 712), (601, 731), (634, 807)], fill='#cecab0', width=4)
    for column, row, size in [(481, 594, 12), (503, 614, 15), (529, 627, 13), (541, 653, 17), (560, 672, 13), (579, 687, 18), (587, 715, 15), (607, 735, 20), (633, 753, 17)]:
        drawing.polygon([(column, row), (column + size, row + 3), (column + size, row + size), (column, row + size - 3)], fill='#e4dcc2')
        drawing.polygon([(column + size, row + 3), (column + size + 7, row - 1), (column + size + 7, row + size - 4), (column + size, row + size)], fill='#b7b49a')
        drawing.polygon([(column - 3, row), (column + 8, row - 7), (column + size + 10, row - 1), (column + size, row + 4)], fill='#888a75')
        drawing.rectangle((column + 4, row + 5, column + 7, row + 9), fill='#859681')
    drawing.polygon([(224, 731), (284, 633), (349, 647), (393, 720), (449, 709), (504, 795), (557, 790), (621, 855), (671, 813), (720, 829), (720, 960), (224, 960)], fill='#466f56')
    drawing.polygon([(251, 883), (291, 807), (342, 826), (388, 787), (440, 869), (501, 847), (546, 904), (613, 883), (657, 928), (720, 912), (720, 960), (251, 960)], fill='#385e4c')
    random = Random(1018)
    for index in range(32):
        column = random.randrange(281, 716)
        row = random.randrange(700, 966)
        height = random.randrange(28, 68)
        color = random.choice(['#56785a', '#678765', '#73906a'])
        drawing.line((column, row - height, column + 2, row + 10), fill=color, width=2)
        for offset in [-18, -4, 10]:
            leaf_row = row - height + offset + 22
            drawing.line([(column - 14, leaf_row - 7), (column, leaf_row), (column + 14, leaf_row - 9)], fill=color, width=2)
    drawing.polygon([(0, 0), (257, 0), (274, 102), (251, 195), (278, 296), (260, 399), (284, 502), (268, 624), (288, 740), (267, 844), (290, 960), (0, 960)], fill='#b6a17e')
    drawing.polygon([(0, 0), (89, 0), (128, 125), (103, 224), (135, 361), (108, 468), (151, 581), (132, 723), (162, 839), (133, 960), (0, 960)], fill='#918c70')
    drawing.polygon([(107, 0), (203, 0), (226, 109), (193, 200), (225, 278), (199, 390), (232, 463), (211, 581), (242, 682), (218, 809), (249, 960), (173, 960), (172, 793), (161, 682), (186, 576), (161, 454), (183, 338), (153, 217)], fill='#c5b18a')
    drawing.polygon([(203, 0), (257, 0), (274, 102), (251, 195), (278, 296), (240, 329), (225, 278), (237, 158)], fill='#a29271')
    drawing.polygon([(225, 366), (260, 399), (284, 502), (254, 560), (232, 463)], fill='#d1bb91')
    drawing.polygon([(211, 581), (268, 624), (288, 740), (252, 776), (242, 682)], fill='#a39472')
    drawing.polygon([(218, 809), (267, 844), (290, 960), (249, 960)], fill='#d0bb92')
    for points in [([(39, 0), (60, 104), (49, 201), (83, 298), (70, 397)], '#b1a482'), ([(142, 0), (163, 113), (146, 212), (177, 337), (159, 432)], '#e0cd9f'), ([(212, 18), (232, 123), (218, 189)], '#d3bf92'), ([(110, 372), (99, 474), (127, 555), (116, 671)], '#c0b08a'), ([(205, 453), (193, 548), (217, 647), (206, 738)], '#e0cd9f'), ([(83, 706), (103, 796), (91, 900), (111, 960)], '#b6a480'), ([(252, 661), (267, 735), (248, 810), (270, 911)], '#deca9d')]:
        drawing.line(points[0], fill=points[1], width=4)
    for column, row in [(53, 175), (157, 262), (216, 347), (139, 510), (230, 584), (86, 632), (165, 759), (202, 878)]:
        drawing.polygon([(column - 12, row), (column + 10, row - 6), (column + 18, row + 8), (column - 5, row + 13)], fill='#9c9273')
        drawing.line((column - 9, row, column + 9, row - 5), fill='#d0bc93', width=3)
    drawing.line([(349, -10), (342, 174), (332, 354), (334, 457), (348, 511)], fill='#4b6c52', width=3)
    drawing.line([(319, 470), (293, 462), (271, 431)], fill='#d2ae87', width=10)
    drawing.polygon([(313, 457), (331, 464), (316, 481), (301, 469)], fill='#eae3cc')
    drawing.polygon([(321, 464), (337, 469), (361, 508), (350, 527), (323, 515), (310, 486)], fill='#efe7d1')
    drawing.polygon([(337, 469), (347, 474), (367, 507), (356, 513)], fill='#ddd9bf')
    drawing.ellipse((301, 436, 327, 463), fill='#d2ae87')
    drawing.polygon([(300, 444), (302, 431), (315, 427), (329, 436), (331, 446), (313, 447)], fill='#859c97')
    drawing.polygon([(299, 441), (313, 442), (307, 448), (292, 446)], fill='#627e77')
    drawing.line([(333, 487), (310, 511), (274, 529)], fill='#dab591', width=10)
    drawing.polygon([(325, 481), (338, 486), (327, 502), (315, 496)], fill='#f2ead4')
    drawing.ellipse((267, 524, 279, 534), fill='#dab591')
    drawing.line([(323, 513), (354, 526)], fill='#40564c', width=7)
    drawing.line([(325, 518), (332, 536), (347, 533), (352, 523)], fill='#788375', width=3)
    drawing.polygon([(327, 521), (343, 529), (327, 558), (301, 583), (291, 575), (312, 547)], fill='#36514a')
    drawing.polygon([(342, 526), (356, 523), (372, 556), (367, 589), (353, 587), (355, 560)], fill='#2e4943')
    drawing.line([(360, 587), (351, 617)], fill='#2e4943', width=13)
    drawing.polygon([(286, 572), (301, 581), (294, 590), (277, 590), (276, 582)], fill='#d4bd86')
    drawing.line([(278, 590), (295, 590), (301, 583)], fill='#314b43', width=5)
    drawing.polygon([(345, 610), (357, 613), (359, 624), (343, 635), (334, 632)], fill='#d6b67d')
    drawing.line([(334, 633), (344, 638), (360, 626)], fill='#314b43', width=5)
    drawing.polygon([(359, 511), (375, 507), (386, 518), (382, 537), (366, 539), (357, 527)], fill='#b96f50')
    drawing.line([(359, 514), (371, 518), (383, 514)], fill='#d0946b', width=3)
    finish(image, 'linan-shiziyan')


def leafy_branch(drawing, start, end, spread, color, seed):
    drawing.line([start, end], fill=color, width=3)
    random = Random(seed)
    for index in range(1, 10):
        ratio = index / 10
        column = start[0] + (end[0] - start[0]) * ratio
        row = start[1] + (end[1] - start[1]) * ratio
        for direction in [-1, 1]:
            length = spread * random.uniform(0.55, 1)
            leaf_column = column + direction * length
            leaf_row = row - length * 0.65
            drawing.line((column, row, leaf_column, leaf_row), fill=color, width=2)
            drawing.polygon([
                (leaf_column - direction * 14, leaf_row + 3),
                (leaf_column - direction * 9, leaf_row - 9),
                (leaf_column + direction * 13, leaf_row - 17),
                (leaf_column + direction * 8, leaf_row),
            ], fill=color)


def dongyang_meigu():
    image, drawing = gradient((202, 222, 212), (225, 226, 193))
    drawing.polygon([(130, 847), (224, 784), (300, 805), (364, 773), (449, 801), (530, 757), (615, 796), (720, 770), (720, 960), (130, 960)], fill='#a1b497')
    drawing.polygon([(105, 904), (192, 833), (261, 867), (341, 823), (400, 857), (478, 808), (561, 851), (640, 814), (720, 849), (720, 960), (105, 960)], fill='#779777')
    drawing.polygon([(107, 960), (155, 905), (231, 914), (277, 864), (329, 896), (382, 859), (451, 912), (502, 870), (561, 911), (636, 878), (720, 914), (720, 960)], fill='#4f785b')
    for column, row, height in [(218, 960, 91), (256, 938, 113), (299, 975, 109), (346, 937, 98), (390, 977, 118), (429, 949, 130), (477, 983, 105)]:
        drawing.line((column, row - height, column, row), fill='#5c7655', width=3)
        drawing.polygon([(column, row - height), (column - 27, row - height + 36), (column - 13, row - height + 34), (column - 36, row - 20), (column + 29, row - 20), (column + 15, row - height + 34), (column + 24, row - height + 38)], fill='#6c8a61')
    drawing.polygon([(0, 0), (183, 0), (176, 79), (159, 142), (121, 184), (102, 253), (137, 311), (204, 357), (238, 425), (279, 491), (275, 548), (249, 584), (261, 653), (235, 728), (207, 791), (190, 873), (173, 960), (0, 960)], fill='#6c7161')
    drawing.polygon([(0, 0), (104, 0), (92, 123), (46, 213), (68, 312), (123, 354), (169, 431), (187, 511), (156, 583), (165, 688), (108, 807), (115, 960), (0, 960)], fill='#4b5b50')
    drawing.polygon([(104, 0), (183, 0), (176, 79), (159, 142), (121, 184), (102, 253), (70, 215), (109, 119)], fill='#9b997b')
    drawing.polygon([(102, 253), (137, 311), (204, 357), (238, 425), (279, 491), (245, 476), (191, 411), (157, 381), (99, 350), (80, 301)], fill='#8c8d70')
    drawing.polygon([(174, 571), (249, 584), (261, 653), (235, 728), (207, 791), (177, 881), (173, 960), (112, 960), (127, 842), (168, 725), (150, 667)], fill='#9c9170')
    drawing.polygon([(0, 815), (70, 757), (126, 773), (140, 844), (112, 960), (0, 960)], fill='#b09a72')
    drawing.polygon([(301, 0), (720, 0), (720, 960), (468, 960), (447, 876), (426, 813), (396, 762), (389, 708), (411, 657), (420, 604), (395, 550), (374, 483), (349, 409), (324, 333), (294, 259), (285, 184), (292, 97)], fill='#a68f6b')
    drawing.polygon([(301, 0), (425, 0), (408, 92), (394, 185), (411, 273), (445, 333), (460, 439), (510, 508), (494, 605), (534, 711), (530, 823), (574, 960), (468, 960), (447, 876), (426, 813), (396, 762), (389, 708), (411, 657), (420, 604), (395, 550), (374, 483), (349, 409), (324, 333), (294, 259), (285, 184), (292, 97)], fill='#c0a57b')
    drawing.polygon([(425, 0), (546, 0), (501, 123), (514, 218), (487, 310), (523, 402), (510, 508), (460, 439), (445, 333), (411, 273), (394, 185)], fill='#8e8569')
    drawing.polygon([(546, 0), (720, 0), (720, 960), (627, 960), (594, 852), (611, 749), (575, 649), (594, 539), (552, 445), (575, 336), (540, 211)], fill='#5b6455')
    drawing.polygon([(499, 591), (548, 557), (575, 649), (611, 749), (594, 852), (627, 960), (574, 960), (530, 823), (534, 711)], fill='#8c8263')
    for points in [([(340, 34), (319, 130), (332, 223), (366, 311), (380, 405)], '#d1b88a'), ([(433, 359), (449, 454), (479, 513), (465, 584)], '#d2b888'), ([(440, 711), (445, 796), (478, 872), (486, 960)], '#dac092'), ([(552, 52), (526, 147), (545, 233), (531, 306)], '#a69a75'), ([(69, 396), (126, 462), (139, 526), (117, 591)], '#8c9477'), ([(174, 682), (198, 716), (175, 799), (152, 847)], '#c0ab7e'), ([(22, 849), (56, 811), (82, 821), (92, 904)], '#d2b689')]:
        drawing.line(points[0], fill=points[1], width=4)
    for column, row in [(357, 203), (398, 347), (431, 482), (463, 841), (195, 454), (203, 630), (94, 902)]:
        drawing.polygon([(column - 17, row + 3), (column + 5, row - 5), (column + 24, row + 3), (column + 10, row + 12)], fill='#8d8263')
        drawing.line((column - 13, row + 1, column + 5, row - 5), fill='#d0b789', width=2)
    leafy_branch(drawing, (6, 340), (113, 218), 29, '#829667', 31)
    leafy_branch(drawing, (0, 493), (79, 382), 25, '#a0ad73', 32)
    leafy_branch(drawing, (86, 936), (185, 842), 22, '#71875d', 33)
    drawing.line([(407, 207), (377, 405), (350, 597), (357, 656)], fill='#728b79', width=2)
    drawing.line([(407, 207), (327, 584), (274, 960)], fill='#9fac8e', width=2)
    drawing.line([(347, 616), (370, 597), (388, 574)], fill='#bbaa84', width=8)
    drawing.ellipse((326, 591, 348, 613), fill='#bba782')
    drawing.pieslice((324, 586, 350, 611), 180, 360, fill='#536c61')
    drawing.polygon([(333, 610), (348, 611), (363, 644), (354, 660), (332, 650), (324, 627)], fill='#53675b')
    drawing.line([(329, 620), (322, 643), (322, 667)], fill='#b4a482', width=7)
    drawing.line((334, 650, 359, 660), fill='#d2bd8c', width=5)
    drawing.line([(353, 655), (375, 629), (392, 632)], fill='#374f48', width=12)
    drawing.line([(350, 661), (376, 680), (401, 691)], fill='#3c554b', width=12)
    drawing.line((392, 630, 405, 623), fill='#d3bc88', width=6)
    drawing.line((401, 691, 412, 683), fill='#d3bc88', width=6)
    drawing.polygon([(330, 645), (341, 644), (345, 660), (333, 665), (327, 657)], fill='#b67d58')
    finish(image, 'dongyang-meigu')


def xinchang_shigoudong():
    image, drawing = gradient((187, 209, 197), (222, 216, 184))
    drawing.polygon([(0, 205), (105, 151), (206, 180), (300, 127), (420, 174), (524, 122), (628, 169), (720, 137), (720, 960), (0, 960)], fill='#78917a')
    drawing.polygon([(0, 177), (78, 159), (159, 180), (242, 223), (295, 298), (308, 417), (283, 548), (274, 680), (204, 782), (116, 817), (0, 774)], fill='#8e8b7c')
    drawing.polygon([(0, 200), (86, 174), (166, 195), (233, 246), (248, 326), (192, 378), (99, 392), (0, 368)], fill='#c6bda5')
    drawing.polygon([(0, 377), (99, 392), (192, 378), (248, 326), (290, 401), (268, 500), (215, 554), (119, 540), (34, 570), (0, 551)], fill='#767c70')
    drawing.polygon([(0, 564), (120, 541), (215, 554), (270, 507), (274, 680), (203, 781), (107, 810), (0, 757)], fill='#aaa599')
    drawing.line([(0, 386), (103, 398), (191, 385), (241, 337)], fill='#5c675d', width=6)
    for points in [[(44, 576), (58, 689), (49, 748)], [(116, 565), (123, 708), (110, 790)], [(204, 571), (196, 692), (167, 761)], [(242, 429), (236, 490), (220, 535)]]:
        drawing.line(points, fill='#d0c5b1', width=5)
    drawing.polygon([(473, 253), (531, 229), (596, 240), (659, 294), (720, 334), (720, 757), (660, 709), (616, 609), (558, 540), (519, 438)], fill='#7b8673')
    drawing.polygon([(720, 586), (720, 960), (267, 960), (336, 862), (435, 837), (512, 762), (593, 733), (645, 648)], fill='#607d65')
    drawing.polygon([(362, 960), (407, 875), (475, 845), (513, 782), (565, 753), (611, 684), (643, 667), (614, 726), (585, 765), (533, 800), (493, 867), (437, 895), (408, 960)], fill='#dfd3b4')
    for column, row in [(414, 886), (432, 873), (450, 865), (470, 854), (489, 840), (505, 820), (518, 800), (535, 790), (551, 779), (568, 768), (585, 746), (599, 724), (612, 705)]:
        drawing.line((column - 8, row + 4, column + 10, row - 3), fill='#948f78', width=3)
    leafy_branch(drawing, (708, 558), (594, 449), 30, '#8c9e71', 53)
    leafy_branch(drawing, (22, 948), (147, 833), 32, '#729065', 54)
    finish(image, 'xinchang-shigoudong')


def xinchang_tiandiyan():
    image, drawing = gradient((123, 167, 177), (223, 224, 192))
    drawing.polygon([(0, 208), (89, 175), (164, 199), (234, 239), (321, 274), (407, 319), (496, 381), (599, 437), (720, 486), (720, 960), (0, 960)], fill='#526c58')
    drawing.polygon([(0, 279), (86, 260), (157, 279), (244, 330), (334, 357), (427, 423), (520, 471), (611, 519), (720, 561), (720, 794), (622, 777), (511, 723), (397, 708), (305, 657), (204, 654), (107, 615), (0, 618)], fill='#8b8b83')
    drawing.polygon([(0, 309), (90, 293), (158, 314), (236, 352), (242, 602), (175, 586), (123, 604), (62, 572), (0, 584)], fill='#b2aea0')
    drawing.polygon([(245, 352), (327, 373), (414, 429), (411, 671), (346, 640), (291, 648), (239, 601)], fill='#9f9d92')
    drawing.polygon([(414, 429), (511, 480), (609, 530), (720, 572), (720, 770), (622, 750), (520, 702), (412, 670)], fill='#aaa79a')
    for points in [[(32, 312), (40, 429), (29, 575)], [(105, 298), (104, 440), (119, 591)], [(177, 320), (181, 448), (168, 588)], [(269, 363), (277, 483), (269, 620)], [(337, 392), (347, 529), (339, 645)], [(456, 453), (470, 576), (461, 688)], [(554, 507), (566, 631), (573, 727)], [(652, 551), (653, 654), (665, 749)]]:
        drawing.line(points, fill='#777c73', width=5)
    drawing.line([(0, 473), (109, 485), (215, 499), (327, 523), (450, 565), (574, 617), (720, 671)], fill='#6f766b', width=5)
    drawing.polygon([(0, 700), (110, 641), (193, 688), (272, 632), (352, 686), (446, 635), (546, 700), (635, 656), (720, 699), (720, 960), (0, 960)], fill='#829a6e')
    drawing.polygon([(0, 803), (103, 752), (195, 796), (272, 729), (355, 782), (450, 733), (552, 783), (637, 736), (720, 782), (720, 960), (0, 960)], fill='#577a5c')
    drawing.polygon([(270, 960), (326, 840), (371, 814), (388, 770), (402, 770), (390, 831), (359, 863), (330, 960)], fill='#b6a788')
    leafy_branch(drawing, (16, 919), (142, 806), 33, '#9aaa72', 63)
    leafy_branch(drawing, (706, 941), (574, 817), 33, '#97a96d', 64)
    drawing.ellipse((349, 801, 367, 819), fill='#d2b392')
    drawing.polygon([(345, 817), (365, 816), (373, 850), (348, 853), (341, 837)], fill='#4a6572')
    drawing.line([(352, 851), (348, 875), (341, 886)], fill='#4c5551', width=7)
    drawing.line([(365, 851), (372, 870), (381, 880)], fill='#4c5551', width=7)
    finish(image, 'xinchang-tiandiyan')


def xinchang_baizhangyan():
    image, drawing = gradient((228, 230, 209), (179, 195, 167))
    drawing.polygon([(0, 199), (86, 154), (154, 172), (211, 135), (279, 179), (349, 142), (417, 165), (485, 112), (575, 143), (649, 117), (720, 162), (720, 394), (0, 394)], fill='#a6b28e')
    drawing.polygon([(0, 213), (74, 182), (135, 189), (184, 229), (224, 278), (259, 356), (296, 479), (325, 598), (349, 777), (377, 960), (0, 960)], fill='#8a8b79')
    drawing.polygon([(0, 234), (68, 211), (118, 224), (159, 275), (196, 362), (219, 482), (240, 632), (262, 786), (273, 960), (0, 960)], fill='#aaa58d')
    drawing.polygon([(0, 354), (55, 318), (110, 330), (147, 425), (151, 552), (186, 653), (178, 770), (204, 960), (0, 960)], fill='#c0b69b')
    drawing.polygon([(203, 281), (251, 257), (296, 262), (324, 301), (344, 386), (355, 526), (370, 703), (377, 960), (349, 777), (325, 598), (296, 479), (259, 356)], fill='#777d6a')
    drawing.polygon([(251, 257), (298, 235), (329, 252), (355, 298), (367, 416), (370, 567), (397, 729), (407, 960), (377, 960), (370, 703), (355, 526), (344, 386), (324, 301), (296, 262)], fill='#a59f83')
    drawing.polygon([(329, 252), (349, 277), (369, 391), (380, 568), (401, 718), (421, 960), (377, 960), (368, 771), (353, 610), (345, 468), (336, 345)], fill='#3d5045')
    drawing.polygon([(384, 179), (427, 137), (468, 129), (522, 162), (587, 146), (650, 174), (720, 165), (720, 960), (421, 960), (400, 768), (389, 621), (365, 455), (365, 316)], fill='#b6a78d')
    drawing.polygon([(428, 164), (471, 151), (521, 185), (548, 265), (536, 352), (564, 448), (563, 546), (600, 659), (580, 777), (621, 960), (448, 960), (421, 765), (415, 617), (392, 453), (397, 307)], fill='#d0baa0')
    drawing.polygon([(384, 179), (427, 137), (428, 213), (415, 312), (431, 408), (416, 512), (444, 628), (433, 742), (471, 960), (421, 960), (400, 768), (389, 621), (365, 455), (365, 316)], fill='#a4987f')
    drawing.polygon([(571, 166), (632, 178), (674, 162), (720, 171), (720, 960), (661, 960), (634, 808), (648, 689), (614, 573), (631, 457), (594, 353), (603, 251)], fill='#baaa91')
    for row, offset in [(249, 11), (292, -6), (337, 5), (387, -9), (436, 3), (485, -4), (536, 10), (584, -2), (635, 8), (687, -6), (739, 4), (793, -8), (845, 5), (900, 0)]:
        left_edge = min(295, 128 + round(row * 0.18))
        drawing.line([(0, row + 16), (55, row + 6), (110, row + offset), (160, row + 7), (left_edge, row - 4)], fill='#95957f', width=3)
        drawing.line([(0, row + 22), (57, row + 11), (112, row + offset + 6), (159, row + 13), (left_edge - 5, row + 2)], fill='#cbbfa1', width=2)
        right_edge = 400 + round(row * 0.035)
        drawing.line([(right_edge, row + 5), (465, row - 7), (520, row - 13), (573, row - 3), (634, row - 9), (720, row - 4)], fill='#a3977f', width=3)
        drawing.line([(right_edge + 5, row + 12), (467, row), (523, row - 5), (575, row + 4), (638, row - 2), (720, row + 3)], fill='#ddc9ab', width=3)
    drawing.line([(310, 336), (319, 409), (327, 473)], fill='#c4b799', width=3)
    drawing.line([(456, 194), (443, 272), (455, 347)], fill='#e1cdb0', width=4)
    drawing.line([(596, 419), (581, 484), (604, 559)], fill='#e0caab', width=3)
    drawing.line([(91, 531), (112, 597), (104, 677)], fill='#777e6c', width=3)
    drawing.polygon([(0, 0), (321, 0), (277, 38), (238, 25), (218, 70), (173, 66), (151, 109), (105, 89), (81, 141), (28, 127), (0, 164)], fill='#557252')
    drawing.polygon([(430, 0), (720, 0), (720, 116), (681, 99), (655, 126), (617, 94), (583, 103), (565, 61), (516, 73), (496, 35), (456, 41)], fill='#5d7856')
    leafy_branch(drawing, (0, 70), (230, 178), 48, '#7d9569', 41)
    leafy_branch(drawing, (0, 179), (158, 354), 46, '#67855a', 42)
    leafy_branch(drawing, (0, 333), (80, 507), 35, '#8c9f6b', 43)
    leafy_branch(drawing, (720, 19), (576, 164), 32, '#84996b', 44)
    drawing.line([(352, 276), (350, 465), (347, 514), (407, 779)], fill='#ac897e', width=2)
    drawing.line([(343, 489), (323, 481), (309, 474)], fill='#bfab89', width=5)
    drawing.ellipse((337, 474, 353, 490), fill='#a68d71')
    drawing.pieslice((335, 470, 354, 487), 180, 360, fill='#48675a')
    drawing.polygon([(339, 491), (352, 489), (359, 515), (347, 523), (334, 511)], fill='#4b6555')
    drawing.line([(354, 496), (369, 483), (374, 469)], fill='#c4ac86', width=5)
    drawing.line([(345, 520), (329, 537), (333, 555)], fill='#c2b267', width=8)
    drawing.line([(350, 520), (361, 541), (359, 561)], fill='#b5a45a', width=8)
    drawing.line((328, 555, 339, 557), fill='#3e5546', width=5)
    drawing.line((356, 561, 367, 561), fill='#3e5546', width=5)
    drawing.line((337, 516, 355, 520), fill='#d3c28c', width=3)
    drawing.polygon([(0, 902), (68, 870), (144, 889), (229, 857), (310, 880), (384, 850), (461, 887), (546, 870), (617, 895), (720, 861), (720, 960), (0, 960)], fill='#758365')
    drawing.polygon([(0, 944), (103, 909), (183, 934), (265, 901), (344, 918), (413, 895), (494, 930), (585, 902), (660, 927), (720, 916), (720, 960), (0, 960)], fill='#4f6d50')
    drawing.line([(394, 784), (383, 830), (371, 881)], fill='#8c8e7b', width=17)
    drawing.line([(408, 787), (422, 829), (429, 883)], fill='#a5a38b', width=17)
    drawing.polygon([(384, 735), (407, 730), (423, 769), (411, 799), (382, 792), (373, 770)], fill='#e7dfc6')
    drawing.ellipse((382, 711, 405, 737), fill='#c7a886')
    drawing.ellipse((379, 705, 406, 729), fill='#b96f58')
    drawing.line((382, 716, 403, 712), fill='#d69573', width=3)
    drawing.line([(379, 747), (369, 771), (385, 790)], fill='#c4a584', width=7)
    drawing.line([(414, 746), (429, 766), (452, 776)], fill='#c4a584', width=7)
    drawing.line((381, 787, 413, 795), fill='#3b5447', width=6)
    drawing.line([(385, 791), (389, 806), (403, 811), (414, 797)], fill='#c0ae7c', width=3)
    drawing.polygon([(375, 789), (385, 788), (386, 809), (375, 815), (370, 805)], fill='#b59d6a')
    drawing.line([(388, 793), (408, 779), (452, 776), (466, 887)], fill='#9a7e78', width=2)
    drawing.line((363, 883, 381, 884), fill='#3e5749', width=7)
    drawing.line((422, 884, 440, 884), fill='#3e5749', width=7)
    leafy_branch(drawing, (4, 960), (86, 841), 30, '#879768', 45)
    leafy_branch(drawing, (155, 960), (215, 870), 24, '#a2a96f', 46)
    finish(image, 'xinchang-baizhangyan')


def quzhou_liangtoudong():
    image, drawing = gradient((183, 212, 210), (219, 225, 193))
    drawing.polygon([(105, 648), (181, 576), (246, 588), (313, 536), (381, 548), (434, 519), (493, 557), (552, 543), (629, 589), (720, 567), (720, 960), (105, 960)], fill='#9aaf92')
    drawing.polygon([(107, 720), (176, 637), (240, 656), (308, 597), (366, 620), (424, 582), (482, 628), (552, 605), (614, 659), (720, 628), (720, 960), (107, 960)], fill='#779778')
    drawing.polygon([(105, 783), (179, 710), (236, 724), (300, 659), (357, 684), (423, 651), (478, 702), (551, 670), (631, 730), (720, 689), (720, 960), (105, 960)], fill='#547e60')
    drawing.polygon([(67, 843), (147, 775), (212, 788), (272, 731), (345, 753), (411, 715), (475, 768), (547, 729), (619, 779), (720, 744), (720, 960), (67, 960)], fill='#416c53')
    drawing.polygon([(0, 0), (720, 0), (720, 960), (618, 960), (612, 838), (594, 712), (595, 600), (577, 502), (555, 428), (513, 351), (475, 302), (436, 283), (393, 288), (353, 311), (313, 327), (270, 346), (231, 379), (209, 427), (190, 493), (174, 587), (174, 672), (154, 755), (162, 960), (0, 960)], fill='#777e6b')
    drawing.polygon([(0, 0), (431, 0), (386, 85), (329, 123), (276, 190), (225, 218), (180, 278), (124, 304), (82, 390), (63, 503), (0, 542)], fill='#9b9c80')
    drawing.polygon([(0, 0), (208, 0), (162, 101), (114, 123), (74, 202), (0, 223)], fill='#b7af8e')
    drawing.polygon([(431, 0), (720, 0), (720, 406), (668, 370), (627, 291), (557, 247), (522, 170), (454, 133), (392, 169), (337, 222), (280, 246), (231, 294), (193, 348), (151, 394), (122, 490), (117, 606), (89, 702), (79, 960), (0, 960), (0, 542), (63, 503), (82, 390), (124, 304), (180, 278), (225, 218), (276, 190), (329, 123), (386, 85)], fill='#5e6b5b')
    drawing.polygon([(716, 0), (720, 0), (720, 960), (618, 960), (612, 838), (594, 712), (595, 600), (577, 502), (555, 428), (513, 351), (475, 302), (436, 283), (393, 288), (353, 311), (313, 327), (270, 346), (231, 379), (209, 427), (190, 493), (174, 587), (174, 672), (154, 755), (162, 960), (79, 960), (89, 702), (117, 606), (122, 490), (151, 394), (193, 348), (231, 294), (280, 246), (337, 222), (392, 169), (454, 133), (522, 170), (557, 247), (627, 291), (668, 370), (720, 406)], fill='#8e927b')
    drawing.polygon([(0, 217), (65, 179), (90, 241), (71, 319), (46, 361), (33, 461), (54, 545), (31, 637), (41, 744), (17, 863), (0, 874)], fill='#c2b898')
    drawing.polygon([(129, 383), (172, 347), (201, 345), (175, 416), (160, 512), (161, 602), (140, 691), (144, 804), (121, 874), (93, 960), (79, 960), (89, 702), (117, 606), (122, 490)], fill='#b8b193')
    drawing.polygon([(513, 351), (563, 356), (603, 423), (622, 508), (657, 576), (647, 663), (671, 735), (655, 835), (692, 960), (618, 960), (612, 838), (594, 712), (595, 600), (577, 502), (555, 428)], fill='#a5a58a')
    drawing.polygon([(625, 290), (677, 320), (720, 399), (720, 960), (692, 960), (655, 835), (671, 735), (647, 663), (657, 576), (622, 508), (603, 423), (563, 356)], fill='#737f6d')
    for points in [([(9, 130), (75, 109), (125, 60), (158, 0)], '#d0c29d'), ([(171, 11), (153, 96), (104, 145), (97, 206)], '#737e67'), ([(285, 0), (252, 73), (207, 115), (194, 169)], '#b3af8c'), ([(368, 12), (334, 85), (275, 132), (244, 180)], '#9a9d80'), ([(454, 42), (492, 101), (538, 126), (558, 204)], '#acaa88'), ([(607, 31), (586, 99), (632, 166), (646, 238)], '#a6a88a'), ([(29, 354), (17, 437), (36, 521), (17, 596)], '#e0ceaa'), ([(98, 403), (78, 472), (91, 547), (69, 616)], '#404f45'), ([(139, 515), (129, 598), (108, 673), (115, 752)], '#dbccaa'), ([(587, 401), (615, 471), (620, 543), (650, 610)], '#c2bda0'), ([(626, 634), (612, 706), (638, 785), (630, 855)], '#d0c7a5'), ([(688, 450), (670, 524), (691, 587)], '#526550')]:
        drawing.line(points[0], fill=points[1], width=4)
    for column, row, size in [(115, 117, 26), (246, 76, 31), (303, 181, 20), (457, 99, 24), (558, 62, 30), (622, 202, 23), (51, 278, 18), (113, 344, 22), (83, 640, 27), (144, 720, 18), (629, 506, 23), (682, 711, 28), (648, 892, 24)]:
        drawing.polygon([(column, row), (column + size, row - 12), (column + size + 15, row + 9), (column + 5, row + 20)], fill='#697662')
        drawing.line((column, row, column + size, row - 12), fill='#b5ae8d', width=3)
    leafy_branch(drawing, (153, 701), (203, 617), 22, '#90a16a', 51)
    leafy_branch(drawing, (595, 748), (553, 638), 29, '#668759', 52)
    leafy_branch(drawing, (172, 457), (219, 402), 15, '#9dac75', 53)
    drawing.line([(218, 294), (200, 462), (194, 653)], fill='#b0b99c', width=1)
    drawing.polygon([(169, 741), (720, 736), (720, 768), (169, 777)], fill='#8e6951')
    drawing.polygon([(169, 765), (720, 757), (720, 774), (169, 784)], fill='#674f41')
    drawing.line((166, 705, 720, 700), fill='#88684e', width=6)
    drawing.line((167, 747, 720, 740), fill='#b7986e', width=4)
    for column in range(175, 721, 28):
        drawing.line((column, 705, column, 744), fill='#987658', width=3)
    for column in range(182, 720, 104):
        drawing.line([(column, 778), (column + 51, 820), (column + 103, 776)], fill='#826147', width=8)
        drawing.line((column + 51, 820, column + 51, 847), fill='#6d5844', width=6)
    drawing.polygon([(7, 960), (82, 960), (194, 779), (163, 774)], fill='#aa8660')
    for row in range(796, 960, 15):
        ratio = (row - 779) / (960 - 779)
        left_edge = round(163 + (7 - 163) * ratio)
        right_edge = round(194 + (82 - 194) * ratio)
        drawing.line((left_edge, row, right_edge, row), fill='#d0b48a', width=3)
    drawing.line([(9, 909), (164, 727), (172, 706)], fill='#987255', width=6)
    drawing.line([(85, 921), (198, 728), (198, 705)], fill='#987255', width=6)
    for row in range(752, 918, 26):
        ratio = (row - 727) / (921 - 727)
        column = round(198 + (85 - 198) * ratio)
        drawing.line((column, row, column, row + 43), fill='#9e7b58', width=3)
    drawing.polygon([(240, 960), (268, 906), (320, 881), (355, 909), (348, 960)], fill='#b4ab88')
    drawing.polygon([(268, 906), (320, 881), (309, 930), (240, 960)], fill='#d1c19a')
    drawing.polygon([(400, 960), (422, 884), (469, 854), (507, 892), (523, 960)], fill='#7d896e')
    drawing.polygon([(422, 884), (469, 854), (469, 917), (400, 960)], fill='#a2a58a')
    drawing.polygon([(553, 960), (564, 898), (614, 876), (671, 920), (677, 960)], fill='#a39978')
    leafy_branch(drawing, (365, 960), (385, 843), 33, '#839567', 54)
    leafy_branch(drawing, (530, 956), (553, 828), 34, '#6f8c5e', 55)
    drawing.ellipse((149, 735, 160, 747), fill='#d1b18b')
    drawing.pieslice((146, 731, 162, 743), 180, 360, fill='#e4d8b8')
    drawing.polygon([(149, 747), (159, 747), (164, 768), (151, 772), (144, 760)], fill='#57745a')
    drawing.line([(151, 769), (147, 785), (139, 794)], fill='#657f75', width=6)
    drawing.line([(159, 769), (166, 781), (164, 792)], fill='#657f75', width=6)
    finish(image, 'quzhou-liangtoudong')


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


if __name__ == '__main__':
    renderers = {
        'arrival': (arrival, PACKAGE_OUTPUT),
        'river': (river, PACKAGE_OUTPUT),
        'cliff': (cliff, PACKAGE_OUTPUT),
        'sunset': (sunset, PACKAGE_OUTPUT),
        'street': (street, PACKAGE_OUTPUT),
        'return': (returning, PACKAGE_OUTPUT),
        'map-pin': (map_pin, PACKAGE_OUTPUT),
        'linan-shiziyan': (linan_shiziyan, CLOUD_OUTPUT),
        'dongyang-meigu': (dongyang_meigu, CLOUD_OUTPUT),
        'xinchang-baizhangyan': (xinchang_baizhangyan, CLOUD_OUTPUT),
        'xinchang-shigoudong': (xinchang_shigoudong, CLOUD_OUTPUT),
        'xinchang-tiandiyan': (xinchang_tiandiyan, CLOUD_OUTPUT),
        'quzhou-liangtoudong': (quzhou_liangtoudong, CLOUD_OUTPUT),
    }
    parser = argparse.ArgumentParser(description='Generate original illustrated travel covers')
    parser.add_argument('--only', choices=renderers, nargs='+', help='Generate only the selected assets')
    parser.add_argument('--output', type=Path, help='Override the default directory for generated assets')
    arguments = parser.parse_args()
    selected = arguments.only if arguments.only else list(renderers)
    for name in selected:
        render, default_output = renderers[name]
        OUTPUT = (arguments.output or default_output).expanduser().resolve()
        OUTPUT.mkdir(parents=True, exist_ok=True)
        render()
        print(f'Generated {name} in {OUTPUT}')
