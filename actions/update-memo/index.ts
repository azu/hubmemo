import { AsocialBookmark } from "asocial-bookmark";
/*
    Env
      GITHUB_TOKEN=xxx
      GITHUB_REF=refs/heads/main
      GITHUB_REPOSITORY=azu/hubmemo
      PAYLOAD=client_payload json
 */
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
    const PAYLOAD = process.env.PAYLOAD;
    if (!PAYLOAD) {
        throw new Error("require PAYLOAD env")
    }
    const JSONPayload = JSON.parse(PAYLOAD);
    const [owner, repo] = GITHUB_REPOSITORY.split("/");
    // test
    const ref = JSONPayload._test_branch_ ?? GITHUB_REF.replace(/^refs\//, "");
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
