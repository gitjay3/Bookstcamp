/* eslint-disable react/jsx-props-no-spreading */
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import PlusIcon from '@/assets/icons/plus.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import UploadIcon from '@/assets/icons/upload.svg?react';
import TemplateIcon from '@/assets/icons/template.svg?react';
import DownloadIcon from '@/assets/icons/download.svg?react';
import type { EventFormValues } from '../schema';
import SectionCard from './SectionCard';
import TemplateSelectModal, { type Template, type SlotFieldType } from './TemplateSelectModal';

export default function SlotOptionsSection() {
  const { orgId } = useParams<{ orgId: string }>();

  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<EventFormValues>();

  const templateFields = (useWatch({
    control,
    name: 'slotSchema.fields',
  }) || []) as Array<{ id: string; name: string; type: SlotFieldType }>;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'slots',
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // TODO: 실제 API로 교체
  const templates: Template[] = useMemo(
    () => [
      {
        id: 'tpl_1',
        title: '시니어 리뷰어 피드백',
        description: '리뷰어와 시간을 선택하는 템플릿',
        tags: ['시작 시간', '리뷰어', '정원'],
        fields: [
          { id: 'f_1', name: '시작 시간', type: 'time' },
          { id: 'f_2', name: '리뷰어', type: 'text' },
        ],
      },
      {
        id: 'tpl_2',
        title: '오프라인 행사 신청',
        description: '장소와 정원을 관리하는 템플릿',
        tags: ['날짜', '장소', '정원'],
        fields: [
          { id: 'f_1', name: '날짜', type: 'text' },
          { id: 'f_2', name: '장소', type: 'text' },
        ],
      },
    ],
    [],
  );

  const blockNegativeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
  };

  const numberRegisterOptions = {
    setValueAs: (v: string) => {
      if (v === '' || v === null) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : Math.max(0, n);
    },
  };

  const buildDefaultSlotRow = (fieldsToUse: Array<{ id: string; type: SlotFieldType }>) => {
    const base = fieldsToUse.reduce(
      (acc, f) => ({ ...acc, [f.id]: f.type === 'number' ? 0 : '' }),
      {} as Record<string, unknown>,
    );
    return { ...base, capacity: 0 };
  };

  const handleAddSlot = () => {
    append(buildDefaultSlotRow(templateFields));
  };

  const handleSelectTemplate = (t: Template) => {
    setValue('slotSchema.fields', t.fields, { shouldDirty: true });
    replace([buildDefaultSlotRow(t.fields)]);
    setIsTemplateModalOpen(false);
  };

  const handleDownloadTemplate = () => {
    // TODO: 템플릿 서식 다운로드
    console.log('템플릿 서식 다운로드');
  };

  const getPlaceholder = (field: { name: string; type: SlotFieldType }) => {
    if (field.type === 'number') return '0';
    if (field.type === 'time') return 'HH:MM';
    return `${field.name} 입력`;
  };

  const showSlotsError = !!errors.slots;

  const inputBaseClassName =
    'w-full rounded-md border border-neutral-border-default px-3 py-2 text-14 outline-none placeholder:text-neutral-text-tertiary focus:border-brand-border-default';

  const manageTemplatesHref = `/orgs/${orgId}/templates`;

  return (
    <>
      <SectionCard title="선택지 목록" description="사용자가 선택할 수 있는 옵션을 등록하세요.">
        <div className="mb-4 flex items-end justify-between">
          <div className="min-h-4">
            {showSlotsError && (
              <p className="text-12 text-error-text-primary font-medium">
                선택지의 모든 값을 입력해주세요.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="border-neutral-border-default text-14 flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 font-medium"
            >
              <TemplateIcon className="h-4 w-4" /> 템플릿 설정
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="border-neutral-border-default text-14 flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 font-medium"
            >
              <DownloadIcon className="h-4 w-4" /> 서식 다운로드
            </button>

            <button
              type="button"
              className="border-neutral-border-default text-14 flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 font-medium"
            >
              <UploadIcon className="h-4 w-4" /> 엑셀 업로드
            </button>

            <button
              type="button"
              onClick={handleAddSlot}
              className="bg-brand-surface-default text-14 flex items-center gap-1.5 rounded-md px-4 py-2 font-medium text-white"
            >
              <PlusIcon className="h-4 w-4" /> 선택지 추가
            </button>
          </div>
        </div>

        <div className="border-neutral-border-default overflow-x-auto rounded-lg border">
          <table className="w-full min-w-150 table-fixed border-collapse">
            <thead>
              <tr className="bg-neutral-surface-default text-14 text-neutral-text-tertiary font-medium">
                <th className="w-16 py-3.5 text-center">No.</th>
                {templateFields.map((field) => (
                  <th key={field.id} className="px-4 py-3.5 text-left">
                    {field.name}
                  </th>
                ))}
                <th className="w-28 px-4 py-3.5 text-left">정원</th>
                <th className="w-16 py-3.5 text-center">삭제</th>
              </tr>
            </thead>

            <tbody className="divide-neutral-border-default divide-y bg-white">
              {fields.map((row, rowIndex) => (
                <tr key={row.id}>
                  <td className="text-14 text-neutral-text-tertiary py-4 text-center">
                    {rowIndex + 1}
                  </td>

                  {templateFields.map((field) => (
                    <td key={field.id} className="px-2 py-2">
                      <input
                        {...register(`slots.${rowIndex}.${field.id}` as const)}
                        type={field.type}
                        placeholder={getPlaceholder(field)}
                        onKeyDown={field.type === 'number' ? blockNegativeKey : undefined}
                        className={inputBaseClassName}
                      />
                    </td>
                  ))}

                  <td className="px-2 py-2">
                    <input
                      {...register(`slots.${rowIndex}.capacity` as const, numberRegisterOptions)}
                      type="number"
                      placeholder="0"
                      onKeyDown={blockNegativeKey}
                      className={inputBaseClassName}
                    />
                  </td>

                  <td className="py-2 text-center">
                    <button type="button" onClick={() => remove(rowIndex)}>
                      <TrashIcon className="text-neutral-text-tertiary h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {fields.length === 0 && (
            <div className="text-12 text-error-text-primary py-12 text-center font-medium">
              등록된 선택지가 없습니다. &apos;선택지 추가&apos; 버튼을 눌러주세요.
            </div>
          )}
        </div>
      </SectionCard>

      <TemplateSelectModal
        open={isTemplateModalOpen}
        templates={templates}
        manageTemplatesHref={manageTemplatesHref}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleSelectTemplate}
      />
    </>
  );
}
