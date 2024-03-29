import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";

const app = express();
const port = 3000;
const slatRounds = 10;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 0;
const colors = [
  "red",
  "olive",
  "orange",
  "indigo",
  "blue",
  "pink",
  "yellow",
];
let ranColor;

app.get("/", async (req, res) => {
  res.render("home.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

async function getCodes() {
  let countries = [];
  const list = await db.query(
    "SELECT country_code FROM visitedCountries JOIN login ON login_id=login.id WHERE login.id=$1",
    [currentUserId]
  );
  list.rows.forEach((item) => {
    countries.push(item.country_code);
  });
  return countries;
}

app.get("/process", async (req, res) => {
  const codes = await getCodes();
  console.log(codes);
  res.render("index.ejs", {
    countries: codes,
    total: codes.length,
    color: ranColor,
  });
});

app.post("/add", async (req, res) => {
  var input;
  if (req.body.country.length > 0) {
    input = req.body["country"];
  }
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    console.log(countryCode);
    console.log(currentUserId);
    try {
      await db.query(
        "INSERT INTO visitedCountries (country_code, login_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/process");
    } catch (err) {
      console.log(err);
      const countries = await getCodes();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
        color: ranColor,
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await getCodes();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
      color: ranColor,
    });
  }
});

app.post("/delete", async (req, res) => {
  try {
    const result = await getCodes();
    console.log(result);
    const remove = result[result.length - 1];
    console.log(remove);
    await db.query(
      "DELETE FROM visitedCountries WHERE country_code=$1 AND login_id = $2",
      [remove, currentUserId]
    );
    res.redirect("/process");
  } catch (err) {
    console.log(err);
  }
});
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const check = await db.query("SELECT * FROM login WHERE email=$1", [
      username,
    ]);
    if (check.rows.length > 0) {
      res.send("You have already registered");
    } else {
      bcrypt.hash(password, slatRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing the password : ", err);
        } else {
          const result = await db.query(
            "INSERT INTO login(email,pass) VALUES($1,$2) RETURNING *;",
            [username, hash]
          );
          const userId = result.rows[0].id;
          currentUserId = userId;
          console.log(userId);
          ranColor = colors[Math.floor(Math.random() * colors.length)];
          res.redirect("/process");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const loginPass = req.body.password;
  try {
    const result = await db.query("SELECT * FROM login WHERE email=$1", [
      username,
    ]);
    console.log(result.rows);
    if (result.rows.length > 0) {
      const storedHashPass = result.rows[0].pass;

      bcrypt.compare(loginPass, storedHashPass, (err, valid) => {
        if (err) {
          console.log("error comparing passwords : ", err);
        } else {
          if (valid) {
            currentUserId = result.rows[0].id;
            console.log("current user id is ", currentUserId);
            ranColor = colors[Math.floor(Math.random() * colors.length)];
            res.redirect("/process");
          } else {
            res.send("Incorrect password");
          }
        }
      });
    } else {
      res.send("No user with that email, try registering again");
    }
  } catch (err) {
    console.log(err);
  }
});
app.get("/logout", (req, res) => {
  currentUserId = 0;
  res.render("home.ejs");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
