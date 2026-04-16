import { useEffect, useState, useRef } from "react";

export default function ErrorMessage({ message, onClose, type = "error" }) {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 4700);
    const close = setTimeout(() => onCloseRef.current?.(), 5000);
    return () => {
      clearTimeout(hide);
      clearTimeout(close);
    };
  }, [message]);

  if (!message) return null;

  const styles =
    type === "warning"
      ? "bg-amber-500 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed top-3 right-4 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      <div className={`relative ${styles} px-3 py-2 rounded shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-fit`}>
        <button
          type="button"
          aria-label="Close message"
          onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }}
          className="absolute top-2 right-2 text-white hover:text-gray-200 text-xl leading-none"
        >
          ✕
        </button>
        <p className="pr-6 break-words text-center">{message}</p>
      </div>
    </div>
  );
}
