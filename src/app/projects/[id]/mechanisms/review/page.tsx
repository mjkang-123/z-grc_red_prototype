import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MECHANISM_KINDS,
  kindConfig,
  optionLabel,
} from "@/lib/asset-kinds";

export default async function MechanismsReviewPage({
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

  const candidates: string[] = project.screeningComplete
    ? JSON.parse(project.mechanismCandidates)
    : [];

  // Only show mechanism kinds whose code is in the screening candidates.
  const applicableKinds = MECHANISM_KINDS.filter(
    (k) => k.mechanismCode && candidates.includes(k.mechanismCode),
  );

  const mechanisms = project.assets.filter((a) =>
    applicableKinds.some((m) => m.kind === a.kind),
  );

  // Cross-check: any ACM with uses_authentication=yes should have at least one
  // authentication_mechanism registered.
  const acmList = project.assets.filter(
    (a) => a.kind === "access_control_mechanism",
  );
  const acmWithAuth = acmList.filter((a) => {
    const md = safeJson(a.metadata);
    return md.uses_authentication === "yes";
  });
  const aumCount = project.assets.filter(
    (a) => a.kind === "authentication_mechanism",
  ).length;
  const authWarning = acmWithAuth.length > 0 && aumCount === 0;

  const total = mechanisms.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href={`/projects/${project.id}/mechanisms`}>
          <Button variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="mr-1 size-4" />
            메커니즘 입력 / Edit Mechanisms
          </Button>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          메커니즘 검토
          <span className="ml-2 text-base font-medium text-muted-foreground">
            / Mechanism Review
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          제품: <span className="font-medium text-foreground">{project.name}</span>
          {" · "}
          {project.manufacturer}
        </p>
      </div>

      <Card
        className={
          total === 0
            ? "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20"
            : "border-primary/30 bg-primary/5"
        }
      >
        <CardContent className="flex items-center gap-3 py-4">
          {total === 0 ? (
            <>
              <CircleAlert className="size-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">
                  등록된 메커니즘이 없습니다. / No mechanisms registered.
                </p>
                <p className="text-xs text-muted-foreground">
                  DT 평가 단계에서 반복 대상이 비어 있게 됩니다. 최소한의 메커니즘을 등록해 주세요.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  총 {total}개 메커니즘이 등록되었습니다. / {total} mechanism(s) registered.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {authWarning && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">
                일관성 경고: 인증을 사용하는 ACM이 있지만 등록된 인증 메커니즘(AUM)이 없습니다.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                다음 ACM이 `uses_authentication = yes`로 설정되어 있습니다:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {acmWithAuth.map((a) => (
                  <li key={a.id}>
                    <span className="font-mono">{a.name}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/projects/${project.id}/mechanisms#section-authentication_mechanism`}
                className="mt-1 inline-block text-xs text-primary underline"
              >
                인증 메커니즘 섹션으로 이동 / Jump to Authentication Mechanism section
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {applicableKinds.map((kind) => {
        const items = project.assets.filter((a) => a.kind === kind.kind);
        return (
          <Card key={kind.kind}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <span>
                  {kind.title_ko}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">
                    / {kind.title_en}
                  </span>
                </span>
                <Badge variant="secondary">{items.length}개</Badge>
              </CardTitle>
              <CardDescription>{kind.description_ko}</CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                  등록된 항목 없음 / None registered
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름 / Name</TableHead>
                        {kind.metadataFields.map((f) => (
                          <TableHead key={f.name}>
                            {f.label_ko}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              / {f.label_en}
                            </span>
                          </TableHead>
                        ))}
                        <TableHead>설명 / Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((a) => {
                        const meta = safeJson(a.metadata);
                        const cfg = kindConfig(kind.kind)!;
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.name}</TableCell>
                            {kind.metadataFields.map((f) => {
                              const raw = meta[f.name] ?? "";
                              if (!raw) {
                                return (
                                  <TableCell
                                    key={f.name}
                                    className="text-muted-foreground/60"
                                  >
                                    —
                                  </TableCell>
                                );
                              }
                              if (f.type === "select") {
                                const lbl = optionLabel(cfg, f.name, raw);
                                return (
                                  <TableCell key={f.name}>
                                    <span>{lbl.ko}</span>
                                    {lbl.ko !== lbl.en && (
                                      <span className="ml-1 text-xs text-muted-foreground">
                                        / {lbl.en}
                                      </span>
                                    )}
                                  </TableCell>
                                );
                              }
                              return <TableCell key={f.name}>{raw}</TableCell>;
                            })}
                            <TableCell className="text-sm text-muted-foreground">
                              {a.description || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-between gap-4 py-4">
        <Link href={`/projects/${project.id}/mechanisms`}>
          <Button variant="outline">
            <Pencil className="mr-2 size-4" />
            메커니즘 입력으로 돌아가기 / Edit Mechanisms
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/dt`}>
          <Button>
            Decision Tree 평가 / Next: Decision Tree
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
