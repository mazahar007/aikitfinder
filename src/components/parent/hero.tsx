import Link from "next/link";

import { HeroLife } from "@/components/parent/hero-life/hero-life";
import { MotionToggle } from "@/components/parent/motion-toggle";

/**
 * Hero of the parent homepage (approved hybrid design): headline, supporting
 * copy and the two product buttons on the left; the Directory and AutoFlow
 * previews on the right; the living layer (fish, light, particles) behind
 * everything. The previews are decorative and hidden from assistive technology.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="mist" aria-hidden="true"></div>
      <div className="mist m2" aria-hidden="true"></div>
      <div className="horizon" aria-hidden="true"></div>
      <div className="reflect" aria-hidden="true"></div>
      <HeroLife />
      <div className="wrap hero-cols">
        <div>
          <span className="kicker rise">One account · Two AI products</span>
          <h1 id="hero-title">
            <span className="rise d1" style={{ display: "block" }}>
              Discover AI tools.
            </span>
            <span className="l2 serif rise d2">Create content with AI.</span>
          </h1>
          <p className="lead rise d3">
            AIKitFinder is home to two separate products: a directory for finding and comparing AI
            tools, and AutoFlow AI, a studio for planning and producing video content.
          </p>
          <div className="ctas rise d4">
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
          <p className="status rise d5">
            <span className="c">
              <i></i>Browsing the directory needs no account.
            </span>
            <span className="v">
              <i></i>AutoFlow AI is in development.
            </span>
          </p>
          <MotionToggle className="in-hero" />
        </div>

        <div className="stage rise d3" aria-hidden="true">
          <div className="orbit"></div>
          <div className="orbit o2"></div>

          <div className="plane af">
            <div className="pl-head">
              <span className="t">
                <i></i>AutoFlow AI<span className="hide-m">&nbsp;· Studio</span>
              </span>
              <span className="pill pill-v">Preview — not yet available</span>
            </div>
            <div className="frame">
              <svg className="ridge" viewBox="0 0 400 120" preserveAspectRatio="none">
                <path
                  d="M0 70 L60 52 L110 64 L170 38 L230 58 L290 44 L350 60 L400 50 L400 120 L0 120Z"
                  fill="#160f2c"
                />
                <path
                  d="M0 92 L80 80 L150 90 L240 76 L320 88 L400 82 L400 120 L0 120Z"
                  fill="#0a0716"
                />
                <path
                  d="M0 100 Q200 92 400 100"
                  stroke="#ffcf9e"
                  strokeOpacity=".35"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
              <span className="lb t"></span>
              <span className="lb b"></span> <span className="crop a"></span>
              <span className="crop b"></span>
              <span className="crop c"></span>
              <span className="crop d"></span>
              <span className="sc">SCENE 03 · 16:9</span>
              <span className="tc">00:01:12:04</span>
              <span className="cap">
                <span style={{ width: "150px" }}></span>
                <span style={{ width: "96px", opacity: "0.7" }}></span>
              </span>
            </div>
            <div className="tl">
              <div className="trk">
                VOICE
                <div className="lane">
                  <svg viewBox="0 0 300 20" preserveAspectRatio="none">
                    <g fill="#a68fff" opacity=".85">
                      <rect x="4" y="8" width="3" height="4" />
                      <rect x="10" y="5" width="3" height="10" />
                      <rect x="16" y="3" width="3" height="14" />
                      <rect x="22" y="6" width="3" height="8" />
                      <rect x="28" y="4" width="3" height="12" />
                      <rect x="34" y="7" width="3" height="6" />
                      <rect x="40" y="2" width="3" height="16" />
                      <rect x="46" y="5" width="3" height="10" />
                      <rect x="52" y="8" width="3" height="4" />
                      <rect x="64" y="6" width="3" height="8" />
                      <rect x="70" y="3" width="3" height="14" />
                      <rect x="76" y="5" width="3" height="10" />
                      <rect x="82" y="8" width="3" height="4" />
                      <rect x="88" y="4" width="3" height="12" />
                      <rect x="94" y="6" width="3" height="8" />
                      <rect x="100" y="2" width="3" height="16" />
                      <rect x="106" y="7" width="3" height="6" />
                      <rect x="118" y="5" width="3" height="10" />
                      <rect x="124" y="3" width="3" height="14" />
                      <rect x="130" y="6" width="3" height="8" />
                      <rect x="136" y="8" width="3" height="4" />
                      <rect x="142" y="4" width="3" height="12" />
                      <rect x="148" y="2" width="3" height="16" />
                      <rect x="154" y="5" width="3" height="10" />
                      <rect x="160" y="7" width="3" height="6" />
                      <rect x="172" y="6" width="3" height="8" />
                      <rect x="178" y="3" width="3" height="14" />
                      <rect x="184" y="5" width="3" height="10" />
                      <rect x="190" y="8" width="3" height="4" />
                      <rect x="196" y="4" width="3" height="12" />
                      <rect x="202" y="2" width="3" height="16" />
                      <rect x="208" y="6" width="3" height="8" />
                      <rect x="220" y="5" width="3" height="10" />
                      <rect x="226" y="7" width="3" height="6" />
                      <rect x="232" y="3" width="3" height="14" />
                      <rect x="238" y="5" width="3" height="10" />
                      <rect x="244" y="8" width="3" height="4" />
                      <rect x="250" y="4" width="3" height="12" />
                      <rect x="262" y="6" width="3" height="8" />
                      <rect x="268" y="3" width="3" height="14" />
                      <rect x="274" y="5" width="3" height="10" />
                      <rect x="280" y="8" width="3" height="4" />
                      <rect x="286" y="6" width="3" height="8" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="trk">
                VIDEO
                <div className="lane">
                  <span className="clip v" style={{ left: "1%", width: "22%" }}></span>
                  <span
                    className="clip v"
                    style={{ left: "24%", width: "30%", opacity: "0.8" }}
                  ></span>
                  <span className="clip v" style={{ left: "55%", width: "18%" }}></span>
                  <span
                    className="clip v"
                    style={{ left: "74%", width: "25%", opacity: "0.75" }}
                  ></span>
                </div>
              </div>
              <div className="trk">
                TEXT
                <div className="lane">
                  <span className="clip t" style={{ left: "6%", width: "14%" }}></span>
                  <span className="clip t" style={{ left: "30%", width: "18%" }}></span>
                  <span className="clip t" style={{ left: "58%", width: "12%" }}></span>
                  <span className="clip t" style={{ left: "80%", width: "15%" }}></span>
                </div>
              </div>
              <span className="playhead" style={{ left: "calc(46px + 8px + 54%)" }}></span>
            </div>
          </div>

          <div className="plane dir">
            <div className="pl-head">
              <span className="t">
                <i></i>AI Tools Directory
              </span>
              <span
                className="pill"
                style={{ color: "#ffd28a", borderColor: "rgba(255, 210, 138, 0.38)" }}
              >
                Sample data
              </span>
            </div>
            <div className="srch">
              <svg>
                <use href="#i-search" />
              </svg>
              voiceover for a documentary<span className="caret"></span>
            </div>
            <ul className="res">
              <li>
                <span
                  className="ini"
                  style={{ background: "linear-gradient(135deg, #7aeaf3, #2bb8d0)" }}
                >
                  V
                </span>
                <span>
                  <strong>Voxly</strong>
                  <em>Audio and voice</em>
                </span>
                <span className="s">SAMPLE</span>
              </li>
              <li>
                <span
                  className="ini"
                  style={{ background: "linear-gradient(135deg, #8cc8ff, #3a8ee6)" }}
                >
                  S
                </span>
                <span>
                  <strong>Storyreel</strong>
                  <em>Video generation</em>
                </span>
                <span className="s">SAMPLE</span>
              </li>
              <li>
                <span
                  className="ini"
                  style={{ background: "linear-gradient(135deg, #7ff0d4, #22b59a)" }}
                >
                  N
                </span>
                <span>
                  <strong>Notewell</strong>
                  <em>Audio and voice</em>
                </span>
                <span className="s">SAMPLE</span>
              </li>
            </ul>
          </div>

          <div className="gate">
            <span className="ic">
              <svg>
                <use href="#i-shield" />
              </svg>
            </span>
            <span>
              <b>Your approval comes first</b>
              <small>Nothing publishes without it</small>
            </span>
          </div>
        </div>
      </div>
      <Link className="scroll-cue" href="/#products" aria-label="Scroll to products">
        <span></span>Scroll
      </Link>
    </section>
  );
}
