import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextInput from './TextInput';

describe('TextInput', () => {
  describe('렌더링', () => {
    it('텍스트 입력 필드가 렌더링된다', () => {
      render(<TextInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('기본 타입이 text이다', () => {
      render(<TextInput />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('placeholder를 표시한다', () => {
      render(<TextInput placeholder="입력하세요" />);
      expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
    });

    it('초기값을 표시한다', () => {
      render(<TextInput value="테스트 값" readOnly />);
      expect(screen.getByDisplayValue('테스트 값')).toBeInTheDocument();
    });

    it('name 속성이 적용된다', () => {
      render(<TextInput name="username" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });
  });

  describe('사용자 상호작용', () => {
    it('텍스트를 입력하면 onChange가 호출된다', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<TextInput onChange={handleChange} />);
      await user.type(screen.getByRole('textbox'), 'hello');

      expect(handleChange).toHaveBeenCalledTimes(5); // 'hello' = 5 keystrokes
    });

    it('disabled 상태에서는 입력할 수 없다', () => {
      render(<TextInput disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('포커스를 받을 수 있다', async () => {
      const user = userEvent.setup();
      render(<TextInput placeholder="입력" />);

      await user.click(screen.getByRole('textbox'));

      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('탭으로 포커스 이동이 가능하다', async () => {
      const user = userEvent.setup();
      render(
        <>
          <TextInput placeholder="첫 번째" />
          <TextInput placeholder="두 번째" />
        </>,
      );

      await user.tab();
      expect(screen.getByPlaceholderText('첫 번째')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText('두 번째')).toHaveFocus();
    });
  });

  describe('스타일 커스터마이징', () => {
    it('추가 className이 적용된다', () => {
      render(<TextInput className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });
});
