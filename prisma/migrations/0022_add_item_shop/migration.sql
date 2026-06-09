-- Store item shop catalog and user-owned cosmetic inventory.
CREATE TABLE "shop_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "price_dpmm" INTEGER NOT NULL DEFAULT 0,
    "preview_text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shop_items_category_check" CHECK ("category" IN ('profile_theme', 'badge', 'emote')),
    CONSTRAINT "shop_items_rarity_check" CHECK ("rarity" IN ('common', 'rare', 'epic')),
    CONSTRAINT "shop_items_price_dpmm_check" CHECK ("price_dpmm" >= 0)
);

CREATE TABLE "user_shop_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "is_equipped" BOOLEAN NOT NULL DEFAULT false,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_shop_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shop_items_code_key"
ON "shop_items"("code");

CREATE INDEX "shop_items_category_sort_order_idx"
ON "shop_items"("category", "sort_order");

CREATE INDEX "shop_items_is_active_idx"
ON "shop_items"("is_active");

CREATE UNIQUE INDEX "user_shop_items_user_id_item_id_key"
ON "user_shop_items"("user_id", "item_id");

CREATE INDEX "user_shop_items_user_id_is_equipped_idx"
ON "user_shop_items"("user_id", "is_equipped");

CREATE INDEX "user_shop_items_item_id_idx"
ON "user_shop_items"("item_id");

ALTER TABLE "user_shop_items"
ADD CONSTRAINT "user_shop_items_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_shop_items"
ADD CONSTRAINT "user_shop_items_item_id_fkey"
FOREIGN KEY ("item_id") REFERENCES "shop_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
