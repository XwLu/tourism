import argparse
import base64
import io
import json
from pathlib import Path

import pypdfium2
from PIL import Image

parser = argparse.ArgumentParser(description='将多份 PDF 按区域组合成路书')
parser.add_argument('--config', required=True)
parser.add_argument('--source-dir', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
config = json.loads(Path(args.config).read_text(encoding='utf-8'))
pages = []
sections = []
for section in config['sections']:
    document = pypdfium2.PdfDocument(str(Path(args.source_dir) / section['pdf']))
    start = len(pages) + 1
    for parts in section['pages']:
        images = []
        for part in parts:
            number = part['page']
            if not isinstance(number, int) or not 1 <= number <= len(document):
                raise SystemExit(f"PDF 页码无效：{section['pdf']} {number}")
            image = document[number - 1].render(scale=3).to_pil().convert('RGB')
            left, top, right, bottom = part['rect']
            if not 0 <= left < right <= 1 or not 0 <= top < bottom <= 1:
                raise SystemExit('页面片段范围无效')
            images.append(image.crop((round(left * image.width), round(top * image.height), round(right * image.width), round(bottom * image.height))))
        width = max(part.width for part in images)
        image = Image.new('RGB', (width, sum(part.height for part in images) + 16 * (len(images) - 1)), 'white')
        offset = 0
        for part in images:
            image.paste(part, ((width - part.width) // 2, offset))
            offset += part.height + 16
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=87, optimize=True)
        pages.append(base64.b64encode(buffer.getvalue()).decode('ascii'))
    entry = {'id': section['id'], 'title': section['title'], 'startPage': start, 'endPage': len(pages)}
    if section.get('intro'):
        entry['intro'] = section['intro']
    sections.append(entry)
    document.close()
guide = {field: config[field] for field in ('id', 'title', 'location', 'description')}
guide.update({'sections': sections, 'pages': pages})
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(guide, ensure_ascii=False), encoding='utf-8')
print(f'已准备 {len(sections)} 个区域、{len(pages)} 页：{output}')
