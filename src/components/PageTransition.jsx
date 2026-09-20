/**
 * Cross-fades the routed page in on every navigation, instead of the old
 * page's content being replaced by the new one's in the same instant React
 * commits — which reads as a hard cut rather than a transition, and more so
 * whenever the new page's data hasn't arrived yet and there's a loading
 * state in between.
 *
 * `key={pathKey}` is what does the actual work: changing a React key on an
 * element tells React to unmount the old node and mount a fresh one instead
 * of patching it, so the CSS animation on `.page-transition` restarts from
 * its 0% keyframe on every route change, in the same commit as the route
 * change itself — nothing to coordinate by hand.
 */
export default function PageTransition({ pathKey, children }) {
  return (
    <div key={pathKey} className="page-transition">
      {children}
    </div>
  );
}
