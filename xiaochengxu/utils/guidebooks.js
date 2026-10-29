import { cloudEnvironmentId, cloudServiceName } from '../config/cloud';
let imageSequence = 0;

async function request(path) {
  if (!wx.cloud || !wx.cloud.callContainer) throw new Error('请升级微信后查看路书');
  let response;
  try {
    response = await wx.cloud.callContainer({
      config: { env: cloudEnvironmentId },
      path,
      header: { 'X-WX-SERVICE': cloudServiceName },
      method: 'GET',
      timeout: 15000,
    });
  } catch (error) {
    throw new Error('暂时连不上路书，请检查网络后重试');
  }
  if (response.statusCode !== 200 || !response.data?.ok) {
    throw new Error(response.data?.message || '路书暂时无法加载，请稍后重试');
  }
  return response.data.data;
}

export async function fetchGuidebooks() {
  const data = await request('/api/guidebooks');
  if (!Array.isArray(data?.guidebooks)) throw new Error('路书列表暂时无法读取');
  return data.guidebooks.filter((guide) => guide && /^[a-z0-9-]{1,64}$/.test(guide.id) && typeof guide.title === 'string' && typeof guide.location === 'string' && typeof guide.description === 'string' && /^[a-f0-9]{64}$/.test(guide.version) && Number.isInteger(guide.pageCount) && guide.pageCount > 0).map((guide) => {
    const sections = guide.sections?.length ? guide.sections : [{ id: 'all', title: '全部', startPage: 1, endPage: guide.pageCount }];
    let lastPage = 0;
    const ids = new Set();
    if (!Array.isArray(sections) || sections.some((section) => {
      if (!section || typeof section.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(section.id) || ids.has(section.id) || typeof section.title !== 'string' || !section.title.trim() || !Number.isInteger(section.startPage) || !Number.isInteger(section.endPage) || section.startPage <= lastPage || section.endPage < section.startPage || section.endPage > guide.pageCount || (section.intro !== undefined && (!Array.isArray(section.intro) || !section.intro.length || section.intro.some((item) => !item || typeof item.label !== 'string' || typeof item.text !== 'string')))) return true;
      ids.add(section.id);
      lastPage = section.endPage;
      return false;
    })) throw new Error('路书区域暂时无法读取');
    return { ...guide, sections };
  });
}

export async function fetchGuidebookPage(guide, page) {
  const data = await request(`/api/guidebooks/${guide.id}/pages/${page}?version=${guide.version}`);
  if (typeof data?.image !== 'string' || !data.image) throw new Error('路书图片暂时无法读取');
  const path = `${wx.env.USER_DATA_PATH}/guide-${Date.now()}-${imageSequence += 1}.jpg`;
  await new Promise((resolve, reject) => wx.getFileSystemManager().writeFile({ filePath: path, data: data.image, encoding: 'base64', success: resolve, fail: reject }));
  return path;
}
