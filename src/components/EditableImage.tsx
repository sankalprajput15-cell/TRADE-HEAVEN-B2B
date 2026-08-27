import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';
import { ImagePlus } from 'lucide-react';

interface Props {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export const EditableImage: React.FC<Props> = ({ contentKey, defaultSrc, alt, className = '' }) => {
  const { siteContent, updateField, isUserAuthorized, currentUser } = useSiteContent();
  
  const canEdit = isUserAuthorized(currentUser).isAuthorized;
  const src = contentKey.split('.').reduce((o, i) => (o ? o[i] : null), siteContent) || defaultSrc;

  const handleClick = () => {
    if (!canEdit) return;
    const newUrl = window.prompt("Enter new image URL:", src);
    if (newUrl && newUrl !== src) {
      updateField(contentKey, newUrl);
    }
  };

  return (
    <div className={`relative ${canEdit ? 'group cursor-pointer' : ''} ${className}`} onClick={(e) => { if (canEdit) { e.preventDefault(); e.stopPropagation(); handleClick(); } }}>
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-inherit" />
      {canEdit && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-inherit">
          <div className="bg-white/90 text-slate-900 px-4 py-2 rounded-full font-semibold text-sm shadow-xl flex items-center gap-2">
            <ImagePlus size={16} />
            Replace Image
          </div>
        </div>
      )}
    </div>
  );
};
