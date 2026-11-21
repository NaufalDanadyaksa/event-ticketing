-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `bankName` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `bankAccountHolder` VARCHAR(191) NULL,
    `maxParticipants` INTEGER NOT NULL DEFAULT 0,
    `registrationDeadline` DATETIME(3) NOT NULL,
    `eventStartDate` DATETIME(3) NOT NULL,
    `eventEndDate` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `attendanceEnabled` BOOLEAN NOT NULL DEFAULT true,
    `attendanceSecret` VARCHAR(191) NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `events_slug_key`(`slug`),
    INDEX `events_slug_idx`(`slug`),
    INDEX `events_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registrations` (
    `id` VARCHAR(191) NOT NULL,
    `ticketCode` VARCHAR(191) NOT NULL,
    `magicToken` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `status` ENUM('WAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `paymentProofUrl` VARCHAR(191) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedByAdminId` VARCHAR(191) NULL,
    `checkInStatus` ENUM('NOT_CHECKED_IN', 'CHECKED_IN') NOT NULL DEFAULT 'NOT_CHECKED_IN',
    `checkedInAt` DATETIME(3) NULL,
    `checkedInByStaffId` VARCHAR(191) NULL,
    `attendanceStatus` ENUM('ABSENT', 'ATTENDED') NOT NULL DEFAULT 'ABSENT',
    `attendedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registrations_ticketCode_key`(`ticketCode`),
    UNIQUE INDEX `registrations_magicToken_key`(`magicToken`),
    INDEX `registrations_eventId_idx`(`eventId`),
    INDEX `registrations_email_idx`(`email`),
    INDEX `registrations_ticketCode_idx`(`ticketCode`),
    INDEX `registrations_magicToken_idx`(`magicToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_checkedInByStaffId_fkey` FOREIGN KEY (`checkedInByStaffId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
