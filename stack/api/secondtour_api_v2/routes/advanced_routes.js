const express = require('express')
const router = express.Router()
const UUIDv4 = require('uuid').v4
const axios = require('axios')

/**
 * @swagger
 * /data/fetch/{table}:
 *    post:
 *      tags:
 *          - Automated Data Operation
 *      description: Return all the rows of a table
 *      parameters:
 *          - in: path
 *            name: table
 *            type: string
 *            required: true
 *            description: The table you want to fetch
 *          - in: body
 *            name: User auth
 *            type: object
 *            schema:
 *              $ref: '#definitions/User'
 *      responses:
 *          '200':
 *              description: Table retreive correctly
 *              schema:
 *                  $ref: '#definitions/fetchOut'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/fetch/:table').post(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-fetch',
        data: {
          target: 'mysql:api-fetch'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-fetch',
        data: {
          target: 'api:api-fetch'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let table = req.params['table']
  let result = await db.query(`SELECT * FROM ${table};`).catch(e => {
    res.status(500).send(e)
  })
  res.send(result)
})

/**
 * @swagger
 * /data/fetchfilter/{table}:
 *    post:
 *      tags:
 *          - Automated Data Operation
 *      description: Return all the rows of a table that match with your filter
 *      parameters:
 *          - in: path
 *            name: table
 *            type: string
 *            required: true
 *            description: The table you want to fetch
 *          - in: body
 *            name: User auth + Filter
 *            type: object
 *            schema:
 *              $ref: '#definitions/UserContentTableDescription'
 *      responses:
 *          '200':
 *              description: Table retreive correctly
 *              schema:
 *                  $ref: '#definitions/fetchFilterOut'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/fetchfilter/:table').post(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-fetchfilter',
        data: {
          target: 'mysql:api-fetchfilter'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-fetchfilter',
        data: {
          target: 'api:api-fetchfilter'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let table = req.params['table']
  let content = req.body['content']
  let condition = ''
  Object.keys(content).forEach((element, index) => {
    if (index != 0) condition += ' AND '
    if (
      content[element] === 'null' ||
      !isNaN(content[element]) ||
      content[element] === 'true' ||
      content[element] === 'false'
    )
      condition += element + ' = ' + content[element]
    else {
        content[element] = content[element].replace(/'/g, "''");
        condition += element + " = '" + content[element] + "'"
    }
  })
  let result = await db
    .query(`SELECT * FROM ${table} WHERE ${condition};`)
    .catch(e => {
      res.status(500).send(e)
    })
  res.send(result)
})

/**
 * @swagger
 * /data/fetchmulti:
 *    post:
 *      tags:
 *          - Automated Data Operation
 *      description: Return all the table and rows you asked
 *      parameters:
 *          - in: body
 *            name: User auth + Rows name
 *            type: object
 *            schema:
 *              $ref: '#definitions/UserContentTableName'
 *      responses:
 *          '200':
 *              description: Table retreive correctly
 *              schema:
 *                  $ref: '#definitions/fetchMultiOut'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/fetchmulti').post(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-fetchmulti',
        data: {
          target: 'mysql:api-fetchmulti'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-fetchmulti',
        data: {
          target: 'api:api-fetchmulti'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let tables = req.body['content']
  let result = []
  for (let i = 0; i < tables.length; i++) {
    let table = tables[i]
    let a_result = await db.query(`SELECT * FROM ${table};`).catch(e => {
      res.status(500).send(e)
    })
    result.push(a_result)
  }

  res.send(result)
})

/**
 * @swagger
 * /data/insert/{table}:
 *    put:
 *      tags:
 *          - Automated Data Operation
 *      description: Insert a row in the table selected
 *      parameters:
 *          - in: path
 *            name: table
 *            type: string
 *            required: true
 *            description: The table you want to insert in the row
 *          - in: body
 *            name: User auth + Row content
 *            type: object
 *            schema:
 *              $ref: '#definitions/UserContentTableDescriptionFull'
 *      responses:
 *          '201':
 *              description: Table created successfully
 *              schema:
 *                  $ref: '#definitions/returnId'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/insert/:table').put(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-insert',
        data: {
          target: 'mysql:api-insert'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-insert',
        data: {
          target: 'api:api-insert'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let table = req.params['table']
  let content = req.body['content']
  let values = '('
  Object.keys(content).forEach((element, index) => {
    values += element
    if (index != Object.keys(content).length - 1) values += ', '
  })
  values += ') VALUES ('
  Object.keys(content).forEach((element, index) => {
    if (
      content[element]
        .toString()
        .match(/... ... [0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} [0-9]{4}/)
    ) {
      content[element] =
        "STR_TO_DATE('" + content[element] + "', '%a %b %d %H:%i:%s %Y')"
      values += content[element]
    } else {
      if (
        content[element] === 'null' ||
        !isNaN(content[element]) ||
        content[element] === 'true' ||
        content[element] === 'false'
      )
        values += content[element]
      else {
          content[element] = content[element].replace(/'/g, "''");
          values += "'" + content[element] + "'"
      }
    }
    if (index != Object.keys(content).length - 1) values += ', '
  })
  values += ')'
  let result = await db.query(`INSERT INTO ${table} ${values};`).catch(e => {
    res.status(500).send(e)
  })
  res.status(201).send(result)
})

/**
 * @swagger
 * /data/delete/{table}:
 *    delete:
 *      tags:
 *          - Automated Data Operation
 *      description: Delete all the rows in the table you want
 *      parameters:
 *          - in: path
 *            name: table
 *            type: string
 *            required: true
 *            description: The table you want to fetch
 *          - in: body
 *            name: User auth
 *            type: object
 *            schema:
 *              $ref: '#definitions/User'
 *      responses:
 *          '202':
 *              description: Table deleted succesfully
 *              schema:
 *                  $ref: '#definitions/returnId'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/delete/:table').delete(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-delete',
        data: {
          target: 'mysql:api-delete'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-delete',
        data: {
          target: 'api:api-delete'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let table = req.params['table']
  let result = await db.query(`DELETE FROM ${table};`).catch(e => {
    res.status(500).send(e)
  })
  res.status(202).send(result)
})

/**
 * @swagger
 * /data/deletefilter/{table}:
 *    delete:
 *      tags:
 *          - Automated Data Operation
 *      description: Delete all the rows of a table that match with your filter
 *      parameters:
 *          - in: path
 *            name: table
 *            type: string
 *            required: true
 *            description: The table you where you want to delete rows
 *          - in: body
 *            name: User auth + Filter
 *            type: object
 *            schema:
 *              $ref: '#definitions/UserContentTableDescription'
 *      responses:
 *          '202':
 *              description: Rows successfully deleted
 *              schema:
 *                  $ref: '#definitions/returnId'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/deletefilter/:table').delete(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-deletefilter',
        data: {
          target: 'mysql:api-deletefilter'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-deletefilter',
        data: {
          target: 'api:api-deletefilter'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let table = req.params['table']
  let content = req.body['content']
  let condition = ''
  Object.keys(content).forEach((element, index) => {
    if (index != 0) condition += ' AND '
    if (
      content[element] === 'null' ||
      !isNaN(content[element]) ||
      content[element] === 'true' ||
      content[element] === 'false'
    )
      condition += element + ' = ' + content[element]
    else {
        content[element] = content[element].replace(/'/g, "''");
        condition += element + " = '" + content[element] + "'"
    }
  })
  let result = await db
    .query(`DELETE FROM ${table} WHERE ${condition};`)
    .catch(e => {
      res.status(500).send(e)
    })
  res.status(202).send(result)
})

/**
 * @swagger
 * /data/deleteall:
 *    post:
 *      tags:
 *          - Automated Data Operation
 *      description: Delete all the rows of all the tables
 *      parameters:
 *          - in: body
 *            name: User auth
 *            type: object
 *            schema:
 *              $ref: '#definitions/User'
 *      responses:
 *          '202':
 *              description: Rows successfully deleted
 *              schema:
 *                  $ref: '#definitions/fetchMultiOut'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/deleteall').delete(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-deleteall',
        data: {
          target: 'mysql:api-deleteall'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-deleteall',
        data: {
          target: 'api:api-deleteall'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let tables = await db.query(`SHOW TABLES;`).catch(e => {
    res.status(500).send(e)
  })
  let result = []
  tables.forEach(async table => {
    let a_result = await db
      .query(`DELETE FROM ${table['Tables_in_secondtour']};`)
      .catch(e => {
        console.log(e)
      })
    result.push(a_result)
  })
  res.status(202).send(result)
})

/**
 * @swagger
 * /data/updatefilter/{table}:
 *    patch:
 *      tags:
 *          - Automated Data Operation
 *      description: Update all the rows of a table that match with your filter
 *      parameters:
 *          - in: path
 *            name: table
 *            type: string
 *            required: true
 *            description: The table you where you want to update rows
 *          - in: body
 *            name: User auth + Filter
 *            type: object
 *            schema:
 *              $ref: '#definitions/UserContentUpdate'
 *      responses:
 *          '202':
 *              description: Rows successfully updated
 *              schema:
 *                  $ref: '#definitions/returnId'
 *          '401':
 *              description: Your authentification identifiers are not correct
 */
