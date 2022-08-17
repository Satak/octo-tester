const { Buffer } = require('node:buffer')
const { randomUUID } = require('node:crypto')
const { Octokit } = require('@octokit/rest')

module.exports = async function (context, req) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
  })

  const base64 = (strData, decode = false) => {
    const encodingMap = {
      true: 'base64',
      false: 'utf8',
    }
    return Buffer.from(strData, encodingMap[decode]).toString(encodingMap[!decode])
  }

  // get github file
  const getFile = async (githubParams) => {
    try {
      const repoData = await octokit.rest.repos.getContent({
        ...githubParams
      })
      return repoData.data

    } catch (err) {

      context.log.info(`${githubParams.path} doesn't exist`)
    }
  }

  // add file to github
  const addFile = async (githubParams, content, message, sha) => {
    try {
      return await octokit.repos.createOrUpdateFileContents({
        ...githubParams,
        sha,
        content,
        message,
      })
    } catch (err) {
      context.log.error(err)
    }
  }

  const postController = async (githubParams, headers) => {

    const order = req.body?.order ?? randomUUID()
    const folderName = req.body?.folderName ?? 'orders'

    const orderFileName = `order_${order}.json`
    const path = folderName === '.' ? orderFileName : `${folderName}/${orderFileName}`

    const data = {
      order,
      name: req.body?.name,
      enabled: req.body?.enabled ?? true,
    }

    const jsonData = JSON.stringify(data)
    const content = base64(jsonData)
    const message = `feat: Added ${path} programmatically`
    const githubParamsFull = { ...githubParams, path }

    const resData = await getFile(githubParamsFull)
    const addFileRes = await addFile(githubParamsFull, content, message, resData?.sha)

    const status = addFileRes ? 201 : 401
    const responseMessage = addFileRes ? 'success' : 'error'
    const body = { status, data, responseMessage, githubParamsFull, content, sha: resData?.sha }

    context.res = {
      status,
      body,
      headers,
    }
  }

  const getController = async (githubParams, headers) => {

    const folder = context.bindingData.folder
    const orderId = context.bindingData.id

    const orderFileName = `order_${orderId}.json`
    const path = folder === 'root' ? orderFileName : `${folder}/${orderFileName}`

    const githubParamsFull = { ...githubParams, path }

    const resData = await getFile(githubParamsFull)

    const resDataStr = resData ? base64(resData.content, true) : '{}'

    const content = JSON.parse(resDataStr)

    const status = resData ? 200 : 404
    const responseMessage = resData ? 'success' : 'error'

    const body = { status, responseMessage, githubParamsFull, content, }

    context.res = {
      status,
      body,
      headers,
    }
  }

  const headers = {
    'Content-Type': 'application/json'
  }

  // repo information
  const owner = req.body?.owner ?? 'Satak'
  const repo = req.body?.repo ?? 'octo-tester'
  const githubParams = {
    owner,
    repo,
  }

  if (req.method === 'GET') {
    await getController(githubParams, headers)
  }

  if (req.method === 'POST') {
    await postController(githubParams, headers)
  }
}
