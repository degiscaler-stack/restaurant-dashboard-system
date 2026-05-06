# Le Grand Baraka Grill — مطعم وشواية البركة الكبرى

موقع مطعم احترافي: منيو، سلة، Checkout، **الدفع عند الاستلام**، **PayPal Sandbox**، إشعارات (WhatsApp Cloud API + بريد + لوحة الإدارة + رابط `wa.me`)، ولوحة إدارة كاملة.

قاعدة البيانات: **MySQL فقط** (مثلاً استضافة Hostinger). لا توجد أوراق اعتماد مُجمَّعة في الكود؛ استعمل إما **`DATABASE_URL`** أو **`DB_HOST` + `DB_USER` + `DB_NAME`** (مع **`DB_PORT`** و **`DB_PASSWORD`** اختياريين)، وتُنشَأ **`DATABASE_URL` تلقائياً في وقت التشغيل** قبل أوامر Prisma والخادم (`src/lib/ensure-database-url.ts`). ملفات `.env` غير مرفوعة إلى Git — انظر `.gitignore`.

## المتطلبات

- Node.js 20+
- MySQL 8+ (محلياً: `docker compose up -d`)

## تشغيل محلي سريع

1. أنشئ ملف `.env` أو `.env.local` في جذر المشروع (لا ترفعه إلى Git). عرّف `JWT_SECRET` وبيانات الأدمن والمسارات العامة، ثم إما المتغيرات المنفصلة أو `DATABASE_URL`:

**متغيرات منفصلة (مثل Hostinger):**

```env
DB_HOST="YOUR_MYSQL_HOST"
DB_PORT="3306"
DB_USER="YOUR_USER"
DB_PASSWORD="YOUR_PASSWORD"
DB_NAME="YOUR_DATABASE"
JWT_SECRET="قيمة-عشوائية-طويلة"
ADMIN_SEED_EMAIL="your-admin@example.com"
ADMIN_SEED_PASSWORD="your-secure-password"
NEXT_PUBLIC_SITE_URL="http://localhost:3002"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
```

يُستعمل `encodeURIComponent` على اسم المستخدم وكلمة المرور عند بناء سلسلة الاتصال.

**أو سلسلة واحدة:**

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
JWT_SECRET="قيمة-عشوائية-طويلة"
ADMIN_SEED_EMAIL="your-admin@example.com"
ADMIN_SEED_PASSWORD="your-secure-password"
NEXT_PUBLIC_SITE_URL="http://localhost:3002"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
```

2. شغّل قاعدة البيانات (اختياري عبر Docker):

```bash
docker compose up -d
```

3. تهيئة Prisma + البيانات الافتراضية (اختياري للمنيو التجريبي):

```bash
npm install
npm run db:migrate
npm run db:seed
```

لإنشاء مستخدم الأدمن فقط دون إعادة تعبئة المنيو بالكامل:

```bash
npm run admin:ensure
```

4. التطوير (المنفذ **3002**):

```bash
npm run dev
```

- الموقع: `http://localhost:3002`
- الإدارة: `http://localhost:3002/admin/login`

### خطأ `Cannot find module './8548.js'` أو chunk ناقص فـ `.next`

1. أوقف السيرفر (Ctrl+C).
2. `npm run clean` أو احذف مجلد `.next`.
3. `npm run dev` — أو `npm run dev:fresh`.

### الصفحة بيضاء على المنفذ 3002

غالباً استيراد عميل Prisma من مكوّن `"use client"` — بعد تعديل كبير: `npm run clean && npm run dev`.

## النشر على Hostinger

1. في لوحة البيئة عرّف **`DB_HOST`**, **`DB_PORT`** (غالباً `3306`), **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`**, **`JWT_SECRET`**, **`ADMIN_SEED_EMAIL`**, **`ADMIN_SEED_PASSWORD`**, **`NEXT_PUBLIC_SITE_URL`** (و **`NEXT_PUBLIC_APP_URL`** إن لزم). يُبنى **`DATABASE_URL`** تلقائياً قبل `prisma generate` / `migrate deploy` / البناء.
2. **لا ترفع** `.env` أو `.env.local` أو `.env.production` إلى Git.
3. `npm run build` يمرّ عبر `scripts/with-database-url.mjs` بحيث تكون **`DATABASE_URL`** مضبوطة عند كل خطوة Prisma وعند `ensure-admin`.
4. تحقق من الصحة: `GET /api/health` (متغيرات DB، توفر `DATABASE_URL` بعد التجميع، الاتصال، الجداول، الأدمن).

ملاحظة: إذا كان MySQL على نفس الخادم، قد يظهر في السجلات `127.0.0.1` أو `localhost` داخل السلسلة الناتجة — ذلك يعكس ما أدخلته في **`DB_HOST`** أو **`DATABASE_URL`** في اللوحة، وليس عنواناً ثابتاً في المشروع.

## PayPal Sandbox

1. أنشئ تطبيق Sandbox من [PayPal Developer](https://developer.paypal.com/).
2. ضع `PAYPAL_CLIENT_ID` و`PAYPAL_CLIENT_SECRET` في البيئة مع `PAYPAL_MODE=sandbox`.
3. أضف Return URL: `${NEXT_PUBLIC_APP_URL}/payment/paypal-return`

## WhatsApp

- مع `WHATSAPP_CLOUD_TOKEN` و`WHATSAPP_PHONE_NUMBER_ID` يُرسل عبر Cloud API.
- بدون ذلك: إشعار في لوحة الإدارة + SMTP اختياري + رابط wa.me.

## الأمان

- لا يتم تخزين بيانات البطاقة محلياً.
- لوحة الإدارة محمية بـ JWT في Cookie `httpOnly`.

## هيكلية i18n

الملف `src/i18n/index.ts` يوفّر قاموساً عربياً ومفاتيح أولية للفرنسية/الإنجليزية.

## بوابات دفع مغربية لاحقاً

انظر `src/lib/payments/moroccan-gateways.placeholder.ts`.
