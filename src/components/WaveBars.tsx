export function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center justify-center gap-1">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="block w-1 rounded-full bg-primary transition-all"
          style={{
            height: active ? `${20 + Math.sin(i) * 12 + (i % 3) * 8}px` : "4px",
            animation: active
              ? `wave 0.9s ease-in-out ${i * 0.08}s infinite alternate`
              : undefined,
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}
