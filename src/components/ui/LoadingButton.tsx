import { Button } from "antd";
import { useState } from "react";
import type { ButtonProps } from "antd";

interface LoadingButtonProps extends Omit<ButtonProps, 'loading' | 'onClick'> {
  onClick: () => Promise<void> | void;
}

export const LoadingButton = ({ onClick, children, ...props }: LoadingButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      {...props}
      loading={loading}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};