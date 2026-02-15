// ============================================
// ABOUT PAGE - TightLines Story & Mission
// ============================================
import { Fish, Users, MapPin, Shield, Heart, TrendingUp, ArrowRight } from 'lucide-react';

export const AboutPage = ({ onSearch, onListWater }) => {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About TightLines</h1>
          <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto">
            The UK's leading fishing booking platform — connecting anglers with the best waters, guides, and experiences across the country.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-6">Our Story</h2>
          <div className="prose prose-stone max-w-none space-y-4 text-stone-700 leading-relaxed">
            <p>
              TightLines was born from a simple frustration: finding and booking quality fishing in the UK was far harder than it should be. Information was scattered across outdated websites, social media groups, and word-of-mouth. We knew there had to be a better way.
            </p>
            <p>
              We're a team of passionate anglers who believe that whether you're casting for your first fish or chasing specimen salmon on a legendary beat, the experience of finding, comparing, and booking your fishing should be as enjoyable as the fishing itself.
            </p>
            <p>
              Our platform brings together game, coarse, and sea fishing venues from every corner of the UK — from the chalk streams of Hampshire to the wild lochs of Scotland, from specimen carp lakes in the Midlands to the surf-swept beaches of the South West.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do - Values */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-900 mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'Discovery',
                desc: 'We make it easy to explore hundreds of waters across the UK — filter by species, region, price, or fishing type to find your perfect day out.'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Trust & Transparency',
                desc: 'Verified reviews, clear pricing, and honest descriptions. No hidden fees, no surprises — just great fishing.'
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Conservation',
                desc: 'We work with fisheries that prioritise sustainable practices, catch and release policies, and the long-term health of our waterways.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 text-center">
                <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Waters Listed' },
              { number: '50+', label: 'Qualified Guides' },
              { number: '12,000+', label: 'Bookings Made' },
              { number: '30+', label: 'UK Regions' }
            ].map((stat, i) => (
              <div key={i}>
                <span className="text-3xl md:text-4xl font-bold text-brand-700">{stat.number}</span>
                <p className="text-stone-600 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Fisheries & Instructors */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-900 mb-6">For Fisheries & Instructors</h2>
          <p className="text-center text-stone-600 max-w-2xl mx-auto mb-10">
            TightLines isn't just for anglers. We help fishery owners and qualified instructors reach a wider audience, manage bookings, and grow their business.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-4">
                <Fish className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-stone-900 mb-2">List Your Water</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                Get your fishery in front of thousands of anglers. Set up your own booking options, manage enquiries, and track performance — all for free during our launch period.
              </p>
              <button
                onClick={onListWater}
                className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 font-medium text-sm"
              >
                List Your Water <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-stone-900 mb-2">Become an Instructor</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                Showcase your skills and certifications, manage your availability, and connect with anglers looking to learn. We handle the bookings so you can focus on teaching.
              </p>
              <button
                onClick={onListWater}
                className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 font-medium text-sm"
              >
                Register as Instructor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Find Your Next Fishing Adventure?</h2>
          <p className="text-brand-100 mb-8">Browse waters, book day tickets, or connect with expert guides — all in one place.</p>
          <button
            onClick={onSearch}
            className="px-8 py-3 bg-white text-brand-700 rounded-xl font-semibold hover:bg-brand-50 transition"
          >
            Browse All Waters
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
