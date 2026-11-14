import Link from "next/link";

import { products } from "@/config/products";

/** "Choose your product": two visibly different cards. Status labels come from the product registry. */
export function ProductCards() {
  return (
    <section className="band" id="products" aria-labelledby="p-title">
      <div className="wrap">
        <div className="sec-head fade-up">
          <span className="kicker">Products</span>
          <h2 id="p-title">
            Two products. <span className="serif">Use either one on its own.</span>
          </h2>
          <p>Pick the one that matches what you want to do today.</p>
        </div>

        <div className="cards">
          <article className="pcard dir fade-up">
            <div className="art" aria-hidden="true">
              <div className="dir-art">
                <div className="q">
                  <svg>
                    <use href="#i-search" />
                  </svg>
                  What do you want to do?<kbd>/</kbd>
                </div>
                <div className="chips">
                  <span>Video generation</span>
                  <span>Audio and voice</span>
                  <span>Writing and research</span>
                  <span>Image generation</span>
                  <span>Coding</span>
                  <span>Automation</span>
                </div>
              </div>
            </div>
            <div className="body">
              <div className="row1">
                <span className="num">01 · Discover</span>
                <span className="pill pill-c">
                  <i></i>
                  {products.directory.status.label}
                </span>
              </div>
              <h3>AI Tools Directory</h3>
              <p className="aud">For anyone choosing an AI tool.</p>
              <ul>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Search by task, category, price and platform
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Compare up to four tools side by side
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Guides, prompts and step-by-step workflows
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Sources and a last-checked date on tool profiles
                </li>
              </ul>
              <p className="acct">
                <b>Account:</b> not needed to browse. Needed later to save tools.
              </p>
              <Link className="btn btn-dir" href="/directory">
                Explore AI Tools{" "}
                <svg>
                  <use href="#i-arrow" />
                </svg>
              </Link>
            </div>
          </article>

          <article className="pcard af fade-up">
            <div className="art" aria-hidden="true">
              <div className="beam"></div>
              <div className="film">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div className="film-meta">
                <span>16:9 · DOCUMENTARY</span>
                <span className="rec">PREVIEW</span>
              </div>
            </div>
            <div className="body">
              <div className="row1">
                <span className="num">02 · Create</span>
                <span className="pill pill-v">
                  <i></i>
                  {products.autoflow.status.label}
                </span>
              </div>
              <h3>AutoFlow AI</h3>
              <p className="aud">For creators producing YouTube video content.</p>
              <ul>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Research topics and write scripts with AI
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Voiceover and subtitles in many languages
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  Video assembly, thumbnail and metadata
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  You review and approve before anything is published
                </li>
              </ul>
              <p className="acct">
                <b>Account:</b> required for the workspace.
              </p>
              <Link className="btn btn-af" href="/autoflow">
                Explore AutoFlow AI{" "}
                <svg>
                  <use href="#i-arrow" />
                </svg>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
