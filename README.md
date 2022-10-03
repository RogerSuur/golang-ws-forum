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
        "user": "Roman Walker",
        "postID": "62eec9d0c57b380813d49914",
        "title": "esse aliqua eiusmod aute adipisicing 0",
        "content": "Proident ea velit dolor id sit mollit duis mollit. Ea excepteur dolor excepteur commodo officia reprehenderit ea cupidatat dolore tempor. Sint esse laborum quis ad excepteur aliquip.",
        "timestamp": "2014-02-25T05:32:37.578Z",
        "comments": 4,
        "unread": false
      },
      {
        "user": "Bowers Schultz",
        "postID": "62eec9d06cc876cdb45401d8",
        "title": "adipisicing ipsum sit quis ex 1",
        "content": "Eiusmod elit tempor veniam anim consectetur commodo ex fugiat commodo deserunt veniam culpa excepteur cillum. Pariatur ea qui minim deserunt proident reprehenderit proident et nisi. Anim nostrud qui aliqua aute sunt proident velit proident ea tempor.",
        "timestamp": "2014-04-05T03:06:00.502Z",
        "comments": 2,
        "unread": false
      },
      {
        "user": "Webster Randolph",
        "postID": "62eec9d08d3df1a575ed1571",
        "title": "esse do incididunt enim veniam 2",
        "content": "Elit veniam nulla adipisicing exercitation. In esse pariatur aliqua aliquip eu dolor Lorem exercitation qui amet reprehenderit consectetur aute do. Proident veniam exercitation irure labore.",
        "timestamp": "2013-05-11T12:12:20.939Z",
        "comments": 5,
        "unread": true
      },
      {
        "user": "Cameron Salas",
        "postID": "62eec9d0787124bfbef9c843",
        "title": "est laboris tempor aliqua esse 3",
        "content": "Do culpa laboris minim irure. Fugiat incididunt veniam aute sint sit anim cillum est mollit ad pariatur irure. Reprehenderit fugiat dolor id quis aute duis aliquip officia dolore duis irure irure.",
        "timestamp": "2012-09-11T10:48:29.269Z",
        "comments": 5,
        "unread": false
      },
      {
        "user": "Angie Workman",
        "postID": "62eec9d01509518340ca417f",
        "title": "magna ipsum laborum dolore qui 4",
        "content": "Fugiat sint qui ullamco voluptate cupidatat est ea tempor pariatur esse tempor deserunt Lorem. Minim eu aute aliqua eu laboris voluptate minim proident ea cupidatat do cillum esse. Aute et fugiat labore dolor nulla ullamco labore magna ut irure velit magna.",
        "timestamp": "2010-01-19T22:25:16.327Z",
        "comments": 6,
        "unread": true
      }
  ],
  "remainingPosts": 5
}
```

### Thread JSON structure

```json
{
  "posts": [
      {
        "user": "Roman Walker",
        "postID": "62eec9d0c57b380813d49914",
        "title": "esse aliqua eiusmod aute adipisicing 0",
        "content": "Proident ea velit dolor id sit mollit duis mollit. Ea excepteur dolor excepteur commodo officia reprehenderit ea cupidatat dolore tempor. Sint esse laborum quis ad excepteur aliquip.",
        "timestamp": "2014-02-25T05:32:37.578Z",
        "comments": 4,
        "unread": false
      },
      {
        "user": "Bowers Schultz",
        "postID": "62eec9d06cc876cdb45401d8",
        "title": "adipisicing ipsum sit quis ex 1",
        "content": "Eiusmod elit tempor veniam anim consectetur commodo ex fugiat commodo deserunt veniam culpa excepteur cillum. Pariatur ea qui minim deserunt proident reprehenderit proident et nisi. Anim nostrud qui aliqua aute sunt proident velit proident ea tempor.",
        "timestamp": "2014-04-05T03:06:00.502Z",
        "comments": 2,
        "unread": false
      },
      {
        "user": "Webster Randolph",
        "postID": "62eec9d08d3df1a575ed1571",
        "title": "esse do incididunt enim veniam 2",
        "content": "Elit veniam nulla adipisicing exercitation. In esse pariatur aliqua aliquip eu dolor Lorem exercitation qui amet reprehenderit consectetur aute do. Proident veniam exercitation irure labore.",
        "timestamp": "2013-05-11T12:12:20.939Z",
        "comments": 5,
        "unread": true
      },
      {
        "user": "Cameron Salas",
        "postID": "62eec9d0787124bfbef9c843",
        "title": "est laboris tempor aliqua esse 3",
        "content": "Do culpa laboris minim irure. Fugiat incididunt veniam aute sint sit anim cillum est mollit ad pariatur irure. Reprehenderit fugiat dolor id quis aute duis aliquip officia dolore duis irure irure.",
        "timestamp": "2012-09-11T10:48:29.269Z",
        "comments": 5,
        "unread": false
      }
  ],
  "remainingComments": 3
}
```

### Messages JSON structure

```json
{
  "messages": [
      {
        "from": "User3",
        "to": "User2",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "timestamp": "07/07/2022 18:59"
      },
      {
        "from": "User2",
        "to": "User3",
        "content": "Morbi dignissim hendrerit blandit.",
        "timestamp": "07/07/2022 18:58"
      },
      {
        "from": "User2",
        "to": "User3",
        "content": "In bibendum, turpis ac tristique luctus, turpis odio mattis nisi, vel vestibulum lacus ex a turpis.",
        "timestamp": "07/07/2022 18:56"
      },
      {
        "from": "User2",
        "to": "User3",
        "content": "Etiam id purus et nunc suscipit consequat et ac ante.",
        "timestamp": "07/07/2022 18:54"
      },
      {
        "from": "User2",
        "to": "User3",
        "content": "Integer lobortis nibh vitae justo pretium gravida.",
        "timestamp": "07/07/2022 18:52"
      },
      {
        "from": "User3",
        "to": "User2",
        "content": "Nulla ultricies orci non mauris porta, eget vestibulum eros laoreet.",
        "timestamp": "07/07/2022 18:50"
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
