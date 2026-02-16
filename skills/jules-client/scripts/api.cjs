const https = require('https');
const { URL } = require('url');
const { execSync, exec } = require('child_process');

const API_KEY = process.env.JULES_API_KEY;
const BASE_URL = 'https://jules.googleapis.com/v1alpha';

if (!API_KEY) {
  console.error('Error: JULES_API_KEY environment variable is not set.');
  process.exit(1);
}

// --- API Helpers ---

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      method: method,
      headers: {
        'x-goog-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (e) {
            resolve({});
          }
        } else {
          try {
            const error = JSON.parse(data);
            const fullError = error.error ? JSON.stringify(error.error, null, 2) : JSON.stringify(error, null, 2);
            reject(new Error(`API Error (${res.statusCode}): ${fullError}`));
          } catch (e) {
            reject(new Error(`API Error (${res.statusCode}): ${data}`));
          }
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function extractId(fullResourceName, prefix) {
  if (fullResourceName.startsWith(prefix)) {
    return fullResourceName.split('/')[1];
  }
  return fullResourceName;
}

function extractPrNumber(url) {
  if (!url) return null;
  const match = url.match(/\/pull\/(\d+)/);
  return match ? match[1] : null;
}

function getCurrentRepoUrl() {
  try {
    return execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return null;
  }
}

async function resolveSource(input) {
  if (!input) return null;
  if (input.startsWith('sources/')) return input;

  let owner, repo;
  // Match GitHub URL: https://github.com/owner/repo or git@github.com:owner/repo
  const githubUrlMatch = input.match(/github\.com[:\/]([^/]+)\/([^/.]+)/);
  // Match owner/repo
  const ownerRepoMatch = input.match(/^([^/]+)\/([^/]+)$/);

  if (githubUrlMatch) {
    owner = githubUrlMatch[1];
    repo = githubUrlMatch[2].replace(/\.git$/, '');
  } else if (ownerRepoMatch) {
    owner = ownerRepoMatch[1];
    repo = ownerRepoMatch[2];
  }

  // Fetch sources to find a match
  const response = await request('GET', '/sources');
  const sources = response.sources || [];

  if (owner && repo) {
    const found = sources.find(s => 
      s.githubRepo && 
      s.githubRepo.owner.toLowerCase() === owner.toLowerCase() && 
      s.githubRepo.repo.toLowerCase() === repo.toLowerCase()
    );
    if (found) return found.name;
  }

  // Fallback: Check if the input matches any source.id or name directly
  const matchById = sources.find(s => s.id === input || s.name === input || s.name === `sources/${input}`);
  if (matchById) return matchById.name;

  if (owner && repo) {
    throw new Error(`Error: Repository "${owner}/${repo}" is not connected to Jules.
Please connect it in the Jules UI or use "node scripts/api.cjs sources" to see the list of available sources.`);
  }

  if (input.startsWith('sources/')) return input;

  throw new Error(`Error: Could not resolve source from input "${input}".
Please verify that you are in a connected git repository, or provide a source URL/ID explicitly.
Use "node scripts/api.cjs sources" to list available sources.`);
}

// --- Command Logic ---

async function listSources(args, options) {
  try {
    let path = '/sources';
    const params = [];
    if (options.limit) params.push(`pageSize=${options.limit}`);
    if (options.pageToken) params.push(`pageToken=${encodeURIComponent(options.pageToken)}`);
    if (params.length > 0) path += `?${params.join('&')}`;

    const response = await request('GET', path);
    if (options.json) {
      console.log(JSON.stringify(response, null, 2));
      return;
    }
    if (!response.sources || response.sources.length === 0) {
      console.log('No sources found.');
      return;
    }
    console.log('Available Sources:');
    response.sources.forEach(source => {
      const type = source.githubRepo ? 'GitHub' : 'Unknown';
      console.log(`- ${source.name} (Type: ${type})`);
      if (source.githubRepo) {
          console.log(`  Repo: ${source.githubRepo.owner}/${source.githubRepo.repo}`);
          console.log(`  Branches: ${source.githubRepo.branches ? source.githubRepo.branches.map(b => b.displayName).join(', ') : 'N/A'}`);
      }
    });
    if (response.nextPageToken) {
        console.log(`\nNext Page Token: ${response.nextPageToken}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function listSessions(args, options) {
    try {
        const limit = options.limit || 10;
        let path = `/sessions?pageSize=${limit}`;
        if (options.pageToken) path += `&pageToken=${encodeURIComponent(options.pageToken)}`;

        const response = await request('GET', path);
        
        // Remove bulky fields to prevent CLI freezing
        if (response.sessions) {
            response.sessions.forEach(session => {
                delete session.outputs; // Contains large diffs
            });
        }

        if (options.json) {
            console.log(JSON.stringify(response, null, 2));
            return;
        }
        if (!response.sessions || response.sessions.length === 0) {
            console.log('No sessions found.');
            return;
        }
        console.log(`Sessions History (Limit: ${limit}, Outputs hidden):`);
        response.sessions.forEach(session => {
            const id = extractId(session.name, 'sessions/');
            console.log(`- ID: ${id} | State: ${session.state} | Title: ${session.title || 'No Title'}`);
            console.log(`  Created: ${session.createTime}`);
        });
        if (response.nextPageToken) {
            console.log(`\nNext Page Token: ${response.nextPageToken}`);
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function getSession(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: get <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');
    
    try {
        const session = await request('GET', `/sessions/${pathId}`);
        
        if (session.outputs) {
            session.outputs.forEach(output => {
                if (output.pullRequest) {
                    output.pullRequest.prNumber = extractPrNumber(output.pullRequest.url);
                }
            });
        }

        if (options.json) {
            console.log(JSON.stringify(session, null, 2));
            return;
        }

        console.log(`Session Details for ${pathId}:`);
        console.log(`-----------------------------------`);
        console.log(`Title: ${session.title || 'N/A'}`);
        console.log(`Status: ${session.state}`);
        console.log(`Prompt: ${session.prompt}`);
        console.log(`Created: ${session.createTime}`);
        console.log(`Updated: ${session.updateTime}`);
        
        if (session.outputs && session.outputs.length > 0) {
            console.log(`\nOutputs:`);
            session.outputs.forEach(output => {
                if (output.pullRequest) {
                    console.log(`[Pull Request]`);
                    console.log(`  Title: ${output.pullRequest.title}`);
                    console.log(`  URL: ${output.pullRequest.url}`);
                    if (output.pullRequest.prNumber) {
                        console.log(`  PR Number: ${output.pullRequest.prNumber}`);
                    }
                }
            });
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function getBranch(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: branch <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');
    
    try {
        const session = await request('GET', `/sessions/${pathId}`);
        let branch = null;

        // 1. Try to get from PR outputs (most reliable for working branch)
        if (session.outputs) {
            for (const output of session.outputs) {
                if (output.pullRequest && output.pullRequest.headRef) {
                    branch = output.pullRequest.headRef;
                    break;
                }
            }
        }

        // 2. Fallback: Try to get from workingBranch context
        if (!branch && session.sourceContext && session.sourceContext.githubRepoContext) {
            branch = session.sourceContext.githubRepoContext.workingBranch;
        }

        if (branch) {
            if (options.json) {
                console.log(JSON.stringify({ branch: branch }));
            } else {
                console.log(branch);
            }
        } else {
            if (!options.json) console.error(`No working branch found for session ${pathId}.`);
            process.exit(1);
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function deleteSession(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: delete <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');

    try {
        await request('DELETE', `/sessions/${pathId}`);
        if (options.json) {
            console.log(JSON.stringify({ success: true, sessionId: pathId }));
        } else {
            console.log(`Session ${pathId} deleted successfully.`);
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function startSession(args, options) {
  let sourceInput = null;
  let prompt = null;

  // Handle flexible arguments: start [source] <prompt>
  if (args.length === 1) {
      prompt = args[0];
  } else if (args.length >= 2) {
      sourceInput = args[0];
      prompt = args.slice(1).join(' ');
  } else {
      console.error('Usage: start [source_url_or_name] <prompt> [options]');
      process.exit(1);
  }

  // Detect source if not provided
  if (!sourceInput) {
    sourceInput = getCurrentRepoUrl();
    if (!sourceInput) {
      console.error('Error: No source provided and could not detect git remote URL.');
      console.error('Usage: start [source_url_or_name] <prompt> [options]');
      process.exit(1);
    }
  }

  try {
    const resolvedSourceName = await resolveSource(sourceInput);
    
    if (!options.json) {
        console.log(`\nStarting Session...`);
        console.log(`Source: ${sourceInput}`);
        console.log(`Resolved: ${resolvedSourceName}`);
    }

    const body = {
      prompt: prompt,
      sourceContext: {
        source: resolvedSourceName,
        githubRepoContext: {
          startingBranch: options.branch || "main"
        }
      },
      requirePlanApproval: !options.noApproval,
    };

    if (options.title) body.title = options.title;
    if (options.autoPr) body.automationMode = 'AUTO_CREATE_PR';

    const session = await request('POST', '/sessions', body);
    if (options.json) {
        console.log(JSON.stringify(session, null, 2));
    } else {
        console.log('Session Started Successfully');
        console.log(`Session ID: ${session.name}`); 
        console.log(`Status: ${session.state}`);
        console.log(`URL: ${session.url}`);
    }

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function getActivity(args, options) {
  const sessionId = args[0];
  const activityId = args[1];

  if (!sessionId || !activityId) {
    console.error('Usage: activity <session_id> <activity_id>');
    process.exit(1);
  }

  const sId = extractId(sessionId, 'sessions/');
  const aId = extractId(activityId, 'activities/');

  try {
    const activity = await request('GET', `/sessions/${sId}/activities/${aId}`);
    if (options.json) {
        console.log(JSON.stringify(activity, null, 2));
        return;
    }
    
    console.log(`Activity Details: ${activity.description}`);
    console.log(`ID: ${activity.id} | Created: ${activity.createTime}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function listActivities(args, options) {
  const sessionId = args[0];
  if (!sessionId) {
    console.error('Usage: activities <session_id>');
    process.exit(1);
  }

  const pathId = extractId(sessionId, 'sessions/');
  const limit = options.limit || 20;
  let path = `/sessions/${pathId}/activities?pageSize=${limit}`;
  if (options.pageToken) path += `&pageToken=${encodeURIComponent(options.pageToken)}`;

  try {
    const response = await request('GET', path);
    
    if (response.activities) {
        response.activities.forEach(act => {
            if (act.artifacts) {
                act.artifacts.forEach(art => {
                    if (art.changeSet && art.changeSet.gitPatch) {
                        art.changeSet.gitPatch.unidiffPatch = "(omitted)";
                    }
                });
            }
        });
    }

    if (options.json) {
        console.log(JSON.stringify(response, null, 2));
        return;
    }
    if (!response.activities || response.activities.length === 0) {
      console.log('No activities found.');
      return;
    }
    
    console.log(`Activities for Session ${pathId} (Limit: ${limit}, Large patches omitted):`);
    response.activities.forEach(act => {
      console.log(`[${act.createTime}] ${act.description || 'No description'} (ID: ${act.id})`);
      if (act.agentMessaged) {
          console.log(`  > Message: ${act.agentMessaged.agentMessage}`);
      }
      if (act.artifacts) {
          act.artifacts.forEach(art => {
              if (art.changeSet && art.changeSet.gitPatch) {
                  console.log(`  > Code Changes: ${art.changeSet.gitPatch.suggestedCommitMessage || 'No commit message'}`);
              }
              if (art.bashOutput) {
                  console.log(`  > Command Executed: ${art.bashOutput.command}`);
                  console.log(`    Exit Code: ${art.bashOutput.exitCode}`);
              }
          });
      }
      if (act.planGenerated) {
          console.log(`  > Plan Generated: ${act.planGenerated.plan.id}`);
          if (act.planGenerated.plan.steps) {
            console.log('    Plan Steps:');
            act.planGenerated.plan.steps.forEach((step, idx) => {
              const displayIndex = (step.index !== undefined && step.index !== null) ? step.index + 1 : idx + 1;
              console.log(`    [${displayIndex}] ${step.title}`);
            });
          }
      }
    });
    if (response.nextPageToken) {
        console.log(`\nNext Page Token: ${response.nextPageToken}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function approvePlan(args, options) {
  const sessionId = args[0];
  if (!sessionId) {
    console.error('Usage: approve <session_id>');
    process.exit(1);
  }

  const pathId = extractId(sessionId, 'sessions/');

  try {
    await request('POST', `/sessions/${pathId}:approvePlan`, {});
    if (options.json) {
        console.log(JSON.stringify({ success: true, sessionId: pathId }));
    } else {
        console.log('Plan approved successfully.');
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function openSession(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: open <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');
    
    try {
        const session = await request('GET', `/sessions/${pathId}`);
        if (session.url) {
            if (!options.json) console.log(`Opening session URL: ${session.url}`);
            exec(`start ${session.url}`);
            if (options.json) console.log(JSON.stringify({ success: true, url: session.url }));
        } else {
            if (options.json) {
                console.log(JSON.stringify({ success: false, error: 'No URL found' }));
            } else {
                console.log('No URL found for this session.');
            }
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function getPr(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: pr <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');
    
    try {
        const session = await request('GET', `/sessions/${pathId}`);
        let prFound = false;

        if (session.outputs) {
            session.outputs.forEach(output => {
                if (output.pullRequest) {
                    const prNumber = extractPrNumber(output.pullRequest.url);
                    if (options.json) {
                        console.log(JSON.stringify({ 
                          prNumber: prNumber, 
                          url: output.pullRequest.url,
                          title: output.pullRequest.title 
                        }, null, 2));
                    } else {
                        console.log(prNumber || output.pullRequest.url);
                    }
                    prFound = true;
                }
            });
        }

        if (!prFound) {
            if (!options.json) console.error(`No Pull Request found for session ${pathId}.`);
            process.exit(1);
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function inspectSession(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: inspect <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');

    try {
        const response = await request('GET', `/sessions/${pathId}/activities?pageSize=100`);
        const activities = response.activities || [];

        const summary = {
            plan_steps: [],
            agent_notes: [],
            test_results: [],
            changed_files: []
        };

        activities.forEach(act => {
            if (act.planGenerated && act.planGenerated.plan.steps) {
                summary.plan_steps = act.planGenerated.plan.steps.map(s => s.title);
            }
            if (act.agentMessaged) {
                summary.agent_notes.push(act.agentMessaged.agentMessage);
            }
            if (act.artifacts) {
                act.artifacts.forEach(art => {
                    if (art.bashOutput) {
                        const status = art.bashOutput.exitCode === 0 ? "PASS" : "FAIL";
                        summary.test_results.push({
                            command: art.bashOutput.command,
                            status: status,
                            exit_code: art.bashOutput.exitCode
                        });
                    }
                    if (art.changeSet && art.changeSet.gitPatch) {
                        const patch = art.changeSet.gitPatch.unidiffPatch;
                        const files = [];
                        const regex = /diff --git a\/(.*?) b\//g;
                        let match;
                        while ((match = regex.exec(patch)) !== null) {
                            files.push(match[1]);
                        }
                        files.forEach(f => {
                            if (!summary.changed_files.includes(f)) summary.changed_files.push(f);
                        });
                    }
                });
            }
        });

        console.log(JSON.stringify(summary, null, 2));

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function diffSession(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: diff <session_id>');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');

    try {
        const response = await request('GET', `/sessions/${pathId}/activities?pageSize=100`);
        const activities = response.activities || [];
        
        let latestPatch = null;
        for (const act of activities) {
            if (act.artifacts) {
                for (const art of act.artifacts) {
                    if (art.changeSet && art.changeSet.gitPatch) {
                        latestPatch = art.changeSet.gitPatch.unidiffPatch;
                    }
                }
            }
        }

        if (latestPatch) {
            console.log(latestPatch);
        } else {
            console.error('No diff found for this session.');
            process.exit(1);
        }

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

async function watchSession(args, options) {
    const sessionId = args[0];
    if (!sessionId) {
        console.error('Usage: watch <session_id> [--wait-for <event>] [--timeout <seconds>]');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');
    const waitFor = options.waitFor;
    const timeoutSec = options.timeout;
    const startTime = Date.now();

    console.log(`Watching session ${pathId}...`);
    if (waitFor) console.log(`Waiting for event: ${waitFor}`);
    if (timeoutSec) console.log(`Timeout set to: ${timeoutSec} seconds`);

    const seenActivityIds = new Set();
    const pollInterval = 3000;

    const checkCondition = (activity) => {
        if (!waitFor) return false;
        
        if (waitFor === 'plan' && activity.planGenerated) return true;
        if (waitFor === 'message' && activity.agentMessaged) return true;
        if (waitFor === 'changes' && activity.artifacts && activity.artifacts.some(a => a.changeSet)) return true;
        if (waitFor === 'finish') {
             if (activity.sessionCompleted || activity.sessionFailed) return true;
        }
        return false;
    };

    const loop = async () => {
        if (timeoutSec && (Date.now() - startTime) > timeoutSec * 1000) {
            console.error('\nTimeout reached. Exiting watch.');
            process.exit(1);
        }

        try {
            let path = `/sessions/${pathId}/activities?pageSize=50`;
            const response = await request('GET', path);
            const activities = response.activities || [];
            
            activities.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));

            let conditionMet = false;

            for (const act of activities) {
                if (seenActivityIds.has(act.id)) continue;

                seenActivityIds.add(act.id);

                const time = new Date(act.createTime).toLocaleTimeString();
                let type = 'Info';
                let details = act.description || '';

                if (act.agentMessaged) {
                    type = 'Message';
                    details = act.agentMessaged.agentMessage;
                } else if (act.planGenerated) {
                    type = 'Plan';
                    details = `Plan Generated (${act.planGenerated.plan.steps ? act.planGenerated.plan.steps.length : 0} steps)`;
                } else if (act.artifacts && act.artifacts.some(a => a.changeSet)) {
                    type = 'Changes';
                    details = 'Code changes generated';
                } else if (act.artifacts && act.artifacts.some(a => a.bashOutput)) {
                    type = 'Exec';
                    const bash = act.artifacts.find(a => a.bashOutput).bashOutput;
                    details = `Ran: ${bash.command} (Exit: ${bash.exitCode})`;
                }

                console.log(`[${time}] [${type}] ${details}`);

                if (checkCondition(act)) {
                    conditionMet = true;
                }
            }

            if (waitFor === 'finish') {
                const session = await request('GET', `/sessions/${pathId}`);
                if (session.state === 'COMPLETED' || session.state === 'FAILED' || session.state === 'CANCELLED') {
                    console.log(`[${new Date().toLocaleTimeString()}] [Status] Session is ${session.state}`);
                    conditionMet = true;
                }
            }

            if (conditionMet) {
                console.log(`\nTarget event '${waitFor}' detected. Exiting.`);
                process.exit(0);
            }

        } catch (error) {
            // Ignore transient errors
        }

        setTimeout(loop, pollInterval);
    };

    loop();
}

async function messageSession(args, options) {
    const sessionId = args[0];
    const message = args[1];

    if (!sessionId || !message) {
        console.error('Usage: message <session_id> "<text>"');
        process.exit(1);
    }
    const pathId = extractId(sessionId, 'sessions/');

    const body = {
        prompt: message
    };

    try {
        const response = await request('POST', `/sessions/${pathId}:sendMessage`, body);
        
        if (options.json) {
            console.log(JSON.stringify(response, null, 2));
        } else {
            console.log('Message sent successfully.');
            if (response.name) console.log(`Activity ID: ${response.name}`);
        }
    } catch (error) {
        console.error(`Failed to send message: ${error.message}`);
        process.exit(1);
    }
}

// --- CLI Definitions ---

const COMMANDS = {
  sources: {
    handler: listSources,
    args: [],
    flags: { limit: 'number', pageToken: 'string', json: 'boolean' }
  },
  sessions: {
    handler: listSessions,
    args: [],
    flags: { limit: 'number', pageToken: 'string', json: 'boolean' }
  },
  get: {
    handler: getSession,
    args: ['session_id'],
    flags: { json: 'boolean' }
  },
  branch: {
    handler: getBranch,
    args: ['session_id'],
    flags: { json: 'boolean' }
  },
  pr: {
    handler: getPr,
    args: ['session_id'],
    flags: { json: 'boolean' }
  },
  inspect: {
    handler: inspectSession,
    args: ['session_id'],
    flags: {}
  },
  diff: {
    handler: diffSession,
    args: ['session_id'],
    flags: {}
  },
  watch: {
    handler: watchSession,
    args: ['session_id'],
    flags: { waitFor: 'string', timeout: 'number' }
  },
  message: {
    handler: messageSession,
    args: ['session_id', 'message'],
    flags: { json: 'boolean' }
  },
  open: {
    handler: openSession,
    args: ['session_id'],
    flags: { json: 'boolean' }
  },
  delete: {
    handler: deleteSession,
    args: ['session_id'],
    flags: { json: 'boolean' }
  },
  start: {
    handler: startSession,
    args: ['[source]', 'prompt'],
    flags: { 
        branch: 'string', 
        title: 'string', 
        autoPr: 'boolean', 
        noApproval: 'boolean', 
        json: 'boolean'
    }
  },
  activities: {
    handler: listActivities,
    args: ['session_id'],
    flags: { limit: 'number', pageToken: 'string', json: 'boolean' }
  },
  activity: {
    handler: getActivity,
    args: ['session_id', 'activity_id'],
    flags: { json: 'boolean' }
  },
  approve: {
    handler: approvePlan,
    args: ['session_id'],
    flags: { json: 'boolean' }
  }
};

// --- Argument Parsing ---

function parseAndDispatch() {
  const args = process.argv.slice(2);
  const commandName = args[0];

  if (!commandName || !COMMANDS[commandName]) {
    console.log('Available commands: ' + Object.keys(COMMANDS).join(', '));
    process.exit(1);
  }

  const cmdDef = COMMANDS[commandName];
  const rawArgs = args.slice(1);
  const parsedArgs = [];
  const parsedOptions = {};

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.startsWith('--')) {
        // camelCase conversion: --auto-pr -> autoPr
        const flagName = arg.slice(2).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        
        if (!cmdDef.flags.hasOwnProperty(flagName)) {
            console.error(`Error: Unknown flag '${arg}' for command '${commandName}'.`);
            console.error(`Allowed flags: ${Object.keys(cmdDef.flags).map(f => '--' + f.replace(/[A-Z]/g, m => '-' + m.toLowerCase())).join(', ')}`);
            process.exit(1);
        }

        const type = cmdDef.flags[flagName];
        if (type === 'boolean') {
            parsedOptions[flagName] = true;
        } else {
            if (i + 1 >= rawArgs.length || rawArgs[i+1].startsWith('--')) {
                console.error(`Error: Flag '${arg}' requires a value.`);
                process.exit(1);
            }
            const val = rawArgs[++i];
            parsedOptions[flagName] = type === 'number' ? parseInt(val, 10) : val;
        }
    } else {
        parsedArgs.push(arg);
    }
  }

  cmdDef.handler(parsedArgs, parsedOptions);
}

parseAndDispatch();