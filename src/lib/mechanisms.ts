// EN 18031 Security Mechanisms — common across -1, -2, -3
// Reference: EN 18031-1/2/3 (Radio Equipment Directive Art. 3.3 (d)(e)(f))

export type StandardId = 1 | 2 | 3;

export type Mechanism = {
  code: string;
  name_en: string;
  name_ko: string;
  description_en: string;
  description_ko: string;
  // Which standards this mechanism typically applies to
  standards: StandardId[];
};

export const STANDARDS: Record<StandardId, { name_en: string; name_ko: string; article: string }> = {
  1: {
    article: "RED Art. 3.3(d)",
    name_en: "EN 18031-1 — Protection of the network",
    name_ko: "EN 18031-1 — 네트워크 자원 보호",
  },
  2: {
    article: "RED Art. 3.3(e)",
    name_en: "EN 18031-2 — Protection of personal data and privacy",
    name_ko: "EN 18031-2 — 개인정보 및 프라이버시 보호",
  },
  3: {
    article: "RED Art. 3.3(f)",
    name_en: "EN 18031-3 — Protection from fraud",
    name_ko: "EN 18031-3 — 금전적 사기 방지",
  },
};

export const MECHANISMS: Mechanism[] = [
  {
    code: "ACM",
    name_en: "Access Control Mechanism",
    name_ko: "접근 통제 메커니즘",
    description_en: "Restricts access to security assets and network assets to authorized entities only.",
    description_ko: "보안 자산 및 네트워크 자산에 대한 접근을 인가된 주체로만 제한합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "AUM",
    name_en: "Authentication Mechanism",
    name_ko: "인증 메커니즘",
    description_en: "Verifies the claimed identity of users, services, or devices before granting access.",
    description_ko: "접근 허용 전 사용자·서비스·기기의 주장된 신원을 검증합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "SUM",
    name_en: "Secure Update Mechanism",
    name_ko: "보안 업데이트 메커니즘",
    description_en: "Ensures authenticity and integrity of firmware/software updates.",
    description_ko: "펌웨어·소프트웨어 업데이트의 진본성과 무결성을 보장합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "SSM",
    name_en: "Secure Storage Mechanism",
    name_ko: "보안 저장 메커니즘",
    description_en: "Protects security parameters and sensitive data stored on the device.",
    description_ko: "기기에 저장되는 보안 파라미터 및 민감 데이터를 보호합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "SCM",
    name_en: "Secure Communication Mechanism",
    name_ko: "보안 통신 메커니즘",
    description_en: "Protects confidentiality, integrity, and authenticity of data in transit.",
    description_ko: "전송 중 데이터의 기밀성·무결성·진본성을 보호합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "RLM",
    name_en: "Resilience Mechanism",
    name_ko: "복원력 메커니즘",
    description_en: "Maintains availability and recovers from attacks or failure conditions.",
    description_ko: "공격이나 장애 상황에서 가용성을 유지하고 복구합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "NMM",
    name_en: "Network Monitoring Mechanism",
    name_ko: "네트워크 모니터링 메커니즘",
    description_en: "Detects anomalies and malicious traffic on the network.",
    description_ko: "네트워크 상의 이상 징후 및 악성 트래픽을 탐지합니다.",
    standards: [1],
  },
  {
    code: "TCM",
    name_en: "Traffic Control Mechanism",
    name_ko: "트래픽 제어 메커니즘",
    description_en: "Controls network traffic to prevent misuse of network resources.",
    description_ko: "네트워크 자원의 오·남용을 막기 위해 트래픽을 제어합니다.",
    standards: [1],
  },
  {
    code: "CCK",
    name_en: "Confidential Cryptographic Keys",
    name_ko: "기밀 암호 키 관리",
    description_en: "Generates, stores and uses cryptographic keys securely.",
    description_ko: "암호 키를 안전하게 생성·저장·사용합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "GEC",
    name_en: "General Equipment Capabilities",
    name_ko: "공통 장비 능력",
    description_en: "General security-related capabilities of the equipment (documentation, default state).",
    description_ko: "장비의 일반 보안 관련 능력(문서화, 기본 상태 등).",
    standards: [1, 2, 3],
  },
  {
    code: "CRY",
    name_en: "Cryptography",
    name_ko: "암호 기술",
    description_en: "Uses appropriate cryptographic primitives and best practices.",
    description_ko: "적합한 암호 프리미티브와 모범 사례를 사용합니다.",
    standards: [1, 2, 3],
  },
  {
    code: "LGM",
    name_en: "Logging Mechanism",
    name_ko: "로깅 메커니즘",
    description_en: "Records security-relevant events for later inspection.",
    description_ko: "보안 관련 이벤트를 기록하여 사후 점검을 지원합니다.",
    standards: [2, 3],
  },
  {
    code: "DLM",
    name_en: "Deletion Mechanism",
    name_ko: "삭제 메커니즘",
    description_en: "Allows deletion of personal/user data upon request.",
    description_ko: "요청 시 개인·사용자 데이터의 삭제를 허용합니다.",
    standards: [2],
  },
  {
    code: "UNM",
    name_en: "User Notification Mechanism",
    name_ko: "사용자 알림 메커니즘",
    description_en: "Informs users about security-relevant states and changes.",
    description_ko: "보안 관련 상태 및 변경 사항을 사용자에게 알립니다.",
    standards: [2],
  },
];

export function mechanismByCode(code: string): Mechanism | undefined {
  return MECHANISMS.find((m) => m.code === code);
}
