import { Sparkles, Search, ShieldCheck, QrCode, FileText, Github, Bell, LayoutDashboard } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Unified Portfolio', desc: 'Projects, certificates, education, and experience in one page.' },
  { icon: FileText, title: 'Resume Builder + PDF Export', desc: 'Structure your resume once, export a polished PDF anytime.' },
  { icon: QrCode, title: 'QR Portfolio Sharing', desc: 'Generate a QR code that links straight to your live portfolio.' },
  { icon: Github, title: 'GitHub Import', desc: 'Pull your public repositories into your project list automatically.' },
  { icon: ShieldCheck, title: 'Institution Verification', desc: 'Get your credentials verified by your college for recruiter trust.' },
  { icon: Search, title: 'Recruiter Search & Filters', desc: 'Recruiters filter candidates by skill, location, and verification.' },
  { icon: Bell, title: 'Notifications', desc: 'Get notified the moment you are shortlisted or verified.' },
  { icon: LayoutDashboard, title: 'Role-based Dashboards', desc: 'Purpose-built views for students, recruiters, and institutions.' },
];

const Features = () => (
  <div className="max-w-6xl mx-auto px-6 py-16">
    <h1 className="text-3xl font-semibold mb-10 text-center">Features</h1>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f) => (
        <div key={f.title} className="glass rounded-2xl p-6">
          <f.icon className="text-primary-600 mb-3" size={26} />
          <h3 className="font-semibold mb-1">{f.title}</h3>
          <p className="text-sm text-ink-faint dark:text-ink-faint">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Features;
