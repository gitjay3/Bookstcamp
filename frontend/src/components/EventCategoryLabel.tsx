import type { EventCategory } from "@/types/event";

interface EventCategoryLabelProps {
  category: EventCategory;
}

const CATEGORY_LABEL_TEXT: Record<EventCategory, string> = {
  WEB: 'WEB',
  ANDROID: 'ANDROID',
  IOS: 'iOS',
  COMMON: '공통',
};

function EventCategoryLabel({ category }: EventCategoryLabelProps) {
  return (
    <span className="border-neutral-border-default text-12 text-neutral-text-secondary flex h-5 items-center rounded-sm border bg-white px-2 font-bold">
      {CATEGORY_LABEL_TEXT[category]}
    </span>
  );
}

export default EventCategoryLabel;
