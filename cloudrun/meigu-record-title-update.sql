START TRANSACTION;

UPDATE climbing_records
SET guide_title = '东阳梅谷'
WHERE guide_id = 'meigu';

SELECT COUNT(*) AS total_records,
       COALESCE(SUM(guide_title = '东阳梅谷'), 0) AS renamed_records
FROM climbing_records
WHERE guide_id = 'meigu';

COMMIT;
