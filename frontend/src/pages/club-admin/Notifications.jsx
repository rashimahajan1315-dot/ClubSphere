import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notifications";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";
import "./Notifications.css";

const getNotificationId = (notification) => notification?.id ?? notification?._id;

const getDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = getDate(value);
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const relativeDate = (value) => {
  const date = getDate(value);
  if (!date) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(value);
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async ({ quiet = false } = {}) => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const data = await fetchNotifications(user.id);
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setNotifications(rows);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "We couldn't load notifications. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );
  const readCount = notifications.length - unreadCount;

  const visibleNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...notifications]
      .filter((item) => {
        if (filter === "unread" && item.is_read) return false;
        if (filter === "read" && !item.is_read) return false;
        if (!query) return true;
        return `${item.message || ""} ${item.title || ""}`.toLowerCase().includes(query);
      })
      .sort((a, b) => (getDate(b.created_at)?.getTime() || 0) - (getDate(a.created_at)?.getTime() || 0));
  }, [notifications, filter, search]);

  const handleRead = async (notification) => {
    const id = getNotificationId(notification);
    if (!id || notification.is_read) return;
    setBusyId(id);
    setActionError("");
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) =>
        getNotificationId(item) === id ? { ...item, is_read: true } : item
      ));
    } catch (err) {
      setActionError(err?.response?.data?.detail || "Couldn't update this notification. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    setMarkingAll(true);
    setActionError("");
    try {
      await markAllNotificationsRead(user.id);
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      setActionError(err?.response?.data?.detail || "Couldn't mark all notifications as read. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="page-container cs-notifications fade-in">
      <div className="cs-notifications-eyebrow"><span /> MIT-WPU <i>·</i> CLUB OPERATIONS</div>

      <section className="cs-notifications-hero">
        <div className="cs-notifications-hero-copy">
          <p className="cs-notifications-kicker">A LITTLE CAMPUS CLARITY</p>
          <h1>Your club, <em>in the loop.</em></h1>
          <p>Updates and important messages for your club team, all in one place.</p>
        </div>
        <div className="cs-notifications-hero-art" aria-hidden="true">
          <div className="cs-notification-orbit cs-notification-orbit-one" />
          <div className="cs-notification-orbit cs-notification-orbit-two" />
          <div className="cs-notification-bell">♧</div>
          <span className="cs-notification-spark cs-spark-one">✳</span>
          <span className="cs-notification-spark cs-spark-two">✦</span>
        </div>
      </section>

      <section className="cs-notification-stats" aria-label="Notification summary">
        <article className="cs-notification-stat cs-stat-total">
          <span className="cs-notification-stat-icon">▤</span>
          <div><span className="cs-stat-label">All updates</span><strong>{notifications.length}</strong></div>
        </article>
        <article className="cs-notification-stat cs-stat-unread">
          <span className="cs-notification-stat-icon">●</span>
          <div><span className="cs-stat-label">Unread</span><strong>{unreadCount}</strong></div>
        </article>
        <article className="cs-notification-stat cs-stat-read">
          <span className="cs-notification-stat-icon">✓</span>
          <div><span className="cs-stat-label">Read</span><strong>{readCount}</strong></div>
        </article>
      </section>

      <section className="cs-notification-board">
        <div className="cs-notification-board-heading">
          <div>
            <p className="cs-notifications-kicker">YOUR INBOX</p>
            <h2>Notifications</h2>
            <p className="cs-notification-subtitle">Keep up with what needs your attention.</p>
          </div>
          <button
            type="button"
            className="cs-notification-refresh"
            onClick={() => loadNotifications({ quiet: true })}
            disabled={refreshing}
          >
            <span aria-hidden="true">↻</span> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="cs-notification-toolbar">
          <div className="cs-notification-tabs" role="group" aria-label="Filter notifications">
            {[
              { id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: unreadCount },
              { id: "read", label: "Read", count: readCount },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`cs-notification-tab ${filter === tab.id ? "is-active" : ""}`}
                onClick={() => setFilter(tab.id)}
                aria-pressed={filter === tab.id}
              >
                {tab.label}<span>{tab.count}</span>
              </button>
            ))}
          </div>
          <label className="cs-notification-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search updates"
              aria-label="Search notifications"
            />
          </label>
        </div>

        {error && (
          <div className="cs-notification-alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => loadNotifications()}>Try again</button>
          </div>
        )}
        {actionError && <div className="cs-notification-alert" role="alert">{actionError}</div>}

        <div className="cs-notification-list" aria-live="polite">
          {visibleNotifications.map((notification, index) => {
            const id = getNotificationId(notification) ?? `${notification.created_at || "notification"}-${index}`;
            const isUnread = !notification.is_read;
            return (
              <article key={id} className={`cs-notification-item ${isUnread ? "is-unread" : "is-read"}`}>
                <div className={`cs-notification-item-icon ${isUnread ? "icon-unread" : "icon-read"}`} aria-hidden="true">
                  {isUnread ? "✳" : "✓"}
                </div>
                <div className="cs-notification-item-content">
                  <div className="cs-notification-item-meta">
                    <span className={`cs-notification-state ${isUnread ? "state-unread" : "state-read"}`}>
                      {isUnread ? "NEW UPDATE" : "READ"}
                    </span>
                    <time dateTime={notification.created_at || undefined} title={formatDate(notification.created_at)}>
                      {relativeDate(notification.created_at)}
                    </time>
                  </div>
                  {notification.title && <h3>{notification.title}</h3>}
                  <p>{notification.message || "Notification details are not available."}</p>
                  <span className="cs-notification-full-date">{formatDate(notification.created_at)}</span>
                </div>
                {isUnread && (
                  <button
                    type="button"
                    className="cs-notification-read-button"
                    onClick={() => handleRead(notification)}
                    disabled={busyId === getNotificationId(notification) || !getNotificationId(notification)}
                  >
                    {busyId === getNotificationId(notification) ? "Saving…" : "Mark as read"}
                  </button>
                )}
              </article>
            );
          })}

          {!error && visibleNotifications.length === 0 && (
            <div className="cs-notification-empty">
              <div className="cs-notification-empty-art" aria-hidden="true">✳</div>
              <h3>{search.trim() ? "No matching updates" : filter === "unread" ? "You're all caught up" : filter === "read" ? "Nothing read just yet" : "It's quiet in here"}</h3>
              <p>{search.trim() ? "Try another search term or clear your search." : filter === "unread" ? "New club updates will appear here when they arrive." : "Club updates and important messages will show up here."}</p>
              {(search || filter !== "all") && <button type="button" className="cs-notification-reset" onClick={() => { setSearch(""); setFilter("all"); }}>Show all notifications</button>}
            </div>
          )}
        </div>

        <div className="cs-notification-footer">
          <span>Showing {visibleNotifications.length} of {notifications.length} updates</span>
          {unreadCount > 0 && (
            <button type="button" className="cs-notification-mark-all" onClick={handleMarkAllRead} disabled={markingAll}>
              {markingAll ? "Updating…" : "Mark all as read"} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
