// Rafraîchit "updated" (date du dernier commit) et "commits" (nb total de commits)
// pour chaque projet listé dans projects.json, en interrogeant l'API GitHub.
// Le champ "status" (et desc/tags/name) n'est JAMAIS touché ici : c'est la seule
// partie du fichier que l'humain contrôle depuis la page.

import { readFile, writeFile } from "node:fs/promises";

const TOKEN = process.env.PROJECTS_READ_TOKEN || process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("Aucun token disponible (PROJECTS_READ_TOKEN ou GITHUB_TOKEN).");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function lastPageFromLink(linkHeader) {
  if (!linkHeader) return 1;
  const match = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? parseInt(match[1], 10) : 1;
}

async function fetchRepoStats(repo) {
  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!repoRes.ok) throw new Error(`${repo}: GET /repos → ${repoRes.status}`);
  const repoData = await repoRes.json();
  const branch = repoData.default_branch || "main";

  const commitsRes = await fetch(
    `https://api.github.com/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
    { headers }
  );
  if (!commitsRes.ok) throw new Error(`${repo}: GET /commits → ${commitsRes.status}`);
  const commitsData = await commitsRes.json();
  const latest = commitsData[0];
  const updated = latest
    ? (latest.commit.committer?.date || latest.commit.author?.date || "").slice(0, 10)
    : null;
  const commits = lastPageFromLink(commitsRes.headers.get("link"));

  return { updated, commits };
}

const raw = await readFile(new URL("../projects.json", import.meta.url), "utf8");
const data = JSON.parse(raw);

let changed = false;
for (const p of data.projects) {
  try {
    const stats = await fetchRepoStats(p.repo);
    if (stats.updated && stats.updated !== p.updated) { p.updated = stats.updated; changed = true; }
    if (stats.commits && stats.commits !== p.commits) { p.commits = stats.commits; changed = true; }
    console.log(`ok   ${p.repo} → ${stats.updated}, ${stats.commits} commits`);
  } catch (err) {
    console.warn(`skip ${p.repo}: ${err.message}`);
  }
}

if (changed) {
  data.generatedAt = new Date().toISOString();
  await writeFile(new URL("../projects.json", import.meta.url), JSON.stringify(data, null, 2) + "\n");
  console.log("projects.json mis à jour.");
} else {
  console.log("Rien de changé.");
}
