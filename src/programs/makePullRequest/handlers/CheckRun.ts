import { EventPayloadMap } from "packages/github/src/vendor/webhookType";
import { Handler } from "./Handler";
import { extractTag } from "@sdk/utils";
import { prompts } from "../prompts";
import { DEFAULT_PROVIDERS } from "../constants";

class CheckRun extends Handler {
  override trigger = 'check_run'

  async probe(data: EventPayloadMap['check_run']): Promise<{ files: any[], logs: string }> {
    const logs = await this.api.actions.downloadJobLogsForWorkflowRun({
      job_id: data.check_run.id!
    }) as string

    const commit = await this.api.repos.getCommit({
      ref: data.check_run.head_sha
    })

    const files = await Promise.all((commit.files || []).map(async file => {
      const content = await this.api.repos.getContent({
        path: file.filename,
        ref: data.check_run.head_sha
      }).then(response =>
        'content' in response ?
          Buffer.from(response.content, 'base64').toString() : null
      ).catch(() => null)

      return {
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch,
        content: content
      }
    }))

    return { files, logs }
  }


  async diagnose(logs: string, files: any[]): Promise<string> {
    const [result] = await prompt(prompts.diagnose(files, logs), {
      providers: DEFAULT_PROVIDERS
    })!
    return extractTag(result, 'diagnosis')!
  }


  async prescribe(diagnosis: string, files: any[]): Promise<string> {
    const [result] = await prompt(prompts.prescribe(diagnosis, files), {
      providers: DEFAULT_PROVIDERS
    })

    return extractTag(result, 'prescription')!
  }


  async handle(data: EventPayloadMap['check_run']) {

    if (data.check_run.status == 'completed')
      if (data.check_run.conclusion === 'failure') {

        const { logs, files } = await this.probe(data)
        const diagnosis = await this.diagnose(logs, files) 
        const prescription = await this.prescribe(diagnosis, files)
      
        const pr = await this.api.pulls.get({
          pull_number: data.check_run.pull_requests[0].number
        })

        const fixResult = await makeChangeAndUpdatePR(this.context, this.api, prescription, pr, {
          requirements: `${diagnosis}\n\n${prescription}`,
          repoUrl: data.repository.ssh_url,
          accessToken: await api.getAccessToken(),
          basedOn: pr.base.sha,
          continueFrom: pr.head.ref
        })

        return fixResult
      }
  }
}

export { CheckRun }
