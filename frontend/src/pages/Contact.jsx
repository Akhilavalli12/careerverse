import { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend contact endpoint in this MVP — falls back to opening the user's mail client.
    const subject = encodeURIComponent(`CareerVerse inquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} (${form.email})`);
    window.location.href = `mailto:hello@careerverse.app?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold mb-2">Contact us</h1>
      <p className="text-sm text-ink-faint mb-6">Questions about institutions, recruiter plans, or anything else — reach out.</p>

      {sent ? (
        <p className="text-sm text-primary-600">Opening your mail client... thanks for reaching out!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <input
            required
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <textarea
            required
            rows={4}
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-ink/20 dark:border-paper-light/20 bg-transparent"
          />
          <button type="submit" className="w-full py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">
            Send message
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
