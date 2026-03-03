export default function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-3 right-4 z-50">
      <div className="relative bg-red-600 text-white px-3 py-2 rounded shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-fit">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-200 text-xl leading-none"
        >
          ✕
        </button>

        <p className="pr-6 break-words text-center">{message}</p>
      </div>
    </div>
  );
}
