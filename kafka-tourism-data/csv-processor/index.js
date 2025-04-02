// csv-processor/index.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Kafka, Partitioners } = require('kafkajs');

// Configure Kafka producer
const kafka = new Kafka({
  clientId: 'csv-processor',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092']
});
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

// Helper function to read and parse CSV files
function readCsvFile(filePath, delimiter = ',') {
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: delimiter === ';' ? ';' : ',',
    trim: true
  });
}

// Process route data
async function processRoutes() {
  const routesData = readCsvFile('/data/rutas_turisticas.csv', ';');
  
  for (const route of routesData) {
    await producer.send({
      topic: 'routes',
      messages: [
        { 
          key: route.ruta_nombre,
          value: JSON.stringify({
            name: route.ruta_nombre,
            routeType: route.tipo_ruta,
            lengthKm: parseFloat(route.longitud_km),
            durationHr: parseFloat(route.duracion_hr),
            popularity: parseInt(route.popularidad)
          })
        }
      ]
    });
  }
  console.log(`Processed ${routesData.length} routes`);
}

// Process transport data
async function processTransport() {
  const transportData = readCsvFile('/data/uso_transporte.csv');
  
  for (const usage of transportData) {
    // First, send vehicle type if new
    await producer.send({
      topic: 'vehicle-types',
      messages: [
        { 
          key: usage.tipo_transporte,
          value: JSON.stringify({
            name: usage.tipo_transporte
          })
        }
      ]
    });
    
    // Then send transport usage data
    await producer.send({
      topic: 'transport-usage',
      messages: [
        { 
          value: JSON.stringify({
            date: usage.fecha,
            vehicleType: usage.tipo_transporte,
            userCount: parseInt(usage.num_usuarios),
            averageTravelTimeMin: parseFloat(usage.tiempo_viaje_promedio_min),
            popularRoute: usage.ruta_popular
          })
        }
      ]
    });
  }
  console.log(`Processed ${transportData.length} transport usage records`);
}

// Process hotel sustainability data
async function processSustainability() {
  const sustainabilityData = readCsvFile('/data/datos_sostenibilidad.csv', ';');
  
  for (const data of sustainabilityData) {
    // First, make sure the hotel is registered
    await producer.send({
      topic: 'hotels',
      messages: [
        { 
          key: data.hotel_nombre,
          value: JSON.stringify({
            name: data.hotel_nombre
          })
        }
      ]
    });
    
    // Then send sustainability data
    await producer.send({
      topic: 'hotel-sustainability',
      messages: [
        { 
          key: data.hotel_nombre,
          value: JSON.stringify({
            hotelName: data.hotel_nombre,
            date: data.fecha,
            energyConsumptionKwh: parseFloat(data.consumo_energia_kwh),
            wasteGeneratedKg: parseFloat(data.residuos_generados_kg),
            recyclingPercentage: parseFloat(data.porcentaje_reciclaje),
            waterUsageM3: parseFloat(data.uso_agua_m3)
          })
        }
      ]
    });
  }
  console.log(`Processed ${sustainabilityData.length} sustainability records`);
}

// Process hotel occupancy data
async function processOccupancy() {
  const occupancyData = readCsvFile('/data/ocupacion_hotelera.csv', ';');
  
  for (const data of occupancyData) {
    // Make sure hotel is registered
    await producer.send({
      topic: 'hotels',
      messages: [
        { 
          key: data.hotel_nombre,
          value: JSON.stringify({
            name: data.hotel_nombre
          })
        }
      ]
    });
    
    // Send occupancy data
    await producer.send({
      topic: 'hotel-occupancy',
      messages: [
        { 
          key: data.hotel_nombre,
          value: JSON.stringify({
            hotelName: data.hotel_nombre,
            date: data.fecha,
            occupancyRate: parseFloat(data.tasa_ocupacion),
            confirmedBookings: parseInt(data.reservas_confirmadas),
            cancellations: parseInt(data.cancelaciones),
            averagePricePerNight: parseFloat(data.precio_promedio_noche)
          })
        }
      ]
    });
  }
  console.log(`Processed ${occupancyData.length} occupancy records`);
}

// Process reviews
async function processReviews() {
  const reviewsData = readCsvFile('/data/opiniones_turisticas.csv');
  
  for (const review of reviewsData) {
    // Send review data
    await producer.send({
      topic: 'reviews',
      messages: [
        { 
          value: JSON.stringify({
            date: review.fecha,
            serviceType: review.tipo_servicio,
            serviceName: review.nombre_servicio,
            rating: parseInt(review.puntuacion),
            comment: review.comentario,
            language: review.idioma || 'es'
          })
        }
      ]
    });
  }
  console.log(`Processed ${reviewsData.length} reviews`);
}

// Main function to run all processing
async function main() {
  await producer.connect();
  console.log('Connected to Kafka');
  
  // Create all required topics
  const admin = kafka.admin();
  await admin.connect();
  
  const topics = [
    { topic: 'routes' },
    { topic: 'vehicle-types' },
    { topic: 'transport-usage' },
    { topic: 'hotels' },
    { topic: 'hotel-sustainability' },
    { topic: 'hotel-occupancy' },
    { topic: 'reviews' }
  ];
  
  await admin.createTopics({
    topics,
    waitForLeaders: true
  });
  
  console.log('Topics created');
  await admin.disconnect();
  
  // Process all CSV files
  try {
    await processRoutes();
    await processTransport();
    await processSustainability();
    await processOccupancy();
    await processReviews();
    
    console.log('All data processed successfully!');
  } catch (error) {
    console.error('Error processing data:', error);
  } finally {
    await producer.disconnect();
  }
}

// Run the main function
main().catch(console.error);