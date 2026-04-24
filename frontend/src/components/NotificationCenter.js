import { useState, useRef, useCallback } from "react";
import {
  Badge,
  IconButton,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ClickAwayListener,
  Popper,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

const initialNotifications = [
  {
    id: "1",
    message: "Welcome to SGarden! Your account has been set up.",
    timestamp: new Date().toISOString(),
    read: false,
    type: "info",
  },
  {
    id: "2",
    message: "Your garden plan has been saved successfully.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    type: "success",
  },
  {
    id: "3",
    message: "New update available for your dashboard.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    type: "info",
  },
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback((event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }, []);

  const handleMarkAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        data-testid="notification-bell"
        onClick={handleToggle}
        sx={{ mr: 1 }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          data-testid="notification-badge"
        >
          <NotificationsIcon sx={{ color: "secondary.main" }} />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            data-testid="notification-dropdown"
            elevation={8}
            sx={{
              width: 360,
              maxHeight: 480,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              mt: 1,
              borderRadius: 2,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Notifications
              </Typography>
              <Box>
                <Tooltip title="Mark all as read">
                  <IconButton
                    data-testid="notification-mark-all-read"
                    onClick={handleMarkAllAsRead}
                    size="small"
                    disabled={unreadCount === 0}
                  >
                    <DoneAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear all">
                  <IconButton
                    data-testid="notification-clear-all"
                    onClick={handleClearAll}
                    size="small"
                    disabled={notifications.length === 0}
                  >
                    <DeleteSweepIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Notification List */}
            <Box sx={{ overflowY: "auto", maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <Box
                  data-testid="notification-empty"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 6,
                    px: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {notifications.map((notification, index) => (
                    <Box key={notification.id}>
                      <ListItem
                        data-testid={`notification-item-${notification.id}`}
                        sx={{
                          bgcolor: notification.read
                            ? "transparent"
                            : "action.hover",
                          py: 1.5,
                          px: 2,
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                        }}
                      >
                        {/* Unread indicator */}
                        {!notification.read && (
                          <CircleIcon
                            data-testid={`notification-item-unread-${notification.id}`}
                            sx={{
                              fontSize: 10,
                              color: "primary.main",
                              mr: 1.5,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight={notification.read ? "normal" : "bold"}
                            >
                              {notification.message}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTime(notification.timestamp)}
                            </Typography>
                          }
                          sx={{ mr: 4 }}
                        />
                        {!notification.read && (
                          <ListItemSecondaryAction>
                            <Tooltip title="Mark as read">
                              <IconButton
                                data-testid={`notification-mark-read-${notification.id}`}
                                edge="end"
                                size="small"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <DoneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default NotificationCenter;