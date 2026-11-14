import Link from "next/link";

/**
 * The AIKitFinder mark (the existing magnifier and spark) in the parent
 * identity: violet tile, pink spark. Needs <ParentSprite /> on the page.
 */
export function ParentLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link className="logo" href="/" aria-label="AIKitFinder home" onClick={onNavigate}>
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" fill="url(#g-parent)" />
        <use href="#mark" />
        <path
          d="M14 10.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"
          fill="#ffb3df"
          stroke="#ffb3df"
          strokeWidth=".75"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        AIKit<b>Finder</b>
      </span>
    </Link>
  );
}
