# Le Grand Baraka Grill — مطعم وشواية البركة الكبرى

موقع مطعم احترافي: منيو، سلة، Checkout، **الدفع عند الاستلام**، **PayPal Sandbox**، إشعارات (WhatsApp Cloud API + بريد + لوحة الإدارة + رابط `wa.me`)، ولوحة إدارة كاملة.

## المتطلبات

- Node.js 20+
- PostgreSQL 16+ (أو Docker)

## تشغيل محلي سريع

1. انسخ الإعدادات:

```bash
copy .env.example .env
```

عدّل `DATABASE_URL` و`JWT_SECRET` و`NEXT_PUBLIC_APP_URL`.

2. شغّل قاعدة البيانات (اختياري عبر Docker):

```bash
docker compose up -d
```

3. تهيئة Prisma + البيانات الافتراضية:

   عرّف في `.env` (بدون إيداع أسرار في Git): `ADMIN_SEED_EMAIL` و`ADMIN_SEED_PASSWORD` — مطلوبان لأمر الـ seed التالي.

```bash
npm install
npx prisma db push
npm run db:seed
```

4. التطوير (المنفذ **3002** باش ما يتصادمش مع مشروع آخر على 3000):

```bash
npm run dev
```

- الموقع: `http://localhost:3002`
- الإدارة: `http://localhost:3002/admin/login` (بيانات الدخول تُدار عبر مستخدم مسجّل في قاعدة البيانات / متغيرات البيئة — لا تشارِك كلمة المرور.)

### خطأ `Cannot find module './8548.js'` أو chunk ناقص فـ `.next`

غالباً **cache قديم** بعد build مقطوع أو تبديل فرع. دير:

1. **وقف السيرفر** (Ctrl+C) وتأكد ما بقاش `node` خدام على المشروع.
2. من جذر المشروع:

```bash
npm run clean
```

أو يدوياً: احذف مجلد `.next` بالكامل (`Remove-Item -Recurse -Force .next` فـ PowerShell).

3. شغّل من جديد:

```bash
npm run dev
```

**تشغيل نظيف دفعة وحدة:** `npm run dev:fresh` (كيحيد `.next` ثم يشغّل dev على **3002**).

4. تأكد من `.env`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

5. إلا بقا الخطأ: clean install (حذف `node_modules` + `package-lock.json` ثم `npm install`).

### الصفحة بيضاء على `http://localhost:3002` (ما كاينش محتوى)

كان السبب الشائع: **استيراد قيم من `@prisma/client` داخل مكوّنات `"use client"`** (مثلاً enum كـ `DeliveryBand` أو `OrderStatus`) كيدخل عميل Prisma للمتصفح وقد يطيح React بلا رسالة واضحة.

فالمشروع: `DeliveryBand` خرج لـ `src/lib/delivery.ts`، وحالات الطلب فالإدارة كـ قائمة نصية بدل `Object.values(OrderStatus)`.

بعد أي تعديل كبير: `npm run clean && npm run dev`.

## PayPal Sandbox

1. أنشئ تطبيق Sandbox من [PayPal Developer](https://developer.paypal.com/).
2. ضع `PAYPAL_CLIENT_ID` و`PAYPAL_CLIENT_SECRET` في `.env` مع `PAYPAL_MODE=sandbox`.
3. في إعدادات تطبيق PayPal، أضف **Return URL**:
   - `${NEXT_PUBLIC_APP_URL}/payment/paypal-return`

ملاحظة: PayPal قد لا يدعم عملة `MAD` في كل الحسابات؛ إذا فشل إنشاء الطلب جرّب حساباً/تطبيقاً يدعم MAD أو عدّل الكود لعملة مدعومة في بيئتك.

## WhatsApp

- إن وُجدت `WHATSAPP_CLOUD_TOKEN` و`WHATSAPP_PHONE_NUMBER_ID` يتم إرسال رسالة عبر Cloud API.
- بدون ذلك: يتم إنشاء **إشعار في لوحة الإدارة** + (اختياري) بريد عبر SMTP + رابط **wa.me** يظهر في استجابة إنشاء الطلب للواجهة.

## الأمان و Netlify (CVE-2025-55182 / CVE-2025-66478)

المشروع على **Next.js 15.5.15** و**React 19.2.5** (إصدارات خارج النطاق اللي كاتبلوكيها Netlify). ما تبقّاش على 15.3.3 أو أقل.

### تسجيل دخول الإدارة على Netlify (مهم)

إذا كان النموذج يظهر «البريد أو كلمة المرور غير صحيحة» رغم صحة البيانات، فغالباً **الخادم** يفشل بعد التحقق (مثلاً نقص `JWT_SECRET`)، أو قاعدة البيانات غير متصلة.

على Netlify (أو أي استضافة) يجب تعريف على الأقل:

| المتغير | الغرض |
|--------|--------|
| `DATABASE_URL` | اتصال Neon (أو Postgres) — نفس القاعدة اللي فيها مستخدم الأدمن |
| `JWT_SECRET` | **إلزامي في الإنتاج** — قيمة عشوائية طويلة؛ بدونها فشل إصدار جلسة تسجيل الدخول |
| `DEFAULT_RESTAURANT_SLUG` أو `NEXT_PUBLIC_RESTAURANT_SLUG` | يطابق slug المطعم في DB (مثلاً `baraka`) |

تحديث كلمة مرور الأدمن في Neon من جهازك (مع `.env` محلي يحتوي `DATABASE_URL` و`ADMIN_SEED_EMAIL` و`ADMIN_SEED_PASSWORD`):

```bash
npx tsx scripts/ensure-admin.ts
```

## النشر (Vercel + قاعدة بيانات)

1. أنشئ قاعدة بيانات PostgreSQL (Neon / Supabase / Railway).
2. اضبط متغيرات البيئة في Vercel مثل `.env.example`.
3. `npm run build` يجب أن ينجح بعد `prisma generate` (يُشغَّل تلقائياً عبر `postinstall`).
4. بعد أول نشر: نفّذ `prisma db push` و`db:seed` من جهازك متصلاً بنفس `DATABASE_URL` أو عبر وظيفة migration في CI.

**ملاحظة:** لا يمكن لهذا المساعد نشر نسخة عامة تلقائياً؛ اتبع الخطوات أعلاه على حسابك (Vercel مثلاً) للحصول على رابط تجربة.

## هيكلية i18n

الملف `src/i18n/index.ts` يوفّر قاموساً عربياً كاملاً ومفاتيح أولية للفرنسية/الإنجليزية — يمكن توسيعها لاحقاً.

## بوابات دفع مغربية لاحقاً

انظر `src/lib/payments/moroccan-gateways.placeholder.ts` كنقطة توسعة (CMI / Payzone).

## الأمان

- لا يتم تخزين بيانات البطاقة في قاعدة البيانات.
- الدفع أونلاين يمر عبر PayPal فقط.
- لوحة الإدارة محمية بـ JWT في Cookie `httpOnly`.

## السكربتات

- `npm run dev` — تطوير
- `npm run build` / `npm start` — إنتاج
- `npm run db:push` — مزامنة المخطط
- `npm run db:seed` — بيانات تجريبية

## الترخيص

خاص بالمشروع التجريبي للمطعم.
