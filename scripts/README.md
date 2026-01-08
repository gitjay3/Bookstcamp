# 배포 스크립트

이 디렉토리에는 Bookstcamp 프로젝트를 NCP VPC 서버에 배포하기 위한 스크립트가 포함되어 있습니다.

## 스크립트 목록

### 1. deploy.sh

메인 배포 스크립트입니다.

**기능:**
- NCP Container Registry에서 최신 Docker 이미지 pull
- 배포 전 검사 실행 (pre-deploy-checks.sh)
- Database 마이그레이션 실행 (production 환경)
- 컨테이너 재시작 (기존 중지 → 새 컨테이너 시작)
- 배포 검증 (모든 컨테이너 실행 상태 확인)
- 실패 시 자동 rollback

**사용법:**
```bash
./scripts/deploy.sh <environment>
```

**예시:**
```bash
# Production 배포
./scripts/deploy.sh prod
```

**필요한 환경변수:**
- `NCP_REGISTRY_URL`: NCP Container Registry URL
- `NCP_REGISTRY_USERNAME`: Registry 사용자명
- `NCP_REGISTRY_PASSWORD`: Registry 비밀번호
- `DOTENVX_PRIVATE_KEY`: dotenvx 복호화 키 (선택사항, .env.keys 파일 사용 가능)

### 2. pre-deploy-checks.sh

배포 전 환경 검사 스크립트입니다.

**검사 항목:**
- Docker / Docker Compose 설치 확인
- Docker 데몬 실행 확인
- Compose 파일 존재 확인
- 환경 변수 파일 확인
- dotenvx 설치 확인 (선택사항)
- 디스크 공간 확인 (최소 5GB)
- NCP Registry 네트워크 연결 확인
- Database 연결 확인 (Production 환경)
- 백업 디렉토리 확인/생성

**사용법:**
```bash
./scripts/pre-deploy-checks.sh <environment>
```

**예시:**
```bash
./scripts/pre-deploy-checks.sh prod
```

### 3. health-check.sh

배포 후 서비스 상태 검증 스크립트입니다.

**기능:**
- 모든 컨테이너 실행 상태 확인
- 재시도 로직 (기본 5회, 10초 간격)
- 실패 시 컨테이너 로그 확인 안내

**사용법:**
```bash
./scripts/health-check.sh <environment> [max_retries]
```

**예시:**
```bash
# 기본 재시도 (5회)
./scripts/health-check.sh prod

# 재시도 10회
./scripts/health-check.sh prod 10
```

### 4. rollback.sh

배포 실패 시 이전 상태로 복원하는 스크립트입니다.

**기능:**
- 백업된 컨테이너 정보 확인
- 현재 컨테이너 중지
- 이전 버전으로 복원 안내
- 서비스 재시작

**사용법:**
```bash
./scripts/rollback.sh <environment> [backup_timestamp]
```

**예시:**
```bash
# 최신 백업으로 롤백
./scripts/rollback.sh prod

# 특정 시점으로 롤백
./scripts/rollback.sh prod 20260108_143000
```

**참고:**
- 백업 파일은 `backups/` 디렉토리에 저장됩니다
- 백업 타임스탬프를 지정하지 않으면 가장 최근 백업으로 복원됩니다

## 배포 플로우

### 일반 배포
```
deploy.sh 실행
  ↓
pre-deploy-checks.sh (자동 실행)
  ↓
NCP Registry 로그인
  ↓
현재 컨테이너 상태 백업
  ↓
최신 이미지 Pull
  ↓
DB 마이그레이션
  ↓
컨테이너 재시작
  ↓
컨테이너 시작 대기 (30초)
  ↓
배포 검증
  ↓
성공 → 완료
실패 → rollback.sh 자동 실행
```

### 수동 롤백
```
rollback.sh 실행
  ↓
백업 파일 확인
  ↓
사용자 확인
  ↓
현재 컨테이너 중지
  ↓
이전 설정으로 재시작
  ↓
상태 확인
```

## 백업 파일

배포 시 자동으로 생성되는 백업 파일:
- `backups/containers_<environment>_<timestamp>.txt`: 컨테이너 상태
- `backups/images_<environment>_<timestamp>.txt`: 이미지 정보

## 트러블슈팅

### 배포 실패 시
1. 로그 확인: `docker compose logs -f`
2. 컨테이너 상태 확인: `docker compose ps`
3. 수동 롤백: `./scripts/rollback.sh prod`

### Database 마이그레이션 실패 시
수동으로 마이그레이션 실행:
```bash
docker compose exec backend npx prisma migrate deploy
```

### dotenvx 복호화 실패 시
- `.env.keys` 파일 확인
- `DOTENVX_PRIVATE_KEY` 환경변수 확인
- 수동 복호화 테스트: `dotenvx decrypt --stdout -f .env.<environment>`

## GitHub Actions 연동

이 스크립트들은 GitHub Actions 워크플로우에서 SSH로 VPC 서버에 접속하여 실행됩니다:

```yaml
# GitHub Actions 예시
- name: Deploy to production
  run: |
    ssh ${{ secrets.PRODUCTION_SERVER_USER }}@${{ secrets.PRODUCTION_SERVER_HOST }} \
      "cd ~/bookstcamp && ./scripts/deploy.sh prod"
```

## 환경변수 설정

VPC 서버에서 배포 전 환경변수를 export하거나 `.bashrc` / `.zshrc`에 추가:

```bash
# NCP Container Registry
export NCP_REGISTRY_URL="your-registry.ncloud.com"
export NCP_REGISTRY_USERNAME="your-username"
export NCP_REGISTRY_PASSWORD="your-password"

# dotenvx (선택사항)
export DOTENVX_PRIVATE_KEY="your-private-key"
```

## 주의사항

1. **모든 스크립트는 VPC 서버에서 실행되어야 합니다** (GitHub Actions에서 SSH로 접속)
2. **Production 배포는 반드시 승인 후 진행해야 합니다** (GitHub Environment 설정)
3. **Database 백업은 별도로 수행해야 합니다** (스크립트에 포함되지 않음)
4. **dotenvx를 사용하지 않는 경우** 환경변수를 직접 export하거나 .env 파일 사용
5. **롤백은 이미지 태그 변경이 필요할 수 있습니다** (수동 작업)
