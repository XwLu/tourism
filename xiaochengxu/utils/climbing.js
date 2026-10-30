export const grades = ['5.7', '5.8', '5.9', ...[10, 11, 12, 13, 14].flatMap((level) => ['a', 'b', 'c', 'd'].map((suffix) => `5.${level}${suffix}`))];
export const styles = [{ id: 'toprope', label: '顶绳' }, { id: 'lead', label: '先锋' }];
export const results = [{ id: 'onsight', label: '视攀' }, { id: 'flash', label: '闪攀' }, { id: 'redpoint', label: '红点' }, { id: 'pinkpoint', label: '粉点' }, { id: 'complete', label: '完攀' }, { id: 'incomplete', label: '未完成' }];
export function labelRecord(record) {
  return { ...record, styleLabel: styles.find((item) => item.id === record.style)?.label || record.style, resultLabel: results.find((item) => item.id === record.result)?.label || record.result };
}
export function weeklyClimbingTotals(records, now = new Date()) {
  const today = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const valid = records.map((record) => {
    const match = typeof record.climbingDate === 'string' && record.climbingDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), date = Number(match[3]);
    const calendarDate = new Date(Date.UTC(year, month - 1, date));
    if (calendarDate.getUTCFullYear() !== year || calendarDate.getUTCMonth() !== month - 1 || calendarDate.getUTCDate() !== date) return null;
    return { ...record, day: Math.floor(calendarDate.getTime() / 86400000) };
  }).filter((record) => record && record.day <= today && ['lead', 'toprope'].includes(record.style));
  if (!valid.length) return [];
  const firstDay = Math.min(...valid.map((record) => record.day));
  const weeks = Array.from({ length: Math.ceil((today - firstDay) / 7) + 1 }, (_, index) => {
    const endDay = Math.min(firstDay + index * 7, today);
    const date = new Date(endDay * 86400000);
    return { label: `${date.getUTCFullYear()}.${date.getUTCMonth() + 1}.${date.getUTCDate()}`, lead: 0, toprope: 0, total: 0 };
  });
  for (const record of valid) weeks[Math.ceil((record.day - firstDay) / 7)][record.style] += 1;
  for (let index = 0; index < weeks.length; index += 1) {
    if (index) { weeks[index].lead += weeks[index - 1].lead; weeks[index].toprope += weeks[index - 1].toprope; }
    weeks[index].total = weeks[index].lead + weeks[index].toprope;
  }
  return weeks;
}
