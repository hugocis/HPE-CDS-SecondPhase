// data-consumer/index.js
const { Kafka } = require('kafkajs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const kafka = new Kafka({
  clientId: 'data-consumer',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092']
});

// Map to track entities that have been processed
const entityMap = {
  hotels: {},
  routes: {},
  vehicleTypes: {}
};

// Helper function to parse dates in different formats
function parseDate(dateString) {
  // Check for DD/MM/YYYY format
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  } 
  // Assume YYYY-MM-DD format
  return new Date(dateString);
}

// Process routes
async function handleRouteMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    // Check if route already exists
    let route = await prisma.route.findUnique({
      where: { name: data.name }
    });
    
    if (!route) {
      route = await prisma.route.create({
        data: {
          name: data.name,
          routeType: data.routeType,
          lengthKm: data.lengthKm,
          durationHr: data.durationHr,
          popularity: data.popularity
        }
      });
      console.log(`Created route: ${data.name}`);
    }
    
    entityMap.routes[data.name] = route.id;
  } catch (error) {
    console.error(`Error processing route ${data.name}:`, error);
  }
}

// Process vehicle types
async function handleVehicleTypeMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    // Check if vehicle type already exists
    let vehicleType = await prisma.vehicleType.findUnique({
      where: { name: data.name }
    });
    
    if (!vehicleType) {
      vehicleType = await prisma.vehicleType.create({
        data: { name: data.name }
      });
      console.log(`Created vehicle type: ${data.name}`);
    }
    
    entityMap.vehicleTypes[data.name] = vehicleType.id;
  } catch (error) {
    console.error(`Error processing vehicle type ${data.name}:`, error);
  }
}

// Process transport usage
async function handleTransportUsageMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    // Ensure vehicle type exists
    if (!entityMap.vehicleTypes[data.vehicleType]) {
      const vehicleType = await prisma.vehicleType.findUnique({
        where: { name: data.vehicleType }
      });
      
      if (vehicleType) {
        entityMap.vehicleTypes[data.vehicleType] = vehicleType.id;
      } else {
        console.error(`Vehicle type ${data.vehicleType} not found`);
        return;
      }
    }
    
    // Ensure route exists
    if (!entityMap.routes[data.popularRoute]) {
      // Try to find the route
      let route = await prisma.route.findUnique({
        where: { name: data.popularRoute }
      });
      
      if (!route) {
        // Create route if it doesn't exist
        route = await prisma.route.create({
          data: { name: data.popularRoute }
        });
      }
      
      entityMap.routes[data.popularRoute] = route.id;
    }
    
    // Create transport usage record
    await prisma.transportUsage.create({
      data: {
        date: parseDate(data.date),
        vehicleTypeId: entityMap.vehicleTypes[data.vehicleType],
        userCount: data.userCount,
        averageTravelTimeMin: data.averageTravelTimeMin,
        popularRouteId: entityMap.routes[data.popularRoute]
      }
    });
    
    console.log(`Created transport usage for ${data.vehicleType} on ${data.date}`);
  } catch (error) {
    console.error('Error processing transport usage:', error);
  }
}

// Process hotels
async function handleHotelMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    // Check if hotel already exists
    let hotel = await prisma.hotel.findUnique({
      where: { name: data.name }
    });
    
    if (!hotel) {
      hotel = await prisma.hotel.create({
        data: { name: data.name }
      });
      console.log(`Created hotel: ${data.name}`);
    }
    
    entityMap.hotels[data.name] = hotel.id;
  } catch (error) {
    console.error(`Error processing hotel ${data.name}:`, error);
  }
}

// Process hotel sustainability data
async function handleSustainabilityMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    // Ensure hotel exists
    if (!entityMap.hotels[data.hotelName]) {
      const hotel = await prisma.hotel.findUnique({
        where: { name: data.hotelName }
      });
      
      if (hotel) {
        entityMap.hotels[data.hotelName] = hotel.id;
      } else {
        console.error(`Hotel ${data.hotelName} not found`);
        return;
      }
    }
    
    // Create sustainability record
    await prisma.hotelSustainability.create({
      data: {
        hotelId: entityMap.hotels[data.hotelName],
        date: parseDate(data.date),
        energyConsumptionKwh: data.energyConsumptionKwh,
        wasteGeneratedKg: data.wasteGeneratedKg,
        recyclingPercentage: data.recyclingPercentage,
        waterUsageM3: data.waterUsageM3
      }
    });
    
    console.log(`Created sustainability record for ${data.hotelName} on ${data.date}`);
  } catch (error) {
    console.error('Error processing sustainability data:', error);
  }
}

