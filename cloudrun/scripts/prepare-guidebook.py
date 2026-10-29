import argparse
import base64
import io
import json
from pathlib import Path

import pypdfium2
from PIL import Image, ImageChops

parser = argparse.ArgumentParser(description='将 PDF 路书转换为待发布的 JPEG 页面')
parser.add_argument('pdf')
parser.add_argument('--id', required=True)
parser.add_argument('--title', required=True)
parser.add_argument('--location', required=True)
parser.add_argument('--description', required=True)
parser.add_argument('--sections', help='区域配置 JSON 文件')
parser.add_argument('--layout', help='页面组合 JSON 文件')
parser.add_argument('--output', required=True)
args = parser.parse_args()

document = pypdfium2.PdfDocument(args.pdf)
if not 1 <= len(document) <= 100:
    raise SystemExit('路书须包含 1 至 100 页')
layout = json.loads(Path(args.layout).read_text(encoding='utf-8')) if args.layout else [[{'page': index + 1}] for index in range(len(document))]
if not isinstance(layout, list) or not 1 <= len(layout) <= 100:
    raise SystemExit('组合后的路书须包含 1 至 100 页')
pages = []
for parts in layout:
    if not isinstance(parts, list) or not parts:
        raise SystemExit('每一页至少需要一个原 PDF 页面或片段')
    images = []
    for part in parts:
        number = part['page']
        if not isinstance(number, int) or not 1 <= number <= len(document):
            raise SystemExit('原 PDF 页码无效')
        image = document[number - 1].render(scale=2.25).to_pil().convert('RGB')
        top, bottom = part.get('vertical', [0, 1])
        if not 0 <= top < bottom <= 1:
            raise SystemExit('页面片段范围无效')
        image = image.crop((0, round(top * image.height), image.width, round(bottom * image.height)))
        if len(parts) > 1 or 'vertical' in part:
            difference = ImageChops.difference(image, Image.new('RGB', image.size, 'white')).convert('L').point(lambda pixel: 255 if pixel > 8 else 0)
            bounds = difference.getbbox()
            if not bounds:
                raise SystemExit('页面片段为空')
            left, upper, right, lower = bounds
            image = image.crop((max(0, left - 20), max(0, upper - 20), min(image.width, right + 20), min(image.height, lower + 20)))
        images.append(image)
    width = max(image.width for image in images)
    image = Image.new('RGB', (width, sum(part.height for part in images) + 24 * (len(images) - 1)), 'white')
    offset = 0
    for part in images:
        image.paste(part, ((width - part.width) // 2, offset))
        offset += part.height + 24
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=83, optimize=True)
    pages.append(base64.b64encode(buffer.getvalue()).decode('ascii'))
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
guide = {'id': args.id, 'title': args.title, 'location': args.location, 'description': args.description, 'pages': pages}
if args.sections:
    guide['sections'] = json.loads(Path(args.sections).read_text(encoding='utf-8'))
output.write_text(json.dumps(guide, ensure_ascii=False), encoding='utf-8')
print(f'已准备 {len(pages)} 页：{output}')
