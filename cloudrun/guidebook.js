const { createHash } = require('node:crypto');

function normalizeGuidebook(input) {
  if (!input || typeof input !== 'object' || typeof input.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(input.id)) throw new Error('路书 ID 无效');
  for (const [field, limit] of [['title', 100], ['location', 200], ['description', 500]]) {
    if (typeof input[field] !== 'string' || !input[field].trim() || input[field].length > limit) throw new Error('路书信息无效');
  }
  if (!Array.isArray(input.pages) || !input.pages.length || input.pages.length > 100) throw new Error('路书页数无效');
  const sections = input.sections === undefined ? [{ id: 'all', title: '全部', startPage: 1, endPage: input.pages.length }] : input.sections;
  if (!Array.isArray(sections) || !sections.length || sections.length > 100) throw new Error('路书区域无效');
  let nextPage = 1;
  const sectionIds = new Set();
  const normalizedSections = sections.map((section) => {
    if (!section || typeof section.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(section.id) || sectionIds.has(section.id) || typeof section.title !== 'string' || !section.title.trim() || section.title.length > 100 || !Number.isInteger(section.startPage) || !Number.isInteger(section.endPage) || section.startPage < nextPage || section.endPage < section.startPage || section.endPage > input.pages.length) throw new Error('路书区域页码无效或重叠');
    sectionIds.add(section.id);
    nextPage = section.endPage + 1;
    const result = { id: section.id, title: section.title, startPage: section.startPage, endPage: section.endPage };
    if (section.intro !== undefined) {
      if (!Array.isArray(section.intro) || !section.intro.length || section.intro.length > 12 || section.intro.some((item) => !item || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 40 || typeof item.text !== 'string' || !item.text.trim() || item.text.length > 1000)) throw new Error('路书区域介绍无效');
      result.intro = section.intro.map(({ label, text }) => ({ label, text }));
    }
    return result;
  });
  const hash = createHash('sha256');
  const pages = input.pages.map((encoded) => {
    if (typeof encoded !== 'string' || encoded.length > 1400000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) throw new Error('路书图片无效');
    const image = Buffer.from(encoded, 'base64');
    if (image.length < 4 || image[0] !== 0xff || image[1] !== 0xd8 || image[image.length - 2] !== 0xff || image[image.length - 1] !== 0xd9) throw new Error('路书图片必须为 JPEG');
    hash.update(createHash('sha256').update(image).digest());
    return image;
  });
  hash.update(JSON.stringify([input.id, input.title, input.location, input.description, normalizedSections]));
  return { id: input.id, title: input.title, location: input.location, description: input.description, sections: normalizedSections, version: hash.digest('hex'), pages };
}

module.exports = { normalizeGuidebook };
