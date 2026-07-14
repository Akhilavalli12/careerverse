import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Student — Free',
    price: '₹0',
    period: 'forever',
    features: ['Verified portfolio', 'Unlimited projects & certificates', 'Resume builder + PDF export', 'QR sharing', 'GitHub import'],
    cta: 'Create your portfolio',
    to: '/register',
  },
  {
    name: 'Recruiter — Starter',
    price: '₹0',
    period: 'up to 10 shortlists/mo',
    features: ['Candidate search & filters', 'Shortlisting & notes', 'Application tracker'],
    cta: 'Start recruiting',
    to: '/register',
    highlighted: true,
  },
  {
    name: 'Institution',
    price: 'Contact us',
    period: 'per campus',
    features: ['Bulk credential verification', 'Placement analytics', 'Dedicated support'],
    cta: 'Get in touch',
    to: '/contact',
  },
];

const Pricing = () => (
  <div className="max-w-6xl mx-auto px-6 py-16">
    <h1 className="text-3xl font-semibold mb-4 text-center">Simple, transparent pricing</h1>
    <p className="text-ink-faint text-center mb-12">CareerVerse is free for students. Recruiter and institution plans scale with your hiring volume.</p>
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((p) => (
        <div key={p.name} className={`rounded-2xl p-6 glass ${p.highlighted ? 'ring-2 ring-primary-500' : ''}`}>
          <h3 className="font-semibold text-lg">{p.name}</h3>
          <p className="mt-2 text-3xl font-bold">{p.price}</p>
          <p className="text-sm text-ink-faint mb-4">{p.period}</p>
          <ul className="space-y-2 mb-6">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-primary-600" /> {f}
              </li>
            ))}
          </ul>
          <Link to={p.to} className="block text-center py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">
            {p.cta}
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default Pricing;
