"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/app/actions";

const PRODUCT_TYPE_SUGGESTIONS = [
  "EV Charger / 전기차 충전기",
  "Medical Device / 의료기기",
  "Smart Home / 스마트홈",
  "Wearable / 웨어러블",
  "Router / 라우터",
  "IP Camera / IP 카메라",
  "Industrial IoT / 산업용 IoT",
  "Other / 기타",
];

export function NewProjectForm() {
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const manufacturer = String(formData.get("manufacturer") ?? "").trim();

    if (!name) {
      toast.error("제품명을 입력하세요. / Product name is required.");
      return;
    }
    if (!manufacturer) {
      toast.error("제조사를 입력하세요. / Manufacturer is required.");
      return;
    }

    startTransition(async () => {
      await createProject({
        name,
        manufacturer,
        contactName: String(formData.get("contactName") ?? ""),
        contactEmail: String(formData.get("contactEmail") ?? ""),
        productType: String(formData.get("productType") ?? ""),
        productDescription: String(formData.get("productDescription") ?? ""),
      });
    });
  }

  return (
    <form action={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            기본 정보 / Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field id="name" label="제품명 / Product Name" required>
            <Input
              id="name"
              name="name"
              placeholder="예: ChargePoint CP-100 / e.g. ChargePoint CP-100"
              disabled={pending}
              required
            />
          </Field>

          <Field id="manufacturer" label="제조사 / Manufacturer" required>
            <Input
              id="manufacturer"
              name="manufacturer"
              placeholder="예: Z-EN Systems Inc."
              disabled={pending}
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="contactName" label="담당자 이름 / Contact Name">
              <Input
                id="contactName"
                name="contactName"
                disabled={pending}
                placeholder="홍길동 / Hong Gildong"
              />
            </Field>
            <Field id="contactEmail" label="담당자 이메일 / Contact Email">
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                disabled={pending}
                placeholder="name@example.com"
              />
            </Field>
          </div>

          <Field id="productType" label="제품 유형 / Product Type">
            <Input
              id="productType"
              name="productType"
              list="product-type-suggestions"
              disabled={pending}
              placeholder="예: EV Charger / 전기차 충전기"
            />
            <datalist id="product-type-suggestions">
              {PRODUCT_TYPE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>

          <Field
            id="productDescription"
            label="제품 설명 / Product Description"
          >
            <Textarea
              id="productDescription"
              name="productDescription"
              rows={4}
              disabled={pending}
              placeholder="제품의 기능·통신 방식·사용 환경 등 간단한 설명 / Short description of the product's functions, communication, and operating environment."
            />
          </Field>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중… / Saving…" : "저장 후 스크리닝 / Save & Start Screening"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
