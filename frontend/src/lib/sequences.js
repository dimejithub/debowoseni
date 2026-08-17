/**
 * Automation trigger vocabulary, shared by the list and editor pages.
 *
 * These values must stay in step with the `trigger_type` check constraint in
 * supabase_schema_phase4.sql and with automations.fire() on the backend.
 */
export const TRIGGERS = [
  {
    value: "subscriber_created",
    label: "Someone joins the mailing list",
    needsValue: false,
  },
  {
    value: "tag_added",
    label: "A tag is added",
    needsValue: true,
    hint: "e.g. quiz:tier-2, newsletter, community:lte",
  },
  {
    value: "event_registered",
    label: "Someone registers for an event",
    needsValue: true,
    hint: "event slug — leave blank to fire for any event",
  },
  {
    value: "community_joined",
    label: "Someone joins the community",
    needsValue: true,
    hint: "group key, e.g. lte — leave blank for any",
  },
  { value: "manual", label: "Manual only", needsValue: false },
];

export function triggerLabel(sequence) {
  const trigger = TRIGGERS.find((t) => t.value === sequence.trigger_type);
  const base = trigger?.label || sequence.trigger_type;
  return sequence.trigger_value ? `${base} — ${sequence.trigger_value}` : base;
}
