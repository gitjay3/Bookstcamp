# GitHub Actions 워크플로우

이 디렉토리에는 Bibimbap 프로젝트의 CI/CD 파이프라인을 위한 GitHub Actions 워크플로우가 포함되어 있습니다.

## 워크플로우 목록

### 1. ci.yml - Continuous Integration

**트리거:**
- Pull Request to `develop` or `main`
- Push to `develop` or `main`

**작업:**
1. **Lint and Test**
   - Backend: ESLint, TypeScript 타입 체크, Jest 테스트
   - Frontend: ESLint, TypeScript 타입 체크
   - 각 워크스페이스 빌드 검증

2. **Build Docker Images**
   - Backend, Frontend Docker 이미지 빌드 검증
   - 푸시는 하지 않음 (빌드 가능 여부만 확인)
   - GitHub Actions 캐시 사용

**병렬 실행:**
- Backend와 Frontend는 각각 별도 job으로 병렬 실행
- 빌드 시간 단축

### 2. deploy-staging.yml - Staging 배포

**트리거:**
- Push to `develop` branch

**작업 순서:**
```
1. CI 검증 (ci.yml 재사용)
   ↓
2. Docker 이미지 빌드 및 NCP Registry 푸시
   - Tag: staging-{SHA}, staging-latest
   ↓
3. VPC 서버에 배포
   - SSH 접속
   - 배포 스크립트 실행 (scripts/deploy.sh)
   ↓
4. Health check (최대 10회 재시도)
   ↓
5. 성공/실패 알림
```

**자동 배포:**
- `develop` 브랜치에 푸시하면 자동으로 Staging 환경에 배포됩니다
- 승인 필요 없음

**실패 시:**
- 알림 job 실행
- 수동으로 롤백 필요: `ssh user@host 'cd ~/bibimbap && ./scripts/rollback.sh staging'`

### 3. deploy-production.yml - Production 배포

**트리거:**
- Push to `main` branch
- Manual workflow dispatch (선택적 이미지 태그 지정 가능)

**작업 순서:**
```
1. CI 검증
   ↓
2. Docker 이미지 빌드 및 NCP Registry 푸시
   - Tag: production-{SHA}, production-latest, v{VERSION}
   - Environment: production-build (승인 가능)
   ↓
3. 배포 전 백업
   - 현재 컨테이너 상태 백업
   ↓
4. VPC 서버에 배포
   - Environment: production (승인 필수!)
   - SSH 접속
   - 배포 스크립트 실행
   ↓
5. 엄격한 검증 (10회 + 3회 재시도)
   - 30초 대기 후 추가 검증
   ↓
6. 배포 후 모니터링
   - 컨테이너 상태 확인
   - 리소스 사용량 확인
   ↓
7. 성공 또는 자동 롤백
```

**수동 승인:**
- GitHub Environment `production` 설정 필요
- 최소 1명의 리뷰어 승인 후 배포 진행

**자동 롤백:**
- 배포 실패 시 자동으로 `scripts/rollback.sh production` 실행
- 롤백 후 health check 재실행

## 필요한 GitHub Secrets

### NCP Container Registry
- `NCP_CONTAINER_REGISTRY_URL`: NCP Container Registry URL
- `NCP_CONTAINER_REGISTRY_USERNAME`: Registry 사용자명
- `NCP_CONTAINER_REGISTRY_PASSWORD`: Registry 비밀번호

### Staging 서버
- `STAGING_SSH_PRIVATE_KEY`: SSH private key
- `STAGING_SERVER_HOST`: Staging VPC 서버 IP/hostname
- `STAGING_SERVER_USER`: SSH 사용자명 (예: ubuntu)

### Production 서버
- `PRODUCTION_SSH_PRIVATE_KEY`: SSH private key
- `PRODUCTION_SERVER_HOST`: Production VPC 서버 IP
- `PRODUCTION_SERVER_USER`: SSH 사용자명

## GitHub Environment 설정

### production-build (선택사항)
이미지 빌드 단계에서 승인을 받고 싶다면 설정:
- **Protection rules**: None (또는 optional reviewers)
- **Purpose**: 빌드된 이미지 확인

