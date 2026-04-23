"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Info } from "lucide-react";
import { saveScreening } from "@/app/actions";
import {
  type ScreeningQuestion,
  type ScreeningAnswerMap,
} from "@/lib/screening-questions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SECTION_META = {
  A: {
    title_ko: "A. 표준 적용성",
    title_en: "Standard Applicability",
    desc_ko: "EN 18031-1/-2/-3 중 어떤 표준이 적용되는지 판별합니다.",
    desc_en: "Determines which of EN 18031-1/-2/-3 applies.",
  },
  B: {
    title_ko: "B. 기능 프로파일",
    title_en: "Capability Profile",
    desc_ko: "ACM·AUM·SUM 등 어떤 보안 메커니즘 후보가 필요한지 판별합니다.",
    desc_en: "Determines which mechanism candidates (ACM, AUM, SUM, …) apply.",
  },
} as const;

export function ScreeningForm({
  projectId,
  questions,
  initialAnswers,
  readOnly = false,
}: {
  projectId: string;
  questions: ScreeningQuestion[];
  initialAnswers: ScreeningAnswerMap;
  readOnly?: boolean;
}) {
  const [answers, setAnswers] = useState<ScreeningAnswerMap>(initialAnswers);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const a = questions.filter((q) => q.section === "A");
    const b = questions.filter((q) => q.section === "B");
    return { A: a, B: b };
  }, [questions]);

  const answeredCount = Object.keys(answers).length;
  const total = questions.length;
  const percent = Math.round((answeredCount / total) * 100);

  function setAnswer(id: string, value: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function onSubmit() {
    const missing = questions.filter((q) => !(q.id in answers));
    if (missing.length > 0) {
      toast.error(
        `아직 응답하지 않은 질문이 ${missing.length}개 있습니다. (${missing
          .map((m) => m.id)
          .join(", ")})`,
      );
      return;
    }
    startTransition(async () => {
      await saveScreening(projectId, answers);
    });
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-2 rounded-lg bg-background/90 px-2 py-2 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            진행률 / Progress:{" "}
            <span className="font-medium text-foreground">
              {answeredCount} / {total}
            </span>
          </span>
          <span className="font-medium">{percent}%</span>
        </div>
        <Progress value={percent} className="mt-2" />
      </div>

      {(["A", "B"] as const).map((section) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="secondary" className="text-xs">
                섹션 / Section {section}
              </Badge>
              <span>
                {SECTION_META[section].title_ko} /{" "}
                <span className="text-muted-foreground">
                  {SECTION_META[section].title_en}
                </span>
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {SECTION_META[section].desc_ko} {SECTION_META[section].desc_en}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {grouped[section].map((q, idx) => (
              <QuestionRow
                key={q.id}
                index={idx + 1}
                question={q}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between gap-4 py-4">
        <p className="text-xs text-muted-foreground">
          모든 질문에 응답하면 결과를 저장할 수 있습니다. / Answer all questions to save.
        </p>
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={pending || answeredCount < total || readOnly}
        >
          {pending
            ? "저장 중… / Saving…"
            : "결과 확인 / Save & See Result"}
        </Button>
      </div>
    </div>
  );
}

function QuestionRow({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: ScreeningQuestion;
  value?: "yes" | "no";
  onChange: (v: "yes" | "no") => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
          {question.id}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-snug">
            {index}. {question.text_ko}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            {question.text_en}
          </p>
          {question.hint_ko && (
            <p className="mt-2 flex items-start gap-1 rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 size-3 shrink-0" />
              <span>
                {question.hint_ko}
                {question.hint_en && (
                  <>
                    <br />
                    <span className="italic">{question.hint_en}</span>
                  </>
                )}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2 pl-10">
        <Button
          type="button"
          size="sm"
          variant={value === "yes" ? "default" : "outline"}
          onClick={() => onChange("yes")}
          className={cn(
            "min-w-24",
            value === "yes" && "ring-2 ring-primary/30",
          )}
        >
          <Check className="mr-1 size-4" />
          예 / Yes
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === "no" ? "secondary" : "outline"}
          onClick={() => onChange("no")}
          className={cn(
            "min-w-24",
            value === "no" && "ring-2 ring-muted-foreground/30",
          )}
        >
          <X className="mr-1 size-4" />
          아니오 / No
        </Button>
      </div>
    </div>
  );
}
