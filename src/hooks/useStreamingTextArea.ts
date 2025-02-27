import { useState, useCallback } from 'react';

export const useStreamingTextArea = () => {
  const [content, setContent] = useState('');

  const saveContent = useCallback(async (content: string): Promise<Blob> => {
    return new Blob([content], { type: 'text/csv' });
  }, []);

  return {
    content,
    setContent,
    saveContent
  };
}; 