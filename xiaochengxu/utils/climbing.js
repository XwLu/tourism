export const grades = ['5.7', '5.8', '5.9', ...[10, 11, 12, 13, 14].flatMap((level) => ['a', 'b', 'c', 'd'].map((suffix) => `5.${level}${suffix}`))];
export const styles = [{ id: 'toprope', label: '顶绳' }, { id: 'lead', label: '先锋' }];
export const results = [{ id: 'onsight', label: '视攀' }, { id: 'flash', label: '闪攀' }, { id: 'redpoint', label: '红点' }, { id: 'pinkpoint', label: '粉点' }, { id: 'complete', label: '完攀' }, { id: 'incomplete', label: '未完成' }];
export function labelRecord(record) {
  return { ...record, styleLabel: styles.find((item) => item.id === record.style)?.label || record.style, resultLabel: results.find((item) => item.id === record.result)?.label || record.result };
}
export function weeklyClimbingTotals(records, now = new Date()) {
  const valid = records.map((record) => ({ ...record, date: new Date(Number(record.createdAt)) })).filter((record) => Number.isFinite(record.date.getTime()) && record.date <= now && ['lead', 'toprope'].includes(record.style));
  if (!valid.length) return [];
  const calendarDay = (date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const firstDay = Math.min(...valid.map((record) => calendarDay(record.date)));
  const today = calendarDay(now);
  const weeks = Array.from({ length: Math.ceil((today - firstDay) / 7) + 1 }, (_, index) => {
    const endDay = Math.min(firstDay + index * 7, today);
    const date = new Date(endDay * 86400000);
    return { label: `${date.getUTCFullYear()}.${date.getUTCMonth() + 1}.${date.getUTCDate()}`, lead: 0, toprope: 0, total: 0 };
  });
  for (const record of valid) weeks[Math.ceil((calendarDay(record.date) - firstDay) / 7)][record.style] += 1;
  for (let index = 0; index < weeks.length; index += 1) {
    if (index) { weeks[index].lead += weeks[index - 1].lead; weeks[index].toprope += weeks[index - 1].toprope; }
    weeks[index].total = weeks[index].lead + weeks[index].toprope;
  }
  return weeks;
}
