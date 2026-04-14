export default function AvailableSeats({maxSeats, availableSeats}) {
    return (
        <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full
    text-xs font-semibold bg-gray-300 text-black">
        {availableSeats}/{maxSeats} Available
        </div>
    );
}