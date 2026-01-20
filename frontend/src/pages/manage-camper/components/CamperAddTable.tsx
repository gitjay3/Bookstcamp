import { useState } from 'react';
import PlusIcon from '@/assets/icons/plus.svg?react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import TextInput from '@/components/TextInput';
import type { Track } from '@/types/event';
import { trackOptions, type Camper } from '@/types/camper';

interface CamperAddTableProps {
  onAdd: (camper: Omit<Camper, 'id' | 'status'>) => void;
}

function CamperAddTable({ onAdd }: CamperAddTableProps) {
  const [newCamperId, setNewCamperId] = useState('');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newTrack, setNewTrack] = useState<Track>('WEB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInvalid = !newCamperId || !newName || !newUsername || isSubmitting;

  const handleAdd = async () => {
    if (isInvalid) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        camperId: newCamperId,
        name: newName,
        username: newUsername,
        track: newTrack,
      });
      setNewCamperId('');
      setNewName('');
      setNewUsername('');
      setNewTrack('WEB');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <table className="w-full table-fixed text-left">
        <tbody className="bg-white">
          <tr className="border-neutral-border-default border-t">
            <td className="px-6 py-4">
              <TextInput
                aria-label="부스트캠프 ID"
                placeholder="부스트캠프 ID"
                value={newCamperId}
                onChange={(e) => setNewCamperId(e.target.value)}
              />
            </td>
            <td className="px-6 py-4">
              <TextInput
                aria-label="이름"
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </td>
            <td className="px-6 py-4">
              <TextInput
                aria-label="GitHub ID"
                placeholder="GitHub ID"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </td>
            <td className="px-6 py-4">
              <Dropdown
                options={trackOptions}
                value={newTrack}
                setValue={setNewTrack}
                className="w-full"
              />
            </td>
            <td className="px-6 py-4" aria-hidden="true" />
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end">
                <div className="w-20">
                  <Button disabled={isInvalid} onClickHandler={handleAdd}>
                    <PlusIcon className="h-4 w-4" />
                    추가
                  </Button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CamperAddTable;
