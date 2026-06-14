CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`stripeProductId` text NOT NULL,
	`stripePriceId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`unitAmount` integer NOT NULL,
	`currency` text NOT NULL,
	`active` integer,
	`stockCount` integer DEFAULT 0 NOT NULL,
	`stockReserved` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	CONSTRAINT "unitAmountPositive" CHECK("products"."unitAmount" >= 0),
	CONSTRAINT "stockCountPositive" CHECK("products"."stockCount" >= 0),
	CONSTRAINT "stockReservedPositive" CHECK("products"."stockReserved" >= 0),
	CONSTRAINT "stockReservedLessThanStockCount" CHECK("products"."stockReserved" <= "products"."stockCount"),
	CONSTRAINT "currencyNormalised" CHECK("products"."currency" = lower("products"."currency"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_stripeProductId_unique` ON `products` (`stripeProductId`);