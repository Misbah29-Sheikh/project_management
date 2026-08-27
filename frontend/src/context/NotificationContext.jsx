import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    let notificationMessage = message;

    if (message?.response?.data) {
      const data = message.response.data;

      if (data.errors?.length > 0) {
        notificationMessage = data.errors
          .map((error) => Object.values(error)[0])
          .join(", ");
      } else {
        notificationMessage =
          data.message || "Something went wrong";
      }
    }

    setNotification({
      message: notificationMessage,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {notification && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${notification.type === "success"
                ? "bg-[#355E4A] text-white"
                : notification.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-[#26352D] text-white"
              }`}
          >
            {notification.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};