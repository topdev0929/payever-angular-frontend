export function dateMask(value: string): string {
  const groups = /(\d{1,2})(\D)?(\d{1,2})?(\D)?(\d{1,4})?/.exec(value)?.slice(1) ?? [];

  return groups.map((group, index) => {
    const isSeparator = index % 2 !== 0;
    const next = groups[index + 1];
    const prev = groups[index - 1];

    if (isSeparator) {
      return prev && (group || next)
        ? prev !== '0'
          ? '.'
          : '1.'
        : undefined;
    }

    if (!next) {
      return group
    }

    if (index === 0 && group) {
      let day = parseInt(group, 10);
      if (day > 31) {
        day = 31;
      }
      return day.toString().padStart(2, '0');
    }
    if (index === 2 && group) {
      let month = parseInt(group, 10);
      if (month > 12) {
        month = 12;
      }
      return month.toString().padStart(2, '0');
    }
  }).map((group, index) => {
    if (index === 4) {
      return Number(group) !== 0 && group;
    }
    if (group === '00') {
      return '0';
    }

    return group;
  }).filter(Boolean).join('');
}
