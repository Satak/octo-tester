// https://github.com/okeeffed/octokit-create-file-example
// install octokit: npm install @octokit/rest
// set token:       $env:GITHUB_ACCESS_TOKEN = 'ghp_xxx'
// to run this:     node .\index.js

import { Buffer } from 'node:buffer'
import { Octokit } from '@octokit/rest'

const base64Encode = (str) => {
  const buff = Buffer.from(str)
  return buff.toString('base64')
}

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
})

// order number, can be changed
const order = '6'

// json file content:
const data = JSON.stringify({
  name: 'test',
  order,
  enabled: false,
})

const content = base64Encode(data)

// file name, based on order number
const orderFileName = `order_${order}.json`

const message = `feat: Added ${orderFileName} programmatically`

// repo information
const basics = {
  owner: 'Satak',
  repo: 'octo-tester',
  path: `orders/${orderFileName}`,
}

// get sha from the file
const getSha = async () => {
  try {
    const repoData = await octokit.rest.repos.getContent({
      ...basics
    })
    return repoData.data.sha
  } catch (err) {
    console.log(`orders/${orderFileName} doesn't exist, creating a new file...`)
  }
}

const main = async () => {
  const sha = await getSha()
  try {
    return await octokit.repos.createOrUpdateFileContents({
      ...basics,
      sha: sha ?? null,
      content,
      message,
    })
  } catch (err) {
    console.error(err)
  }
}

main()
