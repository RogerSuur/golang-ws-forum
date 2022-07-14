# real-time-forum

JS Real Time Forum task

To test the mockup:

1. Run a local Python HTTP server: `python3 -m http.server 8080`
2. Open [localhost:8080/src/webapp/](http://localhost:8080/src/webapp/)

## SPECS

### Posts JSON structure

```json
{
  "posts": [
    {
      "user": "Username1",
      "postID": "8351f8765ec782ce42869889fca6ba49",
      "title": "Post title1",
      "content": "Post content 1.",
      "timestamp": "07/07/2022 18:34",
      "comments": 1,
      "unread": false
    },
    {
      "user": "Username2",
      "postID": "9ba55d4972eca5ac4008c3eb9c279b3b",
      "title": "Post title2",
      "content": "Post content 2.",
      "timestamp": "07/07/2022 18:32",
      "comments": 0,
      "unread": false
    },
    {
      "user": "Username3",
      "postID": "d59f6d8ce3f10b35c524ee1416425d9c",
      "title": "Post title3",
      "content": "Post content 3.",
      "timestamp": "07/07/2022 18:30",
      "comments": 2,
      "unread": true
    }
  ],
  "remainingPosts": 5
}
```

### Messages JSON structure

```json
{
  "messages": [
    {
      "from": "Username1",
      "to": "Username2",
      "content": "Message content 1.",
      "timestamp": "07/07/2022 18:59"
    },
    {
      "from": "Username2",
      "to": "Username1",
      "content": "Message content 2.",
      "timestamp": "07/07/2022 18:58"
    },
    {
      "from": "Username2",
      "to": "Username1",
      "content": "Message content 3.",
      "timestamp": "07/07/2022 18:56"
    }
  ],
  "remainingMessages": 8
}
```

### Users JSON structure

```json
{
  "online": [
    {
      "name": "SampleUser3",
      "unread": true
    },
    {
      "name": "SampleUser84",
      "unread": false
    },
    {
      "name": "SampleUser22",
      "unread": false
    }
  ],
  "offline": [
    {
      "name": "SampleUser12",
      "unread": true
    },
    {
      "name": "SampleUserWithAnExtraLongNameToTestTruncating",
      "unread": false
    },
    {
      "name": "SampleUser19",
      "unread": false
    },
    {
      "name": "SampleUser33",
      "unread": false
    }
  ]
}
```
