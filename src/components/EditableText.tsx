import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';
import { Edit2 } from 'lucide-react';

interface Props {
  contentKey: string;
  defaultText: string;
  as?: React.ElementType;
  className?: string;
}

export const EditableText: React.FC<Props> = ({ contentKey, defaultText, as: Component = 'span', className = '' }) => {
  const { siteContent, updateField, isUserAuthorized, currentUser } = useSiteContent();
  
  const canEdit = isUserAuthorized(currentUser).isAuthorized;
  
  const value = contentKey.split('.').reduce((o, i) => (o ? o[i] : null), siteContent) || defaultText;
  
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (e.target.innerText !== value && canEdit) {
      updateField(contentKey, e.target.innerText);
    }
  };

  return (
    <Component 
      className={`${className} ${canEdit ? 'hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-2 cursor-text transition-all relative group rounded-sm' : ''}`}
      contentEditable={canEdit}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={(e) => { if (canEdit) { e.stopPropagation(); } }}
    >
      {value}
    </Component>
  );
};
