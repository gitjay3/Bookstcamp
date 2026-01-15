import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import { useNavigate } from 'react-router';
import BasicInfoSection from './components/BasicInfoSection';
import ScheduleSection from './components/ScheduleSection';
import SlotOptionsSection from './components/SlotOptionsSection';

function EventCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="새 이벤트 만들기"
        description="새로운 멘토링이나 특강 이벤트를 개설합니다."
      />

      <BasicInfoSection />
      <ScheduleSection />
      <SlotOptionsSection />

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="border-neutral-border-default text-neutral-text-secondary h-12 rounded-md border bg-white px-5 text-sm font-semibold"
        >
          취소
        </button>
        <div className="w-40">
          <Button type="primary">이벤트 생성하기</Button>
        </div>
      </div>
    </div>
  );
}

export default EventCreatePage;
