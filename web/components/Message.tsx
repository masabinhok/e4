"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";

interface MessageProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  type = "info",
  onClose,
}) => {
  const getStyles = () => {
    const base =
      "p-4 rounded-lg shadow-lg max-w-xs z-50 border font-medium flex items-start backdrop-blur-sm";

    switch (type) {
      case "success":
        return `${base} bg-green-500/10 border-green-500/20 text-green-300`;
      case "error":
        return `${base} bg-red-500/10 border-red-500/20 text-red-300`;
      case "warning":
        return `${base} bg-amber-500/10 border-amber-500/20 text-amber-300`;
      default:
        return `${base} bg-blue-500/10 border-blue-500/20 text-blue-300`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 mr-3 mt-0.5 flex-shrink-0";

    switch (type) {
      case "success":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.4,
            delay: 0.1,
          },
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.95,
          transition: {
            ease: "easeOut",
            duration: 0.2,
          },
        }}
        className={`${getStyles()}`}
      >
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Message;
