

-- Leiab kasutajad kellega on sõnumi saatnud
-- SELECT username, MAX(timestamp)
-- FROM messages
-- JOIN users ON (messages.from_id = users.user_id OR messages.to_id = users.user_id)
-- WHERE messages.from_id = 9 OR messages.to_id = 9
-- GROUP BY username
-- ORDER BY (timestamp) DESC;

-- SELECT DISTINCT u.username
-- FROM users u
-- JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
-- WHERE m.from_id = 3 OR m.to_id = 3
-- ORDER BY m.timestamp ASC;



SELECT username
FROM users
 LEFT JOIN messages  ON 
            from_id = 8 AND to_id = user_id
        OR 
            from_id = user_id AND to_id = 8
        WHERE NOT user_id = 8
GROUP BY user_id
        ORDER BY 
            IFNULL(MAX(message_id), 0) DESC, 
            username ASC;



-- SELECT DISTINCT u.username
-- FROM users u
-- JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
-- WHERE m.from_id = 3 OR m.to_id = 3
-- ORDER BY m.timestamp ASC;

-- Users table
-- user_id        username
-- 1                   Vic666
-- 2                   Mike
-- 3                   Jack
-- 4                   Mark
-- 5                   Kate
-- 6                   John
-- 7                   Susan
-- 8                   Jollyroger
-- 9                    Keiti

-- Messages table
-- message_id    content      timestamp                                from_id       to_id
-- 1                        Text          2019-04-01T12:40:30.315Z          7               5
-- 2                        Text          2019-04-17T12:40:30.315Z          3               1
-- 3                        Text          2019-08-01T12:40:30.315Z          4               7
-- 4                        Text          2019-08-16T12:40:30.315Z          5               4
-- 5                        Text          2019-08-26T12:40:30.315Z          7               1
-- 6                        Text          2019-10-01T12:40:30.315Z          1               6
-- 7                        Text          2020-04-25T12:40:30.315Z          5               7
-- 8                        Text          2020-07-22T12:40:30.315Z          4               7
-- 9                        Text          2020-08-04T12:40:30.315Z          1               7
-- 10                        Text          2020-09-13T12:40:30.315Z          3               2
-- 11                        Text          2021-03-21T12:40:30.315Z          5               7
-- 12                        Text          2021-06-21T12:40:30.315Z          5               7
-- 13                        Text          2021-07-27T12:40:30.315Z          1               6
-- 14                        Text          2021-08-03T12:40:30.315Z          1               2
-- 15                        Text          2021-08-10T12:40:30.315Z          5               3
-- 16                        Text          2021-10-30T12:40:30.315Z          4               6
-- 17                        Text          2022-05-20T12:40:30.315Z          7               6
-- 18                        Text          2022-07-23T12:40:30.315Z          1               2
-- 19                        Text          2022-09-04T12:40:30.315Z          4               6
-- 20                        Text          2022-09-27T12:40:30.315Z          5               1
-- 21                        Text          2022-10-08T12:40:30.315Z          2               6
-- 22                        Text          2022-10-13T12:40:30.315Z          3               2