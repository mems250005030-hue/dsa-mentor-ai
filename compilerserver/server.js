const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Compiler Server Running");
});

app.post("/execute", (req, res) => {
  const language = req.body.language;
  const code = req.body.code;

  if (!language || !code) {
    return res.json({
      output: "",
      error: "language and code required"
    });
  }

  if (language === "python") {
    fs.writeFileSync("main.py", code);

    exec("python main.py", (err, stdout, stderr) => {
      res.json({
        output: stdout,
        error: stderr
      });
    });

    return;
  }

  if (language === "cpp") {
    fs.writeFileSync("main.cpp", code);

    exec("g++ main.cpp -o main.exe", (compileErr, compileOut, compileStderr) => {
      if (compileErr) {
        return res.json({
          output: compileOut,
          error: compileStderr
        });
      }

      exec("main.exe", (runErr, runOut, runStderr) => {
        res.json({
          output: runOut,
          error: runStderr
        });
      });
    });

    return;
  }

  res.json({
    output: "",
    error: "Unsupported language"
  });
});

app.listen(3001, () => {
  console.log("Compiler server running on port 3001");
});