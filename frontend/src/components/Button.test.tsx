import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  describe('렌더링', () => {
    it('children을 렌더링한다', () => {
      render(<Button>클릭</Button>);
      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
    });

    it('기본 타입은 button이다', () => {
      render(<Button>클릭</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('submit 타입을 지정할 수 있다', () => {
      render(<Button htmlType="submit">제출</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('사용자 상호작용', () => {
    it('클릭하면 핸들러가 호출된다', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClickHandler={handleClick}>클릭</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled 상태에서는 클릭해도 핸들러가 호출되지 않는다', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClickHandler={handleClick} disabled>
          클릭
        </Button>,
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('disabled 상태에서는 버튼이 비활성화된다', () => {
      render(<Button disabled>클릭</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('키보드로 버튼을 활성화할 수 있다', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClickHandler={handleClick}>클릭</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일 변형', () => {
    it('primary 타입 버튼이 렌더링된다', () => {
      render(<Button type="primary">Primary</Button>);
      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    });

    it('secondary 타입 버튼이 렌더링된다', () => {
      render(<Button type="secondary">Secondary</Button>);
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    });

    it('outline variant 버튼이 렌더링된다', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument();
    });
  });
});
