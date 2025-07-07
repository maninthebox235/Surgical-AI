import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle } from '@mui/icons-material';

interface SuccessAnimationProps {
  show: boolean;
  message: string;
  subtitle?: string;
  duration?: number;
  onComplete?: () => void;
  confetti?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  message,
  subtitle,
  duration = 3000,
  onComplete,
  confetti = true,
  size = 'medium',
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (show && confetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, confetti]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  const sizeProps = {
    small: { width: 200, padding: 2, iconSize: 40 },
    medium: { width: 300, padding: 3, iconSize: 60 },
    large: { width: 400, padding: 4, iconSize: 80 },
  };

  const currentSize = sizeProps[size];

  return (
    <AnimatePresence>
      {show && (
        <>
          {showConfetti && (
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              numberOfPieces={200}
              recycle={false}
              gravity={0.3}
              colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722']}
            />
          )}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
          >
            <Paper
              elevation={8}
              sx={{
                width: currentSize.width,
                p: currentSize.padding,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CheckCircle
                  sx={{
                    fontSize: currentSize.iconSize,
                    color: 'white',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    mb: 2,
                  }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Typography
                  variant={size === 'small' ? 'h6' : size === 'medium' ? 'h5' : 'h4'}
                  component="h2"
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  {message}
                </Typography>
                
                {subtitle && (
                  <Typography
                    variant={size === 'small' ? 'body2' : 'body1'}
                    sx={{ opacity: 0.9 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </motion.div>
            </Paper>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessAnimation;