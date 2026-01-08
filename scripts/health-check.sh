#!/bin/bash

set -euo pipefail

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[HEALTH]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# 사용법
usage() {
    cat << EOF
Usage: $0 <environment> [max_retries]

Arguments:
    environment    배포 환경 (prod)
    max_retries    최대 재시도 횟수 (기본값: 5)

Example:
    $0 prod
    $0 prod 10

설명:
    모든 컨테이너가 실행 중인지 확인합니다.
    재시도 간격: 10초
EOF
    exit 1
}

# 환경 검증
if [ $# -lt 1 ]; then
    usage
fi

ENVIRONMENT=$1
MAX_RETRIES=${2:-5}
RETRY_INTERVAL=10

if [[ "$ENVIRONMENT" != "prod" ]]; then
    log_error "Invalid environment: $ENVIRONMENT (only 'prod' is supported)"
    usage
fi

# 변수 설정
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

log_info "=== Health Check 시작: $ENVIRONMENT 환경 ==="
log_info "최대 재시도: $MAX_RETRIES회 (간격: ${RETRY_INTERVAL}초)"

# 예상되는 서비스 목록 (Production - NCP Managed DB 사용)
EXPECTED_SERVICES=("backend" "frontend" "redis")

log_info "예상 서비스: ${EXPECTED_SERVICES[*]}"
echo ""

# Health check 함수
check_containers() {
    local all_running=true

    for service in "${EXPECTED_SERVICES[@]}"; do
        # 컨테이너 상태 확인
        if command -v jq &> /dev/null; then
            local container_state=$(docker compose -f "$COMPOSE_FILE" ps --format json "$service" 2>/dev/null | jq -r '.State' 2>/dev/null || echo "not_found")
        else
            # jq 없으면 간단한 grep 사용
            if docker compose -f "$COMPOSE_FILE" ps "$service" 2>/dev/null | grep -q "Up"; then
                local container_state="running"
            else
                local container_state="not_running"
            fi
        fi

        if [ "$container_state" = "running" ]; then
            echo "   ✓ $service: 실행 중"
        else
            echo "   ✗ $service: 상태 = $container_state"
            all_running=false
        fi
    done

    if [ "$all_running" = true ]; then
        return 0
    else
        return 1
    fi
}

# 재시도 로직
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_info "검사 시도 $RETRY_COUNT/$MAX_RETRIES"

    if check_containers; then
        SUCCESS=true
        break
    else
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            log_warn "일부 서비스가 아직 준비되지 않았습니다. ${RETRY_INTERVAL}초 후 재시도..."
            sleep $RETRY_INTERVAL
        fi
    fi
done

echo ""

if [ "$SUCCESS" = true ]; then
    log_info "=== Health Check 성공 ==="
    log_info "모든 서비스가 정상적으로 실행 중입니다."
    echo ""

    # 추가 정보 출력
    log_info "컨테이너 상세 정보:"
    docker compose -f "$COMPOSE_FILE" ps

    exit 0
else
    log_error "=== Health Check 실패 ==="
    log_error "일부 서비스가 실행되지 않았습니다."
    echo ""

    log_info "현재 컨테이너 상태:"
    docker compose -f "$COMPOSE_FILE" ps

    echo ""
    log_info "로그 확인이 필요합니다:"
    for service in "${EXPECTED_SERVICES[@]}"; do
        echo "  docker compose -f $COMPOSE_FILE logs $service"
    done

    exit 1
fi
