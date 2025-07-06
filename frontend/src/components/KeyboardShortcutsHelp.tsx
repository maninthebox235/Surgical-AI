import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { keyboardShortcuts } from '../services/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose,
}) => {
  const shortcuts = keyboardShortcuts.getRegisteredShortcuts();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.description.split(' ')[0].toLowerCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent>
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <Box key={category} mb={3}>
            <Typography variant="h6" gutterBottom>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <List>
              {categoryShortcuts.map((shortcut, index) => (
                <React.Fragment key={shortcut.key}>
                  <ListItem>
                    <ListItemText
                      primary={shortcut.description}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {[
                            shortcut.ctrlKey && 'Ctrl',
                            shortcut.shiftKey && 'Shift',
                            shortcut.altKey && 'Alt',
                            shortcut.key.toUpperCase(),
                          ]
                            .filter(Boolean)
                            .join(' + ')}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < categoryShortcuts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp; 