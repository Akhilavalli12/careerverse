import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, QrCode, FileText } from 'lucide-react';

const features = [
  { icon: FileText, title: 'One Record, Fully Bound', desc: 'Projects, certificates, education, and experience — collected into a single verifiable transcript.' },
  { icon: Search, title: 'Recruiter Discovery', desc: 'Recruiters search and shortlist by skill, location, and verification status — no more five-tab candidate research.' },
  { icon: ShieldCheck, title: 'Institution Attestation', desc: 'Your college reviews and signs off on your credentials, the way a registrar certifies a transcript.' },
  { icon: QrCode, title: 'Carry It Anywhere', desc: 'A single QR code links straight to your live, up-to-date portfolio — no PDF to re-email.' },
];

const Landing = () => (
  <div>
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <span className="stamp text-moss-600 dark:text-moss-100">Est. Record №1</span>
        <span className="h-px flex-1 bg-ink/15 dark:bg-paper-light/15" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl md:text-7xl leading-[1.05] font-medium"
      >
        Every credential,<br />
        <span className="italic">bound into one record.</span>
      </motion.h1>

      <div className="rule-dotted w-40 mt-6 text-primary-500" />

      <p className="mt-6 text-lg text-ink-soft dark:text-paper-light/80 max-w-2xl leading-relaxed">
        Students keep their work scattered across LinkedIn, GitHub, a resume PDF, and a folder
        of certificates. CareerVerse binds it into one verified portfolio — reviewed by your
        institution, searchable by recruiters, and always current.
      </p>

      <div className="mt-10 flex flex-wrap gap-4 items-center">
        <Link
          to="/register"
          className="px-7 py-3 rounded-full bg-primary-600 text-paper-light hover:bg-primary-700 transition font-medium"
        >
          Open your record
        </Link>
        <Link
          to="/login"
          className="px-7 py-3 rounded-full border border-ink/20 dark:border-paper-light/25 hover:bg-ink/5 dark:hover:bg-paper-light/5 transition"
        >
          Sign in
        </Link>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-2xl">What's on file</h2>
        <span className="font-mono text-xs text-ink-faint uppercase tracking-wide">4 articles</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass deckle-edge rounded-lg p-6"
          >
            <span className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
            <f.icon className="text-primary-600 dark:text-primary-300 mt-3 mb-3" size={24} strokeWidth={1.75} />
            <h3 className="font-display text-lg mb-1.5">{f.title}</h3>
            <p className="text-sm text-ink-soft dark:text-paper-light/70 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="glass rounded-lg p-10 text-center">
        <p className="font-display italic text-2xl md:text-3xl leading-snug max-w-2xl mx-auto">
          "A portfolio should read like a transcript a registrar would sign — not a résumé
          dressed up to look impressive."
        </p>
        <p className="mt-4 font-mono text-xs text-ink-faint uppercase tracking-wide">— CareerVerse design principle</p>
      </div>
    </section>
  </div>
);

export default Landing;
