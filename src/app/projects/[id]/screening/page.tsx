import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ScreeningForm } from "./screening-form";
import { SCREENING_QUESTIONS } from "@/lib/screening-questions";

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { screeningAnswers: true },
  });
  if (!project) notFound();

  const savedAnswers: Record<string, "yes" | "no"> = {};
  for (const a of project.screeningAnswers) {
    if (a.answer === "yes" || a.answer === "no") {
      savedAnswers[a.questionId] = a.answer;
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="mr-1 size-4" />
            뒤로 / Back
          </Button>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          적용성 스크리닝
          <span className="ml-2 text-base font-medium text-muted-foreground">
            / Applicability Screening
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          제품: <span className="font-medium text-foreground">{project.name}</span>
          {" · "}
          {project.manufacturer}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          각 질문에 Yes/No로 답해 주세요. 답변 결과에 따라 EN 18031-1/2/3 적용 여부와 필요한 메커니즘 후보가 결정됩니다.
          <br />
          Answer Yes/No for each question. Your answers determine applicability of EN 18031-1/2/3 and candidate mechanisms.
        </p>
      </div>

      <ScreeningForm
        projectId={project.id}
        questions={SCREENING_QUESTIONS}
        initialAnswers={savedAnswers}
      />
    </div>
  );
}
