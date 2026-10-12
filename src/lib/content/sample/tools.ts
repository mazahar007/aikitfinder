import type { Tool } from "@/lib/content/types";

/*
 * SAMPLE DATA: every tool below is fictional and exists only to prototype the
 * interface. Names, features, settings and links are invented; all URLs use
 * the reserved example.com domain. Nothing here describes a real product.
 */

type ToolInput = Omit<
  Tool,
  | "isSample"
  | "status"
  | "tags"
  | "audience"
  | "inputs"
  | "outputs"
  | "features"
  | "limitations"
  | "setupRequirements"
  | "quickStart"
  | "settings"
  | "prompts"
  | "troubleshooting"
  | "sources"
> &
  Partial<
    Pick<
      Tool,
      | "tags"
      | "audience"
      | "inputs"
      | "outputs"
      | "features"
      | "limitations"
      | "setupRequirements"
      | "quickStart"
      | "settings"
      | "prompts"
      | "troubleshooting"
      | "sources"
    >
  >;

function sample(tool: ToolInput): Tool {
  return {
    tags: [],
    audience: [],
    inputs: [],
    outputs: [],
    features: [],
    limitations: [],
    setupRequirements: [],
    quickStart: [],
    settings: [],
    prompts: [],
    troubleshooting: [],
    sources: [{ title: "Official website (sample link)", url: tool.officialUrl }],
    ...tool,
    status: "published",
    isSample: true,
  };
}

