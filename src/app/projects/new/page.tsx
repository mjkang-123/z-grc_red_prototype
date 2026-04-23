import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="mr-1 size-4" />
            뒤로 / Back
          </Button>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          프로젝트(제품) 등록
          <span className="ml-2 text-base font-medium text-muted-foreground">
            / New Project
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          평가 대상 제품의 기본 정보를 입력하세요. 저장 후 바로 스크리닝으로 이동합니다.
          <br />
          Enter the basic information of the product to assess. You will be redirected to the screening after saving.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
