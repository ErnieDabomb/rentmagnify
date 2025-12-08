// src/components/BubbleBG.jsx
export default function BubbleBG() {
  return (
    <div
      className="pointer-events-none absolute -inset-[20vmax] bottom-0 z-0 blur-3xl saturate-125"
      aria-hidden="true"
    >
      {/* Blue/Purple */}
      <div className="absolute -top-[10vmax] left-[5vmax] h-[42vmax] w-[42vmax] animate-floaty rounded-full opacity-35 mix-blend-multiply bg-[radial-gradient(circle_at_30%_30%,#c7d2fe,#93c5fd_60%,transparent_70%)] motion-reduce:animate-none" />
      {/* Mint */}
      <div className="absolute top-[10vmax] -right-[5vmax] h-[42vmax] w-[42vmax] animate-floaty-med rounded-full opacity-35 mix-blend-multiply bg-[radial-gradient(circle_at_30%_30%,#d1fae5,#86efac_60%,transparent_70%)] motion-reduce:animate-none" />
      {/* Peach/Pink */}
      <div className="absolute -bottom-[8vmax] left-0 h-[42vmax] w-[42vmax] animate-floaty-slow rounded-full opacity-35 mix-blend-multiply bg-[radial-gradient(circle_at_30%_30%,#fde68a,#fbcfe8_60%,transparent_70%)] motion-reduce:animate-none" />
      {/* Sky/Indigo */}
      <div className="absolute bottom-[6vmax] right-[10vmax] h-[42vmax] w-[42vmax] animate-floaty rounded-full opacity-35 mix-blend-multiply bg-[radial-gradient(circle_at_30%_30%,#bae6fd,#a5b4fc_60%,transparent_70%)] motion-reduce:animate-none" />
    </div>
  )
}
