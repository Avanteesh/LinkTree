const express = require("express");
const cookieParser = require("cookie-parser");
const {join} = require("path");
const { execute } = require("./database");
const {hashSync, genSaltSync,compareSync } = require("bcryptjs");
const {v4,v7} = require("uuid");
const jwt = require("jsonwebtoken");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true,limit: '20mb'}))
app.use(express.static(join(__dirname, "public")));
app.use(cookieParser());

app.listen(process.env.port);

app.get("/", async function(req, res) {
  res.render("index");
});

app.post("/sign-in", async function(req, res) {
  const { email, password } = req.body;
  const findUser = await execute(`select user_id from Users 
   where email = '${email}' and u_password = '${password}';`);
  if (findUser.length === 0)  {
    const [user_id, salt] = [v4(), genSaltSync(8)];
    const hashed_pw = hashSync(password, salt);
    const addUser = await execute(`insert into Users(user_id,email,u_password)
    values('${user_id}','${email}','${hashed_pw}');`);
    res.redirect(`/create-profile/${user_id}`);
  } 
  else {
    res.redirect("/login");
  }
});

app.get("/set-profile/:user_id", async function(req, res) {
  const Id = req.params.user_id
  res.render("createProfile", {Id});
});

app.get("/login", async function(req, res)  {
  res.render("login");
});

app.get("/logout", async function(req, res)  {
  res.cookie("token", "");
  res.redirect("/login");
})

app.post("/login-user", async function(req, res) {
  const {email, password} = req.body;
  const findUser = await execute(`select user_id,email,u_password from Users
   where email = '${email}';`);
  if (findUser.length !== 0)  {
    const compare = await compareSync(password, findUser[0].u_password);
    if (compare === true)  {
      const token_key = v7();
      const token = jwt.sign({email}, token_key);
      res.cookie("token", token)
      res.redirect(`/admin/${findUser[0].user_id}`);
      return;
    }
  }
  res.send(`
    <div style="width:80%;display:grid;place-items:center;margin:5vh;">
      <div>
        <h2 style="font-family:monospace;font-size:1.8em;">
          You either have Invalid credentials or your account doesn't exist
        </h2>
      </div>
      <div>
        <button style="width:90%;padding:6px;background-color:#007bff;
          border:none;border-radius:6px">
          <a style="width:90%;color:#fff;text-decoration:none" href="/login">
            click to login
          </a>
        </button>
      </div>
    </div>`);
});

app.post("/create-profile/:id", async function(req, res) {
  const {username,bio} = req.body;
  const [profilePic,_id] = [req.body['profile-picture'],req.params.id];
  const profile_id = v4();
  const saveProfile = await execute(`insert into UserBio(user_id,profile_id,
  username,profile_picture,user_bio) values('${_id}','${profile_id}',
  '${username}','${profilePic}','${bio}')`);
  res.redirect("/login");
});

app.get("/admin/:id", async function(req, res) {
  const id = req.params.id;
  const getProfile = await execute(`select user_id,profile_id,username,
   profile_picture,user_bio from UserBio where user_id = '${id}';`);
  if (getProfile.length == 0)  {
    res.redirect("/");
    return;
  }
  const links = await execute(`select user_id,profile_id,link_tree_id,profile_id,link_title,
  link_url from UserBio join Links on UserBio.profile_id = Links.profile_id
  where user_id = '${id}';`);
  const data = getProfile.at(0);
  res.render("admin", {data,links});
});




