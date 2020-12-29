import meow from "meow";
import { AsocialBookmark } from "asocial-bookmark";

const cli = meow(`
	Usage
	  $ ts-node index.ts --json <input>

	Options
	  --json  JSON Payload

    Env
      GITHUB_TOKEN=xxx
      GITHUB_REF=refs/heads/main
      GITHUB_REPOSITORY=azu/hubmemo

	Examples
	  $ ts-node index.ts --json '{"title":"example","url":"https://example.com","content":"description for example","tags":["example"]}'
`, {
    flags: {
        json: {
            type: 'string',
            isRequired: true
        }
    },
    autoHelp: true,
});

async function main() {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
        throw new Error("require GH_TOKEN env");
    }
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    if (!GITHUB_REPOSITORY) {
        throw new Error("require GITHUB_REPOSITORY env")
    }
    const GITHUB_REF = process.env.GITHUB_REF;
    if (!GITHUB_REF) {
        throw new Error("require GITHUB_BRANCH env")
    }
    const JSONPayload = JSON.parse(cli.flags.json);
    const [owner, repo] = GITHUB_REPOSITORY.split("/");
    const ref = GITHUB_REF.replace(/^refs\//, "");
    console.log("Update Repository", {
        owner,
        repo,
        ref
    });
    const asocialBookmark = new AsocialBookmark({
        github: {
            owner: owner,
            repo: repo,
            ref: ref,
            token: GITHUB_TOKEN
        }
    });
    const isoDate = new Date().toISOString();
    const item = {
        ...JSONPayload,
        date: isoDate
    }
    await asocialBookmark.updateBookmark(item);
    console.log("Update Item", item);
}

if (require.main) {
    main().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
