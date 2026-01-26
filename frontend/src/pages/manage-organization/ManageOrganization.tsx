import { useEffect, useReducer, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import PlusIcon from '@/assets/icons/plus.svg?react';
import { toast } from 'sonner';
import {
  getMyOrganizations,
  createOrganization,
  updateOrganization,
  type Organization,
} from '@/api/organization';
import OrganizationListTable from './components/OrganizationListTable';
import OrganizationFormModal from './components/OrganizationFormModal';

type ModalState =
  | { type: 'closed' }
  | { type: 'form'; organization: Organization | null };

function modalReducer(_: ModalState, action: ModalState): ModalState {
  return action;
}

function ManageOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useReducer(modalReducer, { type: 'closed' });

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      const data = await getMyOrganizations();
      setOrganizations(data);
      setIsLoading(false);
    })();
  }, []);

  const handleCreate = () => {
    setModal({ type: 'form', organization: null });
  };

  const handleEdit = (organization: Organization) => {
    setModal({ type: 'form', organization });
  };

  const handleCloseModal = () => {
    setModal({ type: 'closed' });
  };

  const sortOrganizations = (items: Organization[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const handleSave = async (data: { name: string }) => {
    if (modal.type !== 'form') return;

    try {
      if (modal.organization) {
        const updated = await updateOrganization(modal.organization.id, data);
        setOrganizations((prev) =>
          sortOrganizations(prev.map((org) => (org.id === updated.id ? updated : org))),
        );
        toast.success('조직 정보가 수정되었습니다.');
      } else {
        const created = await createOrganization(data);
        setOrganizations((prev) => sortOrganizations([...prev, created]));
        toast.success('조직이 성공적으로 추가되었습니다.');
      }
    } catch (error) {
      console.error(error);
      toast.error('조직 정보를 저장하는 중 오류가 발생했습니다.');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-neutral-text-tertiary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="조직 관리"
        description="등록된 조직 목록을 확인하고 관리합니다."
        action={
          <Button type="secondary" onClickHandler={handleCreate}>
            <PlusIcon className="h-4 w-4" />
            조직 추가
          </Button>
        }
      />
      <OrganizationListTable organizations={organizations} onEdit={handleEdit} />
      <OrganizationFormModal
        isOpen={modal.type === 'form'}
        organization={modal.type === 'form' ? modal.organization : null}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}

export default ManageOrganization;
