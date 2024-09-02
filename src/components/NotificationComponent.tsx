import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Notification, getUnreadNotifications, markNotificationAsRead } from '../utils/notificationUtils';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NotificationComponent: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (auth.currentUser) {
        const unreadNotifications = await getUnreadNotifications(auth.currentUser.uid);
        setNotifications(unreadNotifications);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Fetch every minute

    return () => clearInterval(interval);
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

    // Navigate based on notification type
    switch (notification.type) {
      case 'rating':
      case 'favorite':
      case 'comment':
        if (notification.relatedItemId) {
          navigate(`/joke/${notification.relatedItemId}`);
        }
        break;
      case 'achievement':
        navigate('/profile');
        break;
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    if (auth.currentUser) {
      await Promise.all(notifications.map(n => n.id && markNotificationAsRead(n.id)));
      setNotifications([]);
    }
    handleClose();
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
        <List sx={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
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
              ))}
              <ListItem>
                <Button fullWidth onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              </ListItem>
            </>
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