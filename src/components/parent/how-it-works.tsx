/** How the two products relate, and the planned AutoFlow pipeline with its approval step. */
export function HowItWorks() {
  return (
    <section className="band" id="how" aria-labelledby="h-title">
      <div className="wrap">
        <div className="sec-head fade-up">
          <span className="kicker">How it works</span>
          <h2 id="h-title">
            How AIKitFinder <span className="serif">fits together</span>
          </h2>
        </div>

        <div className="steps3 fade-up">
          <div>
            <span className="n c">01</span>
            <p className="lab">Discover</p>
            <h3>Find the right tool</h3>
            <p>The Directory explains what each tool does, what it costs and where to verify it.</p>
          </div>
          <div>
            <span className="n v">02</span>
            <p className="lab">Create</p>
            <h3>Produce content</h3>
            <p>AutoFlow AI guides a video from research to a reviewed, publish-ready package.</p>
          </div>
          <div>
            <span className="n p">03</span>
            <p className="lab">One account</p>
            <h3>Sign in once</h3>
            <p>One login works in both products. Each keeps its own workspace and data.</p>
          </div>
        </div>
        <p className="note fade-up">
          <svg>
            <use href="#i-info" />
          </svg>
          Tools listed in the Directory are not connected to AutoFlow AI unless an integration is
          stated.
        </p>

        <div className="pipe fade-up">
          <div className="pipe-top">
            <h3>The AutoFlow AI pipeline</h3>
            <span className="pill pill-v">
              <i></i>Planned
            </span>
            <span className="legend">
              <i></i>Dashed outline: not built yet
            </span>
          </div>
          <ol className="track" style={{ listStyle: "none", marginBottom: "0", padding: "0" }}>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-research" />
                </svg>
              </span>
              <span>Research</span>
            </li>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-script" />
                </svg>
              </span>
              <span>Script</span>
            </li>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-voice" />
                </svg>
              </span>
              <span>Voice</span>
            </li>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-video" />
                </svg>
              </span>
              <span>Video</span>
            </li>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-thumb" />
                </svg>
              </span>
              <span>Thumbnail</span>
            </li>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-seo" />
                </svg>
              </span>
              <span>SEO</span>
            </li>
            <li className="node gate2">
              <span className="dot">
                <svg>
                  <use href="#i-shield" />
                </svg>
              </span>
              <span>Your approval</span>
              <small>Always required</small>
            </li>
            <li className="node">
              <span className="dot">
                <svg>
                  <use href="#s-pub" />
                </svg>
              </span>
              <span>Publish</span>
            </li>
          </ol>
          <p className="pipe-foot">
            Every step is planned until it is built. Publishing waits for your approval.
          </p>
        </div>
      </div>
    </section>
  );
}
