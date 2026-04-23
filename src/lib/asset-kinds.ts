// Asset kinds collected in the inventory step.
// The inventory feeds later Decision Tree evaluation for mechanisms like
// ACM, AUM, SCM, NMM, TCM, RLM, SUM, CCK, SSM, DLM, UNM, etc.

import type { StandardId } from "./mechanisms";

export type AssetKind =
  | "security_asset"
  | "network_asset"
  | "privacy_asset"
  | "financial_asset"
  | "network_interface"
  | "network_service"
  | "data_flow"
  | "physical_interface"
  // Mechanism instances — entered after assets, feed DT iterations
  | "access_control_mechanism"
  | "authentication_mechanism"
  | "secure_update_mechanism"
  | "secure_storage_mechanism"
  | "secure_communication_mechanism"
  | "logging_mechanism"
  | "deletion_mechanism"
  | "user_notification_mechanism";

export type InventoryCategory = "asset" | "mechanism";

export type AssetFieldType = "text" | "select" | "textarea";

export type AssetFieldOption = {
  value: string;
  label_ko: string;
  label_en: string;
};

export type AssetFieldSpec = {
  name: string; // key inside metadata JSON
  label_ko: string;
  label_en: string;
  type: AssetFieldType;
  required?: boolean;
  placeholder?: string;
  options?: AssetFieldOption[];
};

export type AssetKindConfig = {
  kind: AssetKind;
  category: InventoryCategory; // "asset" | "mechanism"
  // For mechanism kinds, the EN 18031 mechanism code ("ACM", "AUM", ...)
  // that this inventory feeds. Used to filter by screening candidates.
  mechanismCode?: string;
  // Which standards this kind is relevant to. If omitted, treated as [1,2,3]
  // (applies across all standards). Used to filter inventory sections by the
  // project's applicable standards (from screening).
  standards?: StandardId[];
  title_ko: string;
  title_en: string;
  description_ko: string;
  description_en: string;
  namePlaceholder: string;
  metadataFields: AssetFieldSpec[];
  listColumns: string[];
};

