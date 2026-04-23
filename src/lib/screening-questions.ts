import type { StandardId } from "./mechanisms";

export type ScreeningSection = "A" | "B";

export type ScreeningQuestion = {
  id: string;
  section: ScreeningSection;
  text_en: string;
  text_ko: string;
  hint_en?: string;
  hint_ko?: string;
  // If answer === "yes", these standards are considered applicable.
  triggersStandards?: StandardId[];
  // If answer === "yes", these mechanism codes are considered candidates.
  triggersMechanisms?: string[];
};

// Section A — Standard applicability screening
// Section B — Mechanism candidate screening
// Section B order follows the result matrix order:
//   ACM → AUM → SUM → SSM → SCM → RLM → NMM/TCM → CCK → GEC → CRY → LGM → DLM → UNM
export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  // --- Section A: determines EN 18031-1 / -2 / -3 applicability ---
  {
    id: "A1",
    section: "A",
    text_en:
      "Is the equipment capable of communicating over the internet, directly or indirectly?",
    text_ko: "본 기기는 직접적으로 또는 간접적으로 인터넷 통신이 가능한가요?",
    hint_en:
      "Any radio equipment that reaches the internet via its own interface or a companion device.",
    hint_ko: "자체 인터페이스나 연결 기기를 통해 인터넷에 도달하는 모든 무선 기기.",
    triggersStandards: [1],
  },
  {
    id: "A2",
    section: "A",
    text_en:
      "Does the equipment provide or use wired/wireless network interfaces (e.g., Wi-Fi, Bluetooth, Ethernet, cellular)?",
    text_ko:
      "본 기기는 유·무선 네트워크 인터페이스(예: Wi-Fi, Bluetooth, 이더넷, 셀룰러)를 제공하거나 사용하나요?",
    triggersStandards: [1],
  },
  {
    id: "A3",
    section: "A",
    text_en:
      "Does the equipment collect, process, or store personal data of end users?",
    text_ko: "본 기기는 최종 사용자의 개인정보를 수집·처리·저장하나요?",
    hint_en:
      "Personal data includes identifiers, account info, location, health data, etc.",
    hint_ko: "개인정보에는 식별자, 계정정보, 위치, 건강정보 등이 포함됩니다.",
    triggersStandards: [2],
  },
  {
    id: "A4",
    section: "A",
    text_en:
      "Is the equipment designed for, or primarily used by, children (e.g., toys, educational devices)?",
    text_ko:
      "본 기기는 아동을 대상으로 설계되었거나 주로 아동이 사용하는가요? (예: 장난감, 교육용 기기)",
    triggersStandards: [2],
  },
  {
    id: "A5",
    section: "A",
    text_en:
      "Is the equipment a wearable or worn on the body (e.g., smartwatch, fitness tracker, hearing aid)?",
    text_ko:
      "본 기기는 웨어러블이거나 신체에 착용하는 형태인가요? (예: 스마트워치, 피트니스 트래커, 보청기)",
    triggersStandards: [2],
  },
  {
    id: "A6",
    section: "A",
    text_en:
      "Does the equipment process biometric data (e.g., fingerprint, face, voice) or health/medical data?",
    text_ko:
      "본 기기는 생체정보(지문·얼굴·음성 등)나 건강·의료 데이터를 처리하나요?",
    triggersStandards: [2],
  },
  {
    id: "A7",
    section: "A",
    text_en:
      "Does the equipment enable the transfer of money, monetary value, or virtual currency (payment, banking, crypto, in-app purchase)?",
    text_ko:
      "본 기기는 금전·금전적 가치·가상자산의 이전을 가능하게 하나요? (결제, 뱅킹, 암호화폐, 인앱구매 등)",
    triggersStandards: [3],
  },

  // --- Section B: ordered as the result matrix (ACM→AUM→SUM→SSM→SCM→RLM→NMM/TCM→CCK→GEC→CRY→LGM→DLM→UNM) ---
  {
    id: "B1",
    section: "B",
    text_en:
      "Does the equipment have security assets (sensitive functions, data, or configurations) whose access must be restricted to authorized entities?",
    text_ko:
      "본 기기는 접근을 인가된 주체로만 제한해야 하는 보안 자산(민감 기능·데이터·설정)이 있나요?",
    hint_en:
      "ACM restricts which users, roles, services, or devices can access specific resources on the equipment.",
    hint_ko:
      "ACM은 기기 내 특정 자원에 접근할 수 있는 사용자·역할·서비스·기기를 제한합니다.",
    triggersMechanisms: ["ACM"],
  },
  {
    id: "B2",
    section: "B",
    text_en: "Does the equipment authenticate users, services, or other devices?",
    text_ko: "본 기기는 사용자·서비스·타 기기를 인증하나요?",
    triggersMechanisms: ["AUM"],
  },
  {
    id: "B3",
    section: "B",
    text_en:
      "Can the equipment receive firmware or software updates (OTA or local)?",
    text_ko:
      "본 기기는 펌웨어 또는 소프트웨어 업데이트를 받을 수 있나요? (OTA 또는 로컬)",
    triggersMechanisms: ["SUM"],
  },
  {
    id: "B4",
    section: "B",
    text_en:
      "Does the equipment store security parameters such as passwords, certificates, tokens, or other sensitive data?",
    text_ko:
      "본 기기는 비밀번호·인증서·토큰·기타 민감 데이터 등 보안 파라미터를 저장하나요?",
    hint_en:
      "Cryptographic keys are evaluated separately under CCK (B8).",
    hint_ko:
      "암호 키에 대한 관리(CCK)는 B8에서 별도로 판별합니다.",
    triggersMechanisms: ["SSM"],
  },
  {
    id: "B5",
    section: "B",
    text_en: "Does the equipment transmit or receive sensitive data over networks?",
    text_ko: "본 기기는 네트워크를 통해 민감한 데이터를 송·수신하나요?",
    hint_en:
      "Resilience (RLM) and traffic control (NMM/TCM) are evaluated separately in B6 and B7.",
    hint_ko:
      "복원력(RLM)과 트래픽 제어(NMM/TCM)는 B6, B7에서 별도로 판별합니다.",
    triggersMechanisms: ["SCM"],
  },
  {
    id: "B6",
    section: "B",
    text_en:
      "Does the equipment need to maintain availability or recover from denial-of-service, overload, or other abnormal conditions?",
    text_ko:
      "본 기기는 서비스 거부(DoS)·과부하·이상 상황에서도 가용성을 유지하거나 복구되어야 하나요?",
    hint_en:
      "RLM applies when continued operation is required under attack, fault, or abnormal traffic.",
    hint_ko:
      "RLM은 공격·장애·이상 트래픽 상황에서도 연속 운용이 요구되는 경우에 해당합니다.",
    triggersMechanisms: ["RLM"],
  },
  {
    id: "B7",
    section: "B",
    text_en:
      "Is the equipment network infrastructure that routes, forwards, or filters traffic for other devices (e.g., router, switch, gateway, access point, firewall)?",
    text_ko:
      "본 기기는 다른 기기의 트래픽을 라우팅·전달·필터링하는 네트워크 인프라 장비인가요? (예: 라우터, 스위치, 게이트웨이, AP, 방화벽)",
    hint_en:
      "NMM (monitoring) and TCM (traffic control) apply primarily to network-handling equipment, not to endpoint devices.",
    hint_ko:
      "NMM(모니터링)과 TCM(트래픽 제어)은 주로 트래픽을 처리하는 네트워크 장비에만 해당하며, 엔드포인트 기기에는 해당하지 않습니다.",
    triggersMechanisms: ["NMM", "TCM"],
  },
  {
    id: "B8",
    section: "B",
    text_en:
      "Does the equipment generate, store, or use confidential cryptographic keys (symmetric keys, private keys, master secrets)?",
    text_ko:
      "본 기기는 기밀 암호 키(대칭 키·개인 키·마스터 시크릿 등)를 생성·저장·사용하나요?",
    hint_en:
      "CCK concerns management of keys that must remain confidential. Public keys alone do not trigger CCK.",
    hint_ko:
      "CCK는 기밀성이 유지되어야 하는 키의 관리에 해당합니다. 공개 키만 사용하는 경우에는 해당하지 않습니다.",
    triggersMechanisms: ["CCK"],
  },
  {
    id: "B9",
    section: "B",
    text_en:
      "Does the equipment have documented general capabilities (configuration options, default secure state)?",
    text_ko:
      "본 기기는 일반 장비 능력(설정 옵션·기본 보안 상태)이 문서화되어 있나요?",
    hint_en: "GEC typically applies to all equipment covered by EN 18031.",
    hint_ko: "GEC는 통상 EN 18031 대상 전 기기에 해당합니다.",
    triggersMechanisms: ["GEC"],
  },
  {
    id: "B10",
    section: "B",
    text_en:
      "Does the equipment use cryptographic operations (encryption, signing, hashing, key agreement)?",
    text_ko:
      "본 기기는 암호학적 연산(암호화·서명·해시·키 합의 등)을 사용하나요?",
    triggersMechanisms: ["CRY"],
  },
  {
    id: "B11",
    section: "B",
    text_en:
      "Does the equipment log security-relevant events (access, authentication, update, errors)?",
    text_ko:
      "본 기기는 보안 관련 이벤트(접근·인증·업데이트·오류 등)를 로깅하나요?",
    triggersMechanisms: ["LGM"],
  },
  {
    id: "B12",
    section: "B",
    text_en:
      "Can users delete their personal or user-generated data from the equipment?",
    text_ko: "사용자가 본 기기에서 자신의 개인정보·사용자 데이터를 삭제할 수 있나요?",
    triggersMechanisms: ["DLM"],
  },
  {
    id: "B13",
    section: "B",
    text_en:
      "Does the equipment notify the user of security-relevant states (UI, LED, sound, companion app)?",
    text_ko:
      "본 기기는 보안 관련 상태를 사용자에게 알리나요? (UI·LED·사운드·연동 앱 등)",
    triggersMechanisms: ["UNM"],
  },
];

export type ScreeningAnswerMap = Record<string, "yes" | "no">;

export type ScreeningResult = {
  applicableStandards: StandardId[];
  candidateMechanisms: string[];
};

export function evaluateScreening(answers: ScreeningAnswerMap): ScreeningResult {
  const standards = new Set<StandardId>();
  const mechanisms = new Set<string>();

  for (const q of SCREENING_QUESTIONS) {
    if (answers[q.id] !== "yes") continue;
    q.triggersStandards?.forEach((s) => standards.add(s));
    q.triggersMechanisms?.forEach((m) => mechanisms.add(m));
  }

  // GEC applies whenever any standard applies
  if (standards.size > 0) mechanisms.add("GEC");

  return {
    applicableStandards: Array.from(standards).sort((a, b) => a - b),
    candidateMechanisms: Array.from(mechanisms).sort(),
  };
}
