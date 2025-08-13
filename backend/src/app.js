import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({ message: "Backend application for Research Paper Organizer" });
});

const startServer = () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
