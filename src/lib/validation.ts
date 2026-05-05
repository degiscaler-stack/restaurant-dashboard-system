import { z } from "zod";

/** استخراج 9 أرقام وطنية (تبدأ بـ 6 أو 7) من مدخلات شائعة */
export function extractMoroccoMobileNational(input: string): string | null {
  const d = input.replace(/\s/g, "");
  let m = /^0([67]\d{8})$/.exec(d);
  if (m) return m[1];
  m = /^\+212([67]\d{8})$/.exec(d);
  if (m) return m[1];
  m = /^212([67]\d{8})$/.exec(d);
  if (m) return m[1];
  return null;
}

function isSequentialNine(nine: string): boolean {
  let asc = true;
  let desc = true;
  for (let i = 1; i < nine.length; i++) {
    const a = Number(nine[i - 1]);
    const b = Number(nine[i]);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    if (b !== a + 1) asc = false;
    if (b !== a - 1) desc = false;
  }
  return asc || desc;
}

function isFakeNationalNine(nine: string): boolean {
  if (nine.length !== 9) return true;
  if (/^(\d)\1{8}$/.test(nine)) return true;
  if (nine === "123456789" || nine === "987654321") return true;
  if (isSequentialNine(nine)) return true;
  return false;
}

export const moroccoMobileSchema = z.string().superRefine((raw, ctx) => {
  const national = extractMoroccoMobileNational(raw);
  if (!national) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "رقم غير صالح. استعمل صيغة مغربية: 06xxxxxxxx أو 07xxxxxxxx أو +2126xxxxxxxx",
    });
    return;
  }
  if (isFakeNationalNine(national)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "رقم الهاتف غير مقبول",
    });
  }
});

export const customerFullNameSchema = z
  .string()
  .min(4, "الاسم مطلوب")
  .max(120, "الاسم طويل جداً")
  .superRefine((raw, ctx) => {
    const name = raw.trim().replace(/\s+/g, " ");
    const words = name.split(" ").filter((w) => w.length > 0);

    if (words.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى إدخال الاسم الكامل (كلمتين على الأقل)",
      });
      return;
    }

    if (words.some((w) => w.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "كل جزء من الاسم يجب أن يكون حرفين على الأقل",
      });
      return;
    }

    if (/^[\d\s٠-٩]+$/.test(name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "الاسم لا يمكن أن يكون أرقاماً فقط",
      });
      return;
    }

    const lettersOnly = name.replace(/[\s\d٠-٩\-_'’.]/g, "");
    if (lettersOnly.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "الاسم غير مقبول",
      });
      return;
    }

    const lower = name.toLowerCase();
    if (/^(test|hello|asdf|xxx|demo|null|undefined|admin)\b/i.test(lower)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "الاسم غير مقبول",
      });
      return;
    }

    if (words.every((w) => /^(.)\1+$/u.test(w))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "الاسم غير مقبول",
      });
      return;
    }
  });

export function normalizeMoroccoPhone(input: string) {
  const national = extractMoroccoMobileNational(input);
  if (!national) throw new Error("normalizeMoroccoPhone: invalid input");
  return `+212${national}`;
}

/** عرض بصيغة 06xxxxxxxx من تخزين +212… */
export function formatMoroccoPhoneDisplay(e164OrRaw: string): string {
  const national = extractMoroccoMobileNational(e164OrRaw);
  if (!national) return e164OrRaw.trim();
  return `0${national}`;
}
