import React from 'react';
import { Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(currentLanguage === 'en' ? 'cn' : 'en');
  };

  return (
    <Button
      type="link"
      icon={<GlobalOutlined />}
      onClick={toggleLanguage}
      size="small"
      block
    >
      {currentLanguage.toUpperCase()}
    </Button>
  );
};

export default LanguageSwitcher; 