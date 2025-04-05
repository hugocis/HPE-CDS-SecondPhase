export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Welcome to GreenLake City</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your eco-friendly destination for sustainable tourism
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Experience the perfect blend of urban comfort and natural beauty in our environmentally conscious city.
            Discover eco-friendly hotels, sustainable transportation options, and carefully curated tourist routes
            that showcase our commitment to preserving nature while providing unforgettable experiences.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Book a Hotel</h2>
            <p className="text-gray-600 mb-4">
              Stay in our certified eco-friendly hotels, combining comfort with environmental responsibility.
            </p>
            <a href="/book-hotel" 
               className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
              Find Hotels
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Book a Route</h2>
            <p className="text-gray-600 mb-4">
              Explore our curated eco-tourism routes, from cultural landmarks to natural wonders.
            </p>
            <a href="/book-route"
               className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
              Discover Routes
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Book a Vehicle</h2>
            <p className="text-gray-600 mb-4">
              Choose from our fleet of eco-friendly vehicles for a sustainable way to explore the city.
            </p>
            <a href="/book-vehicle"
               className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
              Reserve Vehicle
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Book Services</h2>
            <p className="text-gray-600 mb-4">
              Discover eco-friendly activities, attractions, and services throughout the city.
            </p>
            <a href="/book-service"
               className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
              Browse Services
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
