import React, { useRef, useEffect, useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';
import { Edit2 } from 'lucide-react';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';

interface Props {
  contentKey: string;
  defaultText: string;
  as?: React.ElementType;
  className?: string;
}

export const EditableText: React.FC<Props> = ({ contentKey, defaultText, as: Component = 'span', className = '' }) => {
  const { siteContent, updateField, isUserAuthorized, currentUser } = useSiteContent();
  const canEdit = isUserAuthorized(currentUser).isAuthorized;
  
  const siteValue = contentKey.split('.').reduce((o, i) => (o ? o[i] : null), siteContent);
  const defaultEnglishValue = contentKey.split('.').reduce((o, i) => (o ? o[i] : null), DEFAULT_SITE_CONTENT);
  const value = (siteValue && siteValue !== defaultEnglishValue) ? siteValue : defaultText;
  
  const elementRef = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Safely sync external value when not focused to prevent cursor jumping/blinking while typing
  useEffect(() => {
    if (elementRef.current && !isEditing) {
      if (elementRef.current.innerText !== value) {
        elementRef.current.innerText = value;
      }
    }
  }, [value, isEditing]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsEditing(false);
    if (e.target.innerText !== value && canEdit) {
      updateField(contentKey, e.target.innerText);
    }
  };

  const handleFocus = () => {
    if (canEdit) setIsEditing(true);
  };

  return (
    <Component 
      ref={elementRef}
      className={`${className} ${canEdit ? 'hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-2 cursor-text transition-all relative group rounded-sm' : ''}`}
      contentEditable={canEdit}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onFocus={handleFocus}
      onClick={(e: React.MouseEvent) => { if (canEdit) { e.stopPropagation(); } }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};
