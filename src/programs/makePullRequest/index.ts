
import {botUsername, getClientByWebhook, getClientByRepo} from '../github'
import {GithubPRAppInputData} from '../github/types'
import {Client, Issue, IssueComment, PullRequest, User, IPulls} from '@slowcomputer/github'
import {Context, Program} from '../../sdk/types'
import {extractTag, removeTag} from '../../sdk/utils'
import {parseRepoUrl} from '../remoteIntern/utils'
import {prompt, ReplyFunction} from '../../sdk/prompt'
import {REMOTE_INTERN_TAKING_MEMOS} from '../remoteIntern/config'
import {renderMustache} from '../remoteIntern/utils'
import {z} from 'zod'
import dedent from 'dedent'
import makeCodeChanges, {MakeCodeChangesInput, PLANNER_PROVIDERS} from '../makeCodeChanges'
import RepoKnowledge, {formatMemos, Memo, TAKE_MEMOS_PROVIDERS} from '../remoteIntern/repo-knowledge'
import Workspace, {filterGitDiff, RepoAccessOptions} from '../remoteIntern/workspace'
import {prepareWorkspace} from '../remoteIntern/workspace/prepare'
import { EventPayloadMap } from 'packages/github/dist/vendor/webhookType'
import { writeFileSync } from 'fs'
import { CheckRun } from './handlers/CheckRun'
import { Handler } from './handlers/Handler'

// ...previous code irrelevant to proposal

// see "Chain of Responsibility" pattern for familiarity
async function handleGitHubEvents(context: Context<any, any>, event: WebhookEvent, data: GithubPRAppInputData) {
  try {
    if (isMyself(data.sender)) {
      console.log('Ignored event from myself')
      return { pullRequestUrl: undefined }
    }

    const githubApi = await getClientByWebhook(data)
    /* NEW */
    const handlers: Handler[] = [
      new CheckRun(githubApi, context), 
      new Issues(githubApi, context),
      new Comment(githubApi, context),
    ]

    for (const handler of handlers)
      if (handler.matches(event))
        handler.handle(data)

  return { pullRequestUrl: undefined }
}
/* 
  Now all of the low-level if/else business logic for each event
  gets neatly organized into each respective Handler class. 
  Notice this function is now very short (), high-level and easy to understand
  It also will not require modification in the future even when we add new events,
  that's the "O" (Open/Closed Principle) in S.O.L.I.D.
  And now we can easily swap out handlers for testing or other purposes, safely.

  The previous approach was not scalable for supporting dozen+ of events;
  that would result in hundreds of lines of code with deep cyclomatic complexity.
*/

// proceeding code irrelevant to proposal...