// Display order: protected assets first (SA→NA→PA→FA),
// then concrete interfaces/services/flows, then physical interfaces.
export const ASSET_KINDS: AssetKindConfig[] = [
  {
    kind: "security_asset",
    category: "asset",
    title_ko: "보안 자산",
    title_en: "Security Assets",
    description_ko:
      "보호되어야 할 보안 파라미터·기능·데이터 (비밀번호, 키, 인증서, 보안 설정, 펌웨어 이미지 등). ACM·SSM·SUM·CCK 평가 입력.",
    description_en:
      "Security parameters, functions and data to protect (passwords, keys, certificates, security configs, firmware images). Feeds ACM / SSM / SUM / CCK evaluation.",
    namePlaceholder: "예: 관리자 비밀번호 / TLS 클라이언트 인증서",
    listColumns: ["protection", "type", "sensitivity", "storage"],
    metadataFields: [
      {
        name: "protection",
        label_ko: "보호 요구",
        label_en: "Protection Needs",
        type: "select",
        required: true,
        options: [
          { value: "confidentiality", label_ko: "기밀성 (C)", label_en: "Confidentiality (C)" },
          { value: "integrity", label_ko: "무결성 (I)", label_en: "Integrity (I)" },
          { value: "both", label_ko: "기밀성 + 무결성 (C+I)", label_en: "Both (C+I)" },
        ],
      },
      {
        name: "type",
        label_ko: "자산 유형",
        label_en: "Asset Type",
        type: "select",
        required: true,
        options: [
          { value: "credential", label_ko: "계정/비밀번호", label_en: "Credential / Password" },
          { value: "key", label_ko: "암호 키", label_en: "Cryptographic Key" },
          { value: "certificate", label_ko: "인증서", label_en: "Certificate" },
          { value: "token", label_ko: "세션/액세스 토큰", label_en: "Session / Access Token" },
          { value: "security_config", label_ko: "보안 설정값", label_en: "Security Configuration" },
          { value: "firmware_image", label_ko: "펌웨어 이미지", label_en: "Firmware Image" },
          { value: "security_function", label_ko: "보안 기능", label_en: "Security Function" },
          { value: "audit_log", label_ko: "감사 로그", label_en: "Audit Log" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "sensitivity",
        label_ko: "민감도",
        label_en: "Sensitivity",
        type: "select",
        required: true,
        options: [
          { value: "low", label_ko: "낮음", label_en: "Low" },
          { value: "medium", label_ko: "보통", label_en: "Medium" },
          { value: "high", label_ko: "높음", label_en: "High" },
          { value: "critical", label_ko: "매우 중요", label_en: "Critical" },
        ],
      },
      {
        name: "storage",
        label_ko: "저장 위치",
        label_en: "Storage",
        type: "select",
        options: [
          { value: "nvm", label_ko: "비휘발성(NVM/Flash)", label_en: "Non-volatile (NVM/Flash)" },
          { value: "secure_element", label_ko: "보안 요소(SE/TPM)", label_en: "Secure Element (SE/TPM)" },
          { value: "ram", label_ko: "휘발성(RAM)", label_en: "Volatile (RAM)" },
          { value: "external", label_ko: "외부(SD 등)", label_en: "External (SD etc.)" },
          { value: "remote", label_ko: "원격 저장", label_en: "Remote storage" },
          { value: "factory", label_ko: "공장 프로비저닝", label_en: "Factory-provisioned" },
        ],
      },
    ],
  },
  {
    kind: "network_asset",
    category: "asset",
    standards: [1],
    title_ko: "네트워크 자산",
    title_en: "Network Assets",
    description_ko:
      "네트워크 상에서 보호해야 하는 자원·기능 (노출된 관리 API, 텔레메트리 채널, 제어 엔드포인트 등). RLM·NMM·TCM 평가 입력.",
    description_en:
      "Network-reachable resources and functions to protect (exposed management APIs, telemetry channels, control endpoints). Feeds RLM / NMM / TCM evaluation.",
    namePlaceholder: "예: 관리 API 엔드포인트 / 제어 명령 채널",
    listColumns: ["role", "accessibility"],
    metadataFields: [
      {
        name: "role",
        label_ko: "역할",
        label_en: "Role",
        type: "select",
        required: true,
        options: [
          { value: "exposed", label_ko: "기기가 노출 (서버 측)", label_en: "Exposed by device (server side)" },
          { value: "consumed", label_ko: "기기가 소비 (클라이언트 측)", label_en: "Consumed by device (client side)" },
          { value: "internal", label_ko: "내부 전용", label_en: "Internal only" },
        ],
      },
      {
        name: "accessibility",
        label_ko: "접근성",
        label_en: "Accessibility",
        type: "select",
        required: true,
        options: [
          { value: "public", label_ko: "인터넷 공개", label_en: "Internet-facing" },
          { value: "authenticated", label_ko: "인증 후 접근", label_en: "Authenticated access" },
          { value: "local_only", label_ko: "로컬 네트워크 전용", label_en: "Local network only" },
          { value: "internal", label_ko: "기기 내부", label_en: "Device-internal" },
        ],
      },
    ],
  },
  {
    kind: "privacy_asset",
    category: "asset",
    standards: [2],
    title_ko: "개인정보 자산",
    title_en: "Privacy Assets",
    description_ko:
      "기기가 수집·처리·저장하는 개인정보 항목 (이름·연락처·위치·생체정보 등). EN 18031-2 범위, DLM·UNM 평가 입력.",
    description_en:
      "Personal data items collected, processed, or stored by the device (identity, contact, location, biometric, etc.). Feeds EN 18031-2 / DLM / UNM evaluation.",
    namePlaceholder: "예: 사용자 이메일 주소 / 위치 정보",
    listColumns: ["dataType", "sensitivity", "storage"],
    metadataFields: [
      {
        name: "dataType",
        label_ko: "개인정보 유형",
        label_en: "Data Type",
        type: "select",
        required: true,
        options: [
          { value: "identity", label_ko: "신원 식별자 (이름·주민번호 등)", label_en: "Identity (name, national ID)" },
          { value: "contact", label_ko: "연락처 (이메일·전화·주소)", label_en: "Contact (email, phone, address)" },
          { value: "location", label_ko: "위치 정보", label_en: "Location" },
          { value: "biometric", label_ko: "생체 정보 (지문·얼굴·음성)", label_en: "Biometric (fingerprint, face, voice)" },
          { value: "health", label_ko: "건강·의료 정보", label_en: "Health / medical" },
          { value: "financial_pii", label_ko: "금융 관련 개인정보", label_en: "Financial PII" },
          { value: "behavioral", label_ko: "행동·이용 기록", label_en: "Behavioral / usage" },
          { value: "device_id", label_ko: "기기 식별자 (IMEI·MAC·AdID)", label_en: "Device ID (IMEI, MAC, AdID)" },
          { value: "children", label_ko: "아동 정보", label_en: "Children's data" },
          { value: "credentials_pii", label_ko: "사용자 자격증명", label_en: "User credentials" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "sensitivity",
        label_ko: "민감도",
        label_en: "Sensitivity",
        type: "select",
        required: true,
        options: [
          { value: "standard", label_ko: "일반 개인정보", label_en: "Standard personal data" },
          { value: "sensitive", label_ko: "민감정보 (건강·생체·아동 등)", label_en: "Sensitive (health, biometric, children)" },
        ],
      },
      {
        name: "storage",
        label_ko: "저장 위치",
        label_en: "Storage Location",
        type: "select",
        options: [
          { value: "on_device", label_ko: "기기 내부", label_en: "On the device" },
          { value: "backend", label_ko: "자사 백엔드", label_en: "Own backend" },
          { value: "third_party", label_ko: "제3자 (클라우드/처리자)", label_en: "Third party (cloud / processor)" },
          { value: "hybrid", label_ko: "혼합", label_en: "Hybrid" },
          { value: "transient", label_ko: "일시적 (저장 안함)", label_en: "Transient (not stored)" },
        ],
      },
    ],
  },
  {
    kind: "financial_asset",
    category: "asset",
    standards: [3],
    title_ko: "금융 자산",
    title_en: "Financial Assets",
    description_ko:
      "금전·금전적 가치 또는 결제 관련 자산 (결제 토큰, 거래 기록, 잔액, 결제 수단, 지갑 등). EN 18031-3 평가 대상.",
    description_en:
      "Monetary or monetary-equivalent assets (payment tokens, transaction records, balances, payment methods, wallets). In scope of EN 18031-3.",
    namePlaceholder: "예: 결제 카드 토큰 / 거래 기록 / 지갑 잔액",
    listColumns: ["type", "value_form", "storage"],
    metadataFields: [
      {
        name: "type",
        label_ko: "자산 유형",
        label_en: "Asset Type",
        type: "select",
        required: true,
        options: [
          { value: "payment_token", label_ko: "결제 토큰", label_en: "Payment Token" },
          { value: "payment_method", label_ko: "결제 수단(카드/계좌)", label_en: "Payment Method (card/account)" },
          { value: "transaction_record", label_ko: "거래 기록", label_en: "Transaction Record" },
          { value: "balance", label_ko: "잔액/충전금", label_en: "Balance / Stored Value" },
          { value: "receipt", label_ko: "영수증", label_en: "Receipt" },
          { value: "wallet", label_ko: "지갑 (암호화폐 등)", label_en: "Wallet (crypto etc.)" },
          { value: "subscription", label_ko: "구독·결제 설정", label_en: "Subscription / Billing Config" },
          { value: "voucher", label_ko: "바우처/쿠폰", label_en: "Voucher / Coupon" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "value_form",
        label_ko: "가치 형태",
        label_en: "Value Form",
        type: "select",
        required: true,
        options: [
          { value: "direct_money", label_ko: "직접 금전(법정화폐)", label_en: "Direct money (fiat)" },
          { value: "money_equivalent", label_ko: "금전 등가", label_en: "Money equivalent" },
          { value: "loyalty", label_ko: "포인트·마일리지", label_en: "Loyalty points / miles" },
          { value: "crypto", label_ko: "암호화폐", label_en: "Cryptocurrency" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "storage",
        label_ko: "저장 위치",
        label_en: "Storage Location",
        type: "select",
        options: [
          { value: "local_device", label_ko: "기기 내부", label_en: "On the device" },
          { value: "backend", label_ko: "자사 백엔드", label_en: "Own backend" },
          { value: "third_party", label_ko: "제3자 (PG/은행/지갑)", label_en: "Third party (PSP/bank/wallet)" },
          { value: "hybrid", label_ko: "혼합", label_en: "Hybrid" },
        ],
      },
    ],
  },
  {
    kind: "network_interface",
    category: "asset",
    title_ko: "네트워크 인터페이스",
    title_en: "Network Interfaces",
    description_ko:
      "기기가 제공하거나 사용하는 통신 인터페이스 (Wi-Fi, Bluetooth, 이더넷, 셀룰러, RFID 등). NMM·RLM·TCM 평가 입력.",
    description_en:
      "Communication interfaces provided or used by the device. Feeds NMM / RLM / TCM evaluation.",
    namePlaceholder: "예: Wi-Fi 2.4GHz / e.g., Wi-Fi 2.4GHz",
    listColumns: ["type", "role"],
    metadataFields: [
      {
        name: "type",
        label_ko: "인터페이스 유형",
        label_en: "Interface Type",
        type: "select",
        required: true,
        options: [
          { value: "wifi", label_ko: "Wi-Fi", label_en: "Wi-Fi" },
          { value: "bluetooth", label_ko: "Bluetooth / BLE", label_en: "Bluetooth / BLE" },
          { value: "ethernet", label_ko: "이더넷", label_en: "Ethernet" },
          { value: "cellular", label_ko: "셀룰러 (LTE/5G)", label_en: "Cellular (LTE/5G)" },
          { value: "zigbee", label_ko: "Zigbee", label_en: "Zigbee" },
          { value: "zwave", label_ko: "Z-Wave", label_en: "Z-Wave" },
          { value: "lora", label_ko: "LoRa / LoRaWAN", label_en: "LoRa / LoRaWAN" },
          { value: "nfc", label_ko: "NFC", label_en: "NFC" },
          { value: "rfid", label_ko: "RFID", label_en: "RFID" },
          { value: "uwb", label_ko: "UWB", label_en: "UWB" },
          { value: "usb", label_ko: "USB (네트워크)", label_en: "USB (networking)" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "role",
        label_ko: "역할",
        label_en: "Role",
        type: "select",
        required: true,
        options: [
          { value: "client", label_ko: "클라이언트", label_en: "Client" },
          { value: "server_ap", label_ko: "서버 / AP", label_en: "Server / AP" },
          { value: "both", label_ko: "양방향", label_en: "Both" },
        ],
      },
    ],
  },
  {
    kind: "network_service",
    category: "asset",
    title_ko: "네트워크 서비스",
    title_en: "Network Services",
    description_ko:
      "기기에서 실행되거나 기기가 접속하는 네트워크 서비스 (프로토콜·포트·방향·필수 여부).",
    description_en:
      "Network services exposed by or consumed by the device (protocol, port, direction, required/optional).",
    namePlaceholder: "예: Web UI / MQTT 브로커 연결 / e.g., Web UI, MQTT broker",
    listColumns: ["protocol", "optionality", "direction", "port"],
    metadataFields: [
      {
        name: "protocol",
        label_ko: "프로토콜",
        label_en: "Protocol",
        type: "select",
        required: true,
        options: [
          { value: "https", label_ko: "HTTPS", label_en: "HTTPS" },
          { value: "http", label_ko: "HTTP", label_en: "HTTP" },
          { value: "wss", label_ko: "WSS (WebSocket Secure)", label_en: "WSS (WebSocket Secure)" },
          { value: "ws", label_ko: "WS (WebSocket)", label_en: "WS (WebSocket)" },
          { value: "mqtts", label_ko: "MQTTS", label_en: "MQTTS" },
          { value: "mqtt", label_ko: "MQTT", label_en: "MQTT" },
          { value: "coaps", label_ko: "CoAPs", label_en: "CoAPs" },
          { value: "coap", label_ko: "CoAP", label_en: "CoAP" },
          { value: "ocpp_2_0_1", label_ko: "OCPP 2.0.1", label_en: "OCPP 2.0.1" },
          { value: "ocpp_1_6", label_ko: "OCPP 1.6", label_en: "OCPP 1.6" },
          { value: "ocpi", label_ko: "OCPI (로밍)", label_en: "OCPI (roaming)" },
          { value: "iso15118", label_ko: "ISO 15118 (Plug & Charge)", label_en: "ISO 15118 (Plug & Charge)" },
          { value: "modbus", label_ko: "Modbus", label_en: "Modbus" },
          { value: "ssh", label_ko: "SSH", label_en: "SSH" },
          { value: "telnet", label_ko: "Telnet", label_en: "Telnet" },
          { value: "ftp", label_ko: "FTP", label_en: "FTP" },
          { value: "sftp", label_ko: "SFTP", label_en: "SFTP" },
          { value: "dns", label_ko: "DNS", label_en: "DNS" },
          { value: "ntp", label_ko: "NTP", label_en: "NTP" },
          { value: "tcp", label_ko: "TCP (custom)", label_en: "TCP (custom)" },
          { value: "udp", label_ko: "UDP (custom)", label_en: "UDP (custom)" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "optionality",
        label_ko: "필수 여부",
        label_en: "Optionality",
        type: "select",
        required: true,
        options: [
          {
            value: "required",
            label_ko: "필수 (기기 동작에 반드시 필요)",
            label_en: "Required (essential for device operation)",
          },
          {
            value: "optional",
            label_ko: "선택 (사용자가 비활성화 가능)",
            label_en: "Optional (can be disabled by user)",
          },
        ],
      },
      {
        name: "direction",
        label_ko: "방향",
        label_en: "Direction",
        type: "select",
        required: true,
        options: [
          { value: "inbound", label_ko: "수신 (서버)", label_en: "Inbound (Server)" },
          { value: "outbound", label_ko: "송신 (클라이언트)", label_en: "Outbound (Client)" },
          { value: "both", label_ko: "양방향", label_en: "Both" },
        ],
      },
      {
        name: "port",
        label_ko: "포트",
        label_en: "Port",
        type: "text",
        placeholder: "예: 443, 8883",
      },
    ],
  },
  {
    kind: "data_flow",
    category: "asset",
    title_ko: "데이터 흐름",
    title_en: "Data Flows",
    description_ko: "기기가 송·수신하는 데이터의 상대방과 목적. SCM·DLM 평가의 기반이 됩니다.",
    description_en:
      "Peers the device communicates with and the purpose of each flow. Feeds SCM / DLM evaluation.",
    namePlaceholder: "예: 클라우드 텔레메트리 업로드 / e.g., Telemetry upload to cloud",
    listColumns: ["peer", "direction", "dataCategory"],
    metadataFields: [
      {
        name: "peer",
        label_ko: "통신 상대",
        label_en: "Peer",
        type: "text",
        required: true,
        placeholder: "예: AWS IoT, 사용자 모바일 앱, 벤더 포털",
      },
      {
        name: "direction",
        label_ko: "방향",
        label_en: "Direction",
        type: "select",
        required: true,
        options: [
          { value: "outbound", label_ko: "송신", label_en: "Outbound" },
          { value: "inbound", label_ko: "수신", label_en: "Inbound" },
          { value: "bidirectional", label_ko: "양방향", label_en: "Bidirectional" },
        ],
      },
      {
        name: "dataCategory",
        label_ko: "데이터 분류",
        label_en: "Data Category",
        type: "select",
        required: true,
        options: [
          { value: "telemetry", label_ko: "텔레메트리·센서", label_en: "Telemetry / Sensor" },
          { value: "personal", label_ko: "개인정보", label_en: "Personal Data" },
          { value: "auth", label_ko: "인증·자격증명", label_en: "Credentials" },
          { value: "config", label_ko: "설정", label_en: "Configuration" },
          { value: "firmware", label_ko: "펌웨어·업데이트", label_en: "Firmware / Update" },
          { value: "logs", label_ko: "로그·진단", label_en: "Logs / Diagnostics" },
          { value: "command", label_ko: "제어 명령", label_en: "Control Command" },
          { value: "payment", label_ko: "금전·결제", label_en: "Financial / Payment" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
    ],
  },
  {
    kind: "physical_interface",
    category: "asset",
    title_ko: "물리적 인터페이스",
    title_en: "Physical Interfaces",
    description_ko:
      "비통신 목적의 물리 포트 (USB 데이터, 시리얼, JTAG, SD 카드, GPIO, 디버그 핀 등). 물리 접근 기반 공격 면 평가에 사용됩니다.",
    description_en:
      "Non-networking physical ports (USB data, serial, JTAG, SD card, GPIO, debug pins). Used for evaluating physical attack surface.",
    namePlaceholder: "예: USB Type-A (Data) / JTAG Debug Header",
    listColumns: ["type", "accessibility", "purpose"],
    metadataFields: [
      {
        name: "type",
        label_ko: "포트 유형",
        label_en: "Port Type",
        type: "select",
        required: true,
        options: [
          { value: "usb", label_ko: "USB (데이터)", label_en: "USB (data)" },
          { value: "serial_uart", label_ko: "Serial / UART", label_en: "Serial / UART" },
          { value: "jtag", label_ko: "JTAG", label_en: "JTAG" },
          { value: "swd", label_ko: "SWD", label_en: "SWD" },
          { value: "spi", label_ko: "SPI", label_en: "SPI" },
          { value: "i2c", label_ko: "I²C", label_en: "I²C" },
          { value: "sd_card", label_ko: "SD 카드 슬롯", label_en: "SD card slot" },
          { value: "gpio", label_ko: "GPIO", label_en: "GPIO" },
          { value: "debug_pins", label_ko: "디버그 핀/패드", label_en: "Debug pins/pads" },
          { value: "audio", label_ko: "오디오 잭", label_en: "Audio jack" },
          { value: "hdmi", label_ko: "HDMI / DP", label_en: "HDMI / DisplayPort" },
          { value: "power", label_ko: "전원(데이터 없음)", label_en: "Power only" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "accessibility",
        label_ko: "접근 가능성",
        label_en: "Accessibility",
        type: "select",
        required: true,
        options: [
          { value: "always", label_ko: "상시 노출 (외부)", label_en: "Always exposed" },
          { value: "removable_cover", label_ko: "커버 제거 시 접근", label_en: "Behind removable cover" },
          { value: "internal", label_ko: "내부 (분해 필요)", label_en: "Internal (disassembly required)" },
          { value: "factory_only", label_ko: "공장 전용", label_en: "Factory only" },
        ],
      },
      {
        name: "purpose",
        label_ko: "용도",
        label_en: "Purpose",
        type: "select",
        options: [
          { value: "data", label_ko: "데이터 입출력", label_en: "Data I/O" },
          { value: "programming", label_ko: "프로그래밍/디버그", label_en: "Programming / debug" },
          { value: "peripheral", label_ko: "주변기기 연결", label_en: "Peripheral" },
          { value: "storage", label_ko: "저장 매체", label_en: "Storage media" },
          { value: "power", label_ko: "전원 공급", label_en: "Power" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // MECHANISM INSTANCES — entered after assets, feed DT iterations
  // ══════════════════════════════════════════════════════════════════════
  {
    kind: "access_control_mechanism",
    category: "mechanism",
    mechanismCode: "ACM",
    title_ko: "접근 통제 메커니즘 (ACM)",
    title_en: "Access Control Mechanisms (ACM)",
    description_ko:
      "기기 내 자산 접근을 관리하는 메커니즘 인스턴스. ACM-2, AUM-1-1/-1-2 평가에서 반복 대상이 됩니다.",
    description_en:
      "Instances of access control mechanisms. Iterated by ACM-2 and AUM-1-x evaluations.",
    namePlaceholder: "예: 관리자 웹 UI 접근 통제 / e.g., Admin Web UI access control",
    listColumns: ["managed_via", "uses_authentication", "protects"],
    metadataFields: [
      {
        name: "managed_via",
        label_ko: "통제 대상 인터페이스",
        label_en: "Managed Via",
        type: "select",
        required: true,
        options: [
          { value: "network_interface", label_ko: "네트워크 인터페이스", label_en: "Network interface" },
          { value: "user_interface", label_ko: "사용자 인터페이스 (로컬)", label_en: "User interface (local)" },
          { value: "machine_interface", label_ko: "머신 인터페이스 (M2M·API)", label_en: "Machine interface (M2M/API)" },
          { value: "physical_interface", label_ko: "물리 인터페이스", label_en: "Physical interface" },
          { value: "mixed", label_ko: "혼합", label_en: "Mixed" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "uses_authentication",
        label_ko: "인증 메커니즘 적용 여부",
        label_en: "Uses Authentication",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예 — 별도로 인증 메커니즘 등록 필요", label_en: "Yes — register an Authentication Mechanism separately" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "protects",
        label_ko: "보호 대상",
        label_en: "Protects",
        type: "text",
        placeholder: "예: 관리자 계정·설정값 / Admin account, config",
      },
      {
        name: "permission_model",
        label_ko: "권한 모델",
        label_en: "Permission Model",
        type: "select",
        options: [
          { value: "role_based", label_ko: "역할 기반 (RBAC)", label_en: "Role-based (RBAC)" },
          { value: "user_based", label_ko: "사용자 기반", label_en: "User-based" },
          { value: "allowlist", label_ko: "Allowlist", label_en: "Allowlist" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
    ],
  },
  {
    kind: "authentication_mechanism",
    category: "mechanism",
    mechanismCode: "AUM",
    title_ko: "인증 메커니즘 (AUM)",
    title_en: "Authentication Mechanisms (AUM)",
    description_ko:
      "ACM이 사용하는 인증 방식의 인스턴스. AUM-2/-3/-4/-6 등에서 반복 대상이 됩니다. 인증을 사용하는 ACM마다 적어도 하나 있어야 합니다.",
    description_en:
      "Instances of authentication methods used by access control mechanisms. Iterated by AUM-2/-3/-4/-6. At least one is expected per authenticating ACM.",
    namePlaceholder: "예: 관리자 비밀번호 인증 / e.g., Admin password auth",
    listColumns: ["factor_type", "password_scope", "uses_factory_default"],
    metadataFields: [
      {
        name: "factor_type",
        label_ko: "요소 종류",
        label_en: "Factor Type",
        type: "select",
        required: true,
        options: [
          { value: "knowledge", label_ko: "지식 (비밀번호·PIN 등)", label_en: "Knowledge (password/PIN)" },
          { value: "possession", label_ko: "소유 (토큰·스마트카드 등)", label_en: "Possession (token, smartcard)" },
          { value: "inherence", label_ko: "고유성 (생체 등)", label_en: "Inherence (biometric)" },
          { value: "multi_factor", label_ko: "다중 요소 (2FA/MFA)", label_en: "Multi-factor (2FA/MFA)" },
        ],
      },
      {
        name: "for_acm",
        label_ko: "적용 ACM",
        label_en: "For ACM",
        type: "text",
        placeholder: "예: 관리자 웹 UI 접근 통제 / which ACM this serves",
      },
      {
        name: "password_scope",
        label_ko: "비밀번호 보관 위치",
        label_en: "Password Scope",
        type: "select",
        required: true,
        options: [
          {
            value: "device_local",
            label_ko: "기기 내 저장·검증 (장비 자체 비밀번호)",
            label_en: "Stored/verified on device (equipment password)",
          },
          {
            value: "external",
            label_ko: "외부 서비스로 위임 (OAuth·클라우드 등)",
            label_en: "Delegated to external service (OAuth/cloud)",
          },
          {
            value: "none",
            label_ko: "비밀번호 미사용 (토큰/생체만)",
            label_en: "No password used (token/biometric only)",
          },
        ],
      },
      {
        name: "uses_factory_default",
        label_ko: "공장 기본 비밀번호 사용",
        label_en: "Uses Factory Default Password",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
          { value: "na", label_ko: "해당 없음 (비밀번호 미사용/외부 위임)", label_en: "N/A (no password or delegated)" },
        ],
      },
      {
        name: "brute_force_protected",
        label_ko: "무차별 대입 방어",
        label_en: "Brute-force Protected",
        type: "select",
        options: [
          { value: "yes", label_ko: "예 (시도 제한·지연 등)", label_en: "Yes (attempt limit / delay)" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "authenticator_changeable",
        label_ko: "인증자 변경 가능",
        label_en: "Authenticator Changeable",
        type: "select",
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
          { value: "conflicts", label_ko: "보안 목표와 충돌", label_en: "Conflicts with security goals" },
        ],
      },
    ],
  },
  {
    kind: "secure_update_mechanism",
    category: "mechanism",
    mechanismCode: "SUM",
    title_ko: "보안 업데이트 메커니즘 (SUM)",
    title_en: "Secure Update Mechanisms (SUM)",
    description_ko:
      "펌웨어·소프트웨어 업데이트 메커니즘 인스턴스. SUM-2, SUM-3 평가 반복 대상.",
    description_en: "Instances of firmware/software update mechanisms. Iterated by SUM-2/SUM-3.",
    namePlaceholder: "예: OTA 펌웨어 업데이트 / e.g., OTA firmware update",
    listColumns: ["target_software", "installation_mode", "verifies_signature"],
    metadataFields: [
      {
        name: "target_software",
        label_ko: "대상 소프트웨어",
        label_en: "Target Software",
        type: "text",
        required: true,
        placeholder: "예: 주 펌웨어·MCU 부트로더 / Main firmware, MCU bootloader",
      },
      {
        name: "installation_mode",
        label_ko: "설치 방식",
        label_en: "Installation Mode",
        type: "select",
        required: true,
        options: [
          { value: "without_human", label_ko: "사람 개입 없이 자동", label_en: "Without human intervention" },
          { value: "scheduled_approval", label_ko: "사람 승인 후 예약 설치", label_en: "Scheduled with human approval" },
          { value: "triggered_approval", label_ko: "사람 승인·감독 하 트리거", label_en: "Triggered under human approval/supervision" },
          { value: "manual", label_ko: "수동 (사용자 직접)", label_en: "Manual (user initiated)" },
        ],
      },
      {
        name: "verifies_signature",
        label_ko: "서명 검증 수행",
        label_en: "Verifies Signature",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "uses_secure_channel",
        label_ko: "보안 채널 사용 (TLS 등)",
        label_en: "Uses Secure Channel",
        type: "select",
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "prevents_rollback",
        label_ko: "롤백 방지",
        label_en: "Prevents Rollback",
        type: "select",
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
    ],
  },
  {
    kind: "secure_storage_mechanism",
    category: "mechanism",
    mechanismCode: "SSM",
    title_ko: "보안 저장 메커니즘 (SSM)",
    title_en: "Secure Storage Mechanisms (SSM)",
    description_ko:
      "영구 저장된 자산을 보호하는 저장 메커니즘 인스턴스. SSM-2, SSM-3 평가 반복 대상.",
    description_en:
      "Instances of secure storage mechanisms protecting persistently stored assets. Iterated by SSM-2/SSM-3.",
    namePlaceholder: "예: Secure Element 저장소 / e.g., Secure Element storage",
    listColumns: ["storage_backend", "protects_integrity", "protects_confidentiality"],
    metadataFields: [
      {
        name: "storage_backend",
        label_ko: "저장소 기반",
        label_en: "Storage Backend",
        type: "select",
        required: true,
        options: [
          { value: "se_tpm", label_ko: "Secure Element / TPM", label_en: "Secure Element / TPM" },
          { value: "encrypted_flash", label_ko: "암호화된 플래시", label_en: "Encrypted flash" },
          { value: "software", label_ko: "소프트웨어 전용", label_en: "Software only" },
          { value: "mcu_secure_boot", label_ko: "MCU 보안 부팅 영역", label_en: "MCU secure boot area" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "protects_integrity",
        label_ko: "무결성 보호",
        label_en: "Protects Integrity",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "protects_confidentiality",
        label_ko: "기밀성 보호",
        label_en: "Protects Confidentiality",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
    ],
  },
  {
    kind: "secure_communication_mechanism",
    category: "mechanism",
    mechanismCode: "SCM",
    title_ko: "보안 통신 메커니즘 (SCM)",
    title_en: "Secure Communication Mechanisms (SCM)",
    description_ko:
      "네트워크 통신을 보호하는 메커니즘 인스턴스. SCM-2, SCM-3, SCM-4 평가 반복 대상.",
    description_en:
      "Instances of secure communication mechanisms. Iterated by SCM-2/-3/-4.",
    namePlaceholder: "예: MQTT-over-TLS / e.g., MQTT over TLS 1.3",
    listColumns: ["protocol_family", "protects_confidentiality", "replay_protection"],
    metadataFields: [
      {
        name: "protocol_family",
        label_ko: "프로토콜 계열",
        label_en: "Protocol Family",
        type: "select",
        required: true,
        options: [
          { value: "tls", label_ko: "TLS", label_en: "TLS" },
          { value: "dtls", label_ko: "DTLS", label_en: "DTLS" },
          { value: "ipsec", label_ko: "IPsec", label_en: "IPsec" },
          { value: "ssh", label_ko: "SSH", label_en: "SSH" },
          { value: "vpn", label_ko: "VPN (기타)", label_en: "VPN (other)" },
          { value: "custom", label_ko: "자체 프로토콜", label_en: "Custom protocol" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "protects_integrity",
        label_ko: "무결성·진본성 보호",
        label_en: "Protects Integrity / Authenticity",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예 (모범 사례)", label_en: "Yes (best practice)" },
          { value: "deviation", label_ko: "편차 (상호운용성 사유)", label_en: "Deviation (interoperability)" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "protects_confidentiality",
        label_ko: "기밀성 보호",
        label_en: "Protects Confidentiality",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예 (모범 사례)", label_en: "Yes (best practice)" },
          { value: "deviation", label_ko: "편차 (상호운용성 사유)", label_en: "Deviation (interoperability)" },
          { value: "no", label_ko: "아니오 (필요 없음)", label_en: "No (not needed)" },
        ],
      },
      {
        name: "replay_protection",
        label_ko: "재전송 방지",
        label_en: "Replay Protection",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "not_threat", label_ko: "재전송이 위협 아님", label_en: "Replay not a threat" },
          { value: "deviation", label_ko: "편차", label_en: "Deviation" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
    ],
  },
  {
    kind: "logging_mechanism",
    category: "mechanism",
    mechanismCode: "LGM",
    title_ko: "로깅 메커니즘 (LGM)",
    title_en: "Logging Mechanisms (LGM)",
    description_ko:
      "보안·프라이버시 이벤트를 로깅하는 메커니즘 인스턴스. EN 18031-2 LGM-2/-3/-4 평가 반복 대상.",
    description_en:
      "Instances of logging mechanisms. Iterated by EN 18031-2 LGM-2/-3/-4.",
    namePlaceholder: "예: Syslog 원격 전송 / e.g., Remote syslog",
    listColumns: ["storage_location", "includes_timestamps", "integrity_protected"],
    metadataFields: [
      {
        name: "storage_location",
        label_ko: "저장 위치",
        label_en: "Storage Location",
        type: "select",
        required: true,
        options: [
          { value: "on_device", label_ko: "기기 내부", label_en: "On device" },
          { value: "remote", label_ko: "원격 (syslog/cloud)", label_en: "Remote (syslog/cloud)" },
          { value: "hybrid", label_ko: "혼합", label_en: "Hybrid" },
        ],
      },
      {
        name: "includes_timestamps",
        label_ko: "타임스탬프 포함",
        label_en: "Includes Timestamps",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예 (실시간 소스 있음)", label_en: "Yes (real-time source)" },
          { value: "time_related", label_ko: "시간 관련 정보 (실시간 소스 없음)", label_en: "Time-related info (no RT source)" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "integrity_protected",
        label_ko: "로그 무결성 보호",
        label_en: "Integrity Protected",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예 (추가전용·서명·원격전송)", label_en: "Yes (append-only/signed/forwarded)" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "min_event_count",
        label_ko: "최소 보관 이벤트 수",
        label_en: "Minimum Events Retained",
        type: "text",
        placeholder: "예: 최근 1,000개 이벤트 / latest 1000 events",
      },
    ],
  },
  {
    kind: "deletion_mechanism",
    category: "mechanism",
    mechanismCode: "DLM",
    title_ko: "삭제 메커니즘 (DLM)",
    title_en: "Deletion Mechanisms (DLM)",
    description_ko:
      "사용자의 개인정보·민감 보안 파라미터를 삭제할 수 있는 메커니즘 인스턴스. EN 18031-2 DLM-1 요구사항.",
    description_en:
      "Instances of mechanisms that delete user personal data or sensitive security parameters. EN 18031-2 DLM-1.",
    namePlaceholder: "예: 공장 초기화 / e.g., Factory reset",
    listColumns: ["trigger_method", "scope", "deletes_cross_store"],
    metadataFields: [
      {
        name: "trigger_method",
        label_ko: "실행 방법",
        label_en: "Trigger Method",
        type: "select",
        required: true,
        options: [
          { value: "user_action", label_ko: "사용자 직접 실행 (UI/버튼)", label_en: "User action (UI/button)" },
          { value: "admin_action", label_ko: "관리자/인가된 엔티티 실행", label_en: "Admin / authorized entity" },
          { value: "api", label_ko: "API 호출", label_en: "API" },
          { value: "automatic", label_ko: "자동 (조건 충족 시)", label_en: "Automatic (on condition)" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "scope",
        label_ko: "삭제 범위",
        label_en: "Deletion Scope",
        type: "select",
        required: true,
        options: [
          { value: "all_user_data", label_ko: "모든 사용자 데이터 (공장 초기화급)", label_en: "All user data (factory reset-like)" },
          { value: "selective", label_ko: "선택적 (항목별)", label_en: "Selective (per item)" },
          { value: "specific", label_ko: "특정 자산만", label_en: "Specific asset only" },
        ],
      },
      {
        name: "deletes_cross_store",
        label_ko: "외부 저장소까지 삭제",
        label_en: "Deletes Across Stores",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예 (기기·백엔드·제3자 모두)", label_en: "Yes (device + backend + third-party)" },
          { value: "device_only", label_ko: "기기만", label_en: "Device only" },
          { value: "device_backend", label_ko: "기기 + 자사 백엔드", label_en: "Device + own backend" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "secure_erase",
        label_ko: "안전 삭제 수행 (복구 불가)",
        label_en: "Secure Erase",
        type: "select",
        options: [
          { value: "yes", label_ko: "예 (cryptographic erase, overwrite)", label_en: "Yes (cryptographic erase/overwrite)" },
          { value: "no", label_ko: "아니오 (논리적 삭제)", label_en: "No (logical delete only)" },
          { value: "unknown", label_ko: "확인 불가", label_en: "Unknown" },
        ],
      },
    ],
  },
  {
    kind: "user_notification_mechanism",
    category: "mechanism",
    mechanismCode: "UNM",
    title_ko: "사용자 알림 메커니즘 (UNM)",
    title_en: "User Notification Mechanisms (UNM)",
    description_ko:
      "개인정보·보안 관련 변경을 사용자에게 알리는 메커니즘 인스턴스. EN 18031-2 UNM-1/-2에서 반복 평가됩니다.",
    description_en:
      "Instances of mechanisms that notify the user about privacy/security-related changes. Iterated by EN 18031-2 UNM-1/-2.",
    namePlaceholder: "예: 상태 LED 알림 / e.g., Status LED / push notification",
    listColumns: ["channel", "describes_change", "describes_impact"],
    metadataFields: [
      {
        name: "channel",
        label_ko: "알림 수단",
        label_en: "Notification Channel",
        type: "select",
        required: true,
        options: [
          { value: "ui_screen", label_ko: "기기 UI (화면)", label_en: "Device UI (screen)" },
          { value: "led", label_ko: "LED 표시등", label_en: "LED indicator" },
          { value: "sound", label_ko: "소리·음성", label_en: "Sound / voice" },
          { value: "companion_app", label_ko: "연동 모바일 앱", label_en: "Companion mobile app" },
          { value: "email", label_ko: "이메일", label_en: "Email" },
          { value: "push", label_ko: "푸시 알림", label_en: "Push notification" },
          { value: "multi", label_ko: "복수 수단", label_en: "Multi-channel" },
          { value: "other", label_ko: "기타", label_en: "Other" },
        ],
      },
      {
        name: "describes_change",
        label_ko: "변경 사항 설명 포함",
        label_en: "Describes Change",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "describes_impact",
        label_ko: "프라이버시 영향 설명 포함",
        label_en: "Describes Privacy Impact",
        type: "select",
        required: true,
        options: [
          { value: "yes", label_ko: "예", label_en: "Yes" },
          { value: "no", label_ko: "아니오", label_en: "No" },
        ],
      },
      {
        name: "triggers",
        label_ko: "알림 트리거 (어떤 경우)",
        label_en: "Triggers",
        type: "text",
        placeholder: "예: 펌웨어 업데이트·설정 변경·카메라 활성화 / firmware update, config change, camera on",
      },
    ],
  },
];

// Kind lists filtered by category, useful for page routing/rendering.
export const ASSET_ONLY_KINDS: AssetKindConfig[] = ASSET_KINDS.filter(
  (k) => k.category === "asset",
);
export const MECHANISM_KINDS: AssetKindConfig[] = ASSET_KINDS.filter(
  (k) => k.category === "mechanism",
);

// True if a kind is relevant under ANY of the given applicable standards.
// A kind without explicit `standards` applies to every standard.
export function kindAppliesToStandards(
  kind: AssetKindConfig,
  applicable: StandardId[],
): boolean {
  if (!kind.standards || kind.standards.length === 0) return true;
  return kind.standards.some((s) => applicable.includes(s));
}

export function applicableAssetKinds(
  applicable: StandardId[],
): AssetKindConfig[] {
  return ASSET_ONLY_KINDS.filter((k) => kindAppliesToStandards(k, applicable));
}

export function kindConfig(kind: string): AssetKindConfig | undefined {
  return ASSET_KINDS.find((k) => k.kind === kind);
}

export function fieldLabel(
  kind: AssetKindConfig,
  fieldName: string,
): { ko: string; en: string } | null {
  if (fieldName === "description") {
    return { ko: "설명", en: "Description" };
  }
  const f = kind.metadataFields.find((f) => f.name === fieldName);
  if (!f) return null;
  return { ko: f.label_ko, en: f.label_en };
}

export function optionLabel(
  kind: AssetKindConfig,
  fieldName: string,
  value: string,
): { ko: string; en: string } {
  const f = kind.metadataFields.find((f) => f.name === fieldName);
  const opt = f?.options?.find((o) => o.value === value);
  if (opt) return { ko: opt.label_ko, en: opt.label_en };
  return { ko: value, en: value };
}
