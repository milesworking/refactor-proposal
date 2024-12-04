import { EventPayloadMap } from "packages/github/src/vendor/webhookType";
import { Handler } from "./Handler";

class Issues extends Handler {
  override trigger = 'issues'

  async handle(data: EventPayloadMap['issues']) {
    // probably refactor how `matches()` works, since this handler needs to match combinations of events + data shapes
    if (
      (((data.action === 'opened' || data.action === 'labeled')) ||
        (data.action === 'created')) &&
      (!data.issue?.pull_request &&
        data.issue?.state === 'open' &&
        data.issue?.labels.some((label: any) =>
          typeof label === 'string' ?
            label === 'help wanted' : label.name === 'help wanted'
        ))
      )
  }
}

export { Issues }