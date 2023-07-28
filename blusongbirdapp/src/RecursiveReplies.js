import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function RecursiveReplies({ replies, active, refresh }) {
    // used to track reply data to supply to api
    const [comment, setComment] = useState("");
    const [postid, setPostId] = useState(-1);
    const [replyid, setReplyId] = useState(null);
    const reply_box = {
        outlineStyle: 'auto',
        marginTop: '1%',
        width: '90%',
        height: 100,
        overflow: 'auto',
        display: 'Grid',
        padding: '5%'
    };

    // takes data in reply box and post id and parent id and creates a reply 
    const submitReply = () => {
        let data = {
            reply_parent: replyid,
            post_id: postid,
            user_id: 1,
            body: comment
        };
        axios.post(`http://localhost:3001/replies/`, data).then((res) => {
            // used to refresh page to update with new posting after it is made
            refresh();
        });
        // reset variables
        setComment("")
        setReplyId(null)
        setPostId(-1)
    };

    return (
        <>
            {(replies !== []) && replies.map(replyData => (
                <Box sx={{ ...reply_box }}>
                    <Typography variant="body2" color="text.secondary">
                        {"User " + replyData.user_id + ":"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {(replyData.body)}
                    </Typography>
                    <TextField id="filled-basic" label="Reply..." variant="filled"
                        value={comment}
                        onChange={(event) => {
                            // sets variables when you type into the specific box
                            setComment(
                                event.target.value
                            );
                            // def something wrong with this, but for simple demo reasons
                            setPostId(replyData.post_id)
                            setReplyId(replyData.reply_id)
                        }}
                        // disable is parent post is not active
                        disabled={active}
                    />
                    <Button
                        variant="contained"
                        onClick={submitReply}
                        // disable is parent post is not active
                        disabled={active}
                    >
                        Reply
                    </Button>
                    <RecursiveReplies
                        // recursively call this component with the children
                        // takes advantage of the structure of the json returned from the replies
                        replies={replyData.children}
                        active={active}
                        refresh={refresh} 
                    />
                </Box>
            ))}
        </>
    );
}