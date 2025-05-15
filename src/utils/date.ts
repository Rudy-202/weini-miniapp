import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param date 日期对象、时间戳或日期字符串
 * @param format 格式化模式，默认YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 格式化时间（与formatDate相同，保留此函数是为了兼容性）
 * @param date 日期对象、时间戳或日期字符串
 * @param format 格式化模式，默认YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期字符串
 */
export function formatTime(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return formatDate(date, format);
}

/**
 * 获取相对时间描述（如：3分钟前，1小时前，昨天，等）
 * @param date 日期对象、时间戳或日期字符串
 * @returns 相对时间描述
 */
export function getRelativeTime(date: Date | number | string): string {
  if (!date) return '';
  
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');
  
  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays === 2) {
    return '前天';
  } else if (diffDays < 30) {
    return `${diffDays}天前`;
  } else {
    return formatDate(date, 'YYYY-MM-DD');
  }
}

/**
 * 计算剩余时间
 * @param endTime 截止时间
 * @returns 剩余时间对象或null（如果已过期）
 */
export function getRemainingTime(endTime: Date | number | string) {
  const end = dayjs(endTime);
  const now = dayjs();
  
  if (end.isBefore(now)) {
    return null;
  }
  
  const diffSeconds = end.diff(now, 'second');
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  
  return { days, hours, minutes, seconds };
}

/**
 * 检查日期是否为今天
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否为今天
 */
export function isToday(date: Date | number | string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 获取某月的天数
 * @param year 年份
 * @param month 月份(1-12)
 * @returns 天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${month}`).daysInMonth();
} 