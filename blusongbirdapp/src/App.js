import './App.css';
import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import RecursiveReplies from './RecursiveReplies';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function App() {
  const userId = 1;
  /*
    array of pairs with first element in pair being the post object and the second element being the reply list
  */
  const [postData, setPostData] = useState([]);
  const [title, setTitle] = useState(""); // string
  const [body, setBody] = useState(""); // string
  const [comment, setComment] = useState(""); // string
  const [postid, setPostId] = useState(-1); // int
  const [replyid, setReplyId] = useState(null); // int || null
  const [displayAll, setDisplayAll] = useState(true); // boolean

  useEffect(() => {
    getPosts(); // fetches all posts (refreshes page data)
  }, []);

  // grab all posts from db and store them all with their replies into postData
  const getPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/posts/`);
      const temp = await Promise.all(
        res.data.map(async (element) => {
          // Clunky way of removing post data, can just check and not show later on, but hides data better?
          if (!element.active) {
            element.title = "Sorry this post has been removed...";
            element.body = "";
          }

          const innerRes = await axios.get(
            `http://localhost:3001/replies/${element.post_id}`
          );
          const tempReply = innerRes.data.map((elementReply) => {
            // same hack
            if (!elementReply.active) {
              elementReply.body = "Sorry this reply has been removed...";
            }
            return elementReply;
          });
          return [element, tempReply];
        })
      );
      setPostData(temp);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // use axios to create post using api
  const submitPost = () => {
    let data = {
      user_id: userId,
      title: title,
      body: body
    };
    axios.post(`http://localhost:3001/posts/`, data).then((res) => {
      getPosts();
    });
    // reset variables
    setTitle("")
    setBody("")
  };

  // create reply for post 
  const submitReply = () => {
    let data = {
      reply_parent: replyid,
      post_id: postid,
      user_id: userId,
      body: comment
    };
    axios.post(`http://localhost:3001/replies/`, data).then((res) => {
      // refresh page for updates
      getPosts();
    });
    // reset variables
    setComment("")
    setReplyId(null)
    setPostId(-1)
  };

  // checkbox changer for toggling 'deleted' posts
  const checkBoxChange = (event) => {
    setDisplayAll(event.target.checked);
  }

  return (
    <div>
      <div
        style={{
          background: '#CCF1FC',
          height: window.innerHeight * 0.005,
        }}>
      </div>
      <div
        style={{
          background: '#F1FCFF',
          display: 'flex',
          flexDirection: 'row',
          overflowY: 'scroll',
          height: window.innerHeight * 0.99,
        }}
      >
        <Card
          style={{
            position: 'relative',
            left: '5%',
            width: '55%',
            bgcolor: 'background.paper',
            marginRight: '3%',
            pt: 2,
            px: 4,
            pb: 3,
            overflow: 'inherit',
          }}>
          <CardHeader
            title="Posts"
            subheader="View your posts!"
          />
          <CardContent
            style={{
              display: 'grid',
            }}
          >
            <div>
              <FormControlLabel control={<Checkbox checked={displayAll} onChange={checkBoxChange} />} label="Show Deleted Posts" />
              {
                // map over all elements in postData, which is all posts found in db
                postData.map(data => (
                  // check if it is active and if checkbox is checked to determine to display or not
                  (displayAll || data[0].active) && (
                    <Box style={{
                      backgroundColor: 'aqua',
                      marginTop: '10%',
                      width: '80%',
                      height: 350,
                      overflow: 'auto',
                      display: 'grid',
                      padding: '5%'
                    }}>
                      <div style={{
                        height: 150,
                        outline: 'auto'
                      }}>
                        {/* could do logic here to change data if not active, but security maybe */}
                        <Typography variant="body2" color="text.primary">
                          {data[0].title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data[0].body}
                        </Typography>
                      </div>
                      <TextField id="filled-basic" label="Comment..." variant="filled" disabled={!data[0].active}
                        value={comment}
                        onChange={(event) => {
                          // set comment and postid for api use
                          setComment(event.target.value);
                          setPostId(data[0].post_id);
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={submitReply}
                        disabled={!data[0].active}
                      >
                        Add Comment
                      </Button>
                      {/* Call the recursive element using the top level comments (parents are the post) as the baseline */}
                      <RecursiveReplies replies={data[1]} active={!data[0].active} refresh={getPosts} />
                    </Box>
                  )
                ))}

            </div>
          </CardContent>
        </Card>
        <div style={{ background: '#F1FCFF', position: 'relative' }}>
          <Card
            style={{
              position: 'relative',
              left: '5%',
              width: '75%',
              bgcolor: 'bacground.paper',
              marginBottom: '5%',
            }}>
            <CardHeader title="Make a post!" subheader="" />
            <CardContent
              style={{
                display: 'grid',
              }}
            >
              <TextField id="outlined-basic" label="Title" variant="outlined"
                value={title}
                onChange={(event) => {
                  setTitle(
                    event.target.value
                  );
                }}
              />
              < TextField
                id="outlined-multiline-static"
                label="Body"
                multiline
                rows={6}
                value={body}
                onChange={(event) => {
                  setBody(
                    event.target.value
                  );
                }}
              />
              <Button
                style={{
                  marginTop: '5%',
                }}
                variant="contained"
                onClick={submitPost}>Post</Button>

            </CardContent>
          </Card>
          <Card style={{
            position: 'relative',
            left: '5%',
            width: '75%',
            bgcolor: 'bacground.paper',
            marginBottom: '5%',
          }}>
            <CardHeader
              title="Personal Ads ;)"
              subheader="100% of clients would recommend"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Enjoy the content? You can put your own ads here! Contact us to
                find out more!
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
      <div
        style={{
          background: '#120309',
          height: window.innerHeight * 0.005,
        }}>

      </div>
    </div>
  );
}

export default App;
