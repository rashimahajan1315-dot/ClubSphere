import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notifications";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";

export default function Notifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await fetchNotifications(user.id);

      setNotifications(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadNotifications();
  }, [user]);


  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to mark notification as read."
      );
    }
  };


  const handleMarkAllRead = async () => {
    if (!user?.id) return;

    try {
      await markAllNotificationsRead(user.id);

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to mark notifications as read."
      );
    }
  };


  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;


  if (loading) {
    return <Loader />;
  }


  return (
    <div className="page-container">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Notifications
          </h1>

          <p className="text-gray-500">
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>

        </div>


        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary"
          >
            Mark all as read
          </button>
        )}

      </div>


      {error && (
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
      )}


      <div className="flex flex-col gap-3">

        {notifications.map((notification) => (

          <div
            key={notification.id}
            className={`card flex items-start justify-between gap-4 ${
              !notification.is_read
                ? "border-l-4 border-brand-600"
                : ""
            }`}
          >

            <div>

              <p
                className={`text-sm ${
                  !notification.is_read
                    ? "font-semibold text-gray-800"
                    : "text-gray-600"
                }`}
              >
                {notification.message}
              </p>


              <p className="text-xs text-gray-400 mt-2">

                {notification.created_at
                  ? new Date(
                      notification.created_at
                    ).toLocaleString()
                  : "—"}

              </p>

            </div>


            {!notification.is_read && (

              <button
                onClick={() =>
                  handleRead(notification.id)
                }
                className="text-brand-600 text-sm font-semibold whitespace-nowrap"
              >
                Mark as read
              </button>

            )}

          </div>

        ))}


        {notifications.length === 0 && (

          <div className="card">

            <p className="text-gray-500">
              No notifications yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}