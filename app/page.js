import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Eye Clinic Management System
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-primary-100">
              Professional eye care services with easy appointment booking
            </p>
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-block bg-white py-3 px-8 rounded-md font-medium text-primary-600 hover:bg-primary-50"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Comprehensive eye care services with modern facilities
          </p>
        </div>
        <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-8">
          {[
            {
              title: 'Easy Appointments',
              description: 'Book your appointments with our experienced doctors hassle-free.',
            },
            {
              title: 'Expert Doctors',
              description: 'Our team of qualified ophthalmologists provides the best care.',
            },
            {
              title: 'Modern Facilities',
              description: 'State-of-the-art equipment for accurate diagnosis and treatment.',
            },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <dt className="text-lg leading-6 font-medium text-gray-900">
                {feature.title}
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Contact Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <h2 className="max-w-md mx-auto text-3xl font-extrabold text-white text-center lg:text-left lg:max-w-none">
              Need an appointment?
            </h2>
            <div className="mt-8 lg:mt-0 text-center lg:text-right">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 