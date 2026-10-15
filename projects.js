// Set this ONCE after creating your new Cloudflare account (your workers.dev subdomain).
// Live links below are built from it: https://<worker-name>.<SUBDOMAIN>.workers.dev
const SUBDOMAIN = "your-subdomain";

const live = (workerName) => `https://${workerName}.${SUBDOMAIN}.workers.dev`;

// To add a project: copy one block, change the text, save, push to GitHub. Cloudflare deploys it.
// image = file inside the public/projects/ folder.
export const projects = [
  {
    name: "Europa AI",
    status: "Active",
    description: "An AI platform for conversational help, document analysis and automated workflows. Built to be a useful tool, not a distraction.",
    image: "/projects/europa-ai.png",
    link: live("europa-ai"),
  },
  {
    name: "Europa Live",
    status: "Active",
    description: "A live news and information platform with curated content across technology, science, business, sports and more. Clear summaries, no noise.",
    image: "/projects/europa-live.png",
    link: live("europa-live"),
  },
  {
    name: "Europify",
    status: "Active",
    description: "An ad-free music streaming platform for listeners who value their attention. No ads, no distractions, just music.",
    image: "/projects/europify.png",
    link: live("europify"),
  },
];
