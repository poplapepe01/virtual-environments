const yargs = require('yargs').argv;
const git = require('simple-git/promise');
const fs = require('fs');
const Octokit = require('@octokit/rest');
const uuid = require('uuid');

if (!yargs.token) {
    throw "Error: Ensure that you passed a git hub token using the --token argument";
}

const runId = yargs.id ? yargs.id : uuid.v1();

const octokit = new Octokit({ auth: yargs.token});

const enabledWorkflows = getEnabledWorkflows();

pushTestFileToGit().catch(err => {
    console.error(err);
    process.exit(1);
});

function getEnabledWorkflows() {
    return JSON.parse(fs.readFileSync("enabledWorkflows.json")).enabled;
}

/**
 * creates a set of files that will trigger workflows that have been configured to
 * run when a commit is pushed with these specific file names
 */
async function pushTestFileToGit() {
    var currentBranch = await git().revparse(["--abbrev-ref", "HEAD"]);

    await git().checkout(['-b', `testrun/${runId}`]);
    for (const workflow of enabledWorkflows) {
        fs.writeFileSync(`testRun_${workflow}`, "testRun");
        await git().add(`testRun_${workflow}`);
    }

    await git().commit(`testRun${runId}`);
    await git().push(['-u', 'origin', `testrun/${runId}`]);
    await git().checkout([currentBranch]);
    await checkRuns();
}

async function checkRuns() {

    var completed = false;
    var statusRequestCount = 0;
    const maxRequests = 20;
    const sleepTimeMs = 60000;
    var allSuccessful = false;
    var checkRuns;
    var total_count;

    while(!completed) {
        console.log(`Waiting ${sleepTimeMs/1000} seconds before checking run status...`)
        await sleep(sleepTimeMs);
        const { data: checks } = await octokit.checks.listForRef({
            owner: "bbq-beets",
            repo: "canary-sandbox",
            ref: `testrun/${runId}`,
            per_page: 100,
        });
        checkRuns = checks.check_runs;
        total_count = checks.total_count;

        var page = 1;
        while(checkRuns.length < total_count) {
            page++;
            const { data: checks } = await octokit.checks.listForRef({
                owner: "bbq-beets",
                repo: "canary-sandbox",
                ref: pullRequest.head.sha,
                per_page: 100,
                page,
            });

            checkRuns = checkRuns.concat(checks.check_runs);
        }

        const status = `Queued: ${total_count} `+
            `Passed: ${checkRuns.filter(check_run => check_run.conclusion == "success").length} ` +
            `Unsuccessful: ${checkRuns.filter(check_run => check_run.status == "completed" && check_run.conclusion != "success").length}`;

        statusRequestCount++;
        console.log(`Run status (${statusRequestCount}): ${status}`);

        completed = statusRequestCount >= maxRequests || (checks.check_runs.every(check_run => check_run.status == "completed") && checkRuns.length > 0)
        allSuccessful = completed && checks.check_runs.every(check_run => check_run.status == "completed" && check_run.conclusion == "success");
    }

    //delete the ref
    await git().push(['origin', '--delete', `testrun/${runId}`]);

    if (!allSuccessful) {
        console.log(`Incomplete: ${checkRuns.filter(check_run => check_run.status != "completed").length}`);
        console.log(`Unsuccessful: ${checkRuns.filter(check_run => check_run.status == "completed" && check_run.conclusion != "success").length}`);
        console.log(`Test Run ${runId} was not comleted successfully. Inspect these individual runs:`);
        checkRuns.filter(check => check.conclusion != "success")
            .forEach(check => console.log(`${check.name}: ${check.html_url}`));
        process.exit(1);
    }
    else {
        console.log("All tests passed.");
    }
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

