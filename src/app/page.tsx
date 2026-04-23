import Link from "next/link";
import { Plus, ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { assets: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            프로젝트 목록
            <span className="ml-2 text-lg font-medium text-muted-foreground">
              / Projects
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            RED Art. 3.3 · EN 18031-1/2/3 자가 평가 대상 제품을 관리하세요.
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="lg">
            <Plus className="mr-2 size-4" />
            프로젝트(제품) 추가 / Add Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Plus className="size-8" />
            </div>
            <div>
              <p className="text-base font-medium">등록된 프로젝트가 없습니다.</p>
              <p className="text-sm text-muted-foreground">
                No projects yet — add one to get started.
              </p>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 size-4" />
                프로젝트 추가 / Add Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const standards: number[] = [];
            if (p.applicable1) standards.push(1);
            if (p.applicable2) standards.push(2);
            if (p.applicable3) standards.push(3);
            const mechanisms: string[] = p.screeningComplete
              ? (JSON.parse(p.mechanismCandidates) as string[])
              : [];

            return (
              <Card key={p.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <CardDescription>{p.manufacturer}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    {p.screeningComplete ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">
                      {p.screeningComplete
                        ? "스크리닝 완료 / Screening done"
                        : "스크리닝 대기 / Pending"}
                    </span>
                  </div>

                  {p.screeningComplete && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {standards.length === 0 ? (
                          <Badge variant="outline">해당 표준 없음 / None</Badge>
                        ) : (
                          standards.map((s) => (
                            <Badge key={s} variant="secondary">
                              EN 18031-{s}
                            </Badge>
                          ))
                        )}
                      </div>
                      {mechanisms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {mechanisms.map((m) => (
                            <Badge
                              key={m}
                              variant="outline"
                              className="font-mono text-[10px]"
                            >
                              {m}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {p.screeningComplete && p._count.assets > 0 && (
                    <p className="text-xs text-muted-foreground">
                      자산 {p._count.assets}개 등록 / {p._count.assets} asset(s)
                    </p>
                  )}

                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <Link
                      href={
                        p.screeningComplete
                          ? `/projects/${p.id}/result`
                          : `/projects/${p.id}/screening`
                      }
                    >
                      <Button variant="outline" className="w-full">
                        {p.screeningComplete
                          ? "결과 보기 / View Result"
                          : "스크리닝 시작 / Start Screening"}
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                    {p.screeningComplete && (
                      <div className="grid grid-cols-3 gap-1">
                        <Link href={`/projects/${p.id}/assets`}>
                          <Button variant="ghost" size="sm" className="w-full px-1 text-[11px]">
                            자산 / Assets
                          </Button>
                        </Link>
                        <Link href={`/projects/${p.id}/mechanisms`}>
                          <Button variant="ghost" size="sm" className="w-full px-1 text-[11px]">
                            메커니즘 / Mech
                          </Button>
                        </Link>
                        <Link href={`/projects/${p.id}/dt`}>
                          <Button variant="ghost" size="sm" className="w-full px-1 text-[11px]">
                            DT 평가 / DT
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
