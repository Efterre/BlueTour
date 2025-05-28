const { Pool } = require("pg");


// PostgreSQL bağlantısı
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "BlueTour",
  password: "Rs.27;rQ",
  port: 5432,
});

const authenticateUser = async (email, password) => {
  console.log("authenticateUser called with:", { email, password });
  try {
    const query = `
      SELECT userid, usertype FROM bluetour.appuser 
      WHERE useremail = $1 AND userpassword = $2
    `;
    const values = [email, password];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      console.log("Kullanıcı doğrulandı:", result.rows[0]);
      return { success: true, message: "Kullanıcı doğrulandı", user: result.rows[0] };
    } else {
      console.log("Geçersiz email veya şifre");
      return { success: false, message: "Geçersiz email veya şifre" };
    }
  } catch (error) {
    console.error("Kullanıcı doğrulanırken hata oluştu:", error);
    return { success: false, message: "Kullanıcı doğrulanamadı", details: error.message };
  }
};

module.exports = { authenticateUser };