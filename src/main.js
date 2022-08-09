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
const order = '3'

// json file content:
const data = JSON.stringify({
  name: 'test',
  order,
  enabled: true,
})

const content = base64Encode(data)

// commit information
const name = 'order bot'
const email = 'sami.koskivaara@gmail.com'
const author = {
  name, email
}

// file name, based on order number
const orderFileName = `order_${order}.json`

// repo information
const basics = {
  owner: 'Satak',
  repo: 'octo-tester',
  path: `orders/${orderFileName}`,
  message: `feat: Added ${orderFileName} programmatically`,
}

const main = async () => {
  try {
    return await octokit.repos.createOrUpdateFileContents({
      ...basics,
      content,
      committer: {
        ...author
      },
      author,
    })
  } catch (err) {
    console.error(err)
  }
}

main()
