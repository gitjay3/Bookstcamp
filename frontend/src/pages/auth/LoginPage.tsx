import GithubIcon from '@/assets/icons/github.svg?react';

export default function LoginPage() {
  const handleGithubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  const handleAdminLogin = () => {
    // TODO: 운영진 로그인
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-5">
          <img className="h-24 w-24" src="/logo.webp" alt="로고" />

          <h1 className="text-neutral-text-primary text-36 font-extrabold">bookstcamp</h1>

          <p className="text-neutral-text-secondary text-16 text-center font-medium">
            부스트캠프 멤버들을 위한 예약 시스템
            <br />
            GitHub 계정으로 간편하게 로그인하세요.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex h-12 w-80 items-center justify-center gap-2 rounded-lg bg-black text-sm font-bold text-white"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub로 계속하기
          </button>

          <div className="flex w-80 items-center gap-2.5">
            <div className="bg-neutral-text-tertiary h-px flex-1" />
            <span className="text-neutral-text-tertiary text-xs font-medium">OR</span>
            <div className="bg-neutral-text-tertiary h-px flex-1" />
          </div>

          <button
            type="button"
            onClick={handleAdminLogin}
            className="border-neutral-border-default text-neutral-text-secondary h-12 w-80 rounded-lg border bg-white text-sm font-bold"
          >
            운영진 로그인
          </button>
        </div>

        <div className="text-neutral-text-tertiary text-xs font-medium">
          © 2026 bookstcamp. All rights reserved.
        </div>
      </div>
    </div>
  );
}
