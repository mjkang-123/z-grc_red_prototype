# Z-GRC RED (Prototype)

EN 18031-1/2/3 (RED Article 3.3 사이버보안) 자가 평가 웹 도구 프로토타입.
무선기기 제조사가 제품의 접근 통제·인증·업데이트·저장·통신·로깅 등 메커니즘을
표준 요구사항에 따라 평가하고, 요구되는 Required Information(증빙·정당화 문서)을
체계적으로 입력·관리할 수 있도록 지원합니다.

## 기능 개요

1. **프로젝트 관리** — 제품별 평가 프로젝트 생성·관리
2. **스크리닝** — 제품 특성 질문을 통해 EN 18031-1/2/3 중 어느 표준이 적용되는지,
   어떤 메커니즘(ACM/AUM/SUM/SSM/SCM/LGM/DLM/UNM/CCK/GEC/CRY)을 평가해야 하는지 자동 판별
3. **자산 인벤토리** — security/network/privacy/financial asset, 네트워크 인터페이스,
   물리적 인터페이스 등 평가 대상 자산 등록
4. **메커니즘 인벤토리** — ACM, AUM, SUM, SSM 등 보안 메커니즘 인스턴스 등록
5. **Decision Tree 평가** — EN 18031 표준 부속서의 DT에 따라 자산·메커니즘별 순차 질문 진행,
   결과(PASS / FAIL / NOT APPLICABLE) 자동 판정
6. **증빙 정보 입력** — EN 18031의 Required Information(E.Info / E.Just) 필드를
   DT 답변에 따라 동적으로 표시하여 입력
7. **표준 간 중복 제거** — 여러 표준이 동시 적용될 때, 상위 표준(예: P1)에서
   이미 평가된 자산 종류(security_asset 등)는 하위 표준(P2, P3)에서 자동 제외
8. **자동 NOT APPLICABLE** — 연결된 요구사항의 DT 답변에 따라 자동 N/A 처리
   (예: ACM-1이 환경·법적 사유로 N/A → ACM-2 자동 N/A)

## 기술 스택

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui 기반)
- **Prisma 7** + **SQLite** (`@prisma/adapter-better-sqlite3`)
- 한국어·영어 병기 UI (`ko` 기본, 관련 `en` 병기)

## 로컬 실행

전제: Node.js 20+

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성 + 마이그레이션 적용
npx prisma generate
npx prisma migrate deploy

# 개발 서버 실행
npm run dev
```

`http://localhost:3000` 접속.

### 데이터베이스

로컬 개발에서는 `dev.db`(SQLite) 파일을 프로젝트 루트에 생성합니다.
이 파일은 `.gitignore`에 포함되어 저장소에 커밋되지 않습니다.

## 프로젝트 구조

```
src/
├── app/                       # Next.js App Router 페이지
│   ├── actions.ts             # Server Actions (프로젝트·자산·DT 답변·증빙 저장)
│   └── projects/[id]/
│       ├── screening/         # 스크리닝 설문
│       ├── result/            # 스크리닝 결과 (적용 표준·메커니즘)
│       ├── assets/            # 자산 인벤토리
│       ├── mechanisms/        # 메커니즘 인벤토리
│       ├── dt/                # Decision Tree 평가
│       └── evidence/          # Required Information 입력
├── lib/
│   ├── screening-questions.ts # 스크리닝 문항 및 평가 로직
│   ├── asset-kinds.ts         # 자산·메커니즘 종류 정의
│   ├── mechanisms.ts          # 메커니즘(ACM/AUM/...) 메타데이터
│   └── decision-trees/
│       ├── types.ts           # DT 타입 + 평가 헬퍼 (sameAs dedup, auto-NA)
│       ├── part1.ts           # EN 18031-1 요구사항 (33개)
│       ├── part2.ts           # EN 18031-2 요구사항 (43개)
│       ├── part3.ts           # EN 18031-3 요구사항 (37개)
│       └── index.ts
└── components/ui/             # shadcn/ui 컴포넌트
prisma/
├── schema.prisma              # Project, Asset, DTAnswer, DTEvidence 등
└── migrations/                # SQLite 마이그레이션
```

## 구현 상태

### 완료
- 스크리닝, 자산·메커니즘 인벤토리, Decision Tree 평가, 증빙 정보 입력
- EN 18031-1/2/3 전체 요구사항(113개) DT 및 Required Information
- 표준 간 `sameAs` 자산 종류 중복 제거
- `naFromRequirement` 기반 자동 NOT APPLICABLE 처리

### 예정
- 최종 리포트 생성·내보내기 (PDF/DOCX)
- 멀티 사용자·권한
- 감사 추적 (변경 이력)

## 참고 표준

- BS EN 18031-1:2024 — 인터넷 연결 무선기기 (일반)
- BS EN 18031-2:2024 — 개인정보·프라이버시 처리 무선기기
- BS EN 18031-3:2024 — 금융 자산 처리 무선기기

## 라이선스

사내 프로토타입.
