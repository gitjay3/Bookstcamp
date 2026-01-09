function formatKoreanDateTime(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const weekday = date.toLocaleDateString('ko-KR', {
    weekday: 'short',
  });

  const time = date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${month}. ${day}. (${weekday}) ${time}`;
}

export default formatKoreanDateTime;
