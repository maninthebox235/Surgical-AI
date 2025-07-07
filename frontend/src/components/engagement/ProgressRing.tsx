import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressRingProps {
  value: number;
  maxValue?: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  duration?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  maxValue = 100,
  label,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  color,
  backgroundColor,
  animated = true,
  duration = 1.5,
}) => {
  const theme = useTheme();
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const defaultColor = color || theme.palette.primary.main;
  const defaultBackgroundColor = backgroundColor || theme.palette.grey[200];

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: animated ? duration : 0 }}
        style={{ width: '100%', height: '100%' }}
      >
        {React.createElement(CircularProgressbar as any, {
          value: percentage,
          strokeWidth: strokeWidth,
          styles: buildStyles({
            pathTransitionDuration: animated ? duration : 0,
            pathColor: defaultColor,
            trailColor: defaultBackgroundColor,
            textColor: theme.palette.text.primary,
            textSize: '16px',
            strokeLinecap: 'round',
          }),
        })}
      </motion.div>
      
      {showValue && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: animated ? duration * 0.5 : 0, type: 'spring', stiffness: 500 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                lineHeight: 1,
              }}
            >
              {Math.round(percentage)}%
            </Typography>
            {label && (
              <Typography
                variant="caption"
                component="div"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  mt: 0.5,
                }}
              >
                {label}
              </Typography>
            )}
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default ProgressRing;