// Process hotel occupancy data
async function handleOccupancyMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    // Ensure hotel exists
    if (!entityMap.hotels[data.hotelName]) {
      const hotel = await prisma.hotel.findUnique({
        where: { name: data.hotelName }
      });
      
      if (hotel) {
        entityMap.hotels[data.hotelName] = hotel.id;
      } else {
        console.error(`Hotel ${data.hotelName} not found`);
        return;
      }
    }
    
    // Create occupancy record
    await prisma.hotelOccupancy.create({
      data: {
        hotelId: entityMap.hotels[data.hotelName],
        date: parseDate(data.date),
        occupancyRate: data.occupancyRate,
        confirmedBookings: data.confirmedBookings,
        cancellations: data.cancellations,
        averagePricePerNight: data.averagePricePerNight
      }
    });
    
    console.log(`Created occupancy record for ${data.hotelName} on ${data.date}`);
  } catch (error) {
    console.error('Error processing occupancy data:', error);
  }
}

// Process reviews
async function handleReviewMessage(message) {
  const data = JSON.parse(message.value.toString());
  
  try {
    const reviewData = {
      date: parseDate(data.date),
      rating: data.rating,
      comment: data.comment,
      language: data.language
    };
    
    // Determine the type of entity being reviewed
    if (data.serviceType === 'Hotel') {
      // Ensure hotel exists
      if (!entityMap.hotels[data.serviceName]) {
        const hotel = await prisma.hotel.findUnique({
          where: { name: data.serviceName }
        });
        
        if (hotel) {
          entityMap.hotels[data.serviceName] = hotel.id;
        } else {
          // Create hotel if it doesn't exist
          const newHotel = await prisma.hotel.create({
            data: { name: data.serviceName }
          });
          entityMap.hotels[data.serviceName] = newHotel.id;
        }
      }
      
      reviewData.hotelId = entityMap.hotels[data.serviceName];
    } else if (data.serviceType === 'Ruta') {
      // Ensure route exists
      if (!entityMap.routes[data.serviceName]) {
        const route = await prisma.route.findUnique({
          where: { name: data.serviceName }
        });
        
        if (route) {
          entityMap.routes[data.serviceName] = route.id;
        } else {
          // Create route if it doesn't exist
          const newRoute = await prisma.route.create({
            data: { name: data.serviceName }
          });
          entityMap.routes[data.serviceName] = newRoute.id;
        }
      }
      
      reviewData.routeId = entityMap.routes[data.serviceName];
    } else {
      // Handle other service types
      let service = await prisma.service.findUnique({
        where: { name: data.serviceName }
      });
      
      if (!service) {
        service = await prisma.service.create({
          data: {
            name: data.serviceName,
            type: data.serviceType
          }
        });
      }
      
      reviewData.serviceId = service.id;
    }
    
    // Create review
    await prisma.review.create({ data: reviewData });
    
    console.log(`Created review for ${data.serviceType} '${data.serviceName}'`);
  } catch (error) {
    console.error('Error processing review:', error);
  }
}

// Main function to run consumer
async function main() {
  // Load existing entities to memory
  await loadExistingEntities();
  
  const consumer = kafka.consumer({ groupId: 'tourism-data-consumer' });
  await consumer.connect();
  
  // Subscribe to all topics
  await consumer.subscribe({ topics: ['routes', 'vehicle-types', 'transport-usage', 'hotels', 'hotel-sustainability', 'hotel-occupancy', 'reviews'], fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Processing message from topic: ${topic}`);
      
      switch (topic) {
        case 'routes':
          await handleRouteMessage(message);
          break;
        case 'vehicle-types':
          await handleVehicleTypeMessage(message);
          break;
        case 'transport-usage':
          await handleTransportUsageMessage(message);
          break;
        case 'hotels':
          await handleHotelMessage(message);
          break;
        case 'hotel-sustainability':
          await handleSustainabilityMessage(message);
          break;
        case 'hotel-occupancy':
          await handleOccupancyMessage(message);
          break;
        case 'reviews':
          await handleReviewMessage(message);
          break;
        default:
          console.log(`Unknown topic: ${topic}`);
      }
    },
  });
}

// Load existing entities from database to prevent duplicates
async function loadExistingEntities() {
  const hotels = await prisma.hotel.findMany();
  hotels.forEach(hotel => {
    entityMap.hotels[hotel.name] = hotel.id;
  });
  
  const routes = await prisma.route.findMany();
  routes.forEach(route => {
    entityMap.routes[route.name] = route.id;
  });
  
  const vehicleTypes = await prisma.vehicleType.findMany();
  vehicleTypes.forEach(vehicleType => {
    entityMap.vehicleTypes[vehicleType.name] = vehicleType.id;
  });
  
  console.log('Loaded existing entities:', {
    hotels: Object.keys(entityMap.hotels).length,
    routes: Object.keys(entityMap.routes).length,
    vehicleTypes: Object.keys(entityMap.vehicleTypes).length
  });
}

// Run the consumer
main().catch(console.error);