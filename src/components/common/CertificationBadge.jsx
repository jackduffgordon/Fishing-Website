// ============================================
// CERTIFICATION BADGE COMPONENT
// Visual badge for instructor certifications
// ============================================
import { Award, Shield, Heart, GraduationCap, CheckCircle } from 'lucide-react';
import { certificationColors } from './Icons';

// Certification icon mapping
const certificationIcons = {
  'AAPGAI': Award,
  'AAPGAI Master': Award,
  'GAIA': GraduationCap,
  'GAIA Advanced': GraduationCap,
  'GAIA Level 2': GraduationCap,
  'SGAIC': Award,
  'Angling Trust': Shield,
  'Angling Trust Level 2': Shield,
  'Angling Trust Level 3': Shield,
  'First Aid': Heart,
  'River Rescue': Heart,
  'DBS': CheckCircle,
  'DBS Checked': CheckCircle,
  'Ambassador': Award,
  'Wild Trout Trust Ambassador': Award,
  'Tenkara UK Ambassador': Award,
  'Tenkara Ambassador': Award
};

const getIcon = (cert) => {
  for (const key in certificationIcons) {
    if (cert.toLowerCase().includes(key.toLowerCase())) {
      return certificationIcons[key];
    }
  }
  return Award;
};

const getColorClass = (cert) => {
  // Check for exact match first
  if (certificationColors[cert]) {
    return certificationColors[cert];
  }

  // Check for partial matches
  for (const key in certificationColors) {
    if (cert.toLowerCase().includes(key.toLowerCase())) {
      return certificationColors[key];
    }
  }

  // Default color
  return 'bg-stone-100 text-stone-700 border-stone-300';
};

export const CertificationBadge = ({ certification, size = 'md' }) => {
  const Icon = getIcon(certification);
  const colorClass = getColorClass(certification);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorClass} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {certification}
    </span>
  );
};

// List of certification badges
export const CertificationBadgeList = ({ certifications = [], size = 'md' }) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {certifications.map((cert, index) => (
        <CertificationBadge key={index} certification={cert} size={size} />
      ))}
    </div>
  );
};

export default CertificationBadge;
