

-- Leiab kasutajad kellega on sõnumi saatnud
-- SELECT username, MAX(timestamp)
-- FROM messages
-- JOIN users ON (messages.from_id = users.user_id OR messages.to_id = users.user_id)
-- WHERE messages.from_id = 1 OR messages.to_id = 1
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
            from_id = 1 AND to_id = user_id
        OR 
            from_id = user_id AND to_id = 1
        WHERE NOT user_id = 1
GROUP BY user_id ORDER BY IFNULL(MAX(message_id), 0) DESC, username ASC;
