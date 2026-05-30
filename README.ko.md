# TryCloudflare GUI

> [English version (README.md)](./README.md)

[TryCloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/trycloudflare/) 터널을 관리하기 위한 간단하고 아름다운 데스크톱 GUI입니다.

**TryCloudflare GUI**를 사용하면 로컬 개발 서버(웹, API, 데이터베이스, SSH 등)를 Cloudflare의 `cloudflared`를 통해 임시 `*.trycloudflare.com` 공개 URL로 즉시 노출할 수 있습니다.

### ✨ 주요 기능

- **원클릭 터널 관리** — 깔끔한 인터페이스로 터널 시작, 중지, 수정, 삭제
- **자동 cloudflared 설치** — `cloudflared` 바이너리가 없으면 자동으로 다운로드
- **빠른 프리셋** — React, Vite, Next.js, Express, Flask, Django, Laravel, Rails, ASP.NET, Go 등 원클릭 시작
- **설정 저장** — 앱을 종료해도 터널 설정이 유지됩니다 (일회용 터널 옵션 제공)
- **다양한 프로토콜 지원** — HTTP, HTTPS, TCP, SSH
- **실시간 상태 확인** — 터널이 준비되면 공개 URL이 즉시 표시됩니다
- **다국어 지원** — English, 한국어, 日本語

### 📦 설치 방법

#### 다운로드 (권장)

Windows, macOS, Linux용 미리 빌드된 실행 파일은 [Releases](https://github.com/Nergis0318/TryCloudflareGUI/releases) 페이지에서 제공될 예정입니다.

#### 소스에서 빌드하기

**필요한 것:** [Bun](https://bun.sh) (권장) 또는 Node.js 20 이상

```bash
# 저장소 복제
git clone https://github.com/Nergis0318/TryCloudflareGUI.git
cd TryCloudflareGUI

# 의존성 설치
bun install

# 개발 모드로 실행
bun run dev

# 앱 빌드
bun run build

# 배포용 패키지 생성 (./release 폴더 생성)
bun run build:electron
```

### 🚀 사용법

1. 앱을 실행합니다
2. `cloudflared`가 설치되어 있지 않으면 한 번의 클릭으로 자동 다운로드합니다
3. **+ 터널 추가** 버튼을 누르거나 오른쪽 사이드바의 프리셋을 클릭합니다
4. 로컬 포트(예: React의 경우 3000)를 입력하고 이름을 지정합니다 (선택)
5. **확인** 버튼을 누릅니다 ("바로 실행" 옵션도 가능)
6. 생성된 공개 URL(`https://xxx.trycloudflare.com`)을 복사해 공유하세요

각 터널은 개별적으로 시작/중지할 수 있으며, 오류 발생 시 상태가 실시간으로 표시됩니다.

### 🛠 기술 스택

- **데스크톱:** Electron
- **UI:** React 19 + TypeScript + Vite
- **스타일:** 커스텀 CSS (Pretendard 폰트)
- **국제화:** i18next + react-i18next
- **핵심:** 공식 `cloudflared` 바이너리 (자동 관리)

### 📄 라이선스

[GNU General Public License v3.0](LICENSE)
