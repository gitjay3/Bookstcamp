export type EventCategory = 'WEB' | 'ANDROID' | 'IOS' | 'COMMON';
export type EventStatus = 'ONGOING' | 'UPCOMING' | 'ENDED';

export interface Event {
  category: EventCategory;
  status: EventStatus;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
}
