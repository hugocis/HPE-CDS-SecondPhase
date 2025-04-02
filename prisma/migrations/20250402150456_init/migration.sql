-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "routeType" TEXT,
    "lengthKm" DOUBLE PRECISION,
    "durationHr" DOUBLE PRECISION,
    "popularity" INTEGER,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportUsage" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vehicleTypeId" INTEGER NOT NULL,
    "userCount" INTEGER NOT NULL,
    "averageTravelTimeMin" DOUBLE PRECISION NOT NULL,
    "popularRouteId" INTEGER,

    CONSTRAINT "TransportUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelOccupancy" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "occupancyRate" DOUBLE PRECISION NOT NULL,
    "confirmedBookings" INTEGER NOT NULL,
    "cancellations" INTEGER NOT NULL,
    "averagePricePerNight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HotelOccupancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelSustainability" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "energyConsumptionKwh" DOUBLE PRECISION NOT NULL,
    "wasteGeneratedKg" DOUBLE PRECISION NOT NULL,
    "recyclingPercentage" DOUBLE PRECISION NOT NULL,
    "waterUsageM3" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HotelSustainability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "language" TEXT,
    "serviceId" INTEGER,
    "hotelId" INTEGER,
    "routeId" INTEGER,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Route_name_key" ON "Route"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_name_key" ON "VehicleType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_name_key" ON "Hotel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- AddForeignKey
ALTER TABLE "TransportUsage" ADD CONSTRAINT "TransportUsage_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportUsage" ADD CONSTRAINT "TransportUsage_popularRouteId_fkey" FOREIGN KEY ("popularRouteId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelOccupancy" ADD CONSTRAINT "HotelOccupancy_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelSustainability" ADD CONSTRAINT "HotelSustainability_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
