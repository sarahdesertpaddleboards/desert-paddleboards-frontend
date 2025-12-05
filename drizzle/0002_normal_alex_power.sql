CREATE TABLE `musicPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseType` enum('album','track') NOT NULL,
	`trackId` int,
	`trackTitle` varchar(255),
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255),
	`amount` int NOT NULL,
	`stripeSessionId` varchar(255) NOT NULL,
	`lastPlayedTrackId` int,
	`lastPlayedTrackTitle` varchar(255),
	`sessionId` varchar(255),
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `musicPurchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `musicPurchases_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
CREATE TABLE `trackPreviewPlays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`trackTitle` varchar(255) NOT NULL,
	`source` enum('homepage','album_page') NOT NULL,
	`sessionId` varchar(255),
	`userId` int,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trackPreviewPlays_id` PRIMARY KEY(`id`)
);
