export function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // If YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatFriendlyDate(dateStr: string | null | undefined): string {
  const d = parseLocalDate(dateStr);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string | null | undefined): string {
  const d = parseLocalDate(dateStr);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysDiff(targetDateStr: string | null | undefined): number | null {
  const target = parseLocalDate(targetDateStr);
  if (!target) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - target.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if referral connection request was sent 5 or more days ago
 * and connection is still awaiting ('sent').
 */
export function isWaitingFivePlusDays(
  connectionStatus: string | null | undefined,
  connectionSentOn: string | null | undefined
): boolean {
  if (connectionStatus !== 'sent') return false;
  const days = getDaysDiff(connectionSentOn);
  return days !== null && days >= 5;
}

/**
 * Returns true if next_followup_on is today or overdue
 */
export function isFollowupDue(nextFollowupOn: string | null | undefined): boolean {
  if (!nextFollowupOn) return false;
  const target = parseLocalDate(nextFollowupOn);
  if (!target) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  return target.getTime() <= today.getTime();
}

/**
 * Returns true if an interview date is within [today, today + 7 days]
 */
export function isInterviewInNext7Days(dateStr: string | null | undefined): boolean {
  const target = parseLocalDate(dateStr);
  if (!target) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);
  
  return target.getTime() >= today.getTime() && target.getTime() <= in7Days.getTime();
}

/**
 * Returns true if job was saved 7 or more days ago and is still in 'saved' status
 */
export function isStaleSavedJob(
  status: string,
  createdAt: string | null | undefined
): boolean {
  if (status !== 'saved') return false;
  const days = getDaysDiff(createdAt);
  return days !== null && days >= 7;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

