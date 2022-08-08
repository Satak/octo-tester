// https://github.com/okeeffed/octokit-create-file-example
// install octokit: npm install @octokit/rest
// set token:       $env:GITHUB_ACCESS_TOKEN = 'ghp_xxx'
// to run this:     node .\index.js

const { Buffer } = require('node:buffer')
const { Octokit } = require('@octokit/rest')

const base64Encode = (str) => {
  const buff = Buffer.from(str)
  return buff.toString('base64')
}

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
})

// variable
const order = '1'

// json file content:
const content = JSON.stringify({
  name: 'test',
  order,
  enabled: true,
})

// commit information
const name = 'order bot'
const email = 'sami.koskivaara@gmail.com'
const author = {
  name, email
}

// file name, based on order number
const orderFileName = `order_${order}.json`

const basics = {
  owner: 'Satak',
  repo: 'octo-tester',
  path: `orders/${orderFileName}`,
  message: `feat: Added ${orderFileName} programmatically`,
}

const main = async () => {
  try {
    const contentEncoded = base64Encode(content)
    const { data } = await octokit.repos.createOrUpdateFileContents({
      ...basics,
      content: contentEncoded,
      committer: {
        ...author
      },
      author: {
        ...author
      },
    })

    console.log(data)
  } catch (err) {
    console.error(err)
  }
}

main()