### production (필수)
실제 배포 단계에서 승인 필수:
- **Protection rules**: Required reviewers (최소 1명)
- **Deployment branches**: `main` only
- **Purpose**: 프로덕션 배포 승인

**설정 방법:**
1. GitHub Repository → Settings → Environments
2. "New environment" 클릭
3. Environment name: `production`
4. Protection rules:
   - ✅ Required reviewers (팀원 추가)
   - ✅ Wait timer: 0 minutes (또는 원하는 시간)
5. Deployment branches: Selected branches → `main`

## 워크플로우 사용법

### CI 실행
PR을 생성하거나 `develop`/`main`에 푸시하면 자동 실행됩니다:
```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
# PR 생성 → CI 자동 실행
```

### Staging 배포
`develop` 브랜치에 머지하면 자동 배포:
```bash
git checkout develop
git merge feature/new-feature
git push origin develop
# 자동으로 Staging 배포 시작
```

### Production 배포
`main` 브랜치에 머지 후 승인:
```bash
git checkout main
git merge develop
git push origin main
# GitHub Actions에서 승인 대기
# 승인 후 배포 진행
```

**수동 배포 (특정 이미지 태그):**
1. GitHub Repository → Actions
2. "Deploy to Production" 워크플로우 선택
3. "Run workflow" 클릭
4. 이미지 태그 입력 (선택사항)
5. "Run workflow" 버튼 클릭

### 배포 모니터링

**실시간 로그 확인:**
1. GitHub Repository → Actions
2. 실행 중인 워크플로우 클릭
3. Job 로그 확인

**서버에서 직접 확인:**
```bash
# Staging
ssh user@staging-host
cd ~/bibimbap
docker compose -f docker-compose.staging.yml logs -f

# Production
ssh user@production-host
cd ~/bibimbap
docker compose -f docker-compose.production.yml logs -f
```

## 트러블슈팅

### CI 실패 시
1. GitHub Actions 로그 확인
2. 로컬에서 재현:
   ```bash
   pnpm install
   pnpm lint
   pnpm test  # backend only
   pnpm build
   ```

### 배포 실패 시

**Staging:**
```bash
# SSH 접속
ssh user@staging-host

# 로그 확인
cd ~/bibimbap
docker compose -f docker-compose.staging.yml logs

# 수동 롤백
./scripts/rollback.sh staging
```

**Production:**
- 자동 롤백이 실행되었는지 확인
- 수동 확인 필요 시:
  ```bash
  ssh user@production-host
  cd ~/bibimbap
  ./scripts/health-check.sh production
  ./scripts/rollback.sh production  # 필요시
  ```

### SSH 연결 실패
1. SSH 키 확인: GitHub Secrets의 SSH_PRIVATE_KEY 값 확인
2. 서버 접근성 확인: VPC 서버 방화벽, Security Group 설정
3. 사용자 권한 확인: SSH 사용자가 docker 그룹에 속해 있는지 확인

### Docker 이미지 푸시 실패
1. NCP Registry 자격 증명 확인
2. Registry URL 형식 확인 (예: `registry.ncloud.com/bibimbap`)
3. Registry 할당량 확인

## 고급 설정

### 병렬 빌드 비활성화
리소스 제약이 있는 경우 순차 빌드:
```yaml
# deploy-staging.yml 또는 deploy-production.yml
strategy:
  matrix:
    service: [backend, frontend]
  max-parallel: 1  # 추가
```

### 배포 타임아웃 조정
```yaml
jobs:
  deploy:
    timeout-minutes: 30  # 기본값: 360 (6시간)
```

### Health Check 재시도 횟수 조정
`scripts/health-check.sh` 호출 시:
```bash
./scripts/health-check.sh staging 20  # 20회로 증가
```

## 워크플로우 최적화

현재 구현된 최적화:
- ✅ pnpm 캐싱
- ✅ Docker layer 캐싱 (GitHub Actions cache)
- ✅ 병렬 빌드 (Backend/Frontend)
- ✅ Concurrency control (중복 실행 방지)

## 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [pnpm Action](https://github.com/pnpm/action-setup)
