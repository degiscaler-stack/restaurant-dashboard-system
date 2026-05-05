import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ orderNumber?: string }>;
};

/** توافق مع روابط قديمة — التوجيه إلى صفحة الشكر الجديدة */
export default async function LegacyOrderSuccessPage({ searchParams }: Props) {
  const p = await searchParams;
  const on = p.orderNumber?.trim();
  if (on) redirect(`/thank-you?order=${encodeURIComponent(on)}`);
  redirect("/thank-you");
}
