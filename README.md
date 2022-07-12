# real-time-forum

JS Real Time Forum task

To test the mockup:
1) Run a local Python HTTP server: `python3 -m http.server 8080`
2) Open [localhost:8080/src/webapp/](http://localhost:8080/src/webapp/)

## SPECS

### Posts JSON structure

```json
[
    {
      "user": "Username1",
      "title": "Post title1",
      "content": "Post content 1.",
      "timestamp": "07/07/2022 18:34",
      "comments": 1
    },
    {
      "user": "Username2",
      "title": "Post title2",
      "content": "Post content 2.",
      "timestamp": "07/07/2022 18:32",
      "comments": 0
    },
    {
      "user": "Username3",
      "title": "Post title3",
      "content": "Post content 3.",
      "timestamp": "07/07/2022 18:30",
      "comments": 2
    }
  ]
```

### Messages JSON structure

```json
[
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
}
