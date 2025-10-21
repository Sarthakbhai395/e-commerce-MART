import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Notification from '../components/Notification';
import ModalNotification from '../components/ModalNotification';

const NotificationContext = createContext();

let nextId = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [modalNotification, setModalNotification] = useState(null);

  const addNotification = (message, type = 'success') => {
    const id = nextId++;
    const newNotification = { id, message, type };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove notification after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const addModalNotification = (title, message, type = 'success') => {
    setModalNotification({ title, message, type, isOpen: true });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const closeModalNotification = () => {
    setModalNotification(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, addModalNotification }}>
      {children}
      <div className="fixed top-20 right-4 z-[9999] space-y-3">
        <AnimatePresence>
          {notifications.map(({ id, message, type }) => (
            <Notification
              key={id}
              message={message}
              type={type}
              onClose={() => removeNotification(id)}
            />
          ))}
        </AnimatePresence>
      </div>
      {modalNotification && (
        <ModalNotification
          isOpen={modalNotification.isOpen}
          onClose={closeModalNotification}
          title={modalNotification.title}
          message={modalNotification.message}
          type={modalNotification.type}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};