// Simple bilingual label helper. UI shows both KO/EN by default per user requirement.

export type Locale = "ko" | "en";

export type Bilingual = {
  ko: string;
  en: string;
};

// Common UI strings (KO primary, EN secondary)
export const t = {
  appName: { ko: "Z-GRC", en: "Z-GRC" },
  tagline: { ko: "EN 18031 자가 평가 도구", en: "EN 18031 Self-Assessment Tool" },
  actions: {
    add: { ko: "추가", en: "Add" },
    addProject: { ko: "프로젝트(제품) 추가", en: "Add Project (Product)" },
    save: { ko: "저장", en: "Save" },
    next: { ko: "다음", en: "Next" },
    prev: { ko: "이전", en: "Previous" },
    confirm: { ko: "확인", en: "Confirm" },
    cancel: { ko: "취소", en: "Cancel" },
    delete: { ko: "삭제", en: "Delete" },
    edit: { ko: "수정", en: "Edit" },
    viewResult: { ko: "결과 보기", en: "View Result" },
    startScreening: { ko: "스크리닝 시작", en: "Start Screening" },
    continueScreening: { ko: "스크리닝 이어하기", en: "Continue Screening" },
  },
  labels: {
    home: { ko: "홈", en: "Home" },
    myPage: { ko: "마이페이지", en: "My Page" },
    projects: { ko: "프로젝트 목록", en: "Projects" },
    noProjects: { ko: "등록된 프로젝트가 없습니다.", en: "No projects yet." },
    productName: { ko: "제품명", en: "Product Name" },
    manufacturer: { ko: "제조사", en: "Manufacturer" },
    contactName: { ko: "담당자 이름", en: "Contact Name" },
    contactEmail: { ko: "담당자 이메일", en: "Contact Email" },
    productType: { ko: "제품 유형", en: "Product Type" },
    productDescription: { ko: "제품 설명", en: "Product Description" },
    screening: { ko: "적용성 스크리닝", en: "Applicability Screening" },
    sectionA: { ko: "표준 적용성", en: "Standard Applicability" },
    sectionB: { ko: "기능 프로파일", en: "Capability Profile" },
    yes: { ko: "예", en: "Yes" },
    no: { ko: "아니오", en: "No" },
    result: { ko: "결과", en: "Result" },
    applicableStandards: { ko: "적용 대상 표준", en: "Applicable Standards" },
    candidateMechanisms: { ko: "후보 메커니즘", en: "Candidate Mechanisms" },
    notApplicable: { ko: "해당 없음", en: "Not Applicable" },
    createdAt: { ko: "등록일", en: "Created" },
    assessmentProgress: { ko: "평가 진행", en: "Assessment Progress" },
  },
  messages: {
    screeningDone: {
      ko: "스크리닝이 완료되었습니다.",
      en: "Screening complete.",
    },
    noStandardApplies: {
      ko: "어떤 EN 18031 표준도 적용되지 않습니다. 응답을 다시 확인하세요.",
      en: "No EN 18031 standard applies. Please review your answers.",
    },
  },
} as const;

export function both(b: Bilingual): string {
  return `${b.ko} / ${b.en}`;
}
