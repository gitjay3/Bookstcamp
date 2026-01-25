import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

// SVG 모킹
vi.mock('@/assets/icons/x-mark.svg?react', () => ({
  default: () => <span data-testid="x-mark-icon">X</span>,
}));

describe('Modal', () => {
  it('isOpen이 false이면 렌더링하지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>모달 내용</div>
      </Modal>
    );

    expect(screen.queryByText('모달 내용')).not.toBeInTheDocument();
  });

  it('isOpen이 true이면 children을 렌더링한다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>모달 내용</div>
      </Modal>
    );

    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose를 호출한다', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>모달 내용</div>
      </Modal>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키를 누르면 onClose를 호출한다', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>모달 내용</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('isOpen이 true일 때 body overflow가 hidden이 된다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>모달 내용</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('언마운트 시 body overflow가 복원된다', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>모달 내용</div>
      </Modal>
    );

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});
