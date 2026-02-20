// ============================================
// CONTACT PAGE - Get in Touch
// ============================================
import { useState } from 'react';
import { Mail, MessageSquare, Fish, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: `[${form.subject || 'General Enquiry'}] ${form.message}`,
          type: 'enquiry'
        })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Failed to send message. Please try again or email us directly.');
      }
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly.');
    }
    setSending(false);
  };

  if (submitted) {
    return (
      <div>
        <section className="hero-gradient text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-3">Message Sent!</h2>
            <p className="text-stone-600 leading-relaxed">
              Thanks for getting in touch. We'll get back to you within 24 hours.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto">
            Got a question, feedback, or need help with a booking? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 mb-4">Get in Touch</h2>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Whether you're an angler looking for help, a fishery owner wanting to list your water, or just have a suggestion — drop us a line.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 text-sm">Email</p>
                    <p className="text-stone-600 text-sm">hello@theanglersnet.co.uk</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 text-sm">Response Time</p>
                    <p className="text-stone-600 text-sm">We aim to reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 text-sm">Based in</p>
                    <p className="text-stone-600 text-sm">United Kingdom</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                <h3 className="font-medium text-stone-900 text-sm mb-2">Common Questions</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <Fish className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>How do I list my fishery on TheAnglersNet?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Fish className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>Can I cancel or change a booking?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Fish className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>How do I become a verified instructor?</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-600 bg-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">General Enquiry</option>
                    <option value="Booking Help">Booking Help</option>
                    <option value="List My Water">List My Water</option>
                    <option value="Become an Instructor">Become an Instructor</option>
                    <option value="Report an Issue">Report an Issue</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-auto px-8 py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
