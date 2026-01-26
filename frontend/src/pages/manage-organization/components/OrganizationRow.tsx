import { useNavigate } from 'react-router';
import Button from '@/components/Button';
import type { Organization } from '@/api/organization';

interface OrganizationRowProps {
  organization: Organization;
  onEdit: (organization: Organization) => void;
}

function OrganizationRow({ organization, onEdit }: OrganizationRowProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/orgs/${organization.id}`);
  };

  return (
    <tr className="h-15">
      <td className="px-6 font-medium whitespace-nowrap">
        <div className="flex h-10 items-center">{organization.name}</div>
      </td>
      <td className="px-6 text-right">
        <div className="flex h-10 items-center justify-end gap-2">
          <Button type="secondary" variant="outline" onClickHandler={() => onEdit(organization)}>
            수정
          </Button>
          <Button type="secondary" variant="outline" onClickHandler={handleNavigate}>
            이동
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default OrganizationRow;
