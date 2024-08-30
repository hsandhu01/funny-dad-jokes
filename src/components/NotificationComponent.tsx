import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Notification, getUnreadNotifications, markNotificationAsRead } from '../utils/notificationUtils';
import { auth } from '../firebase';

const NotificationComponent: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (auth.currentUser) {
        const unreadNotifications = await getUnreadNotifications(auth.currentUser.uid);
        setNotifications(unreadNotifications);
      }
    };

    fetchNotifications();
    // Set up a timer to fetch notifications periodically
    const timer = setInterval(fetchNotifications, 60000); // Fetch every minute

    return () => clearInterval(timer);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.id) {
      await markNotificationAsRead(notification.id);
      setNotifications(notifications.filter(n => n.id !== notification.id));
    }
    // Here you can add logic to navigate to the related item if needed
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List sx={{ width: 300 }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <ListItem 
                button 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemText 
                  primary={notification.message} 
                  secondary={notification.createdAt.toDate().toLocaleString()} 
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Typography>No new notifications</Typography>
            </ListItem>
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationComponent;