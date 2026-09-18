import { useEffect, useRef, useState } from 'react';
import { track } from '../../lib/analytics/client';
import { updateUser, type UpdateInput } from '../../lib/signup/api';
import { messageFor, PROFILE_FAILURE } from '../../lib/signup/messages';

const LEVELS = [
  { value: 'new', label: "I'm new to trading" },
  { value: 'some', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced' },
] as const;

interface Props {
  userId: string;
  saving: boolean;
  onSaving: (saving: boolean) => void;
  onDone: () => void;
}

export default function ProfileStep({ userId, saving, onSaving, onDone }: Props) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<UpdateInput['experience_level']>();
  const [errors, setErrors] = useState<{ form?: string; name?: string; level?: string }>({});
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step so keyboard and screen-reader users land on it.
  useEffect(() => heading.current?.focus(), []);

  async function save(e: React.SyntheticEvent) {
    e.preventDefault();
    const patch: UpdateInput = { ...(name.trim() ? { display_name: name.trim() } : {}), ...(level ? { experience_level: level } : {}) };
    if (Object.keys(patch).length === 0) {
      setErrors({ form: messageFor('empty_update') });
      return;
    }
    setErrors({});
    onSaving(true);
    const res = await updateUser(userId, patch);
    if (res.ok) {
      track('profile_updated', {});
      onDone();
      return;
    }
    onSaving(false);
    const f = res.fields ?? {};
    setErrors({
      name: f.display_name ? messageFor(f.display_name) : undefined,
      level: f.experience_level ? messageFor(f.experience_level) : undefined,
      form: f.display_name || f.experience_level ? undefined : PROFILE_FAILURE,
    });
  }

  function skip() {
    track('profile_skipped', {});
    onDone();
  }

  return (
    <section aria-labelledby="profile-title">
      <h2 id="profile-title" ref={heading} tabIndex={-1}>
        Your account is ready
      </h2>
      <p className="mt-2">Tell us how you trade. It's optional, and you can skip it.</p>
      <form onSubmit={save} noValidate className="mt-6 grid gap-5">
        <div>
          <label htmlFor="display-name" className="block font-bold">
            What should we call you?
          </label>
          <input
            id="display-name"
            name="display_name"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'display-name-error' : undefined}
            className="mt-1 min-h-11 w-full rounded-md border border-line-control bg-surface-2 px-3 text-ink"
          />
          {errors.name && <FieldError id="display-name-error" text={errors.name} />}
        </div>

        <fieldset aria-describedby={errors.level ? 'level-error' : undefined}>
          <legend className="font-bold">How much trading experience do you have?</legend>
          <div className="mt-1 grid gap-1">
            {LEVELS.map((l) => (
              <label key={l.value} className="flex min-h-11 items-center gap-3">
                <input type="radio" name="experience_level" value={l.value} checked={level === l.value} onChange={() => setLevel(l.value)} className="size-5" />
                {l.label}
              </label>
            ))}
          </div>
          {errors.level && <FieldError id="level-error" text={errors.level} />}
        </fieldset>

        {errors.form && <FieldError id="profile-error" text={errors.form} />}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-6 font-bold text-on-brand hover:bg-brand-hover active:bg-brand-pressed disabled:cursor-not-allowed disabled:bg-brand-disabled disabled:text-ink-disabled"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={skip}
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-line-control px-6 font-bold hover:bg-surface-3 active:bg-surface-2 disabled:cursor-not-allowed disabled:text-ink-disabled"
          >
            Skip for now
          </button>
        </div>
      </form>
    </section>
  );
}

// Text plus a labelled icon: an error is never colour alone.
export function FieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-ink-error">
      <svg role="img" aria-label="Error" width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0">
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 5.5v5.5M10 13.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>{text}</span>
    </p>
  );
}
