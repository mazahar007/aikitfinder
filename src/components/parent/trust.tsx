import Link from "next/link";

/** "What you can rely on": four statements, each true of the product as built or labeled as planned. */
export function Trust() {
  return (
    <section className="band" id="trust" aria-labelledby="t-title">
      <div className="wrap">
        <div className="sec-head fade-up">
          <span className="kicker">Trust</span>
          <h2 id="t-title">
            What you can <span className="serif">rely on</span>
          </h2>
        </div>
        <div className="trust fade-up">
          <div>
            <span className="ic" style={{ color: "var(--p-cyan)" }}>
              <svg>
                <use href="#i-source" />
              </svg>
            </span>
            <h3>Checked against sources</h3>
            <p>Tool facts link to the official source and show when they were last checked.</p>
            <Link href="/editorial-policy">
              Editorial policy{" "}
              <svg width="14" height="14">
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
          <div>
            <span className="ic" style={{ color: "#ffd28a" }}>
              <svg>
                <use href="#i-flask" />
              </svg>
            </span>
            <h3>Samples are labeled</h3>
            <p>Demo records are marked “Sample” and never shown as verified.</p>
            <Link href="/editorial-policy">
              How we label data{" "}
              <svg width="14" height="14">
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
          <div>
            <span className="ic" style={{ color: "var(--p-pink)" }}>
              <svg>
                <use href="#i-shield" />
              </svg>
            </span>
            <h3>You approve publishing</h3>
            <p>AutoFlow AI will never publish without your explicit approval.</p>
            <Link href="/autoflow">
              About AutoFlow AI{" "}
              <svg width="14" height="14">
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
          <div>
            <span className="ic" style={{ color: "var(--p-violet-hi)" }}>
              <svg>
                <use href="#i-flag" />
              </svg>
            </span>
            <h3>Honest status</h3>
            <p>Features that are not built yet are labeled as planned.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
