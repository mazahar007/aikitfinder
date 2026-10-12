import type { Guide } from "@/lib/content/types";

/*
 * SAMPLE DATA: fictional guides for prototyping the interface. They refer to
 * the fictional tools in ./tools.ts and use example.com links only.
 */

type GuideInput = Omit<Guide, "isSample" | "status" | "troubleshooting" | "sources"> &
  Partial<Pick<Guide, "troubleshooting" | "sources">>;

function sample(guide: GuideInput): Guide {
  return {
    troubleshooting: [],
    sources: [],
    ...guide,
    status: "published",
    isSample: true,
  };
}

export const sampleGuides: Guide[] = [
  sample({
    slug: "first-ai-image",
    title: "Make your first AI image in 10 minutes",
    summary:
      "Write a clear image prompt, pick the right shape and refine the result until it fits your post.",
    skillLevel: "beginner",
    estimatedMinutes: 10,
    prerequisites: ["A free Pictora account", "An idea for one image"],
    toolSlugs: ["pictora"],
    steps: [
      {
        title: "Decide where the image will be used",
        body: "The destination decides the shape. Square works for most feeds, 9:16 for stories and short video, 16:9 for thumbnails and slides.",
      },
      {
        title: "Write the prompt in four parts",
        body: "Describe the subject first, then the style, the lighting and the mood. Put the most important thing first, because later words get less attention.",
        example:
          "A golden retriever reading a book in a library, watercolour style, soft morning light, calm and cosy",
      },
      {
        title: "Generate and compare",
        body: "Generate once and look for the result closest to what you imagined. Don’t aim for perfect yet.",
      },
      {
        title: "Refine one thing at a time",
        body: "Change a single part of the prompt (for example the lighting) and generate again. Changing everything at once makes it hard to learn what helped.",
      },
      {
        title: "Upscale and download",
        body: "When you’re happy, upscale for sharper detail and download as PNG.",
      },
    ],
    expectedOutcome: "One finished image in the right shape for where you’ll post it.",
    commonMistakes: [
      "Writing a very long prompt with competing ideas",
      "Asking for text inside the image (it’s often misspelled)",
      "Cropping a square image into a vertical one afterwards",
    ],
    troubleshooting: [
      {
        slug: "faces-look-odd",
        problem: "Faces or hands look odd",
        causes: ["Small details are hard for image models"],
        fixes: ["Generate more variations", "Use Edit on just the problem area"],
      },
    ],
    sources: [{ title: "Pictora docs (sample link)", url: "https://example.com/pictora/docs" }],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-09-22",
    updatedAt: "2026-10-06",
  }),
  sample({
    slug: "blog-post-to-video",
    title: "Turn a blog post into a short video",
    summary:
      "Summarise an article into a script, generate scenes and export a vertical video ready for social media.",
    skillLevel: "beginner",
    estimatedMinutes: 20,
    prerequisites: ["A published or drafted blog post", "Accounts for Draftwise and Storyreel"],
    toolSlugs: ["draftwise", "storyreel"],
    steps: [
      {
        title: "Summarise the article into a script",
        body: "Ask Draftwise for a script with one idea per scene. Keep it under 120 words for a 45-second video.",
        example:
          "Summarise this article into a 45-second video script for beginners. Use 6 scenes, one idea per scene, and end with a call to action: [article]",
      },
      {
        title: "Create a new video in Storyreel",
        body: "Paste the script, choose the vertical (9:16) format and let it split the scenes.",
      },
      {
        title: "Check each scene’s visual",
        body: "Swap any visual that doesn’t match its sentence. Viewers notice mismatches quickly.",
      },
      {
        title: "Pick a voice and preview",
        body: "Use a friendly voice for social content and listen for mispronounced words.",
      },
      {
        title: "Export and add captions",
        body: "Export with subtitles on: most people watch social video without sound.",
      },
    ],
    expectedOutcome: "A 30–60 second vertical video with voiceover and subtitles.",
    commonMistakes: [
      "Scripts that are too long for the target length",
      "Skipping the scene review",
    ],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-10-01",
    updatedAt: "2026-10-08",
  }),
  sample({
    slug: "summarise-long-documents",
    title: "Summarise long documents without losing key facts",
    summary: "Get accurate bullet-point summaries and check them against the original.",
    skillLevel: "beginner",
    estimatedMinutes: 8,
    prerequisites: ["A document to summarise", "A Draftwise account"],
    toolSlugs: ["draftwise"],
    steps: [
      {
        title: "Tell it who the summary is for",
        body: "A summary for your manager differs from one for revision notes. Say who will read it and how much time they have.",
      },
      {
        title: "Ask it to keep numbers and names exact",
        body: "This reduces made-up details.",
        example:
          "Summarise the text below in 7 bullet points for a busy manager. Keep numbers and names exact. Text: [text]",
      },
      {
        title: "Spot-check three facts",
        body: "Pick three numbers or claims from the summary and find them in the original.",
      },
    ],
    expectedOutcome: "A short summary you’ve checked and can share.",
    commonMistakes: ["Trusting numbers without checking"],
    verification: "needs-review",
    featured: false,
    lastVerifiedAt: "2026-06-10",
    updatedAt: "2026-09-18",
  }),
  sample({
    slug: "automate-email-summaries",
    title: "Get a daily summary of important emails",
    summary:
      "Build an automation that summarises new emails and sends you one digest each morning.",
    skillLevel: "intermediate",
    estimatedMinutes: 25,
    prerequisites: ["A Flowpilot account", "Access to your email account"],
    toolSlugs: ["flowpilot"],
    steps: [
      {
        title: "Create a new flow with a schedule trigger",
        body: "Set it to run every weekday at 8:00.",
      },
      {
        title: "Fetch emails from the last 24 hours",
        body: "Filter to your inbox and skip newsletters to keep the digest focused.",
      },
      {
        title: "Add an AI summarise step",
        body: "Ask for one line per email and a short list of anything that needs a reply.",
        example:
          "For each email, write one line: sender – topic – what they need. Then list emails that need a reply today.",
      },
      {
        title: "Send the digest to yourself",
        body: "Send it as an email or chat message, then test the flow once by hand.",
      },
    ],
    expectedOutcome: "A morning digest that arrives automatically.",
    commonMistakes: ["Forgetting to exclude newsletters", "Not testing before turning it on"],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-09-25",
    updatedAt: "2026-09-26",
  }),
  sample({
    slug: "explain-code-with-ai",
    title: "Understand unfamiliar code with an AI assistant",
    summary:
      "Use an editor assistant to explain a codebase file by file without blindly trusting it.",
    skillLevel: "intermediate",
    estimatedMinutes: 15,
    prerequisites: ["Stackmate installed in your editor", "A project to explore"],
    toolSlugs: ["stackmate"],
    steps: [
      {
        title: "Start from the entry point",
        body: "Open the file where the program starts and ask for a plain-English overview.",
      },
      {
        title: "Ask about one function at a time",
        body: "Select a function and ask what it does, what it returns and what could go wrong.",
      },
      {
        title: "Verify by running it",
        body: "Run the code or its tests to confirm the explanation matches reality.",
      },
    ],
    expectedOutcome: "Notes explaining how the main parts of the project fit together.",
    commonMistakes: ["Accepting explanations without running the code"],
    verification: "unverified",
    featured: false,
    updatedAt: "2026-10-02",
  }),
];
