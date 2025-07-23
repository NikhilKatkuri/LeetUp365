import fs from "fs";
import https from "https";

const username = "z2NzIqiLZV";
const targetFile = "README.md";

const query = {
  query: `
    query getUserProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `,
  variables: { username },
};

function fetchLeetcodeStats() {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "leetcode.com",
        path: "/graphql",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(JSON.stringify(query)),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(JSON.stringify(query));
    req.end();
  });
}

async function updateReadme() {
  try {
    const data = await fetchLeetcodeStats();

    const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!stats) throw new Error("Invalid response structure from API.");

    const getCount = (difficulty) =>
      stats.find((s) => s.difficulty === difficulty)?.count || 0;

    const total = getCount("All");
    const easy = getCount("Easy");
    const medium = getCount("Medium");
    const hard = getCount("Hard");

    const contentToInsert = `### 💡 LeetCode Stats (auto-updated)

- ✅ Total Solved: ${total}
- 🟢 Easy: ${easy}
- 🟠 Medium: ${medium}
- 🔴 Hard: ${hard}`;

    const START_MARKER = "<!-- LEETCODE_STATS_START -->";
    const END_MARKER = "<!-- LEETCODE_STATS_END -->";

    const readme = fs.readFileSync(targetFile, "utf8");

    if (!readme.includes(START_MARKER) || !readme.includes(END_MARKER)) {
      console.error("LeetCode stats markers not found in README.md.");
      process.exit(1);
    }

    const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, "s");
    const newBlock = `${START_MARKER}\n${contentToInsert}\n${END_MARKER}`;
    const updated = readme.replace(regex, newBlock);

    fs.writeFileSync(targetFile, updated, "utf8");
    console.log("README.md written (forced update).");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err.message);
    process.exit(1);
  }
}

updateReadme();
