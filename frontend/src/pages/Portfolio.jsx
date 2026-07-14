import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import ModernTemplate from '../portfolio-templates/ModernTemplate';
import ClassicTemplate from '../portfolio-templates/ClassicTemplate';
import MinimalTemplate from '../portfolio-templates/MinimalTemplate';
import Endorsements from '../components/Endorsements';

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

const Portfolio = () => {
  const { idOrSlug } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/students/portfolio/${idOrSlug}`)
      .then((res) => setProfile(res.data.profile))
      .catch(() => setError('Portfolio not found.'));
  }, [idOrSlug]);

  if (error) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink-faint">{error}</div>;
  if (!profile) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink-faint">Loading portfolio...</div>;

  const TemplateComponent = templates[profile.portfolioTemplate] || ModernTemplate;

  return (
    <>
      <TemplateComponent profile={profile} />
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <Endorsements studentId={profile._id} skills={profile.skills || []} />
      </div>
    </>
  );
};

export default Portfolio;
