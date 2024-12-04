import dedent from "dedent"
import { surrounding } from "./utils"

// TODO: transition to text-based DSL such as HandlebarsJS
export const prompts = {
  diagnose(files: { filename: string, status: string, additions: number, deletions: number, patch?: string, content?: string }[], logs: string) {
    return dedent`
      You will be given a log from a failed check run, and the files changed in the commit.
  
      Your job is to identify errors and propose fixes for those errors based on the file changes. DON'T propose any fixes, just identify the errors.
  
      <logs>
      ${surrounding('##[error]', { from: logs, diameter: 800 })}
      </logs>
  
      <files>
      ${files.map(file => `
        File: ${file.filename}
        Status: ${file.status}
        Changes: +${file.additions} -${file.deletions}
        Patch:
        ${file.patch || '[No patch available]'}
        
        Full content:
        ${file.content || '[Content not available]'}
        
      `).join('\n\n')}
      </files>
  
      Use this format:
      <diagnosis>
        PLAIN ENGLISH ANALYSIS OF CAUSE
      </diagnosis>
      
      Example:
      <diagnosis>
        The error indicates ... which I believe is caused by xyz changes to the Foo.ts file, as ...
      </diagnosis>
      Begin.
    `
  },
  prescribe(diagnosis: string, files: { filename: string, status: string, additions: number, deletions: number, patch?: string, content?: string }[]) {
    return dedent`
        You are given a diagnosis of a failed check run in a commit pull request, and the files changed in the commit.
  
        <diagnosis>
        ${diagnosis}
        </diagnosis>
  
        <files>
        ${files.map(file => `
          File: ${file.filename}
          Status: ${file.status}
          Changes: +${file.additions} -${file.deletions}
          Patch:
          ${file.patch || '[No patch available]'}
          
          Full content:
          ${file.content || '[Content not available]'}
        `).join('\n\n')}
        </files>
  
        Prescribe an edit to fix the errors, in natural English (don't include any code), in the format:
        <prescription>
        ...
        </prescription>
        Begin.
      `
  }
}
