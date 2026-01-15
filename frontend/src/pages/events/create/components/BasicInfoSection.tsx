import { useState } from 'react';
import Dropdown from '@/components/Dropdown';
import SectionCard from './SectionCard';

const trackOptions = [
  { key: 'ALL', label: '전체' },
  { key: 'COMMON', label: '공통' },
  { key: 'WEB', label: 'Web' },
  { key: 'ANDROID', label: 'Android' },
  { key: 'IOS', label: 'iOS' },
] as const;

const affiliationOptions = [
  { key: 'MEMBERSHIP_10', label: '10기 멤버십' },
  { key: 'CHALLENGE_10', label: '10기 챌린지' },
] as const;

type ApplyType = 'INDIVIDUAL' | 'TEAM';
type TrackValue = (typeof trackOptions)[number]['key'];
type AffiliationValue = (typeof affiliationOptions)[number]['key'];

function BasicInfoSection() {
  const [field, setField] = useState<TrackValue>('ALL');
  const [applyType, setApplyType] = useState<ApplyType>('INDIVIDUAL');
  // TODO: 백엔드에서 받아오기, 기본값/선택값도 해당 데이터 기준으로 처리
  const [affiliation, setAffiliation] = useState<AffiliationValue>('MEMBERSHIP_10');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const labelClassName = 'text-neutral-text-primary text-16 font-medium';

  return (
    <SectionCard title="기본 정보" description="이벤트의 기본적인 정보를 입력해주세요.">
      <div className="flex flex-col gap-6">
        {/* 분야 */}
        <div className="flex flex-col gap-2">
          <div className={labelClassName}>분야</div>
          <Dropdown
            options={trackOptions}
            value={field}
            setValue={setField}
            className="text-12 max-w-60"
          />
        </div>

        {/* 신청 유형 */}
        <div className="flex flex-col gap-2">
          <div className={labelClassName}>신청 유형</div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                id="applyType-individual"
                type="radio"
                name="applyType"
                value="INDIVIDUAL"
                checked={applyType === 'INDIVIDUAL'}
                onChange={() => setApplyType('INDIVIDUAL')}
                className="accent-brand-500"
              />
              <label htmlFor="applyType-individual" className="text-12 cursor-pointer">
                개인 신청
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="applyType-team"
                type="radio"
                name="applyType"
                value="TEAM"
                checked={applyType === 'TEAM'}
                onChange={() => setApplyType('TEAM')}
                className="accent-brand-500"
              />
              <label htmlFor="applyType-team" className="text-12 cursor-pointer">
                팀 신청
              </label>
            </div>
          </div>
        </div>

        {/* 대상 소속 */}
        <div className="flex flex-col gap-2">
          <div className={labelClassName}>대상 소속</div>
          <Dropdown
            options={affiliationOptions}
            value={affiliation}
            setValue={setAffiliation}
            className="text-12 max-w-60"
          />
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <div className={labelClassName}>제목</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예 : 3주차 시니어 멘토링"
            className="border-neutral-border-default focus:border-brand-400 focus:ring-brand-500/20 text-12 h-10 w-full rounded-lg border bg-white px-3 outline-none focus:ring-3"
          />
        </div>

        {/* 상세 설명 */}
        <div className="flex flex-col gap-2">
          <div className={labelClassName}>상세 설명</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이벤트에 대한 상세한 설명을 작성해주세요."
            rows={6}
            className="border-neutral-border-default focus:border-brand-400 focus:ring-brand-500/20 text-12 w-full resize-none rounded-lg border bg-white px-3 py-3 outline-none focus:ring-3"
          />
        </div>
      </div>
    </SectionCard>
  );
}

export default BasicInfoSection;
