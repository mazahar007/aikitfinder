import type { Prompt } from "@/lib/content/types";

/**
 * Original prompts written for AIKitFinder (not copied from any collection).
 * They are sample content: none has been run against a real tool, so every one
 * is marked untested, and the example outputs are illustrations only.
 */
function sample(
  p: Omit<Prompt, "author" | "originNote" | "tested" | "status" | "isSample">,
): Prompt {
  return {
    author: "AIKitFinder (sample)",
    originNote: "Original text written for AIKitFinder as sample content.",
    tested: false,
    status: "published",
    isSample: true,
    ...p,
  };
}

export const samplePrompts: Prompt[] = [
  sample({
    slug: "meeting-notes-to-action-items",
    title: "Turn meeting notes into action items",
    useCase: "Pull clear tasks, owners and deadlines out of messy meeting notes.",
    categorySlugs: ["productivity"],
    tags: ["meetings", "summary", "tasks", "manager", "student"],
    skillLevel: "beginner",
    text: 'You are an assistant that organises meeting notes.\n\nHere are the notes from [meeting name]:\n[paste notes]\n\nList every action item as a table with three columns: task, owner, deadline. If an owner or deadline is not stated, write "not stated" instead of guessing. After the table, list any open questions that were not answered.',
    variables: [
      {
        name: "meeting name",
        description: "A short name so the answer stays on topic.",
        example: "Weekly marketing sync",
      },
      {
        name: "paste notes",
        description: "The raw notes, as rough as they are.",
        example: "Sam to send the report Friday...",
      },
    ],
    instructions: [
      "Paste your notes exactly as you have them; do not tidy them first.",
      "Check each row against the original notes before you share the table.",
      "If a name or date is missing in the result, add it yourself.",
    ],
    expectedOutput: "A three-column table of tasks, followed by a short list of open questions.",
    exampleOutput:
      "| Task | Owner | Deadline |\n| Send the monthly report | Sam | Friday |\n| Book the venue | not stated | not stated |\n\nOpen questions: Who approves the budget?",
    caveats: "The assistant can misread who owns a task. Always check names and dates.",
    toolSlugs: ["notewell", "draftwise"],
    lastReviewedAt: "2026-10-04",
    updatedAt: "2026-10-04",
  }),
  sample({
    slug: "rewrite-for-audience",
    title: "Rewrite text for a different audience",
    useCase: "Make the same message clear for beginners, executives or friends.",
    categorySlugs: ["writing-research"],
    tags: ["rewrite", "tone", "email", "blog", "writer", "student"],
    skillLevel: "beginner",
    text: "Rewrite the text below for [audience]. Keep the facts the same. Use [tone] language and keep it under [length] words.\n\nText:\n[text]\n\nAfter the rewrite, list the three biggest changes you made.",
    variables: [
      {
        name: "audience",
        description: "Who will read it.",
        example: "busy executives with no technical background",
      },
      { name: "tone", description: "How it should sound.", example: "friendly and direct" },
      { name: "length", description: "A maximum number of words.", example: "120" },
      {
        name: "text",
        description: "The text you want rewritten.",
        example: "Our platform leverages...",
      },
    ],
    instructions: [
      'Be specific about the audience; "general readers" gives a vague result.',
      "Read the three listed changes: they show whether the meaning moved.",
      "Compare the facts in the rewrite with your original.",
    ],
    expectedOutput: "A rewritten version in the chosen tone, plus a short list of what changed.",
    caveats: "Rewrites can quietly change a fact or a number. Compare them against the original.",
    toolSlugs: ["draftwise"],
    lastReviewedAt: "2026-10-04",
    updatedAt: "2026-10-04",
  }),
  sample({
    slug: "explain-code-before-changing",
    title: "Explain unfamiliar code before you change it",
    useCase: "Understand what a piece of code does, step by step, before editing it.",
    categorySlugs: ["coding-development"],
    tags: ["code", "explain", "learning", "developer", "student"],
    skillLevel: "beginner",
    text: "Explain the following [language] code to someone who is new to it.\n\n[code]\n\nFirst give a one-sentence summary. Then walk through it line by line in plain English. Finish by listing anything that looks risky, confusing or likely to break if I change [what you plan to change].",
    variables: [
      { name: "language", description: "The programming language.", example: "Python" },
      {
        name: "code",
        description: "The code to explain. Remove secrets such as keys and passwords first.",
        example: "def total(items): ...",
      },
      {
        name: "what you plan to change",
        description: "The edit you have in mind.",
        example: "the discount calculation",
      },
    ],
    instructions: [
      "Remove passwords, keys and personal data from the code before pasting it.",
      "Run the code yourself to check the explanation matches what happens.",
      "Ask a follow-up question about any line that is still unclear.",
    ],
    expectedOutput: "A short summary, a line-by-line explanation and a list of risks.",
    caveats: "An explanation can sound confident and still be wrong. Test before relying on it.",
    toolSlugs: ["stackmate", "bugscout"],
    lastReviewedAt: "2026-10-06",
    updatedAt: "2026-10-06",
  }),
  sample({
    slug: "social-posts-from-article",
    title: "Create social posts from an article",
    useCase: "Turn a finished article into several short posts for different platforms.",
    categorySlugs: ["marketing-seo"],
    tags: ["social media", "repurpose", "marketing", "creator", "marketer"],
    skillLevel: "beginner",
    text: "Here is an article:\n[article]\n\nWrite [number] short social posts for [platform] that point readers to the article. Each post should use a different angle: a question, a surprising fact, and a practical tip. Keep the tone [tone] and do not invent statistics that are not in the article.",
    variables: [
      {
        name: "article",
        description: "The article text or its main points.",
        example: "How to plan a week of meals...",
      },
      { name: "number", description: "How many posts you want.", example: "3" },
      { name: "platform", description: "Where the posts will go.", example: "LinkedIn" },
      { name: "tone", description: "How the posts should sound.", example: "helpful and relaxed" },
    ],
    instructions: [
      "Paste the whole article if you can; the posts stay closer to your content.",
      "Delete any claim that is not actually in your article.",
      "Add your own link and hashtags at the end.",
    ],
    expectedOutput: "Several short posts, each with a different angle.",
    caveats:
      "Assistants sometimes add numbers or quotes that are not in the source. Check every figure.",
    toolSlugs: ["storyreel", "draftwise"],
    lastReviewedAt: "2026-10-06",
    updatedAt: "2026-10-06",
  }),
  sample({
    slug: "product-photo-background",
    title: "Describe a clean product photo",
    useCase: "Get an image tool to make a simple, professional product picture.",
    categorySlugs: ["image-generation", "design"],
    tags: ["image", "product", "photo", "seller", "designer"],
    skillLevel: "intermediate",
    text: "A professional product photo of [product] on a [background] background, soft studio lighting, shot from [angle], sharp focus, plenty of empty space for text. Style: [style]. Avoid: text, logos, hands, clutter.",
    variables: [
      { name: "product", description: "What the picture shows.", example: "a ceramic coffee mug" },
      { name: "background", description: "A simple backdrop.", example: "pale grey" },
      { name: "angle", description: "The camera angle.", example: "a slightly raised angle" },
      { name: "style", description: "The overall look.", example: "minimal and modern" },
    ],
    instructions: [
      "Generate a few versions and keep the best one.",
      "Change one detail at a time so you can see what each word does.",
      "Check the result for odd shapes before you publish it.",
    ],
    expectedOutput: "A product image on a plain background with space for text.",
    caveats:
      "Image tools often fail at text and fine details. Do not rely on them for exact product accuracy.",
    toolSlugs: ["pictora", "canvasmint"],
    lastReviewedAt: "2026-10-07",
    updatedAt: "2026-10-07",
  }),
  sample({
    slug: "summarise-article-with-sources",
    title: "Summarise an article and flag unsupported claims",
    useCase: "Get a short summary and a list of statements that need checking.",
    categorySlugs: ["writing-research"],
    tags: ["summary", "research", "fact-checking", "student", "researcher"],
    skillLevel: "intermediate",
    text: 'Summarise the text below in [number] bullet points for [reader].\n\nText:\n[text]\n\nThen add a section called "Check before you trust this" listing any claims that give no source, use vague numbers or sound too certain. Do not add facts that are not in the text.',
    variables: [
      { name: "number", description: "How many bullet points.", example: "5" },
      { name: "reader", description: "Who the summary is for.", example: "a first-year student" },
      {
        name: "text",
        description: "The article or report text.",
        example: "The study found that...",
      },
    ],
    instructions: [
      "Paste the text rather than a link, so the assistant reads what you read.",
      "Look up each flagged claim yourself in a reliable source.",
      "Keep the original open so you can check the summary against it.",
    ],
    expectedOutput: "A bullet-point summary followed by a short list of claims to verify.",
    caveats:
      "A flagged list is a starting point, not proof. The tool may miss claims or flag fine ones.",
    toolSlugs: ["citebird", "draftwise"],
    lastReviewedAt: "2026-10-07",
    updatedAt: "2026-10-07",
  }),
  sample({
    slug: "interview-practice-questions",
    title: "Practise for a job interview",
    useCase: "Get realistic questions for a role and feedback on your answers.",
    categorySlugs: ["productivity", "business"],
    tags: ["career", "interview", "practice", "student", "job seeker"],
    skillLevel: "beginner",
    text: "Act as an interviewer for a [role] position at a [company type]. Ask me one question at a time, wait for my answer, and then give short feedback: one thing I did well and one thing to improve. Start with an easy question and make them harder. Stop after [number] questions and summarise my strengths.",
    variables: [
      { name: "role", description: "The job title.", example: "junior data analyst" },
      {
        name: "company type",
        description: "The kind of employer.",
        example: "small software company",
      },
      { name: "number", description: "How many questions to ask.", example: "6" },
    ],
    instructions: [
      "Answer out loud first, then type your answer, as you would in the interview.",
      "Keep real details (names, salaries) out of the chat.",
      "Repeat the session with a different company type for variety.",
    ],
    expectedOutput: "A back-and-forth practice session ending with a summary of your strengths.",
    caveats: "The feedback is general. It does not know the real employer or what they value.",
    toolSlugs: ["draftwise"],
    lastReviewedAt: "2026-10-08",
    updatedAt: "2026-10-08",
  }),
  sample({
    slug: "clean-up-spreadsheet-column",
    title: "Clean up a messy spreadsheet column",
    useCase: "Standardise inconsistent entries in a column of data.",
    categorySlugs: ["data-analytics"],
    tags: ["spreadsheet", "cleaning", "data", "analyst", "small business"],
    skillLevel: "intermediate",
    text: 'Below is a column of values from a spreadsheet called [column name]. Standardise them to one consistent format: [target format].\n\nValues:\n[values]\n\nReturn a two-column table: original value and cleaned value. Do not delete or merge rows. If a value is ambiguous, keep it unchanged and mark it "check".',
    variables: [
      { name: "column name", description: "What the column holds.", example: "Customer country" },
      {
        name: "target format",
        description: "The format you want.",
        example: "full country names, e.g. United States",
      },
      {
        name: "values",
        description: "The entries, one per line.",
        example: "USA\nU.S.\nunited states",
      },
    ],
    instructions: [
      "Copy only the column, not the whole sheet, and remove personal data first.",
      "Spot-check ten rows in the result against the original.",
      "Paste the cleaned column back into a copy of your sheet, not the original.",
    ],
    expectedOutput:
      'A two-column table with the original and cleaned values, and "check" on unclear ones.',
    caveats:
      "Large columns may be cut off or reordered. Check the row count against your original.",
    toolSlugs: ["chartsmith"],
    lastReviewedAt: "2026-10-08",
    updatedAt: "2026-10-08",
  }),
  sample({
    slug: "customer-email-reply",
    title: "Draft a polite reply to a customer email",
    useCase: "Write a calm, clear answer to a customer's question or complaint.",
    categorySlugs: ["business", "writing-research"],
    tags: ["email", "customer support", "small business", "tone"],
    skillLevel: "beginner",
    text: "Write a reply to this customer email.\n\nCustomer email:\n[customer email]\n\nOur situation: [what is true]\nWhat we can offer: [offer]\n\nBe polite and honest. Do not promise anything that is not listed above. Keep it under [length] words and end with one clear next step for the customer.",
    variables: [
      {
        name: "customer email",
        description: "The message you received. Remove personal details first.",
        example: "My order arrived late...",
      },
      {
        name: "what is true",
        description: "The facts, including anything awkward.",
        example: "The courier delayed the parcel by three days.",
      },
      {
        name: "offer",
        description: "What you are actually able to do.",
        example: "a 10% discount on the next order",
      },
      { name: "length", description: "A maximum number of words.", example: "150" },
    ],
    instructions: [
      "List only facts and offers you can really honour.",
      "Read the draft out loud: it should sound like you.",
      "Remove or replace anything that promises more than you decided.",
    ],
    expectedOutput: "A short, polite reply that ends with one clear next step.",
    caveats: "Never send an unreviewed draft. The assistant may add promises or wrong details.",
    toolSlugs: ["draftwise"],
    lastReviewedAt: "2026-10-09",
    updatedAt: "2026-10-09",
  }),
  sample({
    slug: "study-plan-from-syllabus",
    title: "Build a study plan from a syllabus",
    useCase: "Turn a list of topics and a deadline into a week-by-week plan.",
    categorySlugs: ["productivity"],
    tags: ["study", "planning", "exam", "student"],
    skillLevel: "beginner",
    text: "I have [weeks] weeks until my [exam or deadline]. I can study [hours] hours a week. Here are the topics:\n[topics]\n\nCreate a week-by-week study plan. Put harder topics earlier, add one review session every [review gap] weeks, and leave the final week for practice questions. Show the plan as a table with the columns: week, topics, hours.",
    variables: [
      { name: "weeks", description: "Weeks left.", example: "8" },
      {
        name: "exam or deadline",
        description: "What you are preparing for.",
        example: "biology exam",
      },
      { name: "hours", description: "Study hours you really have each week.", example: "6" },
      {
        name: "topics",
        description: "The topics, one per line.",
        example: "Cell structure\nGenetics\nEcology",
      },
      { name: "review gap", description: "How often to review.", example: "3" },
    ],
    instructions: [
      "Be honest about your hours; a plan you cannot follow is not helpful.",
      "Move topics you already know to lighter weeks.",
      "Check the plan against your real calendar.",
    ],
    expectedOutput: "A table with a row for each week, its topics and the study hours.",
    caveats: "The plan does not know how hard each topic is for you. Adjust it as you learn.",
    toolSlugs: ["notewell"],
    lastReviewedAt: "2026-10-09",
    updatedAt: "2026-10-09",
  }),
];
