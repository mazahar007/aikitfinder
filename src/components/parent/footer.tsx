import Link from "next/link";

import { ParentLogo } from "@/components/parent/logo";

/** Parent site footer: real destinations only. Deals and VoiceHub are intentionally absent. */
export function ParentFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div className="about">
            <ParentLogo />
            <p>
              Independent guide. Tool names belong to their owners; listing a tool does not mean it
              endorses us or that we endorse it.
            </p>
          </div>
          <nav aria-label="Products">
            <h4>Products</h4>
            <ul>
              <li>
                <Link href="/directory">
                  <i style={{ background: "var(--p-cyan)" }}></i>AI Tools Directory
                </Link>
              </li>
              <li>
                <Link href="/autoflow">
                  <i style={{ background: "var(--p-af-violet)" }}></i>AutoFlow AI
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Directory">
            <h4>Directory</h4>
            <ul>
              <li>
                <Link href="/tools">Tools</Link>
              </li>
              <li>
                <Link href="/categories">Categories</Link>
              </li>
              <li>
                <Link href="/guides">Guides</Link>
              </li>
              <li>
                <Link href="/prompts">Prompts</Link>
              </li>
              <li>
                <Link href="/workflows">Workflows</Link>
              </li>
              <li>
                <Link href="/compare">Compare</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="AIKitFinder">
            <h4>AIKitFinder</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/editorial-policy">Editorial policy</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/#faq">Help</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="fbot">
          <span>© 2026 AIKitFinder</span>
          <span>Product interface in English. Generated content can be multilingual.</span>
        </div>
      </div>
    </footer>
  );
}