export const sampleTools: Tool[] = [
  sample({
    slug: "storyreel",
    name: "Storyreel",
    officialUrl: "https://example.com/storyreel",
    docsUrl: "https://example.com/storyreel/docs",
    shortDescription: "Turns a short script or blog post into a narrated video with stock visuals.",
    overview:
      "Storyreel takes written text, splits it into scenes, picks matching visuals and adds an AI voiceover. You can then reorder scenes, swap visuals and export for social media or presentations. It suits people who need explainer or social videos without filming anything.",
    categorySlugs: ["video-generation", "marketing-seo"],
    tags: ["text to video", "explainer", "social media", "voiceover", "blog to video"],
    useCases: [
      "Turn a blog post into a 60-second social video",
      "Make a narrated product explainer",
      "Create lesson summaries for students",
    ],
    audience: ["Creators", "Marketers", "Teachers", "Students"],
    skillLevel: "beginner",
    pricingModel: "freemium",
    freePlan: "Free plan with watermarked exports up to 720p (sample data).",
    apiAvailable: true,
    apiNotes: "REST API for creating videos from text on paid plans (sample data).",
    inputs: ["Text or script", "Blog URL", "Your own images or clips (optional)"],
    outputs: ["MP4 video", "Subtitles file (SRT)"],
    features: [
      "Automatic scene splitting from text",
      "Stock visual suggestions per scene",
      "AI voiceover in several voices",
      "Auto-generated subtitles",
      "Export presets for vertical, square and landscape video",
    ],
    limitations: [
      "Stock visuals can look generic; plan to swap a few by hand.",
      "Voiceover pacing may need adjusting for long sentences.",
      "Free exports include a watermark.",
    ],
    setupRequirements: [
      "An account (email sign-up)",
      "A modern desktop browser; the editor is not designed for phones",
    ],
    quickStart: [
      "Create a free account on the official website.",
      "Choose “New video” and paste your script or a blog link.",
      "Pick an aspect ratio: vertical for short-form social, landscape for presentations.",
      "Review each scene and swap any visual that doesn’t fit.",
      "Choose a voice, preview the video and export.",
    ],
    firstExample: {
      prompt:
        "Turn this into a 45-second vertical video for beginners: [paste 3–4 short paragraphs].",
      expectedResult:
        "A 6–8 scene draft with visuals and voiceover that you then fine-tune scene by scene.",
    },
    settings: [
      {
        name: "Scene length",
        explanation: "How long each scene stays on screen before moving to the next.",
        options: "Short · Medium · Long",
        whenToAdjust: "Use Short for social clips and Long for tutorials people may pause.",
        tradeoffs: "Short scenes feel energetic but can rush viewers who are reading subtitles.",
        verification: "verified",
        sourceUrl: "https://example.com/storyreel/docs/scenes",
      },
      {
        name: "Voice style",
        explanation: "The tone of the AI narrator.",
        options: "Calm · Friendly · Energetic",
        whenToAdjust: "Match the audience: calm for lessons, energetic for promotions.",
        verification: "verified",
        sourceUrl: "https://example.com/storyreel/docs/voices",
      },
      {
        name: "Visual matching",
        explanation: "How strictly visuals must match the words in each scene.",
        options: "Literal · Balanced · Creative",
        whenToAdjust: "Choose Literal for factual topics where off-topic images confuse viewers.",
        tradeoffs: "Literal can repeat similar images; Creative can drift off topic.",
        verification: "needs-review",
      },
    ],
    prompts: [
      {
        slug: "blog-to-short",
        title: "Blog post to short video",
        task: "Turn a long article into a short social video",
        text: "Summarise this article into a [length]-second video script for [audience]. Use [number] scenes, one idea per scene, and end with a clear call to action: [article text]",
        placeholders: ["length", "audience", "number", "article text"],
        expectedOutput: "A scene-by-scene script ready to paste into the editor.",
        caveats: "Check facts in the summary; shortening can drop important context.",
        tested: true,
      },
      {
        slug: "product-explainer",
        title: "Product explainer",
        task: "Explain what a product does in under a minute",
        text: "Write a 60-second explainer for [product] aimed at [audience]. Cover the problem, how it works in 3 steps, and one example.",
        placeholders: ["product", "audience"],
        expectedOutput: "A short script with a problem, three steps and an example.",
        tested: false,
      },
    ],
    troubleshooting: [
      {
        slug: "export-stuck",
        problem: "Export is stuck at 99%",
        causes: ["Very long video on the free plan", "Browser tab went to sleep"],
        fixes: [
          "Keep the tab active until the export finishes.",
          "Split videos longer than 3 minutes into parts.",
          "Refresh the page; finished exports appear in the Library.",
        ],
        whenToContactSupport: "If the export still fails after splitting the video.",
      },
      {
        slug: "voice-mispronounces",
        problem: "The voiceover mispronounces a name or word",
        causes: ["Unusual names, brand names or abbreviations"],
        fixes: [
          "Spell the word phonetically in the script (for example “Nguyen” as “Win”).",
          "Add hyphens to slow down abbreviations (A-I instead of AI).",
        ],
      },
    ],
    sources: [
      {
        title: "Official website (sample link)",
        url: "https://example.com/storyreel",
        checkedAt: "2026-10-01",
      },
      {
        title: "Help centre: scenes and voices (sample link)",
        url: "https://example.com/storyreel/docs",
        checkedAt: "2026-10-01",
      },
    ],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-10-01",
    updatedAt: "2026-10-08",
  }),
  sample({
    slug: "pictora",
    name: "Pictora",
    officialUrl: "https://example.com/pictora",
    docsUrl: "https://example.com/pictora/docs",
    shortDescription: "Creates images and illustrations from a written description.",
    overview:
      "Pictora generates images from text prompts. You describe the subject, style and mood, and it returns several options you can refine, upscale or edit. Good for social posts, thumbnails, concept art and presentation visuals.",
    categorySlugs: ["image-generation", "design"],
    tags: ["text to image", "illustration", "thumbnail", "concept art"],
    useCases: ["Social media visuals", "Video thumbnails", "Concept art and mood boards"],
    audience: ["Creators", "Designers", "Students", "Small businesses"],
    skillLevel: "beginner",
    pricingModel: "freemium",
    freePlan: "Free daily credits (sample data).",
    apiAvailable: true,
    inputs: ["Text prompt", "Reference image (optional)"],
    outputs: ["PNG or JPG images"],
    features: [
      "Several variations per prompt",
      "Style presets (photo, illustration, 3D, watercolour)",
      "Upscaling",
      "Edit part of an image by selecting it",
    ],
    limitations: [
      "Text inside images is often misspelled.",
      "Hands and small details can look wrong.",
      "Check the licence terms before commercial use.",
    ],
    setupRequirements: ["An account", "Credits for generation"],
    quickStart: [
      "Sign in and open the Create page.",
      "Describe the subject first, then style, lighting and mood.",
      "Generate and pick the closest result.",
      "Use Vary or Edit to refine it, then upscale and download.",
    ],
    firstExample: {
      prompt:
        "A cosy study desk by a window at sunrise, warm light, plants, flat illustration style, soft colours",
      expectedResult: "Four illustrated variations of a desk scene in a consistent flat style.",
    },
    settings: [
      {
        name: "Guidance",
        explanation:
          "How closely the image follows your words compared with the model’s own ideas.",
        options: "1–20 (default 7)",
        whenToAdjust:
          "Raise it when results ignore parts of your prompt; lower it for more variety.",
        tradeoffs: "Very high values can look over-processed.",
        verification: "verified",
        sourceUrl: "https://example.com/pictora/docs/guidance",
      },
      {
        name: "Aspect ratio",
        explanation: "The shape of the image.",
        options: "1:1 · 4:5 · 16:9 · 9:16",
        whenToAdjust: "Pick it before generating; cropping later loses detail.",
        verification: "verified",
      },
      {
        name: "Seed",
        explanation:
          "A number that makes results repeatable when the prompt and settings stay the same.",
        whenToAdjust: "Reuse a seed to make small prompt changes without losing the composition.",
        verification: "needs-review",
      },
    ],
    prompts: [
      {
        slug: "youtube-thumbnail",
        title: "Video thumbnail background",
        task: "Create an eye-catching thumbnail background",
        text: "[subject], dramatic lighting, high contrast, bold colours, empty space on the [left/right] for text, 16:9",
        placeholders: ["subject", "left/right"],
        expectedOutput: "A thumbnail background with room for your own title text.",
        caveats: "Add the title text in a design tool; generated text is unreliable.",
        tested: true,
      },
    ],
    troubleshooting: [
      {
        slug: "ignores-prompt",
        problem: "The image ignores part of my prompt",
        causes: ["Too many ideas in one prompt", "Guidance set low"],
        fixes: [
          "Put the most important subject first.",
          "Remove less important details.",
          "Raise Guidance by 2–3 points.",
        ],
      },
    ],
    sources: [
      {
        title: "Official website (sample link)",
        url: "https://example.com/pictora",
        checkedAt: "2026-09-20",
      },
    ],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-09-20",
    updatedAt: "2026-10-05",
  }),
  sample({
    slug: "draftwise",
    name: "Draftwise",
    officialUrl: "https://example.com/draftwise",
    shortDescription: "A writing assistant for drafting, rewriting and summarising text.",
    overview:
      "Draftwise helps you go from a blank page to a clear draft. It can outline, expand bullet points, adjust tone, shorten text and summarise long documents. It works best when you give it context about your audience and goal.",
    categorySlugs: ["writing-research", "productivity"],
    tags: ["writing", "blog post", "email", "summarise", "rewrite"],
    useCases: [
      "Blog posts and articles",
      "Emails and cover letters",
      "Summaries of long documents",
    ],
    audience: ["Students", "Freelancers", "Professionals"],
    skillLevel: "beginner",
    pricingModel: "freemium",
    freePlan: "Limited monthly words on the free plan (sample data).",
    apiAvailable: false,
    inputs: ["Text", "Documents (PDF, DOCX)"],
    outputs: ["Text"],
    features: ["Outline generator", "Tone adjustment", "Summaries", "Rewrite and shorten"],
    limitations: [
      "Can state incorrect facts confidently; verify anything important.",
      "Long documents may be summarised unevenly.",
    ],
    setupRequirements: ["An account"],
    quickStart: [
      "Create a document and describe your goal and audience in one sentence.",
      "Ask for an outline before asking for full text.",
      "Expand one section at a time and edit as you go.",
    ],
    settings: [
      {
        name: "Tone",
        explanation: "The overall voice of the writing.",
        options: "Neutral · Friendly · Formal · Persuasive",
        verification: "verified",
      },
      {
        name: "Creativity",
        explanation: "How much the assistant varies its wording and ideas.",
        options: "Low · Medium · High",
        whenToAdjust: "Use Low for factual or professional writing.",
        tradeoffs: "High creativity can introduce claims you did not ask for.",
        verification: "needs-review",
      },
    ],
    prompts: [
      {
        slug: "blog-outline",
        title: "Blog post outline",
        task: "Plan a blog post before writing it",
        text: "Create an outline for a [length]-word blog post about [topic] for [audience]. Include a hook, 4–6 sections with one-line summaries, and a conclusion.",
        placeholders: ["length", "topic", "audience"],
        expectedOutput: "A structured outline you can expand section by section.",
        tested: true,
      },
      {
        slug: "summarise-document",
        title: "Summarise a document",
        task: "Get the key points of a long text",
        text: "Summarise the text below in [number] bullet points for someone who has [time] to read it. Keep numbers and names exact. Text: [text]",
        placeholders: ["number", "time", "text"],
        expectedOutput: "A short bulleted summary.",
        caveats: "Check numbers against the original.",
        tested: true,
      },
    ],
    troubleshooting: [
      {
        slug: "too-generic",
        problem: "The writing sounds generic",
        causes: ["Prompt lacks audience, goal or examples"],
        fixes: [
          "Say who the reader is and what they should do after reading.",
          "Paste a paragraph of your own writing and ask it to match the style.",
        ],
      },
    ],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-09-28",
    updatedAt: "2026-09-30",
  }),
  sample({
    slug: "cutwise",
    name: "Cutwise",
    officialUrl: "https://example.com/cutwise",
    shortDescription: "Removes silences, adds captions and resizes clips for every platform.",
    overview:
      "Cutwise speeds up editing of footage you already have. It detects pauses and filler words, generates captions and reframes video for vertical formats.",
    categorySlugs: ["video-editing"],
    tags: ["captions", "subtitles", "remove silence", "reframe"],
    useCases: ["Podcast clips", "Talking-head videos", "Short-form social clips"],
    audience: ["Creators", "Podcasters"],
    skillLevel: "beginner",
    pricingModel: "freemium",
    apiAvailable: false,
    features: ["Silence and filler-word removal", "Auto captions", "Smart reframing"],
    limitations: ["Caption accuracy drops with background music or strong accents."],
    quickStart: [
      "Upload a video.",
      "Run “Remove silences” and review the cuts.",
      "Generate captions and export.",
    ],
    verification: "needs-review",
    featured: false,
    lastVerifiedAt: "2026-07-14",
    updatedAt: "2026-09-02",
  }),
  sample({
    slug: "canvasmint",
    name: "Canvasmint",
    officialUrl: "https://example.com/canvasmint",
    shortDescription: "Designs social posts, slides and simple brand assets from a short brief.",
    overview:
      "Canvasmint generates editable layouts from a short description and your brand colours. Everything stays editable, so you can adjust text and images by hand.",
    categorySlugs: ["design", "marketing-seo"],
    tags: ["social graphics", "presentation", "brand kit"],
    useCases: ["Instagram posts", "Presentation slides", "Event posters"],
    audience: ["Small businesses", "Creators", "Students"],
    skillLevel: "beginner",
    pricingModel: "freemium",
    apiAvailable: false,
    features: ["Layout generation", "Brand kit", "Resize for platforms"],
    verification: "verified",
    featured: false,
    lastVerifiedAt: "2026-09-10",
    updatedAt: "2026-09-10",
  }),
  sample({
    slug: "voxly",
    name: "Voxly",
    officialUrl: "https://example.com/voxly",
    shortDescription: "Natural-sounding voiceovers and audio clean-up for videos and podcasts.",
    overview:
      "Voxly converts text to speech in many voices and removes noise from recordings. Paid plans include voice cloning with consent checks.",
    categorySlugs: ["audio-voice"],
    tags: ["text to speech", "voiceover", "noise removal", "podcast"],
    useCases: ["Video narration", "Podcast clean-up", "Audio versions of articles"],
    audience: ["Creators", "Educators", "Podcasters"],
    skillLevel: "intermediate",
    pricingModel: "paid",
    apiAvailable: true,
    features: ["Text to speech", "Noise removal", "Pronunciation dictionary"],
    limitations: ["Emotional range is limited for long dramatic reads."],
    verification: "needs-review",
    featured: true,
    lastVerifiedAt: "2026-06-30",
    updatedAt: "2026-09-21",
  }),
  sample({
    slug: "citebird",
    name: "Citebird",
    officialUrl: "https://example.com/citebird",
    shortDescription: "Research assistant that answers questions with links to its sources.",
    overview:
      "Citebird searches papers and web pages, summarises what it finds and shows where each claim came from, so you can check it.",
    categorySlugs: ["writing-research"],
    tags: ["research", "citations", "literature review", "study"],
    useCases: ["Literature reviews", "Fact-checking", "Study notes"],
    audience: ["Students", "Researchers", "Journalists"],
    skillLevel: "intermediate",
    pricingModel: "free",
    apiAvailable: false,
    features: ["Answers with citations", "Paper summaries", "Export to reference managers"],
    limitations: ["Coverage of paywalled papers is limited."],
    verification: "verified",
    featured: false,
    lastVerifiedAt: "2026-09-15",
    updatedAt: "2026-09-15",
  }),
  sample({
    slug: "stackmate",
    name: "Stackmate",
    officialUrl: "https://example.com/stackmate",
    shortDescription: "Open-source coding assistant that runs in your editor.",
    overview:
      "Stackmate suggests code, explains unfamiliar code and writes tests from inside your editor. It can run with a local model, so code never leaves your machine.",
    categorySlugs: ["coding-development"],
    tags: ["code completion", "explain code", "tests", "local model"],
    useCases: ["Learning a new codebase", "Writing tests", "Refactoring"],
    audience: ["Developers", "Students"],
    skillLevel: "intermediate",
    pricingModel: "open-source",
    apiAvailable: true,
    features: ["Inline suggestions", "Chat about selected code", "Local model support"],
    limitations: ["Local models need a capable computer.", "Suggestions still need review."],
    setupRequirements: ["A supported code editor", "Optional: a local model runtime"],
    settings: [
      {
        name: "Context size",
        explanation: "How much surrounding code is sent to the model with each request.",
        whenToAdjust:
          "Increase for better suggestions in large files; decrease if responses are slow.",
        tradeoffs: "Larger context is slower and, with hosted models, costs more.",
        verification: "unverified",
      },
    ],
    verification: "needs-review",
    featured: false,
    lastVerifiedAt: "2026-08-20",
    updatedAt: "2026-10-02",
  }),
  sample({
    slug: "bugscout",
    name: "Bugscout",
    officialUrl: "https://example.com/bugscout",
    shortDescription: "Reviews pull requests and points out likely bugs before you merge.",
    overview:
      "Bugscout reads code changes, flags risky patterns and explains why. It integrates with code-hosting platforms and leaves review comments.",
    categorySlugs: ["coding-development"],
    tags: ["code review", "pull request", "bugs", "security"],
    useCases: ["Automated code review", "Catching regressions"],
    audience: ["Developers", "Engineering teams"],
    skillLevel: "advanced",
    pricingModel: "paid",
    apiAvailable: true,
    verification: "unverified",
    featured: false,
    updatedAt: "2026-08-11",
  }),
  sample({
    slug: "flowpilot",
    name: "Flowpilot",
    officialUrl: "https://example.com/flowpilot",
    shortDescription: "Connects your apps and runs AI steps automatically when something happens.",
    overview:
      "Flowpilot lets you build automations like “when a form is submitted, summarise it and post to chat” without code. AI steps can summarise, classify or draft replies.",
    categorySlugs: ["automation", "productivity"],
    tags: ["no-code", "integrations", "automation", "integrations hub"],
    useCases: ["Summarise new emails", "Route support requests", "Post content on a schedule"],
    audience: ["Freelancers", "Small businesses", "Operations teams"],
    skillLevel: "intermediate",
    pricingModel: "freemium",
    apiAvailable: true,
    features: ["Visual workflow builder", "Hundreds of app connectors", "AI steps"],
    limitations: ["Free plan runs automations less often."],
    verification: "verified",
    featured: true,
    lastVerifiedAt: "2026-09-25",
    updatedAt: "2026-09-25",
  }),
  sample({
    slug: "notewell",
    name: "Notewell",
    officialUrl: "https://example.com/notewell",
    shortDescription: "Records meetings and turns them into notes and action items.",
    overview:
      "Notewell joins or records your meetings, transcribes them and writes a summary with decisions and next steps.",
    categorySlugs: ["productivity", "audio-voice"],
    tags: ["meeting notes", "transcription", "action items"],
    useCases: ["Team meetings", "Lectures", "Interviews"],
    audience: ["Students", "Professionals"],
    skillLevel: "beginner",
    pricingModel: "free",
    apiAvailable: false,
    limitations: ["Always ask participants for consent before recording."],
    verification: "verified",
    featured: false,
    lastVerifiedAt: "2026-09-05",
    updatedAt: "2026-09-05",
  }),
  sample({
    slug: "rankwise",
    name: "Rankwise",
    officialUrl: "https://example.com/rankwise",
    shortDescription: "Keyword research and content briefs for search-friendly articles.",
    overview:
      "Rankwise suggests topics people search for, analyses competing pages and generates a content brief with headings and questions to answer.",
    categorySlugs: ["marketing-seo"],
    tags: ["seo", "keywords", "content brief", "blog"],
    useCases: ["Planning blog content", "Content briefs for writers"],
    audience: ["Marketers", "Bloggers", "Freelancers"],
    skillLevel: "intermediate",
    pricingModel: "paid",
    verification: "needs-review",
    featured: false,
    lastVerifiedAt: "2026-05-18",
    updatedAt: "2026-08-30",
  }),
  sample({
    slug: "chartsmith",
    name: "Chartsmith",
    officialUrl: "https://example.com/chartsmith",
    shortDescription: "Ask questions about a spreadsheet in plain English and get charts back.",
    overview:
      "Chartsmith reads CSV or spreadsheet files, answers questions about them and creates charts. It shows the steps it took so you can check the analysis.",
    categorySlugs: ["data-analytics"],
    tags: ["spreadsheet", "csv", "charts", "analysis"],
    useCases: ["Quick data exploration", "Charts for reports"],
    audience: ["Analysts", "Students", "Small businesses"],
    skillLevel: "advanced",
    pricingModel: "open-source",
    apiAvailable: true,
    limitations: ["Large files may need to be sampled first."],
    verification: "verified",
    featured: false,
    lastVerifiedAt: "2026-09-12",
    updatedAt: "2026-09-12",
  }),
  sample({
    slug: "deckhand",
    name: "Deckhand",
    officialUrl: "https://example.com/deckhand",
    shortDescription: "Builds a first draft of a pitch deck or proposal from your notes.",
    overview:
      "Deckhand turns rough notes into a structured slide deck with suggested visuals, which you can then edit or export to common presentation formats.",
    categorySlugs: ["business", "design"],
    tags: ["pitch deck", "presentation", "proposal", "slides"],
    useCases: ["Startup pitch decks", "Client proposals", "Class presentations"],
    audience: ["Founders", "Freelancers", "Students"],
    skillLevel: "beginner",
    pricingModel: "freemium",
    apiAvailable: false,
    verification: "unverified",
    featured: false,
    updatedAt: "2026-07-22",
  }),
];
