-- SQLite
-- SELECT username, MAX(timestamp) as timestamp FROM messages JOIN users ON (messages.from_id = users.user_id OR messages.to_id = users.user_id) WHERE messages.from_id = 7 OR messages.to_id = 7 GROUP BY username ORDER BY strftime('%m/%d/%Y %H:%M:%S', timestamp) DESC;


-- Leiab kasutajad kellega on sõnumi saatnud
-- SELECT username, MAX(timestamp)
-- FROM messages
-- JOIN users ON (messages.from_id = users.user_id OR messages.to_id = users.user_id)
-- WHERE messages.from_id = 3 OR messages.to_id = 3
-- GROUP BY username
-- ORDER BY (timestamp) DESC;

-- SELECT DISTINCT u.username
-- FROM users u
-- JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
-- WHERE m.from_id = 3 OR m.to_id = 3
-- ORDER BY m.timestamp ASC;


-- WITH users_jack_messages AS (
--   SELECT
--     m.from_id,
--     m.to_id,
--     u.username,
--     CASE
--       WHEN m.from_id = 7 THEN m.timestamp
--       ELSE NULL
--     END AS sent_to_jack,
--     CASE
--       WHEN m.to_id = 7 THEN m.timestamp
--       ELSE NULL
--     END AS received_from_jack
--   FROM messages m
--   JOIN users u ON m.from_id = u.user_id OR m.to_id = u.user_id
--   WHERE 7 IN (m.from_id, m.to_id)
-- )
-- SELECT
--   u.username,
--   jm.sent_to_jack,
--   jm.received_from_jack
-- FROM users u
-- LEFT JOIN users_jack_messages jm ON u.user_id = jm.from_id OR u.user_id = jm.to_id
-- ORDER BY
--   COALESCE(jm.sent_to_jack, jm.received_from_jack) DESC NULLS LAST,
--   u.username;

-- WITH user_msgs AS (
--   SELECT 
--     u.username, 
--     m.timestamp,
--     (CASE 
--       WHEN m.from_id = 7 OR m.to_id = 7 THEN 1 
--       ELSE 0 
--     END) AS has_messaged_jack 
--   FROM users u
--   LEFT JOIN messages m 
--   ON u.user_id = m.from_id OR u.user_id = m.to_id 
-- ), 
-- sorted_usernames AS (
--   SELECT 
--     username, 
--     MAX(timestamp) AS max_timestamp 
--   FROM user_msgs 
--   GROUP BY username
-- ) 
-- SELECT username 
-- FROM sorted_usernames 
-- ORDER BY 
--   has_messaged_jack DESC, 
--   max_timestamp DESC, 
--   username;

-- WITH selected_users AS (
--   SELECT DISTINCT u.username, m.timestamp
--   FROM users u
--   JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
--   WHERE m.from_id = 3 OR m.to_id = 3
-- ),
-- all_users AS (
--   SELECT username
--   FROM users
-- )
-- SELECT username, timestamp
-- FROM selected_users
-- UNION
-- SELECT username, NULL as timestamp
-- FROM all_users
-- WHERE username NOT IN (SELECT username FROM selected_users)
-- ORDER BY timestamp, username;

-- SELECT u.username
-- FROM users u
-- JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
-- WHERE m.from_id = 3 OR m.to_id = 3
-- ORDER BY m.timestamp ASC
-- FULL JOIN
-- SELECT username
-- FROM users
-- ORDER BY username ASC;

-- WITH selected_users AS (
--   SELECT DISTINCT u.username, m.timestamp
--   FROM users u
--   JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
--   WHERE m.from_id = 3 OR m.to_id = 3
-- ),
-- all_users AS (
--   SELECT username
--   FROM users
-- )
-- SELECT username, timestamp
-- FROM selected_users
-- UNION
-- SELECT username, NULL as timestamp
-- FROM all_users
-- WHERE username NOT IN (SELECT username FROM selected_users)
-- ORDER BY COALESCE(timestamp, '9999-12-31T23:59:59.999Z'), username;




-- SELECT users.username, MAX (CASE WHEN m.sent_at is NULL THEN 0 else mt.sent_at END, CASE WHEN m.sent_at is NULL THEN 0 else m.sent_at END ) as maxdate FROM users                                                                                                                                                             
-- LEFT OUTER JOIN messages m on m.sender_id = users.username AND m.receiver_id = ?
-- LEFT OUTER JOIN messages mt on mt.receiver_id = users.username AND mt.sender_id = ?
-- GROUP BY users.username ORDER BY MAX(maxdate) DESC, users.username COLLATE NOCASE ASC;



--PEAAGE TÖÖTAB AGA SÕNUMISAATJATE JÄRJEKORD ON VALE
-- WITH selected_users AS (
--     SELECT username, MAX(messages.timestamp) as timestamp
--     FROM messages
--     JOIN users ON (messages.from_id = users.user_id OR messages.to_id = users.user_id)
--     WHERE messages.from_id = 3 OR messages.to_id = 3
-- ),
-- all_users AS (
--   SELECT username
--   FROM users
-- )
-- SELECT username, timestamp
-- FROM selected_users
-- UNION
-- SELECT username, NULL as timestamp
-- FROM all_users
-- WHERE username NOT IN (SELECT username FROM selected_users)
-- ORDER BY timestamp DESC, username COLLATE NOCASE ASC;

-- SELECT username, MAX(timestamp)
-- FROM messages
-- JOIN users ON (messages.from_id = users.user_id OR messages.to_id = users.user_id)
-- WHERE messages.from_id = 3 OR messages.to_id = 3
-- GROUP BY username
-- ORDER BY timestamp DESC;




--Proovin viimast replicate-ida kasutades JOIN-i
-- SELECT DISTINCT u.username, m.timestamp
-- FROM users u
-- JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
-- WHERE m.from_id = 3 OR m.to_id = 3
-- JOIN users ON u.username ;


-- SELECT username, user_id,
--   IFNULL(MAX(message_id), 0), 
--             IFNULL(to_id, 0), 
--             IFNULL(from_id, 0)
-- FROM users
--  LEFT JOIN messages  ON 
--             from_id = 3 AND to_id = user_id
--         OR 
--             from_id = user_id AND to_id = 3
--         WHERE NOT user_id = 3
-- GROUP BY user_id
--         ORDER BY 
--             message_id DESC, 
--             username ASC;


SELECT username
FROM users
 LEFT JOIN messages  ON 
            from_id = 3 AND to_id = user_id
        OR 
            from_id = user_id AND to_id = 3
        WHERE NOT user_id = 3
GROUP BY user_id
        ORDER BY 
            IFNULL(MAX(message_id), 0) DESC, 
            username ASC;

-- SELECT DISTINCT u.username
-- FROM users u
-- JOIN messages m ON u.user_id = m.from_id OR u.user_id = m.to_id
-- WHERE m.from_id = 3 OR m.to_id = 3
-- ORDER BY m.timestamp ASC;
























-- I have two tables called users and messages.
-- Can you make a sqlite query that gets all of the usernames?
-- The usernames need to be sorted by message sent or received to Jack newest beying at the top. Everyone else who haven't received or sent msg to jack being on the bottom and sorted alphabetically

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