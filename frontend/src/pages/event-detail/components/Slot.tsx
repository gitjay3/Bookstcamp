import React from 'react';
import type { EventSlot, SlotSchemaField } from '@/types/event';
import cn from '@/utils/cn';

interface SlotProps {
  isReservable: boolean;
  slot: EventSlot;
  fields: SlotSchemaField[];
  selectedSlotId: number | null;
  setSelectedSlotId: React.Dispatch<React.SetStateAction<number | null>>;
  gridLayout: React.CSSProperties;
}

function Slot({
  isReservable,
  slot,
  fields,
  selectedSlotId,
  setSelectedSlotId,
  gridLayout,
}: SlotProps) {
  const isClosed = slot.maxCapacity === slot.currentCount;
  const isSelected = selectedSlotId === slot.id;
  const isDisabled = !isReservable || isClosed;

  return (
    <button
      type="button"
      disabled={isDisabled}
      style={gridLayout}
      className={cn(
        'grid w-full items-center rounded-xl border px-6 py-3 transition-all duration-100',
        // 기본 배경 및 테두리
        'border-neutral-border-default bg-white hover:border-gray-300',
        // 선택 상태
        isSelected && 'border-brand-500 bg-brand-50 ring-brand-500/50 shadow-sm ring-1',
        // 비활성/마감 상태
        isDisabled && 'bg-neutral-surface-default cursor-not-allowed opacity-60',
      )}
      onClick={() => {
        if (!isDisabled) setSelectedSlotId(slot.id);
      }}
    >
      {/* 데이터 필드들 */}
      {fields.map((field) => {
        const value = slot.extraInfo?.[field.id] ?? '-';
        return (
          <div
            key={field.id}
            className={cn(
              'text-16 text-neutral-text-secondary pr-4 text-left font-medium break-all',
              isClosed && 'text-neutral-text-tertiary',
            )}
          >
            {value}
          </div>
        );
      })}

      {/* 상태 표시 열 */}
      <div className="flex justify-center">
        <div
          className={cn(
            'text-12 flex h-7 w-20 items-center justify-center rounded-xl font-extrabold tracking-tight',
            isClosed ? 'text-error-text-primary' : 'text-brand-text-primary',
          )}
        >
          {isClosed ? '마감' : `${slot.currentCount}/${slot.maxCapacity}`}
        </div>
      </div>
    </button>
  );
}

export default Slot;
