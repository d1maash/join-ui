/**
 * The living wallpaper every pane floats over.
 *
 * Five soft orbs on a pale ground, each drifting on its own long loop, the lot
 * shifted a little further as the page scrolls. All of it is CSS gradients and
 * transforms (see `glass.css`), so it renders with JavaScript off and stands
 * still, complete, under reduced motion.
 */
export function Wallpaper() {
  return (
    <div
      aria-hidden="true"
      className="g-wall pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="g-wall-drift">
        <div className="g-orb g-orb-a" />
        <div className="g-orb g-orb-b" />
        <div className="g-orb g-orb-c" />
        <div className="g-orb g-orb-d" />
        <div className="g-orb g-orb-e" />
      </div>
      <div className="g-wall-veil" />
    </div>
  )
}
