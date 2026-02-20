// ============================================
// TERMS & CONDITIONS PAGE
// ============================================

export const TermsPage = () => {
  return (
    <div>
      <section className="hero-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Terms & Conditions</h1>
          <p className="text-brand-100">Last updated: February 2026</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 prose prose-stone">
          <h2 className="text-xl font-bold text-stone-900 mb-4">1. About TheAnglersNet</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            TheAnglersNet is a fishing booking platform operated in the United Kingdom. By accessing or using our website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">2. Definitions</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li><strong>"Platform"</strong> refers to the TheAnglersNet website, app, and associated services.</li>
            <li><strong>"User"</strong> refers to any person who accesses or uses the Platform, including anglers, fishery owners, and instructors.</li>
            <li><strong>"Water Owner"</strong> refers to any person or entity that lists a fishery or water on the Platform.</li>
            <li><strong>"Instructor"</strong> refers to any person who lists instructor or guide services on the Platform.</li>
            <li><strong>"Booking"</strong> refers to a reservation, enquiry, or purchase made through the Platform.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">3. Account Registration</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">
            To use certain features of TheAnglersNet, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li>Provide accurate and complete information when registering.</li>
            <li>Keep your login credentials secure and confidential.</li>
            <li>Notify us immediately of any unauthorised access to your account.</li>
            <li>Accept responsibility for all activity that occurs under your account.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">4. Bookings & Payments</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">
            TheAnglersNet facilitates bookings between anglers and water owners or instructors. Please note:
          </p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li>Online payments are processed securely through Stripe. TheAnglersNet does not store your card details.</li>
            <li>Enquiry-based bookings are agreements between you and the fishery or instructor. TheAnglersNet acts as an intermediary only.</li>
            <li>Cancellation and refund policies are set by individual fisheries and instructors. Please review their terms before booking.</li>
            <li>TheAnglersNet may charge a service fee on bookings, which will be clearly displayed before payment.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">5. Listing a Water or Instructor Profile</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">
            If you list a fishery or instructor profile on TheAnglersNet, you agree to:
          </p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li>Provide accurate, honest, and up-to-date information about your water or services.</li>
            <li>Hold any necessary licences, permissions, or qualifications for the services you offer.</li>
            <li>Respond to booking enquiries in a timely manner.</li>
            <li>Comply with all applicable UK laws and regulations, including health and safety requirements.</li>
          </ul>
          <p className="text-stone-700 mb-6 leading-relaxed">
            TheAnglersNet reserves the right to remove or suspend any listing that violates these terms, contains misleading information, or receives repeated complaints.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">6. Reviews</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            Reviews can only be submitted by users with a confirmed booking for the relevant water or instructor. All reviews must be honest, fair, and based on genuine experiences. TheAnglersNet reserves the right to remove reviews that are abusive, defamatory, or fraudulent. Users may edit or delete their own reviews from their profile.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">7. Acceptable Use</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li>Use the Platform for any unlawful purpose.</li>
            <li>Submit false, misleading, or fraudulent information.</li>
            <li>Interfere with or disrupt the Platform or its infrastructure.</li>
            <li>Scrape, harvest, or collect data from the Platform without permission.</li>
            <li>Impersonate any person or entity.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">8. Intellectual Property</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            All content on the TheAnglersNet platform, including text, graphics, logos, and software, is the property of TheAnglersNet or its licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">9. Limitation of Liability</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            TheAnglersNet acts as a platform connecting anglers with fisheries and instructors. We do not guarantee the quality, safety, or legality of any listed water, service, or instructor. To the maximum extent permitted by law, TheAnglersNet shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">10. Changes to These Terms</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            We may update these Terms & Conditions from time to time. We will notify users of significant changes via email or a notice on the Platform. Continued use of TheAnglersNet after changes constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">11. Contact Us</h2>
          <p className="text-stone-700 mb-2 leading-relaxed">
            If you have any questions about these Terms & Conditions, please contact us:
          </p>
          <p className="text-stone-700 leading-relaxed">
            Email: <a href="mailto:hello@theanglersnet.co.uk" className="text-brand-700 hover:underline">hello@theanglersnet.co.uk</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
