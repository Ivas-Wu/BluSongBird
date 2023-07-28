const Pool = require('pg').Pool

// Connect Local DB
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test_db',
  password: 'password',
  port: 5432,
})

/* 
  Return all posts in db; return json 
  [
    {
        "post_id": int,
        "user_id": int,
        "title": string,
        "body": string,
        "active": boolean
    },
    ...
  ]
*/
const getAllPosts = (request, response) => {
  pool.query('SELECT * FROM posts ORDER BY post_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

// Return posts from specific user id; For future scaliblity; returns json same as above
const getPostByUserId = (request, response) => {
  const id = parseInt(request.params.id)
  pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY post_id ASC', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

/*
  Return replies for a specific post based on post_id; returns json
  [
    {
        "reply_id": int,
        "reply_parent": int | null,
        "post_id": int,
        "user_id": int,
        "body": string,
        "active": boolean,
        "children": [
            {
              ...same thing
            }
        ]
    },
    ...
  ]
*/
const getReplies = (request, response) => {
  const id = parseInt(request.params.id)
  pool.query('SELECT * FROM replies WHERE post_id = $1 ORDER BY reply_id ASC', [id], (error, results) => {
    if (error) {
      throw error
    }
    // Move all data into a dictionary
    const dataDict = {};
    results.rows.forEach((item) => {
      dataDict[item.reply_id] = { ...item, children: [] };
    });

    // if there is no parent it is top level
    const root = [];
    results.rows.forEach((item) => {
      if (item.reply_parent === null) {
        root.push(dataDict[item.reply_id]);
      }
      // if not parent grab the parent from the dictionary and add to children list
      else {
        const parent = dataDict[item.reply_parent];
        if (parent) {
          parent.children.push(dataDict[item.reply_id]);
        }
      }
    });
    response.status(200).json(root)
  })
}

// Return replies based on reply parent id; Depending on UI implimentation this can be used
const getRepliesId = (request, response) => {
  const id = parseInt(request.params.id)
  pool.query('SELECT * FROM replies WHERE reply_parent = $1 ORDER BY reply_id ASC', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

/*
 Creates post, returns 400 error if no body, returns 201 and post id if successful
 Useage body:
 {
    "user_id": int,
    "title" : string,
    "body" : string
  }
*/
const createPost = (request, response) => {
  const { title, body } = request.body
  // I think this should be designed to be put into the front end, but adding it for completeness sake right now!
  if (body.length < 1) {
    response.status(400).send("No body!")
  }
  else {
    pool.query('INSERT INTO posts (user_id, title, body) VALUES ($1, $2, $3) RETURNING *', [1, title, body], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`Post added with ID: ${results.rows[0].post_id}`)
    })
  }
}

/*
  Create reply to either reply or post, sanity check that parent exists, shouldn't happen in practice 
  Reply body:
  {
    "reply_parent" : int || null,
    "post_id" : int,
    "user_id" : int,
    "body" : string
  }
*/
const createReply = (request, response) => {
  const { reply_parent, post_id, body } = request.body

  // Sanity check to ensure parent exists should also check if reply parent is not null, and if it is not null, check to see that the reply exists (my sql is lacking here...)
  pool.query('INSERT INTO replies (reply_parent, post_id, user_id, body) SELECT $1, $2, $3, $4 WHERE EXISTS (SELECT 1 FROM posts WHERE post_id = $2) RETURNING *', [reply_parent, post_id, 1, body], (error, results) => {
    if (error) {
      throw error
    }
    if (results.rows.length !== 0) {
      response.status(201).send(`Reply added with ID: ${results.rows[0].reply_id}`)
    } else {
      response.status(400).send('Parent Post doesn\'t exist')
    }

  })
}

/*
 Update title and/or body of post based on post id
 Update body:
 {
    "title" : string,
    "body" : string
  }
*/
const updatePost = (request, response) => {
  const id = parseInt(request.params.id)
  const { title, body } = request.body

  pool.query(
    'UPDATE posts SET title = $1, body = $2 WHERE post_id = $3',
    [title, body, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Post modified with ID: ${id}`)
    }
  )
}

/*
 Update body of reply based on reply id
 Update body:
 {
    "body" : string
  }
*/
const updateReply = (request, response) => {
  const id = parseInt(request.params.id)
  const { body } = request.body

  pool.query(
    'UPDATE replies SET body = $1 WHERE reply_id = $2',
    [body, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Reply modified with ID: ${id}`)
    }
  )
}

// Sets active field of post to false based on post id; example: localhost:3001/posts/:id
const deletePost = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('UPDATE posts SET active = FALSE WHERE post_id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Post deleted with ID: ${id}`)
  })
}

// Sets active field of reply to false based on reply id; example: localhost:3001/replies/:id
const deleteReply = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('UPDATE replies SET active = FALSE WHERE reply_id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Reply deleted with ID: ${id}`)
  })
}

module.exports = {
  getAllPosts,
  getPostByUserId,
  getReplies,
  getRepliesId,
  createPost,
  createReply,
  updatePost,
  updateReply,
  deletePost,
  deleteReply,
}