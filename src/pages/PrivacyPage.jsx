// ============================================
// PRIVACY POLICY PAGE
// ============================================

export const PrivacyPage = () => {
  return (
    <div>
      <section className="hero-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-brand-100">Last updated: February 2026</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 prose prose-stone">
          <h2 className="text-xl font-bold text-stone-900 mb-4">1. Introduction</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            TightLines ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal data when you use our platform, in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">2. Data We Collect</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">We collect the following types of personal data:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li><strong>Account information:</strong> Name, email address, and password when you register.</li>
            <li><strong>Profile information:</strong> Phone number, location, and any additional details you provide.</li>
            <li><strong>Booking data:</strong> Details of bookings, enquiries, and transactions made through the platform.</li>
            <li><strong>Reviews:</strong> Ratings, titles, and text content you submit.</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and interactions with the platform.</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, and cookies.</li>
            <li><strong>Payment data:</strong> Processed securely by Stripe. We do not store your full card details.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">3. How We Use Your Data</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">We use your personal data to:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li>Provide and improve our platform and services.</li>
            <li>Process bookings and facilitate communication between anglers, fisheries, and instructors.</li>
            <li>Send booking confirmations and important account notifications.</li>
            <li>Display verified reviews to other users.</li>
            <li>Prevent fraud and ensure the security of the platform.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">4. Legal Basis for Processing</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">We process your data under the following legal bases:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li><strong>Contract:</strong> Processing necessary to fulfil our agreement with you (e.g. bookings, account management).</li>
            <li><strong>Legitimate interest:</strong> Improving our services, preventing fraud, and platform analytics.</li>
            <li><strong>Consent:</strong> Where you have given explicit consent (e.g. marketing communications).</li>
            <li><strong>Legal obligation:</strong> Where processing is required by law.</li>
          </ul>

          <h2 className="text-xl font-bold text-stone-900 mb-4">5. Data Sharing</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">We may share your data with:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li><strong>Fishery owners and instructors:</strong> Your name, email, and booking details when you make a booking or enquiry.</li>
            <li><strong>Payment processors:</strong> Stripe, for secure payment processing.</li>
            <li><strong>Hosting providers:</strong> For platform infrastructure (data stored within the UK/EEA).</li>
            <li><strong>Law enforcement:</strong> Where required by law or to protect our legal rights.</li>
          </ul>
          <p className="text-stone-700 mb-6 leading-relaxed">
            We do not sell your personal data to third parties.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">6. Data Retention</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            We retain your personal data for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes. Booking records may be retained for up to 6 years for tax and accounting purposes.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">7. Your Rights</h2>
          <p className="text-stone-700 mb-4 leading-relaxed">Under UK GDPR, you have the right to:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate data.</li>
            <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten").</li>
            <li><strong>Restriction:</strong> Request restriction of processing.</li>
            <li><strong>Portability:</strong> Request your data in a portable format.</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interest.</li>
          </ul>
          <p className="text-stone-700 mb-6 leading-relaxed">
            To exercise any of these rights, please contact us at <a href="mailto:hello@tightlines.co.uk" className="text-brand-700 hover:underline">hello@tightlines.co.uk</a>.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">8. Cookies</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            We use essential cookies to keep you signed in and ensure the platform functions correctly. We do not currently use third-party tracking or advertising cookies. If this changes, we will update this policy and request your consent.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">9. Security</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            We take reasonable measures to protect your personal data, including encryption in transit (HTTPS), secure password hashing (bcrypt), and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-stone-700 mb-6 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Platform. The "Last updated" date at the top of this page indicates when the policy was last revised.
          </p>

          <h2 className="text-xl font-bold text-stone-900 mb-4">11. Contact Us</h2>
          <p className="text-stone-700 mb-2 leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us:
          </p>
          <p className="text-stone-700 mb-2 leading-relaxed">
            Email: <a href="mailto:hello@tightlines.co.uk" className="text-brand-700 hover:underline">hello@tightlines.co.uk</a>
          </p>
          <p className="text-stone-700 leading-relaxed">
            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
