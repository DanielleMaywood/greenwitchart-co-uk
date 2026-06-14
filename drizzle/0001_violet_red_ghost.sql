CREATE TABLE `stock_adjustments` (
	`id` text PRIMARY KEY NOT NULL,
	`productId` text NOT NULL,
	`delta` integer NOT NULL,
	`previousStockCount` integer NOT NULL,
	`newStockCount` integer NOT NULL,
	`note` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "stockAdjustmentDeltaNotZero" CHECK("stock_adjustments"."delta" <> 0),
	CONSTRAINT "stockAdjustmentPreviousStockPositive" CHECK("stock_adjustments"."previousStockCount" >= 0),
	CONSTRAINT "stockAdjustmentNewStockPositive" CHECK("stock_adjustments"."newStockCount" >= 0)
);
--> statement-breakpoint
CREATE INDEX `stockAdjustmentsProductIdIdx` ON `stock_adjustments` (`productId`);