/**
 * Section divider used inside admin forms — turns a long stack of inputs into
 * labelled, scannable groups. Shared so Events, the post editor and the
 * campaign editor all read the same. `first` drops the top rule.
 */
export function GroupHeading({ children, first }) {
  return (
    <p
      className={`text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-lime/70 ${
        first ? "" : "mt-2 border-t border-line pt-5"
      }`}
    >
      {children}
    </p>
  );
}
