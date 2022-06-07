// implement your posts router here
const Posts = require("./posts-model");

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  Posts.find(req.query)
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ message: "The posts information could not be retrieved" });
    });
});

router.get("/:id", (req, res) => {
  Posts.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
      }
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ message: "The post information could not be retrieved" });
    });
});

router.post("/", (req, res) => {
  let { title, contents } = req.body;
  if (typeof title !== "string" || typeof title === "") {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
    return;
  } else if (typeof contents !== "string" || typeof contents === "") {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
    return;
  }
  title = title.trim();
  contents = contents.trim();
  Posts.insert({ title, contents })
    .then(({ id }) => {
      return Posts.findById(id);
    })
    .then((post) => {
      res.status(201).json(post);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "There was an error while saving the post to the database",
      });
    });
});

router.put("/:id", (req, res) => {
  const changes = req.body;
  let { title, contents } = req.body;
  if (!title || !contents) {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
    return;
  } else
    Posts.findById(req.params.id)
      .then((stuff) => {
        if (!stuff) {
          res
            .status(404)
            .json({ message: "The post with the specified ID does not exist" });
        } else {
          return Posts.update(req.params.id, req.body);
        }
      })
      .then((data) => {
        if (data) {
          return Posts.findById(req.params.id);
        }
      })
      .then((post) => {
        res.json(post);
      })
      .catch((error) => {
        console.log(error);
        res
          .status(500)
          .json({ message: "The posts information could not be retrieved" });
      });
});

router.delete("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist" });
    } else {
      await Posts.remove(req.params.id);
      res.json(post);
    }
  } catch (err) {
    console.log(error);
    res.status(500).json({ message: "The post could not be removed" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist" });
    } else {
      const messages = await Posts.findPostComments(req.params.id);
      res.json(messages);
    }
  } catch (err) {
    res.status(500).json({
      message: "The comments informatoin could not be retrieved",
    });
  }
});

module.exports = router;
