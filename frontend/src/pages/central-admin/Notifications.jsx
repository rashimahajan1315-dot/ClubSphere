
import { useCallback, useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notifications";
import Loader from "../../components/Loader.jsx";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [serverUnreadCount, setServerUnreadCount] = useState(null);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await fetchNotifications();

      // Backend returns { notifications: [...], unread_count: number }
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : [];

      setNotifications(items);
      setServerUnreadCount(
        typeof data?.unread_count === "number"
          ? data.unread_count
          : null
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const visibleNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.is_read;
    if (filter === "read") return item.is_read;
    return true;
  });

  const handleMarkRead = async (notification) => {
    const id = notification.id || notification._id;

    if (!id || notification.is_read) return;

    setUpdatingId(id);
    setError("");

    try {
      await markNotificationRead(id);

      setNotifications((current) =>
        current.map((item) =>
          String(item.id || item._id) === String(id)
            ? { ...item, is_read: true }
            : item
        )
      );

      setServerUnreadCount((count) =>
        count === null ? null : Math.max(0, count - 1)
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Could not mark this notification as read."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setMarkingAll(true);
    setError("");

    try {
      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );

      setServerUnreadCount(0);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Could not mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-brand-600">CENTRAL ADMIN</p>
          <h1 className="text-2xl font-bold text-gray-800">
            Notifications
          </h1>
          <p className="mt-1 text-gray-500">
            Review important updates and account activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="btn-secondary disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="btn-primary disabled:opacity-60"
            >
              {markingAll ? "Updating..." : "Mark all as read"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => loadNotifications()}
            className="ml-2 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-500">Total notifications</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {notifications.length}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500">Unread</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">
            {serverUnreadCount ?? unreadCount}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500">Read</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {notifications.length - unreadCount}
          </p>
        </div>
      </div>

      <div
        className="mb-4 flex flex-wrap gap-2"
        aria-label="Filter notifications"
      >
        {[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
          { value: "read", label: "Read" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              filter === option.value
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleNotifications.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-lg font-semibold text-gray-700">
            {filter === "unread"
              ? "You're all caught up!"
              : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {filter === "all"
              ? "New updates will appear here when available."
              : "Try another filter to see more notifications."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleNotifications.map((notification, index) => {
            const id =
              notification.id ||
              notification._id ||
              `notification-${index}`;

            const date = notification.created_at
              ? new Date(notification.created_at)
              : null;

            const dateLabel =
              date && !Number.isNaN(date.getTime())
                ? date.toLocaleString()
                : "Date unavailable";

            return (
              <article
                key={id}
                className={`card border ${
                  notification.is_read
                    ? "border-gray-100"
                    : "border-brand-200 bg-brand-50/30"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.is_read
                          ? "bg-gray-300"
                          : "bg-brand-600"
                      }`}
                      aria-label={
                        notification.is_read ? "Read" : "Unread"
                      }
                    />

                    <div>
                      <p
                        className={`text-sm leading-6 ${
                          notification.is_read
                            ? "text-gray-600"
                            : "font-semibold text-gray-800"
                        }`}
                      >
                        {notification.message ||
                          "You have a new notification."}
                      </p>

                      {notification.notification_type && (
                        <p className="mt-1 text-xs capitalize text-gray-500">
                          {notification.notification_type.replaceAll(
                            "_",
                            " "
                          )}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-400">
                        {dateLabel}
                      </p>
                    </div>
                  </div>

                  {!notification.is_read &&
                    (notification.id || notification._id) && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification)}
                        disabled={updatingId === id}
                        className="shrink-0 text-sm font-semibold text-brand-700 hover:underline disabled:opacity-50"
                      >
                        {updatingId === id
                          ? "Updating..."
                          : "Mark as read"}
                      </button>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
