START TRANSACTION;

UPDATE climbing_records
SET guide_title = '衢州两头洞'
WHERE guide_id = 'quzhou-liangtoudong';

SELECT COUNT(*) AS total_records,
       COALESCE(SUM(guide_title = '衢州两头洞'), 0) AS renamed_records
FROM climbing_records
WHERE guide_id = 'quzhou-liangtoudong';

COMMIT;
