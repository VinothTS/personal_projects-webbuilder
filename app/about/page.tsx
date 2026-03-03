import { getBusinessConfig } from '@/lib/config';

export default async function AboutPage() {
  const config = await getBusinessConfig();
  const { business } = config;
  const about = business.about || {
    title: 'About Us',
    mission: '',
    vision: '',
    story: '',
    values: [],
    stats: []
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{about.title}</h1>
      
      <div className="max-w-6xl mx-auto">
        {/* Company Story */}
        {about.story && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {about.story}
            </p>
          </div>
        )}

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {about.mission && (
            <div className="bg-primary/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
              <p className="text-gray-700">
                {about.mission}
              </p>
            </div>
          )}

          {about.vision && (
            <div className="bg-secondary/10 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-primary">Our Vision</h2>
              <p className="text-gray-700">
                {about.vision}
              </p>
            </div>
          )}
        </div>

        {/* Values */}
        {about.values && about.values.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {about.values.map((value: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                  <h3 className="text-xl font-semibold mb-3 text-primary">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {about.stats && about.stats.length > 0 && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {about.stats.map((stat: any, index: number) => (
                <div key={index}>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
