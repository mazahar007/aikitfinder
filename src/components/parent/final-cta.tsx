import Link from "next/link";

/** Closing section: the two product choices again. */
export function FinalCta() {
  return (
    <section className="band" id="start" aria-labelledby="s-title">
      <div className="wrap fade-up">
        <h2 id="s-title">
          Where would you like <span className="serif">to start?</span>
        </h2>
        <div className="ctas">
          <Link className="btn btn-dir" href="/directory">
            Explore AI Tools{" "}
            <svg>
              <use href="#i-arrow" />
            </svg>
          </Link>
          <Link className="btn btn-af" href="/autoflow">
            Explore AutoFlow AI{" "}
            <svg>
              <use href="#i-arrow" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
