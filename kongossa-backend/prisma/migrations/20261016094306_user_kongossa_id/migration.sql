-- Short public customer ID (KP100001, KP100002, ...).
-- The sequence must exist before the column default refers to it; adding the
-- column then gives every existing user its own value.
CREATE SEQUENCE "user_kongossa_id_seq" START WITH 100001;

ALTER TABLE "User" ADD COLUMN "kongossaId" TEXT NOT NULL DEFAULT ('KP'::text || nextval('user_kongossa_id_seq'::regclass));

ALTER SEQUENCE "user_kongossa_id_seq" OWNED BY "User"."kongossaId";

-- CreateIndex
CREATE UNIQUE INDEX "User_kongossaId_key" ON "User"("kongossaId");
