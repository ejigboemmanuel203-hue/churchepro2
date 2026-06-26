// Open-book icon whose pages riffle through for ~2s when hovered.
// Pure CSS 3D (see .flipbook rules in globals.css); no JS / state needed.
export function FlipBook() {
  return (
    <div
      className="flipbook relative h-11 w-14"
      style={{ perspective: "700px" }}
      aria-hidden="true"
    >
      {/* deep-blue book cover peeking behind the pages */}
      <div className="absolute -inset-x-0.5 -bottom-0.5 top-0.5 rounded-md bg-deep shadow-sm" />

      {/* the two splayed white pages */}
      <div className="absolute inset-x-0 top-0 bottom-1 flex">
        <div className="h-full w-1/2 rounded-l-sm border border-r-0 border-steel/30 bg-white" />
        <div className="relative h-full w-1/2 rounded-r-sm border border-l-0 border-steel/30 bg-white">
          {/* faint text lines on the resting right page */}
          <div className="absolute inset-x-1 top-2 space-y-1">
            <div className="h-px bg-steel/30" />
            <div className="h-px bg-steel/30" />
            <div className="h-px w-2/3 bg-steel/30" />
          </div>
        </div>
      </div>
      {/* spine shadow down the middle */}
      <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-gradient-to-r from-steel/30 via-deep/20 to-steel/30" />

      {/* turning leaves, hinged at the spine */}
      <div
        className="absolute inset-y-0.5 left-1/2 right-0.5 bottom-1"
        style={{ transformStyle: "preserve-3d" }}
      >
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`leaf leaf-${n} absolute inset-0 rounded-r-sm border border-steel/30 bg-white shadow`}
            style={{ transformOrigin: "left center" }}
          />
        ))}
      </div>

      {/* sky bookmark ribbon */}
      <div className="absolute -top-0.5 left-1/2 h-4 w-1 -translate-x-[3px] rounded-b-sm bg-sky" />
    </div>
  );
}
