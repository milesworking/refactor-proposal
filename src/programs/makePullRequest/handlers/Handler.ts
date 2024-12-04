import { EventPayloadMap } from "packages/github/src/vendor/webhookType";
import {Client, Issue, IssueComment, PullRequest, User, IPulls} from '@slowcomputer/github'
import {Context, Program} from '../../../sdk/types'

abstract class Handler {
  constructor(
    protected readonly api: Client,
    protected readonly context: Context<any, any>,
  ) {}

  abstract trigger: string

  matches(event: WebhookEvent) {
    return event === this.trigger
  }

  abstract handle(data: EventPayloadMap[keyof EventPayloadMap]): Promise<any>
}

export { Handler }
