import { motion } from "framer-motion";

export default function EmergencyButton({ onRequest, searchState }) {
  const isSearching = searchState === "searching";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[1200] flex justify-center px-4">
      <motion.button
        type="button"
        onClick={onRequest}
        disabled={isSearching}
        whileTap={{ scale: 0.98 }}
        className={`pointer-events-auto inline-flex items-center justify-center gap-3 rounded-full border px-7 py-4 font-['Space_Grotesk'] text-lg font-semibold text-white shadow-[0_18px_45px_rgba(239,68,68,0.45)] transition duration-300 ${
          isSearching
            ? "cursor-wait border-cyan-300/30 bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500"
            : "emergency-pulse border-rose-300/30 bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 hover:scale-[1.02]"
        }`}
      >
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 ${isSearching ? "animate-spin" : ""}`}>
          +
        </span>
        {isSearching ? "Finding best ICU..." : "Request Emergency Help"}
      </motion.button>
    </div>
  );
}
