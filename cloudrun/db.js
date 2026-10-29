const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
const { isDeepStrictEqual } = require('node:util');

function createDatabase(env = process.env) {
  const required = ['MYSQL_ADDRESS', 'MYSQL_USERNAME', 'MYSQL_PASSWORD'];
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`请在云托管版本的环境变量中配置：${missing.join('、')}`);
  const [host, port = '3306'] = env.MYSQL_ADDRESS.split(':');
  if (!host || !/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error('MYSQL_ADDRESS 应为数据库内网地址:端口');
  }
  const pool = mysql.createPool({
    host,
    port: Number(port),
    user: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE || 'nodejs_demo',
    charset: 'utf8mb4',
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60000,
    connectTimeout: 5000,
    queueLimit: 20,
    supportBigNumbers: true,
    bigNumberStrings: false,
  });
  const query = async (sql, parameters = []) => (await pool.execute(sql, parameters))[0];
  return {
    async init() {
      const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
      for (const statement of schema
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)) {
        await query(statement);
      }
    },
    close: () => pool.end(),
    async addClimbingRecord(record) {
      await query(`INSERT INTO climbing_records (id, user_id, trip_id, day_id, guide_id, guide_title, section_id, section_title, route_name, route_key, grade, style, result, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = id`,
      [record.id, record.userId, record.tripId, record.dayId, record.guideId, record.guideTitle, record.sectionId, record.sectionTitle, record.routeName, record.routeKey, record.grade, record.style, record.result, record.note, Date.now()]);
    },
    listClimbingRoutes(guideId) {
      return query('SELECT route_name AS routeName, grade FROM climbing_routes WHERE guide_id = ? ORDER BY route_name', [guideId]);
    },
    async replaceClimbingRoutes(guideId, routes) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM climbing_routes WHERE guide_id = ?', [guideId]);
        for (const route of routes) await connection.execute('INSERT INTO climbing_routes (guide_id, section_id, route_key, route_name, grade) VALUES (?, ?, ?, ?, ?)', [guideId, route.sectionId, route.routeKey, route.name, route.grade]);
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    listClimbingRecords(userId) {
      return query(`SELECT id, trip_id AS tripId, day_id AS dayId, guide_id AS guideId, guide_title AS guideTitle, section_id AS sectionId, section_title AS sectionTitle, route_name AS routeName, route_key AS routeKey, grade, style, result, note, created_at AS createdAt FROM climbing_records WHERE user_id = ? ORDER BY created_at DESC, id DESC`, [userId]);
    },
    async deleteClimbingRecord(id, userId) {
      const result = await query('DELETE FROM climbing_records WHERE id = ? AND user_id = ?', [id, userId]);
      return result.affectedRows > 0;
    },
    async publishGuidebook(guide) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          `INSERT INTO climbing_guidebooks (guide_id, title, location, description, version, page_count, published)
           VALUES (?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE title = VALUES(title), location = VALUES(location),
           description = VALUES(description), version = VALUES(version), page_count = VALUES(page_count), published = 1`,
          [guide.id, guide.title, guide.location, guide.description, guide.version, guide.pages.length],
        );
        await connection.execute('DELETE FROM climbing_guidebook_pages WHERE guide_id = ?', [guide.id]);
        await connection.execute('DELETE FROM climbing_guidebook_section_intros WHERE guide_id = ?', [guide.id]);
        await connection.execute('DELETE FROM climbing_guidebook_sections WHERE guide_id = ?', [guide.id]);
        for (const [index, page] of guide.pages.entries()) {
          await connection.execute('INSERT INTO climbing_guidebook_pages (guide_id, page_number, image) VALUES (?, ?, ?)', [guide.id, index + 1, page]);
        }
        for (const [index, section] of guide.sections.entries()) {
          await connection.execute('INSERT INTO climbing_guidebook_sections (guide_id, section_order, section_id, title, start_page, end_page) VALUES (?, ?, ?, ?, ?, ?)', [guide.id, index, section.id, section.title, section.startPage, section.endPage]);
          if (section.intro) await connection.execute('INSERT INTO climbing_guidebook_section_intros (guide_id, section_id, intro) VALUES (?, ?, ?)', [guide.id, section.id, JSON.stringify(section.intro)]);
        }
        const [rows] = await connection.execute('SELECT page_number, image FROM climbing_guidebook_pages WHERE guide_id = ? ORDER BY page_number', [guide.id]);
        if (rows.length !== guide.pages.length || rows.some((row, index) => row.page_number !== index + 1 || !row.image.equals(guide.pages[index]))) throw new Error('路书图片验证失败');
        const [metadata] = await connection.execute('SELECT title, location, description, version, page_count, published FROM climbing_guidebooks WHERE guide_id = ?', [guide.id]);
        const stored = metadata[0];
        if (!stored || stored.title !== guide.title || stored.location !== guide.location || stored.description !== guide.description || stored.version !== guide.version || Number(stored.page_count) !== guide.pages.length || Number(stored.published) !== 1) throw new Error('路书信息验证失败');
        const [sectionRows] = await connection.execute('SELECT section.section_id AS id, section.title, section.start_page AS startPage, section.end_page AS endPage, intro.intro FROM climbing_guidebook_sections section LEFT JOIN climbing_guidebook_section_intros intro ON intro.guide_id = section.guide_id AND intro.section_id = section.section_id WHERE section.guide_id = ? ORDER BY section.section_order', [guide.id]);
        const sections = sectionRows.map(({ intro, ...section }) => intro ? { ...section, intro: typeof intro === 'string' ? JSON.parse(intro) : intro } : section);
        if (!isDeepStrictEqual(sections, guide.sections)) throw new Error('路书区域验证失败');
        await connection.commit();
        return { id: guide.id, version: guide.version, pageCount: guide.pages.length };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    async listGuidebooks() {
      const rows = await query(`SELECT guide.guide_id AS id, guide.title, guide.location, guide.description, guide.version,
        guide.page_count AS pageCount, section.section_id AS sectionId, section.title AS sectionTitle,
        section.start_page AS startPage, section.end_page AS endPage, intro.intro AS sectionIntro FROM climbing_guidebooks guide
        LEFT JOIN climbing_guidebook_sections section ON section.guide_id = guide.guide_id
        LEFT JOIN climbing_guidebook_section_intros intro ON intro.guide_id = section.guide_id AND intro.section_id = section.section_id
        WHERE guide.published = 1 ORDER BY guide.updated_at DESC, guide.guide_id, section.section_order`);
      const guides = new Map();
      for (const row of rows) {
        if (!guides.has(row.id)) guides.set(row.id, { id: row.id, title: row.title, location: row.location, description: row.description, version: row.version, pageCount: row.pageCount, sections: [] });
        if (row.sectionId) {
          const section = { id: row.sectionId, title: row.sectionTitle, startPage: row.startPage, endPage: row.endPage };
          if (row.sectionIntro) section.intro = typeof row.sectionIntro === 'string' ? JSON.parse(row.sectionIntro) : row.sectionIntro;
          guides.get(row.id).sections.push(section);
        }
      }
      return [...guides.values()];
    },
    async getGuidebookPage(id, pageNumber, version) {
      const rows = await query(
        `SELECT page.image FROM climbing_guidebook_pages page JOIN climbing_guidebooks guide ON guide.guide_id = page.guide_id
         WHERE guide.guide_id = ? AND guide.published = 1 AND guide.version = ? AND page.page_number = ?`,
        [id, version, pageNumber],
      );
      return rows[0]?.image || null;
    },
    async publishTrips(trips) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const verified = [];
        for (const [sortOrder, trip] of trips.entries()) {
          await connection.execute(
            `INSERT INTO travel_trips (trip_id, content, sort_order, published) VALUES (?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE content = VALUES(content), sort_order = VALUES(sort_order), published = 1`,
            [trip.id, JSON.stringify(trip), sortOrder],
          );
          for (const day of trip.days) {
            await connection.execute(
              'INSERT INTO travel_trip_days (trip_id, day_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE day_id = VALUES(day_id)',
              [trip.id, day.id],
            );
          }
          const [rows] = await connection.execute('SELECT content, published FROM travel_trips WHERE trip_id = ?', [trip.id]);
          const stored = typeof rows[0]?.content === 'string' ? JSON.parse(rows[0].content) : rows[0]?.content;
          if (Number(rows[0]?.published) !== 1 || !isDeepStrictEqual(stored, trip)) throw new Error('行程正文验证失败');
          const [days] = await connection.execute('SELECT day_id FROM travel_trip_days WHERE trip_id = ?', [trip.id]);
          if (trip.days.some((day) => !days.some((row) => row.day_id === day.id))) throw new Error('日期登记验证失败');
          verified.push({ id: trip.id, title: stored.title, published: 1, days: stored.days.map((day) => ({ id: day.id, date: day.date, hasOutdoorClimbing: day.hasOutdoorClimbing })) });
        }
        await connection.commit();
        return { trips: verified };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    async listTrips() {
      const rows = await query(
        'SELECT trip_id AS id, content FROM travel_trips WHERE published = 1 ORDER BY sort_order, trip_id',
      );
      return rows.map((row) => {
        const trip = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
        if (!trip || trip.id !== row.id) throw new Error('旅行内容与数据库 ID 不一致');
        return trip;
      });
    },
    async hasTripDay(tripId, dayId) {
      const rows =
        dayId === undefined
          ? await query('SELECT 1 FROM travel_trip_days WHERE trip_id = ? LIMIT 1', [tripId])
          : await query('SELECT 1 FROM travel_trip_days WHERE trip_id = ? AND day_id = ? LIMIT 1', [tripId, dayId]);
      return rows.length > 0;
    },
    async getProfile(userId) {
      const rows = await query(
        'SELECT nick_name AS nickName, avatar_id AS avatarId FROM travel_profiles WHERE user_id = ?',
        [userId],
      );
      return rows[0] || null;
    },
    async getAvatar(avatarId) {
      const rows = await query('SELECT avatar FROM travel_profiles WHERE avatar_id = ? LIMIT 1', [avatarId]);
      return rows[0] ? rows[0].avatar : null;
    },
    async saveProfile(userId, nickName, avatarId, avatar) {
      if (avatar) {
        await query(
          `INSERT INTO travel_profiles (user_id, nick_name, avatar_id, avatar, updated_at) VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE nick_name = VALUES(nick_name), avatar_id = VALUES(avatar_id), avatar = VALUES(avatar), updated_at = VALUES(updated_at)`,
          [userId, nickName, avatarId, avatar, Date.now()],
        );
      } else {
        await query('UPDATE travel_profiles SET nick_name = ?, updated_at = ? WHERE user_id = ?', [
          nickName,
          Date.now(),
          userId,
        ]);
      }
      return this.getProfile(userId);
    },
    async getMembership(tripId, userId) {
      const rows = await query('SELECT id FROM travel_members WHERE trip_id = ? AND user_id = ?', [tripId, userId]);
      return rows[0] || null;
    },
    async countMembers(tripId) {
      const rows = await query('SELECT COUNT(*) AS total FROM travel_members WHERE trip_id = ?', [tripId]);
      return Number(rows[0].total);
    },
    recentMembers(tripId) {
      return query(
        `SELECT member.id, profile.nick_name AS nickName, profile.avatar_id AS avatarId
         FROM travel_members member JOIN travel_profiles profile ON profile.user_id = member.user_id
         WHERE member.trip_id = ? ORDER BY member.joined_at DESC, member.id DESC LIMIT 3`,
        [tripId],
      );
    },
    async join(id, tripId, userId) {
      await query(
        'INSERT INTO travel_members (id, trip_id, user_id, joined_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = id',
        [id, tripId, userId, Date.now()],
      );
    },
    async countComments(tripId, dayId) {
      const rows = await query('SELECT COUNT(*) AS total FROM travel_comments WHERE trip_id = ? AND day_id = ?', [
        tripId,
        dayId,
      ]);
      return Number(rows[0].total);
    },
    listComments(tripId, dayId, cursor, limit) {
      const parameters = [tripId, dayId];
      let condition = '';
      if (cursor) {
        condition = ' AND (comment.created_at < ? OR (comment.created_at = ? AND comment.id < ?))';
        parameters.push(cursor.createdAt, cursor.createdAt, cursor.id);
      }
      parameters.push(limit);
      return query(
        `SELECT comment.id, comment.user_id AS userId, profile.nick_name AS nickName,
         profile.avatar_id AS avatarId, comment.content, comment.created_at AS createdAt
         FROM travel_comments comment JOIN travel_profiles profile ON profile.user_id = comment.user_id
         WHERE comment.trip_id = ? AND comment.day_id = ?${condition}
         ORDER BY comment.created_at DESC, comment.id DESC LIMIT ?`,
        parameters,
      );
    },
    async hasComment(id) {
      const rows = await query('SELECT id FROM travel_comments WHERE id = ?', [id]);
      return rows.length > 0;
    },
    async addComment(id, tripId, dayId, userId, content) {
      await query(
        `INSERT INTO travel_comments (id, trip_id, day_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id = id`,
        [id, tripId, dayId, userId, content, Date.now()],
      );
    },
    async deleteComment(id, tripId, dayId, userId) {
      const result = await query(
        'DELETE FROM travel_comments WHERE id = ? AND trip_id = ? AND day_id = ? AND user_id = ?',
        [id, tripId, dayId, userId],
      );
      return result.affectedRows > 0;
    },
  };
}

module.exports = { createDatabase };
