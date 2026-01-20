import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import PlusIcon from '@/assets/icons/plus.svg?react';
import DownloadIcon from '@/assets/icons/download.svg?react';
import type { Camper } from '@/types/camper';
import { getCampers, createCamper } from '@/api/organization';
import CamperListTable from './components/CamperListTable';
import CamperAddTable from './components/CamperAddTable';

function ManageCamper() {
  const { orgId } = useParams<{ orgId: string }>();
  const [campers, setCampers] = useState<Camper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      setIsLoading(true);

      (async () => {
        setCampers(await getCampers(orgId));
        setIsLoading(false);
      })();
    }
  }, [orgId]);

  const handleAddCamper = async (newCamperData: Omit<Camper, 'id' | 'status'>) => {
    if (!orgId) return;

    const newCamper = await createCamper(orgId, newCamperData);
    setCampers((prev) => [...prev, newCamper]);
    toast.success('캠퍼가 성공적으로 추가되었습니다.');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="캠퍼 관리"
        description="현재 선택된 과정의 캠퍼 목록을 관리합니다."
        action={
          <div className="flex gap-2">
            <Button type="secondary" variant="outline">
              <DownloadIcon className="h-4 w-4" />
              캠퍼 정보 다운로드
            </Button>
            <Button type="secondary">
              <PlusIcon className="h-4 w-4" />
              캠퍼 정보 업로드
            </Button>
          </div>
        }
      />
      <div className="flex flex-col">
        <CamperListTable campers={campers} />
        <CamperAddTable onAdd={handleAddCamper} />
      </div>
    </div>
  );
}

export default ManageCamper;
