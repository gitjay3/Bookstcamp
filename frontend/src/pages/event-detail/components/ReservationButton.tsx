import { useState } from 'react';
import { toast } from 'sonner';
import { applyReservation } from '@/api/reservation';
import cn from '@/utils/cn';

interface ReservationButtonProps {
  isReservable: boolean;
  selectedSlotId: number | null;
  onReservationSuccess: () => void;
}

function ReservationButton({
  isReservable,
  selectedSlotId,
  onReservationSuccess,
}: ReservationButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const disabled = selectedSlotId === null;

  const handleReservation = async () => {
    if (!isReservable || disabled || selectedSlotId === null) {
      return;
    }

    setIsSubmitting(true);

    try {
      await applyReservation(selectedSlotId);

      toast.success('예약이 완료되었습니다!');

      onReservationSuccess();
    } catch (error) {
      console.error('예약 신청 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  let buttonText;
  if (isSubmitting) {
    buttonText = '예약 중...';
  } else if (isReservable) {
    buttonText = '예약하기';
  } else {
    buttonText = '예약 기간이 아닙니다';
  }

  return (
    <div className="border-neutral-border-default fixed right-0 bottom-0 left-0 flex justify-center border-t bg-white py-4">
      <button
        type="button"
        onClick={handleReservation}
        disabled={!isReservable || disabled}
        className={cn(
          'bg-brand-surface-default h-12 w-160 cursor-pointer rounded-lg font-bold text-white transition',
          disabled && 'bg-brand-surface-disabled cursor-not-allowed',
          !isReservable &&
            'bg-neutral-surface-default text-neutral-text-tertiary cursor-not-allowed',
        )}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default ReservationButton;
