import Link from "next/link";

/** Questions, using native disclosure elements so they work without JavaScript. The pricing answer is the owner-approved wording (decision F-03). */
export function Faq() {
  return (
    <section className="band" id="faq" aria-labelledby="f-title">
      <div className="wrap faq-grid">
        <div className="faq-side sec-head fade-up">
          <span className="kicker">Help</span>
          <h2 id="f-title">Questions</h2>
          <p>Straight answers about accounts, pricing, verification and publishing.</p>
          <Link className="btn btn-ghost btn-sm" href="/contact">
            Contact us{" "}
            <svg>
              <use href="#i-arrow" />
            </svg>
          </Link>
        </div>
        <div className="fade-up">
          <details>
            <summary>
              Do I need an account?
              <span className="pm">
                <svg width="16" height="16">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p className="ans">
              No account is needed to browse the Directory. An account is needed to save items and
              to use AutoFlow AI.
            </p>
          </details>
          <details open>
            <summary>
              Is AIKitFinder free?
              <span className="pm">
                <svg width="16" height="16">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p className="ans">
              Browsing the public AI Tools Directory is free and does not require an account. Some
              features may require sign-in. AI tool providers set their own prices. AutoFlow AI
              pricing has not yet been announced.
            </p>
          </details>
          <details>
            <summary>
              How is tool information verified?
              <span className="pm">
                <svg width="16" height="16">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p className="ans">
              Each fact is checked against the tool’s official source and dated. Anything not yet
              checked is labelled. Records marked “Sample” are fictional.
            </p>
          </details>
          <details>
            <summary>
              Which AI providers does AutoFlow AI use?
              <span className="pm">
                <svg width="16" height="16">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p className="ans">
              AutoFlow AI is being built to work with several AI providers, starting with Claude. In
              the first release the provider accounts are managed by AIKitFinder; you do not need
              your own API keys. You connect your own social accounts when you publish.
            </p>
          </details>
          <details>
            <summary>
              Will AutoFlow AI post to my channels automatically?
              <span className="pm">
                <svg width="16" height="16">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p className="ans">No. Nothing is published until you review and approve it.</p>
          </details>
          <details>
            <summary>
              What happens to my data?
              <span className="pm">
                <svg width="16" height="16">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p className="ans">See the Privacy page.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
