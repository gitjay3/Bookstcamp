import React from 'react';
import type { EventSlot, SlotSchema, Status } from '@/types/event';
import Slot from './Slot';

interface SlotListProps {
  status: Status;
  slotSchema: SlotSchema;
  slots: EventSlot[];
  selectedSlotId: number | null;
  setSelectedSlotId: React.Dispatch<React.SetStateAction<number | null>>;
  disabled?: boolean;
}

function SlotList({
  status,
  slotSchema,
  slots,
  selectedSlotId,
  setSelectedSlotId,
  disabled = false,
}: SlotListProps) {
  const fields = slotSchema.fields ?? [];

  // 그리드 컬럼 (필드 개수 + 상태 열)
  const gridLayout = {
    gridTemplateColumns: `repeat(${fields.length}, 1fr) 40px`,
  };

  return (
    <div className="flex flex-col gap-1">
      {/* 테이블 헤더 영역 */}
      <div
        className="text-14 text-neutral-text-tertiary grid items-center px-6 py-3 font-bold"
        style={gridLayout}
      >
        {fields.map((field) => (
          <div key={field.id} className="text-left">
            {field.name}
          </div>
        ))}
        <div className="text-center">상태</div>
      </div>

      {/* 슬롯 리스트 영역 */}
      <div className="flex flex-col gap-3">
        {slots.map((slot) => (
          <Slot
            key={slot.id}
            isReservable={status === 'ONGOING' && !disabled}
            slot={slot}
            fields={fields}
            selectedSlotId={selectedSlotId}
            setSelectedSlotId={setSelectedSlotId}
            gridLayout={gridLayout}
          />
        ))}
      </div>
    </div>
  );
}

export default SlotList;