router.route('/updatefilter/:table').patch(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'mysql:api-updatefilter',
        data: {
          target: 'mysql:api-updatefilter'
        }
      })
      .catch(err => {
        console.log(err)
      })
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-updatefilter',
        data: {
          target: 'api:api-updatefilter'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  let table = req.params['table']
  let content = req.body['content']
  let content_condition = content['filter']
  let condition = ''
  Object.keys(content_condition).forEach((element, index) => {
    if (index != 0) condition += ' AND '
    if (
      content_condition[element] === 'null' ||
      !isNaN(content_condition[element]) ||
      content_condition[element] === 'true' ||
      content_condition[element] === 'false'
    )
      condition += element + ' = ' + content_condition[element]
    else {
        content_condition[element] = content_condition[element].replace(/'/g, "''")
        condition += element + " = '" + content_condition[element] + "'"
    }
  })
  let content_data = content['data']
  let data = ''
  Object.keys(content_data).forEach((element, index) => {
    if (
      content_data[element]
        .toString()
        .match(/... ... [0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} [0-9]{4}/)
    ) {
      content_data[element] =
        "STR_TO_DATE('" + content_data[element] + "', '%a %b %d %H:%i:%s %Y')"
      data += element + ' = ' + content_data[element]
    } else {
      if (
        content_data[element] === 'null' ||
        !isNaN(content_data[element]) ||
        content_data[element] === 'true' ||
        content_data[element] === 'false'
      )
        data += element + ' = ' + content_data[element]
      else {
          content_data[element] = content_data[element].replace(/'/g, "''")
          data += element + ' = ' + "'" + content_data[element] + "'"
      }
    }
    if (index != Object.keys(content_data).length - 1) data += ', '
  })
  let result = await db
    .query(`UPDATE ${table} SET ${data} WHERE ${condition};`)
    .catch(e => {
      res.status(500).send(e)
    })
  res.status(202).send(result)
})

router.route('/token').post(async (req, res) => {
  if (process.env.NETWORK_VISU == 'true') {
    axios
      .post('http://' + process.env.LOCAL_IP + ':3000/add', {
        type: 'trigger',
        name: 'api:api-token',
        data: {
          target: 'api:api-token'
        }
      })
      .catch(err => {
        console.log(err)
      })
      
  }

  res.status(200).send({ token: UUIDv4() })
})

if (process.env.NETWORK_VISU == 'true') {
  // token
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-token',
      data: {
        name: 'token',
        id: 'api-token',
        size: 28,
        fsize: 20
      },
      position: {
        x: 395,
        y: 155
      }
    })
    .catch(err => {
      console.log(err)
    })
  // fetch
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-fetch',
      data: {
        name: 'fetch',
        id: 'api-fetch',
        size: 28,
        fsize: 20
      },
      position: {
        x: 426,
        y: 180
      }
    })
    .catch(err => {
      console.log(err)
    })
  // fetchfilter
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-fetchfilter',
      data: {
        name: 'fetchfilter',
        id: 'api-fetchfilter',
        size: 28,
        fsize: 20
      },
      position: {
        x: 457,
        y: 208
      }
    })
    .catch(err => {
      console.log(err)
    })
  // fetchmulti
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-fetchmulti',
      data: {
        name: 'fetchmulti',
        id: 'api-fetchmulti',
        size: 28,
        fsize: 20
      },
      position: {
        x: 488,
        y: 240
      }
    })
    .catch(err => {
      console.log(err)
    })
  // insert
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-insert',
      data: {
        name: 'insert',
        id: 'api-insert',
        size: 28,
        fsize: 20
      },
      position: {
        x: 520,
        y: 270
      }
    })
    .catch(err => {
      console.log(err)
    })
  // delete
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-delete',
      data: {
        name: 'delete',
        id: 'api-delete',
        size: 28,
        fsize: 20
      },
      position: {
        x: 547,
        y: 303
      }
    })
    .catch(err => {
      console.log(err)
    })
  // deletefilter
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-deletefilter',
      data: {
        name: 'deletefilter',
        id: 'api-deletefilter',
        size: 28,
        fsize: 20
      },
      position: {
        x: 582,
        y: 335
      }
    })
    .catch(err => {
      console.log(err)
    })
  // deleteall
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-deleteall',
      data: {
        name: 'deleteall',
        id: 'api-deleteall',
        size: 28,
        fsize: 20
      },
      position: {
        x: 610,
        y: 363
      }
    })
    .catch(err => {
      console.log(err)
    })
  // updatefilter
  axios
    .post('http://' + process.env.LOCAL_IP + ':3000/add', {
      type: 'node',
      name: 'api-updatefilter',
      data: {
        name: 'updatefilter',
        id: 'api-updatefilter',
        size: 28,
        fsize: 20
      },
      position: {
        x: 638,
        y: 396
      }
    })
    .catch(err => {
      console.log(err)
    })

  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-fetch',
    data: {
      id: 'mysql:api-fetch',
      weight: 1,
      source: 'mysql',
      target: 'api-fetch'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-fetchfilter',
    data: {
      id: 'mysql:api-fetchfilter',
      weight: 1,
      source: 'mysql',
      target: 'api-fetchfilter'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-fetchmulti',
    data: {
      id: 'mysql:api-fetchmulti',
      weight: 1,
      source: 'mysql',
      target: 'api-fetchmulti'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-insert',
    data: {
      id: 'mysql:api-insert',
      weight: 1,
      source: 'mysql',
      target: 'api-insert'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-delete',
    data: {
      id: 'mysql:api-delete',
      weight: 1,
      source: 'mysql',
      target: 'api-delete'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-deletefilter',
    data: {
      id: 'mysql:api-deletefilter',
      weight: 1,
      source: 'mysql',
      target: 'api-deletefilter'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-deleteall',
    data: {
      id: 'mysql:api-deleteall',
      weight: 1,
      source: 'mysql',
      target: 'api-deleteall'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'mysql:api-updatefilter',
    data: {
      id: 'mysql:api-updatefilter',
      weight: 1,
      source: 'mysql',
      target: 'api-updatefilter'
    }
  })

  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-token',
    data: {
      id: 'api:api-token',
      weight: 1,
      source: 'api',
      target: 'api-token'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-fetch',
    data: {
      id: 'api:api-fetch',
      weight: 1,
      source: 'api',
      target: 'api-fetch'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-fetchfilter',
    data: {
      id: 'api:api-fetchfilter',
      weight: 1,
      source: 'api',
      target: 'api-fetchfilter'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-fetchmulti',
    data: {
      id: 'api:api-fetchmulti',
      weight: 1,
      source: 'api',
      target: 'api-fetchmulti'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-insert',
    data: {
      id: 'api:api-insert',
      weight: 1,
      source: 'api',
      target: 'api-insert'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-delete',
    data: {
      id: 'api:api-delete',
      weight: 1,
      source: 'api',
      target: 'api-delete'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-deletefilter',
    data: {
      id: 'api:api-deletefilter',
      weight: 1,
      source: 'api',
      target: 'api-deletefilter'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-deleteall',
    data: {
      id: 'api:api-deleteall',
      weight: 1,
      source: 'api',
      target: 'api-deleteall'
    }
  })
  axios.post('http://' + process.env.LOCAL_IP + ':3000/add', {
    type: 'edge',
    name: 'api:api-updatefilter',
    data: {
      id: 'api:api-updatefilter',
      weight: 1,
      source: 'api',
      target: 'api-updatefilter'
    }
  })
}

module.exports = router
