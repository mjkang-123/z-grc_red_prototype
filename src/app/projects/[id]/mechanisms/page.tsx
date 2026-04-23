import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleAlert, Info } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MECHANISM_KINDS } from "@/lib/asset-kinds";
import { MECHANISMS } from "@/lib/mechanisms";
import { AssetSection } from "../assets/asset-section";

export default async function MechanismsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { assets: { orderBy: { createdAt: "asc" } } },
  });
  if (!project) notFound();

  if (!project.screeningComplete) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <CircleAlert className="mx-auto size-8 text-amber-500" />
            <p className="mt-3 text-sm font-medium">
              스크리닝이 아직 완료되지 않았습니다. / Screening is not complete.
            </p>
            <Link href={`/projects/${project.id}/screening`}>
              <Button className="mt-4">스크리닝 진행 / Go to Screening</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidates: string[] = JSON.parse(project.mechanismCandidates);

  // Only show mechanism sections whose code is in the screening candidates.
  const applicableKinds = MECHANISM_KINDS.filter(
    (k) => k.mechanismCode && candidates.includes(k.mechanismCode),
  );

  // Candidate mechanisms that *don't* have a registrable mechanism kind yet
  // (CCK/GEC/CRY/RLM/NMM/TCM — evaluated per device or per asset, no instance inventory needed).
  const candidatesWithoutKind = candidates.filter(
    (c) => !MECHANISM_KINDS.some((k) => k.mechanismCode === c),
  );

  const countsByKind = new Map<string, number>();
  for (const a of project.assets) {
    countsByKind.set(a.kind, (countsByKind.get(a.kind) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href={`/projects/${project.id}/assets/review`}>
          <Button variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="mr-1 size-4" />
            자산 검토 / Asset Review
          </Button>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          보호 메커니즘 인벤토리
          <span className="ml-2 text-base font-medium text-muted-foreground">
            / Protection Mechanism Inventory
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          제품: <span className="font-medium text-foreground">{project.name}</span>
          {" · "}
          {project.manufacturer}
        </p>
      </div>

      <Card className="border-accent bg-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-primary" />
            무엇을 입력하나요? / What goes here?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            자산이 <b>"무엇을 보호하는가"</b> 라면, 메커니즘은 <b>"어떻게 보호하는가"</b> 입니다.
            아래 섹션은 <b>스크리닝에서 해당됨</b>으로 판정된 메커니즘에 대해서만 표시됩니다.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>
              <b>ACM 등록</b> 시 <b>인증 메커니즘 적용 여부(Yes/No)</b> 를 선택하세요. Yes면 <b>AUM 섹션</b>에 관련 인증 메커니즘을 별도로 등록해야 합니다.
            </li>
            <li>
              각 인스턴스는 해당 DT(예: SUM-2/-3, SSM-2/-3)의 반복 평가 대상이 됩니다.
            </li>
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            <span className="font-medium text-foreground">스크리닝 후보 메커니즘:</span>
            {candidates.map((c) => {
              const hasKind = MECHANISM_KINDS.some((k) => k.mechanismCode === c);
              return (
                <Badge
                  key={c}
                  variant={hasKind ? "default" : "outline"}
                  className="font-mono text-[10px]"
                >
                  {c}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {applicableKinds.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            스크리닝 결과 인스턴스 등록이 필요한 메커니즘이 없습니다. 바로 DT 평가로 진행하세요.
            <br />
            No mechanisms require instance registration. Proceed directly to DT evaluation.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
            {applicableKinds.map((k) => (
              <a
                key={k.kind}
                href={`#section-${k.kind}`}
                className="group rounded-lg border bg-card px-3 py-2 transition hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="truncate text-[10px] font-medium uppercase text-muted-foreground">
                  {k.mechanismCode ?? k.title_en}
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    {countsByKind.get(k.kind) ?? 0}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {k.title_ko.replace(/ \(.*\)$/, "")}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {applicableKinds.map((kind) => (
            <div
              key={kind.kind}
              id={`section-${kind.kind}`}
              className="scroll-mt-20"
            >
              <AssetSection
                projectId={project.id}
                kindConfig={kind}
                assets={project.assets
                  .filter((a) => a.kind === kind.kind)
                  .map((a) => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    metadata: safeJson(a.metadata),
                    createdAt: a.createdAt.toISOString(),
                  }))}
              />
            </div>
          ))}
        </>
      )}

      {candidatesWithoutKind.length > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">
              인스턴스 등록이 필요 없는 메커니즘 / No instance registration needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-muted-foreground">
              아래 메커니즘은 기기 단위 또는 자산(인터페이스/키) 단위로 DT에서 직접 평가됩니다. 별도 인스턴스 등록이 필요 없습니다.
            </p>
            <div className="flex flex-wrap gap-1">
              {candidatesWithoutKind.map((code) => {
                const m = MECHANISMS.find((x) => x.code === code);
                return (
                  <Badge key={code} variant="outline" className="font-mono">
                    {code}
                    {m && (
                      <span className="ml-1 font-sans font-normal text-muted-foreground">
                        · {m.name_ko}
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4 py-4">
        <Link href={`/projects/${project.id}/assets/review`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            자산 검토로 / Back to Asset Review
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/mechanisms/review`}>
          <Button>
            검토 / Review
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function safeJson(s: string): Record<string, string> {
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}
